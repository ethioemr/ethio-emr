import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard as Edit2, Phone, Mail, MapPin, Droplet, AlertTriangle, User } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  blood_type?: string;
  emergency_contact?: string;
  emergency_contact_phone?: string;
  allergies?: string;
  chronic_conditions?: string;
  created_at: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  appointment_type: string;
  reason_for_visit?: string;
  users?: { full_name: string };
}

interface LabResult {
  id: string;
  test_name: string;
  result_value: string;
  status: string;
  result_date: string;
}

export default function PatientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      setPatient(patientData);

      if (patientData) {
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('*, users!appointments_doctor_id_fkey(full_name)')
          .eq('patient_id', id)
          .order('appointment_date', { ascending: false })
          .limit(10);

        setAppointments(appointmentsData || []);

        const { data: labsData } = await supabase
          .from('lab_results')
          .select('*')
          .eq('patient_id', id)
          .order('result_date', { ascending: false })
          .limit(10);

        setLabResults(labsData || []);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
              {patient.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
              <p className="text-gray-500 mt-1">Patient ID: {patient.patient_id}</p>
              <p className="text-sm text-gray-400 mt-1">Registered: {new Date(patient.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 transition">
            <Edit2 size={18} />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Age</p>
            <p className="text-xl font-bold text-gray-900">{calculateAge(patient.date_of_birth)} years</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Gender</p>
            <p className="text-xl font-bold text-gray-900">{patient.gender}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Blood Type</p>
            <p className="text-xl font-bold text-gray-900">{patient.blood_type || 'Unknown'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="text-xl font-bold text-green-600">Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{patient.phone}</p>
              </div>
            </div>
            {patient.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{patient.email}</p>
                </div>
              </div>
            )}
            {patient.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{patient.address}, {patient.city}</p>
                </div>
              </div>
            )}
            {patient.emergency_contact && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="text-gray-900">{patient.emergency_contact} - {patient.emergency_contact_phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
          <div className="space-y-4">
            {patient.allergies && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Allergies</p>
                  <span className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium mt-1">
                    {patient.allergies}
                  </span>
                </div>
              </div>
            )}
            {patient.chronic_conditions && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Chronic Conditions</p>
                  <span className="inline-block bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mt-1">
                    {patient.chronic_conditions}
                  </span>
                </div>
              </div>
            )}
            {patient.blood_type && (
              <div className="flex items-start gap-3">
                <Droplet className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="text-gray-900 font-semibold">{patient.blood_type}</p>
                </div>
              </div>
            )}
            {!patient.allergies && !patient.chronic_conditions && !patient.blood_type && (
              <p className="text-gray-500 text-sm">No medical information recorded</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Doctor</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{new Date(apt.appointment_date).toLocaleDateString()}</td>
                    <td className="py-3 text-sm text-gray-600">{apt.users?.full_name || 'N/A'}</td>
                    <td className="py-3 text-sm text-gray-600">{apt.appointment_type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'in_consultation' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No appointments recorded</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lab Results</h2>
        {labResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Test</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Result</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {labResults.map((lab) => (
                  <tr key={lab.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{lab.test_name}</td>
                    <td className="py-3 text-sm text-gray-600">{lab.result_value}</td>
                    <td className="py-3 text-sm text-gray-600">{new Date(lab.result_date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        lab.status === 'completed' ? 'bg-green-100 text-green-700' :
                        lab.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {lab.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No lab results recorded</p>
        )}
      </div>
    </div>
  );
}
