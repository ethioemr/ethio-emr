/*
  # Add Missing Tables and Update Auth

  1. New Tables:
    - pharmacy_items: Drug inventory
    - wards: Hospital wards
    - beds: Individual beds
    - admissions: Patient admissions

  2. Auth Updates:
    - Add pending_users table for registration approval
    - Add approval_status column to users

  3. User Types in System:
    - Super Admin
    - Hospital Admin  
    - Doctor
    - Nurse
    - Receptionist
    - Pharmacist
    - Lab Technician
    - Cashier
    - Patient
*/

-- Add approval_status column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'approved';
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by uuid;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Create pharmacy_items table
CREATE TABLE IF NOT EXISTS pharmacy_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name text NOT NULL,
  drug_code text,
  manufacturer text,
  batch_number text,
  quantity_in_stock integer DEFAULT 0,
  reorder_level integer DEFAULT 10,
  unit_cost numeric(10,2) DEFAULT 0,
  selling_price numeric(10,2) DEFAULT 0,
  expiry_date date,
  strength text,
  form text DEFAULT 'tablet',
  storage_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wards table
CREATE TABLE IF NOT EXISTS wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_name text NOT NULL,
  ward_type text DEFAULT 'general',
  total_beds integer DEFAULT 0,
  department_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create beds table
CREATE TABLE IF NOT EXISTS beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id uuid NOT NULL REFERENCES wards(id),
  bed_number text NOT NULL,
  bed_status text DEFAULT 'available',
  patient_currently_admitted uuid,
  created_at timestamptz DEFAULT now()
);

-- Create admissions table  
CREATE TABLE IF NOT EXISTS admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  bed_id uuid REFERENCES beds(id),
  ward_id uuid REFERENCES wards(id),
  admission_date timestamptz DEFAULT now(),
  discharge_date timestamptz,
  admission_type text DEFAULT 'scheduled',
  admission_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create pending_registrations table for approval workflow
CREATE TABLE IF NOT EXISTS pending_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  requested_role text NOT NULL,
  department_id uuid,
  password_hash text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  notes text
);

-- Enable RLS on new tables
ALTER TABLE pharmacy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for pharmacy_items
CREATE POLICY "Authenticated users can view pharmacy items"
  ON pharmacy_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage pharmacy items"
  ON pharmacy_items FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('pharmacist', 'hospital_admin', 'super_admin')));

-- Add RLS policies for wards
CREATE POLICY "Authenticated users can view wards"
  ON wards FOR SELECT
  TO authenticated
  USING (true);

-- Add RLS policies for beds
CREATE POLICY "Authenticated users can view beds"
  ON beds FOR SELECT
  TO authenticated
  USING (true);

-- Add RLS policies for admissions
CREATE POLICY "Authenticated users can view admissions"
  ON admissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage admissions"
  ON admissions FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('nurse', 'doctor', 'hospital_admin', 'super_admin')));

-- Add RLS policies for pending_registrations
CREATE POLICY "Admins can view pending registrations"
  ON pending_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('hospital_admin', 'super_admin')));

CREATE POLICY "Admins can manage pending registrations"
  ON pending_registrations FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('hospital_admin', 'super_admin')));

-- Insert pharmacy inventory items
INSERT INTO pharmacy_items (drug_name, drug_code, quantity_in_stock, reorder_level, unit_cost, selling_price, strength, form) VALUES
  ('Paracetamol', 'PARA500', 500, 100, 2.50, 5.00, '500mg', 'tablet'),
  ('Amoxicillin', 'AMOX250', 300, 50, 8.00, 15.00, '250mg', 'capsule'),
  ('Metformin', 'MET500', 200, 30, 5.00, 12.00, '500mg', 'tablet'),
  ('Amlodipine', 'AML5', 150, 25, 10.00, 20.00, '5mg', 'tablet'),
  ('Omeprazole', 'OMP20', 250, 40, 7.50, 18.00, '20mg', 'capsule'),
  ('Ceftriaxone', 'CF1G', 100, 20, 25.00, 50.00, '1g', 'injection'),
  ('Azithromycin', 'AZI500', 180, 30, 12.00, 25.00, '500mg', 'tablet'),
  ('Ibuprofen', 'IBU400', 400, 80, 3.00, 8.00, '400mg', 'tablet'),
  ('Ciprofloxacin', 'CIP500', 220, 35, 6.00, 15.00, '500mg', 'tablet'),
  ('Diclofenac', 'DIC50', 280, 45, 4.50, 10.00, '50mg', 'tablet'),
  ('Hydrochlorothiazide', 'HCT25', 170, 30, 3.50, 8.00, '25mg', 'tablet'),
  ('Aspirin', 'ASP100', 450, 90, 1.50, 4.00, '100mg', 'tablet'),
  ('Loratadine', 'LOR10', 200, 40, 5.50, 12.00, '10mg', 'tablet'),
  ('Diazepam', 'DIA5', 80, 15, 8.00, 18.00, '5mg', 'tablet'),
  ('Salbutamol Inhaler', 'SAL100', 120, 25, 30.00, 60.00, '100mcg', 'inhaler')
