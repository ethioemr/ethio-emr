import { supabase } from './supabase';

export async function seedDemoData() {
  try {
    // Create demo users (doctors/staff)
    const users = await supabase.from('users').select('count(*)').limit(1);
    if ((users.count || 0) > 0) return; // Already seeded

    // Demo staff/doctors
    await supabase.from('users').insert([
      {
        id: 'demo-doctor-1',
        email: 'dr.abebe@hospital.com',
        full_name: 'Dr. Abebe Kebede',
        role: 'doctor',
        phone: '+251911223344',
      },
      {
        id: 'demo-doctor-2',
        email: 'dr.almaz@hospital.com',
        full_name: 'Dr. Almaz Kebede',
        role: 'doctor',
        phone: '+251922334455',
      },
    ]);

    // Demo patients
    const patientData = [
      {
        patient_id: 'P202500001',
        full_name: 'Teodros Alemu',
        date_of_birth: '1990-05-15',
        gender: 'male',
        phone: '0911223344',
        email: 'teodros@example.com',
        address: 'Addis Ababa',
        city: 'Addis Ababa',
        blood_type: 'O+',
        allergies: 'Penicillin',
        chronic_conditions: 'Hypertension',
      },
      {
        patient_id: 'P202500002',
        full_name: 'Tirunesh Tesfaye',
        date_of_birth: '1985-08-22',
        gender: 'female',
        phone: '0922334455',
        email: 'tirunesh@example.com',
        address: 'Addis Ababa',
        city: 'Addis Ababa',
        blood_type: 'A+',
        allergies: 'Sulfa drugs',
        chronic_conditions: 'Diabetes',
      },
      {
        patient_id: 'P202500003',
        full_name: 'Bekele Birru',
        date_of_birth: '1995-12-03',
        gender: 'male',
        phone: '0933445566',
        email: 'bekele@example.com',
        address: 'Addis Ababa',
        city: 'Addis Ababa',
        blood_type: 'B+',
        allergies: 'None',
        chronic_conditions: 'None',
      },
    ];

    const insertedPatients = await supabase
      .from('patients')
      .insert(patientData)
      .select('id');

    if (!insertedPatients.data) return;

    const patientIds = insertedPatients.data.map((p) => p.id);

    // Demo appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await supabase.from('appointments').insert([
      {
        patient_id: patientIds[0],
        doctor_id: 'demo-doctor-1',
        appointment_date: tomorrow.toISOString(),
        duration_minutes: 30,
        status: 'scheduled',
        appointment_type: 'general',
        reason_for_visit: 'Regular checkup',
      },
      {
        patient_id: patientIds[1],
        doctor_id: 'demo-doctor-2',
        appointment_date: tomorrow.toISOString(),
        duration_minutes: 45,
        status: 'scheduled',
        appointment_type: 'follow-up',
        reason_for_visit: 'Diabetes follow-up',
      },
    ]);

    // Demo prescriptions
    await supabase.from('prescriptions').insert([
      {
        prescription_id: 'RX-2025-00001',
        patient_id: patientIds[0],
        doctor_id: 'demo-doctor-1',
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: 30,
        duration_unit: 'days',
        instructions: 'Take in the morning with water',
        status: 'active',
        prescribed_at: new Date().toISOString().split('T')[0],
      },
      {
        prescription_id: 'RX-2025-00002',
        patient_id: patientIds[1],
        doctor_id: 'demo-doctor-2',
        medication: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: 30,
        duration_unit: 'days',
        instructions: 'Take with meals',
        status: 'active',
        prescribed_at: new Date().toISOString().split('T')[0],
      },
    ]);

    // Demo lab results
    await supabase.from('lab_results').insert([
      {
        patient_id: patientIds[0],
        test_name: 'Blood Pressure',
        test_category: 'Cardiovascular',
        result_value: '140/90',
        normal_range: '<120/80',
        unit: 'mmHg',
        status: 'abnormal',
        result_date: new Date().toISOString().split('T')[0],
      },
      {
        patient_id: patientIds[1],
        test_name: 'Fasting Blood Sugar',
        test_category: 'Metabolic',
        result_value: '156',
        normal_range: '70-100',
        unit: 'mg/dL',
        status: 'abnormal',
        result_date: new Date().toISOString().split('T')[0],
      },
      {
        patient_id: patientIds[2],
        test_name: 'Complete Blood Count',
        test_category: 'Hematology',
        result_value: 'Normal',
        normal_range: 'Normal',
        status: 'completed',
        result_date: new Date().toISOString().split('T')[0],
      },
    ]);

    // Demo bills
    await supabase.from('bills').insert([
      {
        bill_id: 'INV-2025-00001',
        patient_id: patientIds[0],
        description: 'Consultation and tests',
        category: 'medical',
        amount: 2500,
        paid_amount: 0,
        status: 'pending',
      },
      {
        bill_id: 'INV-2025-00002',
        patient_id: patientIds[1],
        description: 'Medication and follow-up',
        category: 'pharmacy',
        amount: 1800,
        paid_amount: 1800,
        status: 'paid',
      },
    ]);

    // Demo consultations
    const consultationDate = new Date();
    consultationDate.setHours(consultationDate.getHours() + 1);

    await supabase.from('consultations').insert([
      {
        patient_id: patientIds[0],
        doctor_id: 'demo-doctor-1',
        start_time: consultationDate.toISOString(),
        type: 'video',
        status: 'scheduled',
        room_id: 'room-001',
      },
    ]);

    console.log('Demo data seeded successfully!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}
