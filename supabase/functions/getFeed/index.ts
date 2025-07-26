import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url);
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    console.log('Fetching feed with cursor:', cursor, 'limit:', limit);

    // Build base query
    let query = supabase
      .from('feed_posts')
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
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add cursor pagination if provided
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return new Response(
        JSON.stringify({ error: postsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch reaction counts for all posts
    const postIds = posts?.map(p => p.id) || [];
    
    const { data: reactions, error: reactionsError } = await supabase
      .from('post_reactions')
      .select('post_id, reaction_type')
      .in('post_id', postIds);

    if (reactionsError) {
      console.error('Error fetching reactions:', reactionsError);
      return new Response(
        JSON.stringify({ error: reactionsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group reactions by post and type
    const reactionCounts = reactions?.reduce((acc, reaction) => {
      if (!acc[reaction.post_id]) {
        acc[reaction.post_id] = { like: 0, cheer: 0 };
      }
      acc[reaction.post_id][reaction.reaction_type]++;
      return acc;
    }, {} as Record<string, { like: number; cheer: number }>) || {};

    // Format the response data
    const formattedPosts = posts?.map(post => ({
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
      reactions: reactionCounts[post.id] || { like: 0, cheer: 0 }
    })) || [];

    console.log(`Successfully fetched ${formattedPosts.length} posts`);

    return new Response(
      JSON.stringify({ posts: formattedPosts }),
      { 
        status: 200, 
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