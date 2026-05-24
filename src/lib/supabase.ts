import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          department_id: string | null;
          phone: string | null;
          photo_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      patients: {
        Row: {
          id: string;
          patient_id: string;
          full_name: string;
          date_of_birth: string;
          gender: string;
          phone: string;
          email: string | null;
          address: string | null;
          city: string | null;
          blood_type: string | null;
          emergency_contact: string | null;
          emergency_contact_phone: string | null;
          allergies: string | null;
          chronic_conditions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Row']>;
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          appointment_date: string;
          duration_minutes: number;
          status: string;
          appointment_type: string;
          reason_for_visit: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['appointments']['Row']>;
      };
      prescriptions: {
        Row: {
          id: string;
          prescription_id: string;
          patient_id: string;
          doctor_id: string;
          medication: string;
          dosage: string;
          frequency: string;
          duration: number;
          duration_unit: string;
          instructions: string | null;
          status: string;
          prescribed_at: string;
          expiry_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prescriptions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['prescriptions']['Row']>;
      };
      lab_results: {
        Row: {
          id: string;
          patient_id: string;
          test_name: string;
          test_category: string;
          result_value: string | null;
          normal_range: string | null;
          unit: string | null;
          status: string;
          result_date: string;
          requested_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lab_results']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['lab_results']['Row']>;
      };
      bills: {
        Row: {
          id: string;
          bill_id: string;
          patient_id: string;
          description: string | null;
          category: string;
          amount: number;
          paid_amount: number;
          status: string;
          due_date: string | null;
          paid_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bills']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bills']['Row']>;
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          start_time: string;
          end_time: string | null;
          type: string;
          room_id: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['consultations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['consultations']['Row']>;
      };
      departments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          head_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['departments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['departments']['Row']>;
      };
      medical_history: {
        Row: {
          id: string;
          patient_id: string;
          diagnosis: string;
          treatment: string | null;
          date: string;
          doctor_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medical_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['medical_history']['Row']>;
      };
      vital_signs: {
        Row: {
          id: string;
          patient_id: string;
          temperature: number | null;
          pulse: number | null;
          blood_pressure: string | null;
          respiratory_rate: number | null;
          oxygen_saturation: number | null;
          weight: number | null;
          height: number | null;
          bmi: number | null;
          recorded_at: string;
          recorded_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['vital_signs']['Row'], 'recorded_at'>;
        Update: Partial<Database['public']['Tables']['vital_signs']['Row']>;
      };
    };
  };
};
