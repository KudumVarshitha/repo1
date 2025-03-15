/*
  # Add Initial Coupons

  1. Changes
    - Add initial coupons with status 'available'
    - Set expiry dates for 7 days from now
*/

-- Insert initial coupons
INSERT INTO coupons (code, status, expires_at)
VALUES
  ('LUXURY25', 'available', NOW() + INTERVAL '7 days'),
  ('PREMIUM50', 'available', NOW() + INTERVAL '7 days'),
  ('VIP2024', 'available', NOW() + INTERVAL '7 days'),
  ('ELITE100', 'available', NOW() + INTERVAL '7 days'),
  ('GOLD2024', 'available', NOW() + INTERVAL '7 days');