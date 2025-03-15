/*
  # Add claims table RLS policies

  1. Security Changes
    - Enable RLS on claims table
    - Add policy for anonymous users to insert claims
    - Add policy for authenticated users to view all claims
*/

-- Enable RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert claims
CREATE POLICY "Allow anonymous users to insert claims"
  ON claims
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view all claims
CREATE POLICY "Allow authenticated users to view all claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to view their own claims
CREATE POLICY "Allow anonymous users to view their own claims"
  ON claims
  FOR SELECT
  TO anon
  USING (session_id = current_setting('request.headers')::json->>'x-session-id');