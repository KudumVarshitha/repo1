/*
  # Fix claims table RLS policies

  1. Security Changes
    - Enable RLS on claims table if not already enabled
    - Add policy for anonymous users to insert claims
    - Add policy for anonymous users to view their own claims
    
  Note: The policy for authenticated users to view all claims already exists
*/

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'claims' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Allow anonymous users to insert claims
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'claims' 
    AND policyname = 'Allow anonymous users to insert claims'
  ) THEN
    CREATE POLICY "Allow anonymous users to insert claims"
      ON claims
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Allow anonymous users to view their own claims
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'claims' 
    AND policyname = 'Allow anonymous users to view their own claims'
  ) THEN
    CREATE POLICY "Allow anonymous users to view their own claims"
      ON claims
      FOR SELECT
      TO anon
      USING (session_id = current_setting('request.headers')::json->>'x-session-id');
  END IF;
END $$;