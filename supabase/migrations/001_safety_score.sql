-- Phase 1: Add Safety Score to Accounts
-- Run this migration in your Supabase SQL Editor

-- Add safety score columns to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS safety_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS safety_tier TEXT DEFAULT 'clean' 
  CHECK (safety_tier IN ('clean', 'caution', 'warning', 'danger'));

-- Create function to calculate safety score
CREATE OR REPLACE FUNCTION calculate_safety_score(
  p_flag_count INTEGER,
  p_status TEXT,
  p_last_flagged_at TIMESTAMPTZ
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 100;
  recency_days INTEGER;
BEGIN
  -- Base deduction for flag count
  score := score - (p_flag_count * 10);
  
  -- Additional deduction for verified status
  IF p_status = 'verified' THEN
    score := score - 30;
  ELSIF p_status = 'escalated' THEN
    score := score - 20;
  ELSIF p_status = 'reviewing' THEN
    score := score - 10;
  END IF;
  
  -- Recency factor (more recent = lower score)
  IF p_last_flagged_at IS NOT NULL THEN
    recency_days := EXTRACT(DAY FROM NOW() - p_last_flagged_at);
    IF recency_days < 7 THEN
      score := score - 10;
    ELSIF recency_days < 30 THEN
      score := score - 5;
    END IF;
  END IF;
  
  -- Clamp to 0-100
  RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update safety score on changes
CREATE OR REPLACE FUNCTION update_safety_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.safety_score := calculate_safety_score(
    NEW.flag_count,
    NEW.status,
    NEW.last_flagged_at
  );
  
  -- Set tier based on score
  NEW.safety_tier := CASE
    WHEN NEW.safety_score >= 90 THEN 'clean'
    WHEN NEW.safety_score >= 70 THEN 'caution'
    WHEN NEW.safety_score >= 40 THEN 'warning'
    ELSE 'danger'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS account_safety_score_trigger ON public.accounts;
CREATE TRIGGER account_safety_score_trigger
  BEFORE INSERT OR UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_safety_score();

-- Update existing accounts with safety scores
UPDATE public.accounts
SET flag_count = flag_count; -- This triggers the safety score calculation

-- Update RLS policy to allow public read access for search (rows only)
-- NOTE: Column-level restriction should be handled via the API or a View
DROP POLICY IF EXISTS "Anyone can view accounts" ON public.accounts;
CREATE POLICY "Public can view accounts" ON public.accounts
  FOR SELECT USING (true);

-- Index for efficient safety tier queries
CREATE INDEX IF NOT EXISTS idx_accounts_safety_tier ON public.accounts(safety_tier);
CREATE INDEX IF NOT EXISTS idx_accounts_safety_score ON public.accounts(safety_score);
