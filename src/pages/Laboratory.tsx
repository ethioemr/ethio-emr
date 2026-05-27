import { useState, useEffect } from 'react';
import { Beaker, Plus, Search, Clock, CheckCircle, AlertTriangle, FileText, Filter } from 'lucide-react';
import { supabase } from '../services/supabase';

interface LabResult {
  id: string;
  patient_id: string;
  test_name: string;
  test_category: string;
  result_value?: string;
  normal_range?: string;
  unit?: string;
  status: string;
  result_date: string;
  notes?: string;
  patients?: { id: string; patient_id: string; full_name: string; phone: string };
  created_at: string;
}

export default function Laboratory() {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState<LabResult | null>(null);

  const [formData, setFormData] = useState({
    patient_id: '',
    test_name: '',
    test_category: 'hematology',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [labsRes, patientsRes] = await Promise.all([
        supabase
          .from('lab_results')
          .select('*, patients!lab_results_patient_id_fkey(id, patient_id, full_name, phone)')
          .order('result_date', { ascending: false }),
        supabase.from('patients').select('id, patient_id, full_name, phone').order('full_name')
      ]);

      setLabResults(labsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (error) {
      console.error('Error loading lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('lab_results')
        .insert([{
          ...formData,
          status: 'pending',
          result_date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;
      setShowModal(false);
      setFormData({ patient_id: '', test_name: '', test_category: 'hematology', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error creating lab request:', error);
    }
  };

  const updateResult = async (id: string, result_value: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('lab_results')
        .update({
          result_value,
          notes,
          status: 'completed'
        })
        .eq('id', id);

      if (error) throw error;
      setShowResultModal(null);
      loadData();
    } catch (error) {
      console.error('Error updating result:', error);
    }
  };

  const filteredResults = labResults.filter((lab) => {
    const matchesSearch =
      lab.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.patients?.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.test_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lab.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: labResults.length,
    pending: labResults.filter(l => l.status === 'pending').length,
    completed: labResults.filter(l => l.status === 'completed').length,
    critical: labResults.filter(l => l.status === 'critical').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTestCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      hematology: 'bg-red-50 text-red-600',
      chemistry: 'bg-blue-50 text-blue-600',
      microbiology: 'bg-green-50 text-green-600',
      urinalysis: 'bg-amber-50 text-amber-600',
      serology: 'bg-purple-50 text-purple-600',
      endocrinology: 'bg-cyan-50 text-cyan-600'
    };
    return colors[category] || 'bg-gray-50 text-gray-600';
  };

  const testCategories = [
    { value: 'hematology', label: 'Hematology' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'microbiology', label: 'Microbiology' },
    { value: 'urinalysis', label: 'Urinalysis' },
    { value: 'serology', label: 'Serology' },
    { value: 'endocrinology', label: 'Endocrinology' }
  ];

  const commonTests = [
    'Complete Blood Count (CBC)',
    'Blood Glucose Fasting',
    'Lipid Panel',
    'Liver Function Test',
    'Kidney Function Test',
    'Thyroid Panel (TSH, T3, T4)',
    'Urinalysis',
    'Hemoglobin A1C',
    'ESR (Erythrocyte Sedimentation Rate)',
    'Blood Group & Rh Factor',
    'Malaria Parasite',
    'HIV Test',
    'Hepatitis B Surface Antigen',
    'Pregnancy Test (hCG)',
    'Stool Analysis'
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Laboratory</h1>
          <p className="text-gray-500 mt-1">Manage lab tests and results</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus size={20} /> New Lab Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Beaker className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tests</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Critical</p>
              <p className="text-xl font-bold text-gray-900">{stats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by patient or test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Lab Results List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Test Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Result</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResults.map((lab) => (
                <tr key={lab.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lab.patients?.full_name}</p>
                      <p className="text-xs text-gray-500">{lab.patients?.patient_id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{lab.test_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTestCategoryColor(lab.test_category)}`}>
                      {lab.test_category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lab.result_value || <span className="text-gray-400">Pending</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(lab.result_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(lab.status)}`}>
                      {lab.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {lab.status === 'pending' && (
                      <button
                        onClick={() => setShowResultModal(lab)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Enter Result
                      </button>
                    )}
                    {lab.status !== 'pending' && (
                      <button className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1">
                        <FileText size={16} /> View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Beaker className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900 mb-1">No lab results found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lab Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">New Lab Order</h2>
            </div>
            <form onSubmit={handleCreateLabRequest} className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
                <select
                  value={formData.test_name}
                  onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Test</option>
                  {commonTests.map((test) => (
                    <option key={test} value={test}>{test}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.test_category}
                  onChange={(e) => setFormData({ ...formData, test_category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {testCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Clinical notes or special instructions..."
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
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Enter Lab Result</h2>
              <p className="text-sm text-gray-500 mt-1">{showResultModal.test_name} - {showResultModal.patients?.full_name}</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                updateResult(
                  showResultModal.id,
                  formData.get('result') as string,
                  formData.get('notes') as string
                );
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Result Value *</label>
                <input
                  type="text"
                  name="result"
                  required
                  placeholder="e.g., 120 mg/dL"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={showResultModal.notes || ''}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or interpretation..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResultModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Submit Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
