-- Phase 2: Feed & Discovery Migration
-- Run this in your Supabase SQL Editor

-- 1. Create activity_feed table
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'new_report', 
    'threshold_reached', 
    'status_changed', 
    'verified'
  )),
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Public read access
CREATE POLICY "Anyone can view activity feed" ON public.activity_feed
  FOR SELECT USING (true);

-- System can insert (only authenticated users via triggers effectively)
CREATE POLICY "System can insert activity" ON public.activity_feed
  FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Index for efficient feed queries
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);

-- 5. Trigger to add activity on new reports
CREATE OR REPLACE FUNCTION log_report_activity()
RETURNS TRIGGER AS $$
DECLARE
  account_record RECORD;
BEGIN
  -- Get account details
  SELECT platform, handle, flag_count INTO account_record
  FROM public.accounts WHERE id = NEW.account_id;
  
  -- Insert into feed
  INSERT INTO public.activity_feed (
    account_id, 
    activity_type, 
    platform, 
    handle, 
    description
  )
  VALUES (
    NEW.account_id,
    'new_report',
    account_record.platform,
    account_record.handle,
    'Report submitted for @' || account_record.handle || ' on ' || account_record.platform
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS report_activity_trigger ON public.reports;
CREATE TRIGGER report_activity_trigger
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION log_report_activity();

-- 6. Trigger for account status changes (e.g. verified abuser)
CREATE OR REPLACE FUNCTION log_account_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('verified', 'escalated', 'cleared') THEN
    INSERT INTO public.activity_feed (
      account_id, 
      activity_type, 
      platform, 
      handle, 
      description
    )
    VALUES (
      NEW.id,
      'status_changed',
      NEW.platform,
      NEW.handle,
      'Account @' || NEW.handle || ' status updated to ' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS account_status_feed_trigger ON public.accounts;
CREATE TRIGGER account_status_feed_trigger
  AFTER UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION log_account_status_change();
