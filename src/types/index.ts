// User roles
export type UserRole =
  | 'super_admin'
  | 'hospital_admin'
  | 'doctor'
  | 'nurse'
  | 'receptionist'
  | 'pharmacist'
  | 'lab_technician'
  | 'cashier'
  | 'patient';

// Appointment statuses
export type AppointmentStatus =
  | 'scheduled'
  | 'checked_in'
  | 'waiting'
  | 'in_consultation'
  | 'completed'
  | 'cancelled';

// Patient statuses
export type PatientStatus = 'active' | 'inactive' | 'deceased';

// Prescription statuses
export type PrescriptionStatus = 'active' | 'inactive' | 'expired' | 'fulfilled';

// Lab result statuses
export type LabResultStatus = 'pending' | 'completed' | 'critical';

// Payment statuses
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'cancelled';

// User model
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  profile_photo_url?: string;
  department_id?: string;
  license_number?: string;
  specialization?: string;
  bio?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Patient model
export interface Patient {
  id: string;
  mrn: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  age?: number;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  region?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_group?: string;
  allergies?: string;
  chronic_conditions?: string;
  insurance_provider?: string;
  insurance_number?: string;
  national_id?: string;
  patient_photo_url?: string;
  status: PatientStatus;
  created_at: string;
  updated_at: string;
}

// Appointment model
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  duration_minutes: number;
  status: AppointmentStatus;
  appointment_type?: string;
  reason_for_visit?: string;
  notes?: string;
  queue_number?: number;
  patient?: Patient;
  doctor?: User;
  created_at: string;
  updated_at: string;
}

// Consultation model (SOAP notes)
export interface Consultation {
  id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  consultation_type: 'initial' | 'follow_up' | 'emergency';

  // SOAP
  subjective_symptoms?: string;
  objective_findings?: string;
  assessment_diagnosis?: string;
  plan_treatment?: string;

  // Clinical data
  icd10_code?: string;
  temperature?: number;
  pulse?: number;
  blood_pressure?: string;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;

  notes?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

// Prescription model
export interface Prescription {
  id: string;
  prescription_id: string;
  patient_id: string;
  doctor_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: number;
  duration_unit: string;
  instructions?: string;
  status: PrescriptionStatus;
  prescribed_at: string;
  expiry_date?: string;
  created_at: string;
}

// Lab test model
export interface LabTest {
  id: string;
  test_code: string;
  test_name: string;
  test_category: string;
  description?: string;
  normal_range_min?: number;
  normal_range_max?: number;
  unit?: string;
  turnaround_time_hours?: number;
  requires_fasting: boolean;
  sample_type?: string;
}

// Lab result model
export interface LabResult {
  id: string;
  patient_id: string;
  test_id: string;
  doctor_ordered_id?: string;
  result_value?: number;
  result_text?: string;
  status: LabResultStatus;
  is_critical: boolean;
  is_abnormal: boolean;
  reference_note?: string;
  lab_notes?: string;
  ordered_date: string;
  completed_date?: string;
  created_at: string;
  test?: LabTest;
}

// Pharmacy item model
export interface PharmacyItem {
  id: string;
  drug_code: string;
  drug_name: string;
  manufacturer?: string;
  batch_number?: string;
  quantity_in_stock: number;
  reorder_level: number;
  unit_cost: number;
  selling_price: number;
  expiry_date?: string;
  strength?: string;
  form?: string;
  storage_location?: string;
  created_at: string;
  updated_at: string;
}

// Invoice model
export interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  net_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  insurance_provider?: string;
  insurance_claim_number?: string;
  invoice_date: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
  items?: InvoiceItem[];
}

// Invoice line item
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_description: string;
  item_type?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Ward model
export interface Ward {
  id: string;
  ward_name: string;
  ward_type?: string;
  department_id?: string;
  total_beds: number;
  created_at: string;
}

// Bed model
export interface Bed {
  id: string;
  ward_id: string;
  bed_number: string;
  bed_status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patient_currently_admitted?: string;
  created_at: string;
}

// Admission model
export interface Admission {
  id: string;
  patient_id: string;
  bed_id: string;
  ward_id: string;
  admission_date: string;
  discharge_date?: string;
  admission_type: 'emergency' | 'scheduled' | 'transfer';
  admission_notes?: string;
  discharge_summary?: string;
  admitted_doctor_id?: string;
  created_at: string;
}

// Department model
export interface Department {
  id: string;
  name: string;
  description?: string;
  head_doctor_id?: string;
  phone?: string;
  budget?: number;
  created_at: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalPatients: number;
  activeAppointments: number;
  dailyRevenue: number;
  pendingLabs: number;
  pendingBills: number;
  occupiedBeds: number;
  recentAdmissions: number;
}
