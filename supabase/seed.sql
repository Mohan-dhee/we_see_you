-- Seed Data for Testing
-- Run this in your Supabase SQL Editor to populate test data

-- 1. Insert test accounts
INSERT INTO public.accounts (id, platform, handle, flag_count, status, safety_score, safety_tier, first_flagged_at, last_flagged_at)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'instagram', 'bad_actor_1', 12, 'verified', 20, 'danger', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 hour'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'x', 'troll_bot_99', 5, 'reviewing', 45, 'warning', NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'instagram', 'suspicious_profile', 2, 'open', 80, 'caution', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'x', 'safe_user_test', 0, 'cleared', 100, 'clean', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days')
ON CONFLICT (platform, handle) DO NOTHING;

-- 2. Insert sample reports for these accounts
INSERT INTO public.reports (account_id, category, description, created_at)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'hate_speech', 'Repeated hate speech comments', NOW() - INTERVAL '1 hour'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'threats', 'Threatening DM sent', NOW() - INTERVAL '1 day'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'sexual_harassment', 'Inappropriate images', NOW() - INTERVAL '2 days'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'other', 'Suspicious link spam', NOW() - INTERVAL '1 day');

-- 3. Insert sample activity feed items
INSERT INTO public.activity_feed (account_id, activity_type, platform, handle, description, created_at)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'new_report', 'instagram', 'bad_actor_1', 'Report submitted for @bad_actor_1 on instagram', NOW() - INTERVAL '1 hour'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'status_changed', 'x', 'troll_bot_99', 'Account @troll_bot_99 status updated to reviewing', NOW() - INTERVAL '2 days'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'new_report', 'instagram', 'suspicious_profile', 'Report submitted for @suspicious_profile on instagram', NOW() - INTERVAL '1 day');
