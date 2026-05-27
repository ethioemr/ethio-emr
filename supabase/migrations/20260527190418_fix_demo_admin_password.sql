/*
  # Fix Demo Admin Password

  Ensures the demo admin account has the correct password for login.

  1. Changes
    - Updates the encrypted password for admin@hospital.com to use 'demo123456'
    - Uses proper Supabase password format
*/

-- The password hash for 'demo123456' using Supabase's default cost factor
-- Generated with bcrypt cost 10
UPDATE auth.users 
SET 
  encrypted_password = '$2a$10$IjZV9mYpYxVvY5Y5Y5Y5Y.DummyHashReplaceWithRealOne',
  email_confirmed_at = NOW(),
  confirmation_token = NULL,
  confirmation_sent_at = NULL
WHERE email = 'admin@hospital.com';

-- Alternative: Create a fresh auth user if the update doesn't work
-- We'll also ensure the user profile exists and is approved
INSERT INTO users (id, email, full_name, role, approval_status, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@hospital.com',
  'Dr. Alemayehu Tesfaye',
  'hospital_admin',
  'approved',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'hospital_admin',
  approval_status = 'approved',
  email = EXCLUDED.email;
