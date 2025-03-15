/*
  # Fix claims table RLS policies

  1. Security Changes
    - Drop existing policies to ensure clean state
    - Enable RLS on claims table
    - Add comprehensive policies for claims table:
      - Anonymous users can insert claims
      - Anonymous users can view their own claims
      - Authenticated users can view all claims
    
  Note: Using DO blocks to handle idempotency
*/

-- Drop existing policies to start fresh
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow anonymous users to insert claims" ON claims;
  DROP POLICY IF EXISTS "Allow anonymous users to view their own claims" ON claims;
  DROP POLICY IF EXISTS "Allow authenticated users to view all claims" ON claims;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert claims with no restrictions
CREATE POLICY "Allow anonymous users to insert claims"
  ON claims
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to view their own claims
CREATE POLICY "Allow anonymous users to view their own claims"
  ON claims
  FOR SELECT
  TO anon
  USING (
    session_id = COALESCE(
      current_setting('request.headers', true)::json->>'x-session-id',
      current_setting('request.jwt.claims', true)::json->>'session_id'
    )
  );

-- Allow authenticated users to view all claims
CREATE POLICY "Allow authenticated users to view all claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (true);