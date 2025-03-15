/*
  # Create admin user policy

  1. Changes
    - Add policy to allow admin login
    - Remove direct user creation (will be handled through signup)
*/

-- Enable row level security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admin access
CREATE POLICY "Allow admin access"
  ON auth.users
  FOR ALL
  TO authenticated
  USING (role = 'authenticated')
  WITH CHECK (role = 'authenticated');