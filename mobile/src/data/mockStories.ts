export interface Story {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  viewed: boolean;
  timestamp: Date;
  type: 'workout' | 'achievement' | 'meal' | 'general';
}

export const mockStories: Story[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    viewed: false,
    timestamp: new Date(),
    type: 'workout',
  },
  {
    id: '2',
    userId: 'user2',
    username: 'Sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?auto=format&fit=crop&w=150&q=80',
    viewed: false,
    timestamp: new Date(),
    type: 'achievement',
  },
  {
    id: '3',
    userId: 'user3',
    username: 'Mike',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=150&q=80',
    viewed: true,
    timestamp: new Date(),
    type: 'meal',
  },
  {
    id: '4',
    userId: 'user4',
    username: 'Emma',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    viewed: false,
    timestamp: new Date(),
    type: 'workout',
  },
  {
    id: '5',
    userId: 'user5',
    username: 'James',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    viewed: true,
    timestamp: new Date(),
    type: 'general',
  },
  {
    id: '6',
    userId: 'user6',
    username: 'Lisa',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    viewed: false,
    timestamp: new Date(),
    type: 'achievement',
  },
  {
    id: '7',
    userId: 'user7',
    username: 'David',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    viewed: true,
    timestamp: new Date(),
    type: 'workout',
  },
  {
    id: '8',
    userId: 'user8',
    username: 'Anna',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    viewed: false,
    timestamp: new Date(),
    type: 'meal',
  },
];