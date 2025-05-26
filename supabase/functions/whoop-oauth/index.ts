
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    const athleteId = url.searchParams.get('athlete_id')

    if (action === 'authorize') {
      // Generate authorization URL
      if (!athleteId) {
        throw new Error('athlete_id required for authorization')
      }

      const clientId = Deno.env.get('WHOOP_CLIENT_ID')
      const redirectUri = `${url.origin}/supabase/functions/v1/whoop-oauth?action=callback`
      
      const authUrl = new URL('https://api.prod.whoop.com/oauth/oauth2/auth')
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('client_id', clientId!)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('scope', 'read:recovery read:cycles read:workout read:sleep read:profile read:body_measurement')
      authUrl.searchParams.set('state', athleteId)

      return new Response(JSON.stringify({ authorization_url: authUrl.toString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'callback') {
      // Handle OAuth callback
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state') // athlete_id
      
      if (!code || !state) {
        throw new Error('Missing code or state parameter')
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: Deno.env.get('WHOOP_CLIENT_ID')!,
          client_secret: Deno.env.get('WHOOP_CLIENT_SECRET')!,
          code: code,
          redirect_uri: `${url.origin}/supabase/functions/v1/whoop-oauth?action=callback`,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${await tokenResponse.text()}`)
      }

      const tokenData = await tokenResponse.json()
      
      // Store tokens in database
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))
      
      const { error } = await supabaseClient
        .from('whoop_tokens')
        .upsert({
          athlete_uuid: state,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
          token_type: tokenData.token_type,
          scope: tokenData.scope,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      // Redirect to success page
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.app') || 'http://localhost:3000'}/calendar?whoop_connected=true`,
        },
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('WHOOP OAuth error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
