-- Migration for mobility protocols table
-- Created: 2025-08-06
-- Description: Creates a table to store mobility/conditioning protocols that users can browse

create table if not exists mobility_protocols (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  description     text,
  steps           jsonb not null,      -- e.g. [{ step: "Hamstring stretch", duration: 60 }, …]
  muscle_targets  text[] not null,      -- e.g. ['hamstrings','quads']
  duration_min    int not null,         -- total protocol duration
  created_at      timestamptz default now()
);

-- Add some example mobility protocols for testing
insert into mobility_protocols (name, description, steps, muscle_targets, duration_min) values
(
  'Hip Flexor Release',
  'A comprehensive hip flexor mobility routine to improve hip extension and reduce tightness.',
  '[
    {"step": "Couch stretch", "duration": 90, "description": "Place rear foot on couch, front foot forward in lunge position"},
    {"step": "90/90 hip stretch", "duration": 60, "description": "Sit with both knees at 90 degrees, lean forward over front leg"},
    {"step": "Standing hip flexor stretch", "duration": 45, "description": "Step back into lunge, push hips forward"},
    {"step": "Pigeon pose", "duration": 60, "description": "Hip flexor stretch in pigeon position"}
  ]'::jsonb,
  ARRAY['hip_flexors', 'psoas', 'rectus_femoris'],
  6
),
(
  'Shoulder Mobility Flow',
  'Essential shoulder mobility routine for overhead movement preparation.',
  '[
    {"step": "Arm circles", "duration": 30, "description": "Small to large circles, forward and backward"},
    {"step": "Wall slides", "duration": 45, "description": "Back against wall, slide arms up and down"},
    {"step": "Cross-body stretch", "duration": 30, "description": "Pull arm across chest, hold stretch"},
    {"step": "Overhead reach", "duration": 30, "description": "Reach overhead, lean to each side"},
    {"step": "Band pull-aparts", "duration": 45, "description": "Pull resistance band apart at chest level"}
  ]'::jsonb,
  ARRAY['shoulders', 'deltoids', 'rotator_cuff', 'upper_traps'],
  4
),
(
  'Ankle Mobility Routine',
  'Improve ankle dorsiflexion and overall ankle mobility for better movement patterns.',
  '[
    {"step": "Wall ankle stretch", "duration": 60, "description": "Face wall, step back and lean forward to stretch calf"},
    {"step": "Ankle circles", "duration": 30, "description": "Rotate ankle clockwise and counterclockwise"},
    {"step": "Calf stretch with band", "duration": 45, "description": "Use resistance band to pull toes toward shin"},
    {"step": "Heel walks", "duration": 30, "description": "Walk on heels to activate dorsiflexors"}
  ]'::jsonb,
  ARRAY['calves', 'achilles', 'tibialis_anterior'],
  3
);

-- Add index for faster queries
create index if not exists idx_mobility_protocols_muscle_targets on mobility_protocols using gin(muscle_targets);
create index if not exists idx_mobility_protocols_duration on mobility_protocols (duration_min);
create index if not exists idx_mobility_protocols_name on mobility_protocols (name);