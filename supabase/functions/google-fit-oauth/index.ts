import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_FIT_CLIENT_ID = '576186375678-qji87agvkua2m798eof25q2aig3c41ou.apps.googleusercontent.com'
const GOOGLE_FIT_CLIENT_SECRET = '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'
const GOOGLE_FIT_REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-fit-oauth`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // Contains user_id
    const error = url.searchParams.get('error')

    if (req.method === 'GET' && !code && !error) {
      // Step 1: Generate OAuth URL
      const userId = url.searchParams.get('user_id')
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing user_id parameter' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const scopes = [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.body.read',
        'https://www.googleapis.com/auth/fitness.location.read',
        'https://www.googleapis.com/auth/fitness.nutrition.read',
      ].join(' ')

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_FIT_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_FIT_REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${userId}`

      return new Response(
        JSON.stringify({ 
          authUrl,
          message: 'Redirect user to this URL to authorize Google Fit access'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'GET' && error) {
      // User denied authorization
      console.log('Google Fit authorization denied:', error)
      
      return new Response(`
        <html>
          <body>
            <h2>Google Fit Authorization</h2>
            <p>Authorization was cancelled or denied.</p>
            <p>You can close this window and try again from the app.</p>
            <script>
              // Try to close the window if it was opened as a popup
              if (window.opener) {
                window.opener.postMessage({ type: 'google_fit_auth', success: false, error: '${error}' }, '*');
                window.close();
              }
            </script>
          </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      })
    }

    if (req.method === 'GET' && code && state) {
      // Step 2: Exchange code for tokens
      const userId = state

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_FIT_CLIENT_ID,
          client_secret: GOOGLE_FIT_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: GOOGLE_FIT_REDIRECT_URI,
        }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        console.error('Token exchange failed:', errorData)
        throw new Error(`Token exchange failed: ${tokenResponse.status}`)
      }

      const tokens = await tokenResponse.json()
      console.log('Google Fit tokens received for user:', userId)

      // Store tokens in database
      const { error: dbError } = await supabaseClient
        .from('google_fit_connections')
        .upsert({
          user_id: userId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          scope: tokens.scope,
          connected_at: new Date().toISOString(),
          last_sync_at: null,
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to store Google Fit connection')
      }

      // Trigger initial data sync
      try {
        const syncResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/sync-google-fit-data`, {
          method: 'POST',
          headers: {
            'Authorization': req.headers.get('Authorization')!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId, days: 7 })
        })

        if (!syncResponse.ok) {
          console.error('Initial sync failed, but connection was successful')
        }
      } catch (syncError) {
        console.error('Initial sync error:', syncError)
        // Don't fail the connection if sync fails
      }

      // Return success page
      return new Response(`
        <html>
          <body>
            <h2>Google Fit Connected Successfully!</h2>
            <p>Your Google Fit account has been connected and we're syncing your activity data.</p>
            <p>You can close this window and return to the app.</p>
            <script>
              // Try to close the window if it was opened as a popup
              if (window.opener) {
                window.opener.postMessage({ type: 'google_fit_auth', success: true }, '*');
                window.close();
              }
            </script>
          </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      })
    }

    // POST method for programmatic token refresh
    if (req.method === 'POST') {
      const { action, user_id } = await req.json()

      if (action === 'refresh_token') {
        // Get current connection
        const { data: connection, error: fetchError } = await supabaseClient
          .from('google_fit_connections')
          .select('*')
          .eq('user_id', user_id)
          .single()

        if (fetchError || !connection) {
          throw new Error('Google Fit connection not found')
        }

        if (!connection.refresh_token) {
          throw new Error('No refresh token available')
        }

        // Refresh the access token
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: GOOGLE_FIT_CLIENT_ID,
            client_secret: GOOGLE_FIT_CLIENT_SECRET,
            refresh_token: connection.refresh_token,
            grant_type: 'refresh_token',
          }),
        })

        if (!refreshResponse.ok) {
          const errorData = await refreshResponse.text()
          console.error('Token refresh failed:', errorData)
          throw new Error(`Token refresh failed: ${refreshResponse.status}`)
        }

        const newTokens = await refreshResponse.json()

        // Update stored tokens
        const { error: updateError } = await supabaseClient
          .from('google_fit_connections')
          .update({
            access_token: newTokens.access_token,
            expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
            // Keep existing refresh_token if not provided in response
            refresh_token: newTokens.refresh_token || connection.refresh_token,
          })
          .eq('user_id', user_id)

        if (updateError) {
          console.error('Token update error:', updateError)
          throw new Error('Failed to update tokens')
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            access_token: newTokens.access_token,
            expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (action === 'disconnect') {
        // Revoke tokens and remove connection
        const { data: connection } = await supabaseClient
          .from('google_fit_connections')
          .select('access_token')
          .eq('user_id', user_id)
          .single()

        if (connection?.access_token) {
          // Revoke the token with Google
          await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.access_token}`, {
            method: 'POST'
          })
        }

        // Remove from database
        const { error: deleteError } = await supabaseClient
          .from('google_fit_connections')
          .delete()
          .eq('user_id', user_id)

        if (deleteError) {
          throw new Error('Failed to disconnect Google Fit')
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Google Fit disconnected successfully' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Google Fit OAuth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})