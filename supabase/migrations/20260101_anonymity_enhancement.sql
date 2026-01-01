-- =====================================================
-- ANONYMITY ENHANCEMENT MIGRATION
-- Run this in your Supabase SQL Editor
-- =====================================================
-- Purpose: Ensure reporter identities are NEVER visible to moderators
-- Only the reporter themselves can see their own reporter_id
-- =====================================================

-- Step 1: Drop existing moderator policy for reports
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;

-- Step 2: Create a new view for moderators that EXCLUDES reporter_id
-- This view contains only the information moderators need to review reports
DROP VIEW IF EXISTS public.anonymous_reports;
CREATE VIEW public.anonymous_reports AS
SELECT 
  r.id,
  r.account_id,
  r.category,
  r.description,
  r.evidence_urls,
  r.created_at,
  a.platform,
  a.handle,
  a.flag_count,
  a.status as account_status
FROM public.reports r
JOIN public.accounts a ON r.account_id = a.id;

-- Step 3: Grant access to the anonymous view for moderators
GRANT SELECT ON public.anonymous_reports TO authenticated;

-- Step 4: Create RLS policy for the view
ALTER VIEW public.anonymous_reports SET (security_invoker = on);

-- Step 5: Create policy allowing moderators to view the anonymous reports view
CREATE POLICY "Moderators can view anonymous reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin')
    )
    -- But only through the anonymous_reports view, not directly
    -- This policy is for the underlying table access
    AND false  -- Block direct table access for moderators
  );

-- Step 6: Create a function for moderators to query reports safely
CREATE OR REPLACE FUNCTION public.get_anonymous_reports(
  p_status TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  report_id UUID,
  account_id UUID,
  category TEXT,
  description TEXT,
  evidence_urls TEXT[],
  created_at TIMESTAMPTZ,
  platform TEXT,
  handle TEXT,
  flag_count INTEGER,
  account_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is a moderator or admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Only moderators can view reports';
  END IF;

  RETURN QUERY
  SELECT 
    r.id as report_id,
    r.account_id,
    r.category,
    r.description,
    r.evidence_urls,
    r.created_at,
    a.platform,
    a.handle,
    a.flag_count,
    a.status as account_status
  FROM public.reports r
  JOIN public.accounts a ON r.account_id = a.id
  WHERE 
    (p_status IS NULL OR a.status = p_status)
    AND (p_platform IS NULL OR a.platform = p_platform)
  ORDER BY r.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Step 7: Ensure original user policy still works (users see their own reports)
-- This policy already exists but let's make sure it's correct
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Step 8: Add a comment documenting the anonymity model
COMMENT ON TABLE public.reports IS 
  'Abuse reports table. PRIVACY: reporter_id is ONLY visible to the reporter themselves. 
   Moderators must use the anonymous_reports view or get_anonymous_reports() function.';

COMMENT ON COLUMN public.reports.reporter_id IS 
  'UUID of the user who submitted this report. PRIVATE: Only visible to the reporter.
   Moderators and admins CANNOT see this field.';
