import React from 'react';
import { FeedCard, FeedPost } from '@/features/feed/FeedCard';

export default {
  title: 'Feed/FeedScreen',
  component: FeedCard,
  parameters: {
    layout: 'fullscreen',
  },
};

// Mock data for stories
const mockPosts: FeedPost[] = [
  {
    id: '1',
    user_id: 'user1',
    session_id: 'session1',
    media_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    caption: 'Just crushed my deadlift PR! 405lbs for 3 reps 💪 Feeling stronger every day. The grind never stops! #StrengthTraining #PersonalRecord',
    created_at: '2024-01-26T10:30:00Z',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      name: 'Alex Johnson'
    },
    reactions: {
      like: 24,
      cheer: 8
    }
  },
  {
    id: '2',
    user_id: 'user2',
    media_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=800&q=80',
    caption: 'Morning run through the park 🏃‍♀️ 5 miles done before breakfast. There\'s nothing like starting the day with endorphins!',
    created_at: '2024-01-26T08:15:00Z',
    profile: {
      name: 'Sarah Mitchell'
    },
    reactions: {
      like: 18,
      cheer: 12
    }
  },
  {
    id: '3',
    user_id: 'user3',
    session_id: 'session3',
    media_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    caption: 'Core workout complete! 🔥 30 minutes of pure fire. My abs are going to hate me tomorrow but it\'s so worth it.',
    created_at: '2024-01-26T07:45:00Z',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?auto=format&fit=crop&w=150&q=80',
      name: 'Emma Davis'
    },
    reactions: {
      like: 31,
      cheer: 15
    }
  },
  {
    id: '4',
    user_id: 'user4',
    caption: 'Rest day doesn\'t mean lazy day! Did some light yoga and meditation. Recovery is just as important as the workout itself 🧘‍♂️',
    created_at: '2024-01-25T19:20:00Z',
    profile: {
      name: 'Mike Chen'
    },
    reactions: {
      like: 12,
      cheer: 6
    }
  },
  {
    id: '5',
    user_id: 'user5',
    session_id: 'session5',
    media_url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=800&q=80',
    caption: 'Leg day survived! 🦵 Squats, lunges, and Bulgarian split squats. Walking might be difficult for the next few days 😅',
    created_at: '2024-01-25T18:10:00Z',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=150&q=80',
      name: 'James Wilson'
    },
    reactions: {
      like: 27,
      cheer: 19
    }
  }
];

const FeedScreenTemplate = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Feed</h1>
          <div className="space-y-6">
            {mockPosts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                onReactionUpdate={(postId, reactions) => {
                  console.log('Reaction updated:', postId, reactions);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeedScreen = FeedScreenTemplate.bind({});

export const SingleCard = () => (
  <div className="bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90 p-8">
    <div className="max-w-md mx-auto">
      <FeedCard
        post={mockPosts[0]}
        onReactionUpdate={(postId, reactions) => {
          console.log('Reaction updated:', postId, reactions);
        }}
      />
    </div>
  </div>
);

export const WithReactions = () => {
  const [post, setPost] = React.useState({
    ...mockPosts[0],
    reactions: { like: 5, cheer: 3 }
  });

  const handleReactionUpdate = (postId: string, reactions: { like: number; cheer: number }) => {
    console.log('Reaction updated with animation:', postId, reactions);
    setPost(prev => ({ ...prev, reactions }));
  };

  return (
    <div className="bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90 p-8">
      <div className="max-w-md mx-auto">
        <FeedCard
          post={post}
          onReactionUpdate={handleReactionUpdate}
        />
        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/80 text-sm mb-2">Animation Demo:</p>
          <p className="text-white/60 text-xs">
            Click the 👍 or 🎉 buttons to see the tap animation (scale) and count fade-in effect.
            The buttons will scale to 1.3x on tap and the count numbers will fade in smoothly.
          </p>
        </div>
      </div>
    </div>
  );
};

export const WithoutMedia = () => (
  <div className="bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90 p-8">
    <div className="max-w-md mx-auto">
      <FeedCard
        post={mockPosts[3]}
        onReactionUpdate={(postId, reactions) => {
          console.log('Reaction updated:', postId, reactions);
        }}
      />
    </div>
  </div>
);