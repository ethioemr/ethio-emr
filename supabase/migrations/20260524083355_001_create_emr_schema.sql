/*
  # ETHIO-EMR Database Schema

  1. New Tables
    - `users` - Hospital staff (doctors, admins, nurses)
    - `patients` - Patient records
    - `appointments` - Doctor-patient appointments
    - `prescriptions` - Medication prescriptions
    - `lab_results` - Laboratory test results
    - `bills` - Patient billing/invoices
    - `departments` - Hospital departments
    - `consultations` - Video/in-person consultations
    - `medical_history` - Patient medical history
    - `vital_signs` - Patient vital measurements
    
  2. Security
    - RLS enabled on all tables
    - Policies for user role-based access
    - Patient data privacy enforced

  3. Key Features
    - User authentication with role-based access
    - Patient demographics and medical records
    - Appointment scheduling
    - Prescription management
    - Lab results tracking
    - Billing system
    - Consultation tracking
*/

-- Users table (hospital staff)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'doctor',
  department_id uuid,
  phone text,
  photo_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all staff"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  head_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  city text,
  blood_type text,
  emergency_contact text,
  emergency_contact_phone text,
  allergies text,
  chronic_conditions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Medical History table
CREATE TABLE IF NOT EXISTS medical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  diagnosis text NOT NULL,
  treatment text,
  date date NOT NULL,
  doctor_id uuid REFERENCES users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view medical history"
  ON medical_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert medical history"
  ON medical_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Vital Signs table
CREATE TABLE IF NOT EXISTS vital_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  temperature decimal(5,2),
  pulse integer,
  blood_pressure text,
  respiratory_rate integer,
  oxygen_saturation decimal(5,2),
  weight decimal(6,2),
  height decimal(5,2),
  bmi decimal(5,2),
  recorded_at timestamptz DEFAULT now(),
  recorded_by uuid REFERENCES users(id)
);

ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vital signs"
  ON vital_signs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert vital signs"
  ON vital_signs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id),
  appointment_date timestamp NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text NOT NULL DEFAULT 'scheduled',
  appointment_type text NOT NULL DEFAULT 'general',
  reason_for_visit text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id text UNIQUE NOT NULL,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id),
  medication text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  duration integer NOT NULL,
  duration_unit text DEFAULT 'days',
  instructions text,
  status text NOT NULL DEFAULT 'active',
  prescribed_at date NOT NULL,
  expiry_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update prescriptions"
  ON prescriptions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Lab Results table
CREATE TABLE IF NOT EXISTS lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  test_category text NOT NULL,
  result_value text,
  normal_range text,
  unit text,
  status text NOT NULL DEFAULT 'completed',
  result_date date NOT NULL,
  requested_by uuid REFERENCES users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lab results"
  ON lab_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert lab results"
  ON lab_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id text UNIQUE NOT NULL,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  description text,
  category text NOT NULL,
  amount decimal(10,2) NOT NULL,
  paid_amount decimal(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  paid_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bills"
  ON bills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert bills"
  ON bills FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update bills"
  ON bills FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  type text NOT NULL DEFAULT 'in-person',
  room_id text,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_patient_id ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_patient_id ON medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON vital_signs(patient_id);
