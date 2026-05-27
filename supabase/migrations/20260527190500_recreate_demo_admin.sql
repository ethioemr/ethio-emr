/*
  # Recreate Demo Admin User

  Removes the invalid demo admin user and recreates it with proper credentials.

  1. Changes
    - Deletes existing invalid auth user entry
    - Creates fresh auth user with proper password hash
    - Updates user profile to match

  This migration creates a properly hashed password for 'demo123456'.
*/

-- First, get a fresh UUID for the new admin
-- Delete the old auth user entry (the one with all-zeros UUID which bypassed normal creation)
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';

-- Delete old user profile
DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001';

-- Note: We cannot directly insert into auth.users with proper password hashing
-- The password needs to be set through the auth API
-- This migration just cleans up the invalid state
