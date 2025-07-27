import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { publishEvent } from "../_shared/ably.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { session_id, media_url, caption } = await req.json();

    if (!caption && !media_url) {
      return new Response(
        JSON.stringify({ error: 'Caption or media is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} creating new post`);

    // Insert the new post
    const { data: post, error: insertError } = await supabase
      .from('feed_posts')
      .insert({
        user_id: user.id,
        session_id: session_id || null,
        media_url: media_url || null,
        caption: caption || null
      })
      .select(`
        id,
        user_id,
        session_id,
        media_url,
        caption,
        created_at,
        profiles!feed_posts_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating post:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the response data to match FeedPost interface
    const formattedPost = {
      id: post.id,
      user_id: post.user_id,
      session_id: post.session_id,
      media_url: post.media_url,
      caption: post.caption,
      created_at: post.created_at,
      profile: {
        avatar: null, // Will be implemented later with actual avatar URLs
        name: post.profiles?.full_name || post.profiles?.email || 'Unknown User'
      },
      reactions: { like: 0, cheer: 0 }
    };

    console.log(`Successfully created post ${post.id}`);

    // Publish event after successful DB operation
    const uid = user.id;
    publishEvent(uid, "postCreated", { post_id: post.id });

    return new Response(
      JSON.stringify({ post: formattedPost }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})