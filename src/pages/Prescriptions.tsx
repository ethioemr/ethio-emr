import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Pill, Download, Eye } from 'lucide-react';

export default function Prescriptions() {
  const [prescriptions, setPresciptions] = useState<any[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'completed'>('all');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    let filtered = prescriptions;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    filtered = filtered.filter(
      (p) =>
        p.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prescription_id.includes(searchTerm)
    );

    setFilteredPrescriptions(filtered);
  }, [searchTerm, prescriptions, statusFilter]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*, patients(full_name), users(full_name)')
        .order('prescribed_at', { ascending: false });

      if (error) throw error;
      setPresciptions(data || []);
      setFilteredPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading prescriptions...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-2">Manage patient medications and prescriptions</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold">
          <Plus className="w-5 h-5" />
          New Prescription
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search medication or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions Grid */}
      <div className="grid gap-4">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{prescription.medication}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Patient: {prescription.patients?.full_name} • Doctor: {prescription.users?.full_name}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Dosage</p>
                        <p className="text-sm font-semibold text-gray-900">{prescription.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Frequency</p>
                        <p className="text-sm font-semibold text-gray-900">{prescription.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-sm font-semibold text-gray-900">{prescription.duration} {prescription.duration_unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID</p>
                        <p className="text-sm font-semibold text-gray-900 font-mono">{prescription.prescription_id}</p>
                      </div>
                    </div>
                    {prescription.instructions && (
                      <p className="text-sm text-gray-600 mt-2 italic">Instructions: {prescription.instructions}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    prescription.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {prescription.status}
                  </span>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No prescriptions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
