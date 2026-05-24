import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Edit2, Plus, Activity, Pill, AlertCircle } from 'lucide-react';

interface PatientDetailsProps {
  patientId: string;
  onBack: () => void;
}

export default function PatientDetails({ patientId, onBack }: PatientDetailsProps) {
  const [patient, setPatient] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'prescriptions' | 'vitals'>('overview');

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const [patientRes, historyRes, prescriptionsRes, vitalsRes] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).maybeSingle(),
        supabase.from('medical_history').select('*').eq('patient_id', patientId),
        supabase.from('prescriptions').select('*').eq('patient_id', patientId),
        supabase.from('vital_signs').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }),
      ]);

      if (patientRes.data) setPatient(patientRes.data);
      if (historyRes.data) setMedicalHistory(historyRes.data);
      if (prescriptionsRes.data) setPrescriptions(prescriptionsRes.data);
      if (vitalsRes.data) setVitalSigns(vitalsRes.data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading patient details...</div>;
  }

  if (!patient) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Patients
        </button>
        <p className="text-gray-600">Patient not found</p>
      </div>
    );
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Patients
      </button>

      {/* Patient Header */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {patient.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{patient.full_name}</h1>
                <p className="text-gray-600 mt-1">ID: {patient.patient_id}</p>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm mb-1">Age</p>
            <p className="text-2xl font-bold text-gray-900">{calculateAge(patient.date_of_birth)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm mb-1">Gender</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{patient.gender}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm mb-1">Blood Type</p>
            <p className="text-2xl font-bold text-gray-900">{patient.blood_type || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm mb-1">Status</p>
            <p className="text-2xl font-bold text-emerald-600">Active</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900 font-medium">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900 font-medium">{patient.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-gray-900 font-medium">{patient.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="text-gray-900 font-medium">{patient.city || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Medical Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Allergies</p>
              {patient.allergies ? (
                <div className="flex gap-2 flex-wrap">
                  {patient.allergies.split(',').map((allergy: string, idx: number) => (
                    <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {allergy.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900">None reported</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Chronic Conditions</p>
              <p className="text-gray-900">{patient.chronic_conditions || 'None reported'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview' as const, label: 'Overview' },
            { id: 'history' as const, label: 'Medical History', count: medicalHistory.length },
            { id: 'prescriptions' as const, label: 'Prescriptions', count: prescriptions.length },
            { id: 'vitals' as const, label: 'Vital Signs', count: vitalSigns.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 font-semibold transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Patient Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Recent Appointments</p>
                    <p className="text-sm text-gray-600">Last visited on May 20, 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Active Medications</p>
                    <p className="text-sm text-gray-600">{prescriptions.filter(p => p.status === 'active').length} active prescriptions</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Medical History</h3>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                  <Plus className="w-4 h-4" />
                  Add Record
                </button>
              </div>
              {medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {medicalHistory.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900">{record.diagnosis}</p>
                        <span className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{record.treatment || 'No treatment notes'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No medical history recorded</p>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Prescriptions</h3>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                  <Plus className="w-4 h-4" />
                  New Prescription
                </button>
              </div>
              {prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{rx.medication}</p>
                          <p className="text-sm text-gray-600">{rx.dosage} - {rx.frequency}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rx.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rx.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Prescribed: {new Date(rx.prescribed_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No prescriptions</p>
              )}
            </div>
          )}

          {activeTab === 'vitals' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Vital Signs</h3>
              {vitalSigns.length > 0 ? (
                <div className="space-y-4">
                  {vitalSigns.slice(0, 5).map((vital) => (
                    <div key={vital.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <p className="text-sm text-gray-600 mb-2">{new Date(vital.recorded_at).toLocaleString()}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {vital.temperature && (
                          <div>
                            <p className="text-xs text-gray-600">Temperature</p>
                            <p className="text-lg font-semibold text-gray-900">{vital.temperature}°C</p>
                          </div>
                        )}
                        {vital.pulse && (
                          <div>
                            <p className="text-xs text-gray-600">Pulse</p>
                            <p className="text-lg font-semibold text-gray-900">{vital.pulse} bpm</p>
                          </div>
                        )}
                        {vital.blood_pressure && (
                          <div>
                            <p className="text-xs text-gray-600">Blood Pressure</p>
                            <p className="text-lg font-semibold text-gray-900">{vital.blood_pressure}</p>
                          </div>
                        )}
                        {vital.oxygen_saturation && (
                          <div>
                            <p className="text-xs text-gray-600">O2 Saturation</p>
                            <p className="text-lg font-semibold text-gray-900">{vital.oxygen_saturation}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No vital signs recorded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
