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

    const { post_id, type } = await req.json();

    if (!post_id || !type || !['like', 'cheer'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid post_id or reaction type' }),
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

    console.log(`User ${user.id} reacting to post ${post_id} with ${type}`);

    // Check if reaction already exists
    const { data: existingReaction, error: checkError } = await supabase
      .from('post_reactions')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .eq('reaction_type', type)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing reaction:', checkError);
      return new Response(
        JSON.stringify({ error: checkError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let action = '';
    
    if (existingReaction) {
      // Remove existing reaction (toggle off)
      const { error: deleteError } = await supabase
        .from('post_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error('Error deleting reaction:', deleteError);
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      action = 'removed';
    } else {
      // Add new reaction
      const { error: insertError } = await supabase
        .from('post_reactions')
        .insert({
          post_id,
          user_id: user.id,
          reaction_type: type
        });

      if (insertError) {
        console.error('Error inserting reaction:', insertError);
        return new Response(
          JSON.stringify({ error: insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      action = 'added';
    }

    // Get updated reaction counts
    const { data: reactions, error: reactionsError } = await supabase
      .from('post_reactions')
      .select('reaction_type')
      .eq('post_id', post_id);

    if (reactionsError) {
      console.error('Error fetching updated reactions:', reactionsError);
      return new Response(
        JSON.stringify({ error: reactionsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reactionCounts = reactions?.reduce((acc, reaction) => {
      acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
      return acc;
    }, { like: 0, cheer: 0 } as Record<string, number>) || { like: 0, cheer: 0 };

    console.log(`Reaction ${action}: ${type} for post ${post_id}. New counts:`, reactionCounts);

    // Publish event after successful DB operation
    const uid = user.id;
    publishEvent(uid, "postReaction", { post_id, action, reaction_type: type });

    return new Response(
      JSON.stringify({ 
        success: true, 
        action,
        reactions: reactionCounts 
      }),
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