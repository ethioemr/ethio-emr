/*
  # Seed Demo Data for ETHIO-EMR

  This migration populates the database with demo data for testing and demonstration.

  1. Data Added
    - 1 demo admin user (admin@hospital.com)
    - 10 doctors across different departments
    - 50 patients with varied demographics
    - Sample appointments, lab results, bills

  2. Demo Credentials
    - Email: admin@hospital.com
    - Password: demo123456
*/

-- Insert departments
INSERT INTO departments (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Internal Medicine', 'General medical care for adults'),
  ('11111111-1111-1111-1111-111111111102', 'Pediatrics', 'Medical care for children'),
  ('11111111-1111-1111-1111-111111111103', 'Obstetrics & Gynecology', 'Women health and maternity'),
  ('11111111-1111-1111-1111-111111111104', 'Surgery', 'General and specialized surgery'),
  ('11111111-1111-1111-1111-111111111105', 'Cardiology', 'Heart and cardiovascular care'),
  ('11111111-1111-1111-1111-111111111106', 'Dermatology', 'Skin conditions and treatment'),
  ('11111111-1111-1111-1111-111111111107', 'Orthopedics', 'Bone and joint conditions')
ON CONFLICT (id) DO NOTHING;

-- Insert doctors (10 doctors)
INSERT INTO users (id, email, full_name, role, department_id, phone, bio, created_at) VALUES
  ('00000000-0000-0000-0000-000000000002', 'doctor1@hospital.com', 'Dr. Abebe Bikila', 'doctor', '11111111-1111-1111-1111-111111111101', '+251911001002', 'Internal Medicine Specialist with 15 years experience', NOW()),
  ('00000000-0000-0000-0000-000000000003', 'doctor2@hospital.com', 'Dr. Meselech Melaku', 'doctor', '11111111-1111-1111-1111-111111111102', '+251911001003', 'Pediatrician with focus on neonatal care', NOW()),
  ('00000000-0000-0000-0000-000000000004', 'doctor3@hospital.com', 'Dr. Tigist Haile', 'doctor', '11111111-1111-1111-1111-111111111103', '+251911001004', 'OB-GYN Specialist', NOW()),
  ('00000000-0000-0000-0000-000000000005', 'doctor4@hospital.com', 'Dr. Yohannes Girma', 'doctor', '11111111-1111-1111-1111-111111111104', '+251911001005', 'General Surgeon', NOW()),
  ('00000000-0000-0000-0000-000000000006', 'doctor5@hospital.com', 'Dr. Selam Tadesse', 'doctor', '11111111-1111-1111-1111-111111111105', '+251911001006', 'Cardiologist', NOW()),
  ('00000000-0000-0000-0000-000000000007', 'doctor6@hospital.com', 'Dr. Dawit Amare', 'doctor', '11111111-1111-1111-1111-111111111106', '+251911001007', 'Dermatologist', NOW()),
  ('00000000-0000-0000-0000-000000000008', 'doctor7@hospital.com', 'Dr. Hanna Solomon', 'doctor', '11111111-1111-1111-1111-111111111107', '+251911001008', 'Orthopedic Surgeon', NOW()),
  ('00000000-0000-0000-0000-000000000009', 'doctor8@hospital.com', 'Dr. Bereket Tadesse', 'doctor', '11111111-1111-1111-1111-111111111101', '+251911001009', 'Internal Medicine', NOW()),
  ('00000000-0000-0000-0000-000000000010', 'doctor9@hospital.com', 'Dr. Almaz Tesfaye', 'doctor', '11111111-1111-1111-1111-111111111102', '+251911001010', 'Pediatrician', NOW()),
  ('00000000-0000-0000-0000-000000000011', 'doctor10@hospital.com', 'Dr. Tewodros Alemu', 'doctor', '11111111-1111-1111-1111-111111111103', '+251911001011', 'OB-GYN', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert nurses
INSERT INTO users (id, email, full_name, role, phone, created_at) VALUES
  ('00000000-0000-0000-0000-000000000101', 'nurse1@hospital.com', 'Sister Aster Mengistu', 'nurse', '+251922001001', NOW()),
  ('00000000-0000-0000-0000-000000000102', 'nurse2@hospital.com', 'Sister Tigist Alemayehu', 'nurse', '+251922001002', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert receptionist
INSERT INTO users (id, email, full_name, role, phone, created_at) VALUES
  ('00000000-0000-0000-0000-000000000201', 'reception1@hospital.com', 'Wubit Girma', 'receptionist', '+251933001001', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert pharmacist
INSERT INTO users (id, email, full_name, role, phone, created_at) VALUES
  ('00000000-0000-0000-0000-000000000301', 'pharmacist1@hospital.com', 'Ato Dawit Fikre', 'pharmacist', '+251944001001', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert lab technician
INSERT INTO users (id, email, full_name, role, phone, created_at) VALUES
  ('00000000-0000-0000-0000-000000000401', 'lab1@hospital.com', 'Ato Tadesse Haile', 'lab_technician', '+251955001001', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert cashier
INSERT INTO users (id, email, full_name, role, phone, created_at) VALUES
  ('00000000-0000-0000-0000-000000000501', 'cashier1@hospital.com', 'Abebech Tadesse', 'cashier', '+251966001001', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert 50 patients
INSERT INTO patients (id, patient_id, full_name, date_of_birth, gender, phone, email, address, city, blood_type, emergency_contact, emergency_contact_phone, allergies, chronic_conditions, created_at) VALUES
  ('21111111-1111-1111-1111-111111111111', 'PAT-001', 'Abebe Kebede', '1985-03-15', 'Male', '+251911100001', 'abebe.k@email.com', 'Bole Sub-City', 'Addis Ababa', 'A+', 'Tigist Kebede', '+251922200001', 'Penicillin', 'Hypertension', NOW()),
  ('21111111-1111-1111-1111-111111111112', 'PAT-002', 'Tigist Hailemariam', '1990-07-22', 'Female', '+251911100002', 'tigist.h@email.com', 'Kirkos Sub-City', 'Addis Ababa', 'O-', 'Abebe Hailemariam', '+251922200002', NULL, NULL, NOW()),
  ('21111111-1111-1111-1111-111111111113', 'PAT-003', 'Yohannes Tadesse', '1978-11-08', 'Male', '+251911100003', 'yohannes.t@email.com', 'Yeka Sub-City', 'Addis Ababa', 'B+', 'Almaz Tadesse', '+251922200003', 'Aspirin', 'Diabetes Type 2', NOW()),
  ('21111111-1111-1111-1111-111111111114', 'PAT-004', 'Meselech Asfaw', '1992-01-30', 'Female', '+251911100004', 'meselech.a@email.com', 'Arada Sub-City', 'Addis Ababa', 'AB+', 'Dawit Asfaw', '+251922200004', NULL, 'Asthma', NOW()),
  ('21111111-1111-1111-1111-111111111115', 'PAT-005', 'Dawit Girma', '1982-05-18', 'Male', '+251911100005', 'dawit.g@email.com', 'Lideta Sub-City', 'Addis Ababa', 'O+', 'Hanna Girma', '+251922200005', 'Sulfa drugs', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111116', 'PAT-006', 'Selam Tsegaye', '1988-09-12', 'Female', '+251911100006', 'selam.t@email.com', 'Kolfe Keranio', 'Addis Ababa', 'A-', 'Tewodros Tsegaye', '+251922200006', NULL, NULL, NOW()),
  ('21111111-1111-1111-1111-111111111117', 'PAT-007', 'Bereket Alemu', '1995-02-28', 'Male', '+251911100007', 'bereket.a@email.com', 'Nifas Silk Lafto', 'Addis Ababa', 'B-', 'Kidist Alemu', '+251922200007', 'Ibuprofen', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111118', 'PAT-008', 'Almaz Tesfaye', '1975-08-14', 'Female', '+251911100008', 'almaz.t@email.com', 'Gulele Sub-City', 'Addis Ababa', 'O+', 'Abebe Tesfaye', '+251922200008', NULL, 'Arthritis', NOW()),
  ('21111111-1111-1111-1111-111111111119', 'PAT-009', 'Tewodros Bekele', '1980-12-05', 'Male', '+251911100009', 'tewodros.b@email.com', 'Akaki Kality', 'Addis Ababa', 'A+', 'Hiwot Bekele', '+251922200009', 'Penicillin', 'Hypertension, Diabetes', NOW()),
  ('21111111-1111-1111-1111-111111111120', 'PAT-010', 'Hiwot Gidey', '1993-04-17', 'Female', '+251911100010', 'hiwot.g@email.com', 'Addis Ketema', 'Addis Ababa', 'AB-', 'Mulu Gidey', '+251922200010', NULL, NULL, NOW()),
  ('21111111-1111-1111-1111-111111111121', 'PAT-011', 'Fikre Markos', '1970-06-20', 'Male', '+251911100011', 'fikre.m@email.com', 'Bole Sub-City', 'Addis Ababa', 'O+', 'Aster Markos', '+251922200011', 'Codeine', 'Heart Disease', NOW()),
  ('21111111-1111-1111-1111-111111111122', 'PAT-012', 'Eden Alemayehu', '1996-10-03', 'Female', '+251911100012', 'eden.a@email.com', 'Kirkos Sub-City', 'Addis Ababa', 'A+', 'Yordanos Alemayehu', '+251922200012', NULL, NULL, NOW()),
  ('21111111-1111-1111-1111-111111111123', 'PAT-013', 'Natnael Solomon', '1987-03-25', 'Male', '+251911100013', 'natnael.s@email.com', 'Yeka Sub-City', 'Addis Ababa', 'B+', 'Selam Solomon', '+251922200013', 'Sulfa drugs', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111124', 'PAT-014', 'Kidist Tadesse', '1991-07-08', 'Female', '+251911100014', 'kidist.t@email.com', 'Arada Sub-City', 'Addis Ababa', 'O-', 'Bereket Tadesse', '+251922200014', NULL, 'Thyroid Disorder', NOW()),
  ('21111111-1111-1111-1111-111111111125', 'PAT-015', 'Yordanos Haile', '1984-11-30', 'Female', '+251911100015', 'yordanos.h@email.com', 'Lideta Sub-City', 'Addis Ababa', 'AB+', 'Fikre Haile', '+251922200015', 'Penicillin', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111126', 'PAT-016', 'Belete Girma', '1976-05-12', 'Male', '+251911100016', 'belete.g@email.com', 'Kolfe Keranio', 'Addis Ababa', 'A-', 'Almaz Girma', '+251922200016', NULL, 'CKD', NOW()),
  ('21111111-1111-1111-1111-111111111127', 'PAT-017', 'Sara Kebede', '1989-09-23', 'Female', '+251911100017', 'sara.k@email.com', 'Nifas Silk Lafto', 'Addis Ababa', 'B-', 'Dawit Kebede', '+251922200017', 'Aspirin', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111128', 'PAT-018', 'Mikias Addis', '1994-01-16', 'Male', '+251911100018', 'mikias.a@email.com', 'Gulele Sub-City', 'Addis Ababa', 'O+', 'Tigist Addis', '+251922200018', NULL, NULL, NOW()),
  ('21111111-1111-1111-1111-111111111129', 'PAT-019', 'Aster Mengistu', '1981-06-04', 'Female', '+251911100019', 'aster.m@email.com', 'Akaki Kality', 'Addis Ababa', 'A+', 'Yohannes Mengistu', '+251922200019', 'Ibuprofen', 'Migraine', NOW()),
  ('21111111-1111-1111-1111-111111111130', 'PAT-020', 'Muluemebet Tesfaye', '1983-10-27', 'Female', '+251911100020', 'muluemebet.t@email.com', 'Addis Ketema', 'Addis Ababa', 'AB-', 'Abebe Tesfaye', '+251922200020', NULL, 'Epilepsy', NOW()),
  ('21111111-1111-1111-1111-111111111131', 'PAT-021', 'Abebech Girma', '1972-02-09', 'Female', '+251911100021', 'abebech.g@email.com', 'Bole Sub-City', 'Addis Ababa', 'O+', 'Tadesse Girma', '+251922200021', 'Penicillin', 'Hypertension', NOW()),
  ('21111111-1111-1111-1111-111111111132', 'PAT-022', 'Dawit Fikre', '1997-08-21', 'Male', '+251911100022', 'dawit.f@email.com', 'Kirkos Sub-City', 'Addis Ababa', 'B+', 'Selam Fikre', '+251922200022', NULL, NULL, NOW()),
  ('21111111-1111-1111-1111-111111111133', 'PAT-023', 'Frehiwot Alemayehu', '1986-12-14', 'Female', '+251911100023', 'frehiwot.a@email.com', 'Yeka Sub-City', 'Addis Ababa', 'A-', 'Mulugeta Alemayehu', '+251922200023', 'Sulfa drugs', 'Diabetes', NOW()),
  ('21111111-1111-1111-1111-111111111134', 'PAT-024', 'Mulugeta Asfaw', '1974-04-07', 'Male', '+251911100024', 'mulugeta.a@email.com', 'Arada Sub-City', 'Addis Ababa', 'AB+', 'Hiwot Asfaw', '+251922200024', NULL, 'COPD', NOW()),
  ('21111111-1111-1111-1111-111111111135', 'PAT-025', 'Hiwot Bekele', '1992-06-25', 'Female', '+251911100025', 'hiwot.b@email.com', 'Lideta Sub-City', 'Addis Ababa', 'O-', 'Birhanu Bekele', '+251922200025', 'Codeine', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111136', 'PAT-026', 'Birhanu Tadesse', '1979-10-18', 'Male', '+251911100026', 'birhanu.t@email.com', 'Kolfe Keranio', 'Addis Ababa', 'B-', 'Aster Tadesse', '+251922200026', NULL, 'Hyperlipidemia', NOW()),
  ('21111111-1111-1111-1111-111111111137', 'PAT-027', 'Alemnesh Girma', '1988-02-01', 'Female', '+251911100027', 'alemnesh.g@email.com', 'Nifas Silk Lafto', 'Addis Ababa', 'A+', 'Tewodros Girma', '+251922200027', 'Aspirin', 'Anemia', NOW()),
  ('21111111-1111-1111-1111-111111111138', 'PAT-028', 'Tewodros Melaku', '1990-05-13', 'Male', '+251911100028', 'tewodros.m@email.com', 'Gulele Sub-City', 'Addis Ababa', 'AB-', 'Meselech Melaku', '+251922200028', NULL, NULL, NOW()),
  ('21111111-1111-1111-1111-111111111139', 'PAT-029', 'Meselech Tesfaye', '1969-09-26', 'Female', '+251911100029', 'meselech.t@email.com', 'Akaki Kality', 'Addis Ababa', 'O+', 'Fikre Tesfaye', '+251922200029', 'Ibuprofen', 'Osteoporosis', NOW()),
  ('21111111-1111-1111-1111-111111111140', 'PAT-030', 'Fikre Alemu', '1985-01-08', 'Male', '+251911100030', 'fikre.a@email.com', 'Addis Ketema', 'Addis Ababa', 'B+', 'Kidist Alemu', '+251922200030', NULL, 'Gout', NOW()),
  ('21111111-1111-1111-1111-111111111141', 'PAT-031', 'Kidist Tadesse', '1993-04-21', 'Female', '+251911100031', 'kidist.t2@email.com', 'Bole Sub-City', 'Addis Ababa', 'A-', 'Bereket Tadesse', '+251922200031', 'Penicillin', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111142', 'PAT-032', 'Bereket Haile', '1977-08-04', 'Male', '+251911100032', 'bereket.h@email.com', 'Kirkos Sub-City', 'Addis Ababa', 'AB+', 'Yordanos Haile', '+251922200032', NULL, 'Depression', NOW()),
  ('21111111-1111-1111-1111-111111111143', 'PAT-033', 'Yordanos Girma', '1991-12-17', 'Female', '+251911100033', 'yordanos.g@email.com', 'Yeka Sub-City', 'Addis Ababa', 'O-', 'Fikre Girma', '+251922200033', 'Sulfa drugs', 'Anxiety', NOW()),
  ('21111111-1111-1111-1111-111111111144', 'PAT-034', 'Fikre Bekele', '1980-05-30', 'Male', '+251911100034', 'fikre.b@email.com', 'Arada Sub-City', 'Addis Ababa', 'B-', 'Almaz Bekele', '+251922200034', NULL, 'Peptic Ulcer', NOW()),
  ('21111111-1111-1111-1111-111111111145', 'PAT-035', 'Almaz Tesema', '1994-09-12', 'Female', '+251911100035', 'almaz.tes@email.com', 'Lideta Sub-City', 'Addis Ababa', 'A+', 'Dawit Tesema', '+251922200035', 'Codeine', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111146', 'PAT-036', 'Dawit Alemayehu', '1973-01-25', 'Male', '+251911100036', 'dawit.a2@email.com', 'Kolfe Keranio', 'Addis Ababa', 'AB-', 'Hanna Alemayehu', '+251922200036', NULL, 'Hypertension, Diabetes', NOW()),
  ('21111111-1111-1111-1111-111111111147', 'PAT-037', 'Hanna Asfaw', '1989-06-07', 'Female', '+251911100037', 'hanna.a@email.com', 'Nifas Silk Lafto', 'Addis Ababa', 'O+', 'Belete Asfaw', '+251922200037', 'Aspirin', 'PCOS', NOW()),
  ('21111111-1111-1111-1111-111111111148', 'PAT-038', 'Belete Tsegaye', '1996-10-20', 'Male', '+251911100038', 'belete.t@email.com', 'Gulele Sub-City', 'Addis Ababa', 'B+', 'Sara Tsegaye', '+251922200038', NULL, NULL, NOW()),
  ('21111111-1111-1111-1111-111111111149', 'PAT-039', 'Sara Mengistu', '1982-02-03', 'Female', '+251911100039', 'sara.m@email.com', 'Akaki Kality', 'Addis Ababa', 'A-', 'Mikias Mengistu', '+251922200039', 'Ibuprofen', 'Fibroids', NOW()),
  ('21111111-1111-1111-1111-111111111150', 'PAT-040', 'Mikias Kebede', '1987-06-16', 'Male', '+251911100040', 'mikias.k@email.com', 'Addis Ketema', 'Addis Ababa', 'AB+', 'Aster Kebede', '+251922200040', NULL, 'Hepatitis B', NOW()),
  ('21111111-1111-1111-1111-111111111151', 'PAT-041', 'Aster Tesfaye', '1990-09-28', 'Female', '+251911100041', 'aster.t@email.com', 'Bole Sub-City', 'Addis Ababa', 'O-', 'Muluemebet Tesfaye', '+251922200041', 'Penicillin', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111152', 'PAT-042', 'Muluemebet Gidey', '1975-01-11', 'Female', '+251911100042', 'muluemebet.g@email.com', 'Kirkos Sub-City', 'Addis Ababa', 'B-', 'Abebech Gidey', '+251922200042', NULL, 'Endometriosis', NOW()),
  ('21111111-1111-1111-1111-111111111153', 'PAT-043', 'Abebech Alemu', '1995-05-23', 'Female', '+251911100043', 'abebech.a@email.com', 'Yeka Sub-City', 'Addis Ababa', 'A+', 'Tigist Alemu', '+251922200043', 'Sulfa drugs', NULL, NOW()),
  ('21111111-1111-1111-1111-111111111154', 'PAT-044', 'Tigist Haile', '1981-08-05', 'Female', '+251911100044', 'tigist.h2@email.com', 'Arada Sub-City', 'Addis Ababa', 'AB+', 'Yohannes Haile', '+251922200044', NULL, 'Breast Cancer survivor', NOW()),
  ('21111111-1111-1111-1111-111111111155', 'PAT-045', 'Yohannes Tadesse', '1978-12-18', 'Male', '+251911100045', 'yohannes.t2@email.com', 'Lideta Sub-City', 'Addis Ababa', 'O+', 'Meselech Tadesse', '+251922200045', 'Codeine', 'Parkinsons Disease', NOW()),
  ('21111111-1111-1111-1111-111111111156', 'PAT-046', 'Meselech Bekele', '1992-04-01', 'Female', '+251911100046', 'meselech.b@email.com', 'Kolfe Keranio', 'Addis Ababa', 'B+', 'Dawit Bekele', '+251922200046', NULL, NULL, NOW()),
  ('21111111-1111-1111-1111-111111111157', 'PAT-047', 'Dawit Girma', '1984-08-13', 'Male', '+251911100047', 'dawit.g2@email.com', 'Nifas Silk Lafto', 'Addis Ababa', 'A-', 'Selam Girma', '+251922200047', 'Aspirin', 'Glaucoma', NOW()),
  ('21111111-1111-1111-1111-111111111158', 'PAT-048', 'Selam Tadesse', '1989-01-26', 'Female', '+251911100048', 'selam.t2@email.com', 'Gulele Sub-City', 'Addis Ababa', 'AB-', 'Bereket Tadesse', '+251922200048', NULL, 'Multiple Sclerosis', NOW()),
  ('21111111-1111-1111-1111-111111111159', 'PAT-049', 'Bereket Alemayehu', '1971-05-09', 'Male', '+251911100049', 'bereket.a2@email.com', 'Akaki Kality', 'Addis Ababa', 'O+', 'Kidist Alemayehu', '+251922200049', 'Ibuprofen', 'GERD', NOW()),
  ('21111111-1111-1111-1111-111111111160', 'PAT-050', 'Kidist Asfaw', '1993-09-22', 'Female', '+251911100050', 'kidist.a@email.com', 'Addis Ketema', 'Addis Ababa', 'B-', 'Yordanos Asfaw', '+251922200050', NULL, 'Hypothyroidism', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert the admin user (will be linked to auth)
INSERT INTO users (id, email, full_name, role, phone, bio, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@hospital.com', 'Dr. Alemayehu Tesfaye', 'hospital_admin', '+251911001001', 'System Administrator and Hospital Director', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments using gen_random_uuid()
INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, appointment_type, reason_for_visit, duration_minutes, created_at)
SELECT
  (SELECT id FROM patients OFFSET floor(random() * 50) LIMIT 1),
  (SELECT id FROM users WHERE role = 'doctor' OFFSET floor(random() * 10) LIMIT 1),
  NOW() + (random() * 7 || ' days')::interval,
  CASE (i % 4)
    WHEN 0 THEN 'scheduled'
    WHEN 1 THEN 'checked_in'
    WHEN 2 THEN 'in_consultation'
    ELSE 'completed'
  END,
  CASE (i % 5)
    WHEN 0 THEN 'general'
    WHEN 1 THEN 'follow-up'
    WHEN 2 THEN 'emergency'
    WHEN 3 THEN 'consultation'
    ELSE 'routine_checkup'
  END,
  CASE (i % 6)
    WHEN 0 THEN 'Fever and headache'
    WHEN 1 THEN 'Stomach pain'
    WHEN 2 THEN 'Back pain'
    WHEN 3 THEN 'Cough and cold'
    WHEN 4 THEN 'Annual checkup'
    ELSE 'Follow-up visit'
  END,
  30,
  NOW() - (random() * 30 || ' days')::interval
FROM generate_series(1, 30) AS i;

-- Insert sample lab results
INSERT INTO lab_results (patient_id, test_name, test_category, result_value, normal_range, unit, status, result_date, created_at)
SELECT
  (SELECT id FROM patients OFFSET floor(random() * 50) LIMIT 1),
  CASE (i % 5)
    WHEN 0 THEN 'Complete Blood Count (CBC)'
    WHEN 1 THEN 'Blood Glucose Fasting'
    WHEN 2 THEN 'Lipid Panel'
    WHEN 3 THEN 'Liver Function Test'
    ELSE 'Thyroid Panel'
  END,
  CASE (i % 5)
    WHEN 0 THEN 'Hematology'
    WHEN 1 THEN 'Chemistry'
    WHEN 2 THEN 'Chemistry'
    WHEN 3 THEN 'Chemistry'
    ELSE 'Endocrinology'
  END,
  (random() * 100)::text,
  'Normal Range',
  'units',
  CASE (i % 3)
    WHEN 0 THEN 'completed'
    WHEN 1 THEN 'pending'
    ELSE 'completed'
  END,
  NOW()::date,
  NOW() - (random() * 30 || ' days')::interval
FROM generate_series(1, 20) AS i;

-- Insert sample bills
INSERT INTO bills (bill_id, patient_id, description, category, amount, paid_amount, status, due_date, created_at)
SELECT
  'BILL-' || LPAD(i::text, 6, '0'),
  (SELECT id FROM patients OFFSET floor(random() * 50) LIMIT 1),
  CASE (i % 5)
    WHEN 0 THEN 'Consultation Fee'
    WHEN 1 THEN 'Laboratory Tests'
    WHEN 2 THEN 'Medication'
    WHEN 3 THEN 'X-Ray'
    ELSE 'Room and Board'
  END,
  CASE (i % 5)
    WHEN 0 THEN 'consultation'
    WHEN 1 THEN 'laboratory'
    WHEN 2 THEN 'pharmacy'
    WHEN 3 THEN 'radiology'
    ELSE 'accommodation'
  END,
  (random() * 5000 + 500)::numeric(10,2),
  (random() * 2000)::numeric(10,2),
  CASE (i % 4)
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'paid'
    WHEN 2 THEN 'partial'
    ELSE 'cancelled'
  END,
  NOW() + (random() * 30 || ' days')::interval,
  NOW() - (random() * 30 || ' days')::interval
FROM generate_series(1, 20) AS i;

-- Create the Supabase auth user for admin@hospital.com with password demo123456
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'admin@hospital.com',
  crypt('demo123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Dr. Alemayehu Tesfaye"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Insert identity for the auth user
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@hospital.com',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@hospital.com"}',
  'email',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
