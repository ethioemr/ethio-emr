/*
  # ETHIO-EMR Schema - Step 1: Enums and Hospital
  
  Create enum types and hospital base table
*/

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin',
    'hospital_admin',
    'doctor',
    'nurse',
    'receptionist',
    'pharmacist',
    'lab_technician',
    'cashier',
    'patient'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'scheduled',
    'checked_in',
    'waiting',
    'in_consultation',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE patient_status AS ENUM (
    'active',
    'inactive',
    'deceased'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lab_result_status AS ENUM (
    'pending',
    'completed',
    'critical'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE prescription_status AS ENUM (
    'active',
    'inactive',
    'expired',
    'fulfilled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS hospital_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  logo_url text,
  address text,
  city text,
  region text,
  phone text,
  email text,
  website text,
  license_number text UNIQUE,
  established_date date,
  director_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE hospital_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hospital profiles readable by all authenticated"
  ON hospital_profiles FOR SELECT
  TO authenticated
  USING (true);
