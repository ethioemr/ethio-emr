import { useState, useEffect } from 'react';
import { BedDouble, Plus, Search, Users, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Ward {
  id: string;
  ward_name: string;
  ward_type?: string;
  department_id?: string;
  total_beds: number;
  created_at: string;
}

interface Bed {
  id: string;
  ward_id: string;
  bed_number: string;
  bed_status: string;
  patient_currently_admitted?: string;
  created_at: string;
}

interface Admission {
  id: string;
  patient_id: string;
  bed_id: string;
  ward_id: string;
  admission_date: string;
  discharge_date?: string;
  admission_type: string;
  admission_notes?: string;
  patients?: { id: string; patient_id: string; full_name: string; phone: string };
  created_at: string;
}

export default function BedManagement() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedWard, setSelectedWard] = useState<string>('all');

  const [formData, setFormData] = useState({
    patient_id: '',
    ward_id: '',
    bed_id: '',
    admission_type: 'scheduled',
    admission_notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wardsRes, bedsRes, admissionsRes, patientsRes] = await Promise.all([
        supabase.from('wards').select('*').order('ward_name'),
        supabase.from('beds').select('*'),
        supabase.from('admissions').select('*, patients!admissions_patient_id_fkey(id, patient_id, full_name, phone)').is('discharge_date', null),
        supabase.from('patients').select('id, patient_id, full_name, phone').order('full_name')
      ]);

      setWards(wardsRes.data || []);
      setBeds(bedsRes.data || []);
      setAdmissions(admissionsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (error) {
      console.error('Error loading bed data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('admissions')
        .insert([{
          ...formData,
          admission_date: new Date().toISOString()
        }]);

      if (error) throw error;

      // Update bed status
      await supabase
        .from('beds')
        .update({ bed_status: 'occupied', patient_currently_admitted: formData.patient_id })
        .eq('id', formData.bed_id);

      setShowModal(false);
      setFormData({ patient_id: '', ward_id: '', bed_id: '', admission_type: 'scheduled', admission_notes: '' });
      loadData();
    } catch (error) {
      console.error('Error creating admission:', error);
    }
  };

  const dischargePatient = async (admission: Admission, bedId: string) => {
    try {
      // Update admission with discharge date
      await supabase
        .from('admissions')
        .update({ discharge_date: new Date().toISOString() })
        .eq('id', admission.id);

      // Update bed status
      await supabase
        .from('beds')
        .update({ bed_status: 'available', patient_currently_admitted: null })
        .eq('id', bedId);

      loadData();
    } catch (error) {
      console.error('Error discharging patient:', error);
    }
  };

  const getWardBeds = (wardId: string) => {
    return beds.filter(b => b.ward_id === wardId);
  };

  const getAdmissionForBed = (bedId: string) => {
    return admissions.find(a => a.bed_id === bedId);
  };

  const filteredAdmissions = admissions.filter((adm) => {
    return adm.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           adm.patients?.patient_id?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = {
    totalBeds: beds.length,
    available: beds.filter(b => b.bed_status === 'available').length,
    occupied: beds.filter(b => b.bed_status === 'occupied').length,
    maintenance: beds.filter(b => b.bed_status === 'maintenance').length
  };

  const occupancyRate = stats.totalBeds > 0 ? Math.round((stats.occupied / stats.totalBeds) * 100) : 0;

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-700 border-red-200';
      case 'maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'reserved': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bed Management</h1>
          <p className="text-gray-500 mt-1">Manage hospital beds and admissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus size={20} /> New Admission
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <BedDouble className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Beds</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalBeds}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-xl font-bold text-gray-900">{stats.available}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-lg">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupied</p>
              <p className="text-xl font-bold text-gray-900">{stats.occupied}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupancy</p>
              <p className="text-xl font-bold text-gray-900">{occupancyRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Wards</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>{ward.ward_name}</option>
            ))}
          </select>
          <div className="flex gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
              <span className="text-sm text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></div>
              <span className="text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Layout */}
      <div className="space-y-6">
        {wards
          .filter(ward => selectedWard === 'all' || ward.id === selectedWard)
          .map((ward) => {
            const wardBeds = getWardBeds(ward.id);
            const occupied = wardBeds.filter(b => b.bed_status === 'occupied').length;

            return (
              <div key={ward.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{ward.ward_name}</h2>
                    <p className="text-sm text-gray-500">{ward.ward_type || 'General'} Ward</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{occupied}/{wardBeds.length} occupied</p>
                    <div className="w-32 h-2 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-2 bg-red-500 rounded-full transition-all"
                        style={{ width: `${wardBeds.length > 0 ? (occupied / wardBeds.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {wardBeds.map((bed) => {
                    const admission = getAdmissionForBed(bed.id);
                    return (
                      <div
                        key={bed.id}
                        title={admission ? `${admission.patients?.full_name} - Click to discharge` : 'Click to admit'}
                        className={`p-3 rounded-lg text-center text-sm font-medium cursor-pointer transition border ${getBedStatusColor(bed.bed_status)} hover:opacity-80`}
                        onClick={() => {
                          if (bed.bed_status === 'available') {
                            setFormData({ ...formData, ward_id: ward.id, bed_id: bed.id });
                            setShowModal(true);
                          } else if (admission) {
                            if (confirm(`Discharge ${admission.patients?.full_name}?`)) {
                              dischargePatient(admission, bed.id);
                            }
                          }
                        }}
                      >
                        <BedDouble className="w-4 h-4 mx-auto mb-1" />
                        <p>{bed.bed_number}</p>
                        {admission && (
                          <p className="text-xs mt-1 truncate">{admission.patients?.full_name?.split(' ')[0]}</p>
                        )}
                      </div>
                    );
                  })}
                  {wardBeds.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-4">No beds configured</p>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Current Admissions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Admissions</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Admission Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Admitted</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{adm.patients?.full_name}</p>
                        <p className="text-xs text-gray-500">{adm.patients?.patient_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{adm.admission_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(adm.admission_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => dischargePatient(adm, adm.bed_id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Discharge
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAdmissions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <BedDouble className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900 mb-1">No current admissions</p>
                      <p className="text-sm">Click on an available bed to admit a patient</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">New Admission</h2>
            </div>
            <form onSubmit={handleAdmission} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.patient_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ward *</label>
                <select
                  value={formData.ward_id}
                  onChange={(e) => setFormData({ ...formData, ward_id: e.target.value, bed_id: '' })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Ward</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>{w.ward_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bed *</label>
                <select
                  value={formData.bed_id}
                  onChange={(e) => setFormData({ ...formData, bed_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Bed</option>
                  {getWardBeds(formData.ward_id)
                    .filter(b => b.bed_status === 'available')
                    .map((b) => (
                      <option key={b.id} value={b.id}>{b.bed_number}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Type</label>
                <select
                  value={formData.admission_type}
                  onChange={(e) => setFormData({ ...formData, admission_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="emergency">Emergency</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.admission_notes}
                  onChange={(e) => setFormData({ ...formData, admission_notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Admit Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
