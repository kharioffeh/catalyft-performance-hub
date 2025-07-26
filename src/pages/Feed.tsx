import React, { useState, useEffect, useCallback } from 'react';
import { FeedCard, FeedPost } from '@/features/feed/FeedCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchPosts = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const queryParams = new URLSearchParams();
      queryParams.append('limit', '50');
      if (loadMore && cursor) {
        queryParams.append('cursor', cursor);
      }

      const { data, error } = await supabase.functions.invoke('getFeed', {
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      const newPosts = data.posts || [];
      
      if (loadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      // Set cursor for next page (last post's created_at)
      if (newPosts.length > 0) {
        setCursor(newPosts[newPosts.length - 1].created_at);
      }

      // Check if we have more posts
      setHasMore(newPosts.length === 50);

    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor]);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight * 0.8 &&
        !loadingMore &&
        hasMore
      ) {
        fetchPosts(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchPosts, loadingMore, hasMore]);

  const handleReactionUpdate = (postId: string, reactions: { like: number; cheer: number }) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, reactions } : post
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Feed</h1>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 drop-shadow-lg animate-pulse"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-white/20 rounded mb-1"></div>
                      <div className="h-3 bg-white/10 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-48 bg-white/10 rounded-xl mb-3"></div>
                  <div className="h-4 bg-white/10 rounded mb-4"></div>
                  <div className="flex gap-3">
                    <div className="h-8 bg-white/10 rounded-full w-16"></div>
                    <div className="h-8 bg-white/10 rounded-full w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Feed</h1>
          
          {posts.length === 0 ? (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">📱</div>
              <h2 className="text-xl font-semibold text-white mb-2">No posts yet</h2>
              <p className="text-white/60">Be the first to share your workout!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  onReactionUpdate={handleReactionUpdate}
                />
              ))}
              
              {loadingMore && (
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 drop-shadow-lg animate-pulse">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-white/20 rounded mb-1"></div>
                      <div className="h-3 bg-white/10 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-32 bg-white/10 rounded-xl mb-3"></div>
                  <div className="h-4 bg-white/10 rounded mb-4"></div>
                  <div className="flex gap-3">
                    <div className="h-8 bg-white/10 rounded-full w-16"></div>
                    <div className="h-8 bg-white/10 rounded-full w-16"></div>
                  </div>
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-white/60">You've reached the end of the feed!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;