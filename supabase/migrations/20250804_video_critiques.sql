-- Create video_critiques table
create table if not exists video_critiques (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  session_id uuid references workout_sessions(id),
  video_path text not null,
  critique text not null,
  created_at timestamptz default now()
);

-- Create indexes for better performance
create index if not exists idx_video_critiques_user_id on video_critiques(user_id);
create index if not exists idx_video_critiques_session_id on video_critiques(session_id);
create index if not exists idx_video_critiques_created_at on video_critiques(created_at);

-- Enable Row Level Security
alter table video_critiques enable row level security;

-- Create RLS policies for video_critiques
create policy "Users can view their own video critiques"
on video_critiques for select
using (auth.uid() = user_id);

create policy "Users can create their own video critiques"
on video_critiques for insert
with check (auth.uid() = user_id);

create policy "Users can update their own video critiques"
on video_critiques for update
using (auth.uid() = user_id);

create policy "Users can delete their own video critiques"
on video_critiques for delete
using (auth.uid() = user_id);

-- Create storage bucket for videos if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  52428800, -- 50MB limit
  array['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/avi']
)
on conflict (id) do nothing;

-- Create storage policy for video uploads
create policy "Users can upload their own videos"
on storage.objects for insert
with check (
  bucket_id = 'videos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy for viewing videos  
create policy "Users can view their own videos"
on storage.objects for select
using (
  bucket_id = 'videos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy for deleting videos
create policy "Users can delete their own videos"  
on storage.objects for delete
using (
  bucket_id = 'videos'
  and auth.uid()::text = (storage.foldername(name))[1]
);