ON CONFLICT DO NOTHING;

-- Insert wards
INSERT INTO wards (id, ward_name, ward_type, total_beds) VALUES
  ('22222222-2222-2222-2222-222222222201', 'General Ward A', 'general', 20),
  ('22222222-2222-2222-2222-222222222202', 'General Ward B', 'general', 20),
  ('22222222-2222-2222-2222-222222222203', 'ICU', 'icu', 8),
  ('22222222-2222-2222-2222-222222222204', 'Pediatric Ward', 'pediatric', 15),
  ('22222222-2222-2222-2222-222222222205', 'Maternity Ward', 'maternity', 12),
  ('22222222-2222-2222-2222-222222222206', 'Surgical Ward', 'surgical', 18)
ON CONFLICT DO NOTHING;

-- Insert beds for each ward
INSERT INTO beds (ward_id, bed_number, bed_status)
SELECT '22222222-2222-2222-2222-222222222201', 'A' || LPAD(i::text, 3, '0'), 
  CASE WHEN i <= 12 THEN 'occupied' ELSE 'available' END
FROM generate_series(1, 20) AS i
ON CONFLICT DO NOTHING;

INSERT INTO beds (ward_id, bed_number, bed_status)
SELECT '22222222-2222-2222-2222-222222222202', 'B' || LPAD(i::text, 3, '0'), 
  CASE WHEN i <= 8 THEN 'occupied' ELSE 'available' END
FROM generate_series(1, 20) AS i
ON CONFLICT DO NOTHING;

INSERT INTO beds (ward_id, bed_number, bed_status)
SELECT '22222222-2222-2222-2222-222222222203', 'ICU' || LPAD(i::text, 2, '0'), 
  CASE WHEN i <= 5 THEN 'occupied' ELSE 'available' END
FROM generate_series(1, 8) AS i
ON CONFLICT DO NOTHING;

INSERT INTO beds (ward_id, bed_number, bed_status)
SELECT '22222222-2222-2222-2222-222222222204', 'P' || LPAD(i::text, 3, '0'), 
  CASE WHEN i <= 6 THEN 'occupied' ELSE 'available' END
FROM generate_series(1, 15) AS i
ON CONFLICT DO NOTHING;

INSERT INTO beds (ward_id, bed_number, bed_status)
SELECT '22222222-2222-2222-2222-222222222205', 'M' || LPAD(i::text, 3, '0'), 
  CASE WHEN i <= 7 THEN 'occupied' ELSE 'available' END
FROM generate_series(1, 12) AS i
ON CONFLICT DO NOTHING;

-- Update wards with correct bed counts
UPDATE wards SET total_beds = 20 WHERE id = '22222222-2222-2222-2222-222222222201';
UPDATE wards SET total_beds = 20 WHERE id = '22222222-2222-2222-2222-222222222202';
UPDATE wards SET total_beds = 8 WHERE id = '22222222-2222-2222-2222-222222222203';
UPDATE wards SET total_beds = 15 WHERE id = '22222222-2222-2222-2222-222222222204';
UPDATE wards SET total_beds = 12 WHERE id = '22222222-2222-2222-2222-222222222205';
UPDATE wards SET total_beds = 18 WHERE id = '22222222-2222-2222-2222-222222222206';
