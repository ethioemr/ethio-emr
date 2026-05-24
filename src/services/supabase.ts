import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle errors
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  return String(error);
};

// Auth utilities
export const authService = {
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  signUp: async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  },

  signIn: async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    return supabase.auth.signOut();
  },

  resetPassword: async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email);
  },

  updatePassword: async (newPassword: string) => {
    return supabase.auth.updateUser({ password: newPassword });
  },
};

// Patient service
export const patientService = {
  getAll: async () => {
    return supabase.from('patients').select('*').order('created_at', { ascending: false });
  },

  getById: async (id: string) => {
    return supabase.from('patients').select('*').eq('id', id).maybeSingle();
  },

  getByMRN: async (mrn: string) => {
    return supabase.from('patients').select('*').eq('mrn', mrn).maybeSingle();
  },

  create: async (data: any) => {
    return supabase.from('patients').insert([data]).select();
  },

  update: async (id: string, data: any) => {
    return supabase.from('patients').update(data).eq('id', id).select();
  },

  delete: async (id: string) => {
    return supabase.from('patients').delete().eq('id', id);
  },

  search: async (query: string) => {
    return supabase
      .from('patients')
      .select('*')
      .or(`full_name.ilike.%${query}%,mrn.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(50);
  },
};

// Appointment service
export const appointmentService = {
  getAll: async () => {
    return supabase
      .from('appointments')
      .select('*,patient_id(*),doctor_id(*)')
      .order('appointment_date', { ascending: true });
  },

  getById: async (id: string) => {
    return supabase
      .from('appointments')
      .select('*,patient_id(*),doctor_id(*)')
      .eq('id', id)
      .maybeSingle();
  },

  getByDate: async (date: string) => {
    return supabase
      .from('appointments')
      .select('*,patient_id(*),doctor_id(*)')
      .gte('appointment_date', `${date}T00:00:00`)
      .lt('appointment_date', `${date}T23:59:59`)
      .order('appointment_date', { ascending: true });
  },

  create: async (data: any) => {
    return supabase.from('appointments').insert([data]).select();
  },

  update: async (id: string, data: any) => {
    return supabase.from('appointments').update(data).eq('id', id).select();
  },

  delete: async (id: string) => {
    return supabase.from('appointments').delete().eq('id', id);
  },
};

// Consultation service
export const consultationService = {
  getAll: async () => {
    return supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });
  },

  getByPatient: async (patientId: string) => {
    return supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
  },

  create: async (data: any) => {
    return supabase.from('consultations').insert([data]).select();
  },

  update: async (id: string, data: any) => {
    return supabase.from('consultations').update(data).eq('id', id).select();
  },
};

// Prescription service
export const prescriptionService = {
  getAll: async () => {
    return supabase
      .from('prescriptions')
      .select('*')
      .order('prescribed_at', { ascending: false });
  },

  getByPatient: async (patientId: string) => {
    return supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('prescribed_at', { ascending: false });
  },

  create: async (data: any) => {
    return supabase.from('prescriptions').insert([data]).select();
  },

  update: async (id: string, data: any) => {
    return supabase.from('prescriptions').update(data).eq('id', id).select();
  },
};

// Lab result service
export const labResultService = {
  getAll: async () => {
    return supabase
      .from('lab_results')
      .select('*')
      .order('created_at', { ascending: false });
  },

  getByPatient: async (patientId: string) => {
    return supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
  },

  create: async (data: any) => {
    return supabase.from('lab_results').insert([data]).select();
  },

  update: async (id: string, data: any) => {
    return supabase.from('lab_results').update(data).eq('id', id).select();
  },
};

// Invoice service
export const invoiceService = {
  getAll: async () => {
    return supabase
      .from('invoices')
      .select('*')
      .order('invoice_date', { ascending: false });
  },

  getByPatient: async (patientId: string) => {
    return supabase
      .from('invoices')
      .select('*')
      .eq('patient_id', patientId)
      .order('invoice_date', { ascending: false });
  },

  create: async (data: any) => {
    return supabase.from('invoices').insert([data]).select();
  },

  update: async (id: string, data: any) => {
    return supabase.from('invoices').update(data).eq('id', id).select();
  },
};

// User service
export const userService = {
  getAll: async () => {
    return supabase.from('users').select('*').order('created_at', { ascending: false });
  },

  getById: async (id: string) => {
    return supabase.from('users').select('*').eq('id', id).maybeSingle();
  },

  getCurrentUser: async () => {
    const user = await authService.getCurrentUser();
    if (!user) return null;
    return userService.getById(user.id);
  },

  create: async (data: any) => {
    return supabase.from('users').insert([data]).select();
  },

  update: async (id: string, data: any) => {
    return supabase.from('users').update(data).eq('id', id).select();
  },
};
