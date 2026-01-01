-- We See You - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  notification_preferences JSONB DEFAULT '{"in_app": true, "push": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Flagged accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'x')),
  handle TEXT NOT NULL,
  profile_url TEXT,
  flag_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'verified', 'cleared', 'escalated')),
  first_flagged_at TIMESTAMPTZ DEFAULT NOW(),
  last_flagged_at TIMESTAMPTZ DEFAULT NOW(),
  moderator_notes TEXT,
  UNIQUE(platform, handle)
);

-- Enable RLS on accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Accounts policies (public read, authenticated write)
CREATE POLICY "Anyone can view accounts" ON public.accounts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert accounts" ON public.accounts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts" ON public.accounts
  FOR UPDATE TO authenticated USING (true);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'non_consensual_nudity',
    'sexual_harassment',
    'hate_speech',
    'threats',
    'graphic_violence',
    'other'
  )),
  description TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reports policies
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can insert reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin')
    )
  );

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('alert', 'update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger function to create notifications when flag_count reaches threshold
CREATE OR REPLACE FUNCTION notify_on_threshold()
RETURNS TRIGGER AS $$
DECLARE
  threshold INTEGER := 3;
  user_record RECORD;
BEGIN
  -- Check if the account just crossed the threshold
  IF NEW.flag_count >= threshold AND OLD.flag_count < threshold THEN
    -- Create notification for all users
    FOR user_record IN SELECT id FROM public.profiles LOOP
      INSERT INTO public.notifications (user_id, account_id, type, title, message)
      VALUES (
        user_record.id,
        NEW.id,
        'alert',
        'Community Alert: High-Risk Account',
        'Account @' || NEW.handle || ' on ' || NEW.platform || ' has been flagged by multiple users for abuse.'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for threshold notifications
DROP TRIGGER IF EXISTS account_threshold_trigger ON public.accounts;
CREATE TRIGGER account_threshold_trigger
  AFTER UPDATE ON public.accounts
  FOR EACH ROW
  WHEN (NEW.flag_count IS DISTINCT FROM OLD.flag_count)
  EXECUTE FUNCTION notify_on_threshold();

-- Create storage bucket for evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for evidence bucket
CREATE POLICY "Authenticated users can upload evidence" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'evidence');

CREATE POLICY "Anyone can view evidence" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'evidence');

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_platform_handle ON public.accounts(platform, handle);
CREATE INDEX IF NOT EXISTS idx_accounts_flag_count ON public.accounts(flag_count DESC);
CREATE INDEX IF NOT EXISTS idx_reports_account_id ON public.reports(account_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
