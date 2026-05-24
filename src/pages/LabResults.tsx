import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Beaker, Download, AlertCircle } from 'lucide-react';

export default function LabResults() {
  const [labResults, setLabResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchLabResults();
  }, []);

  useEffect(() => {
    let filtered = labResults;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((r) => r.test_category === categoryFilter);
    }

    filtered = filtered.filter(
      (r) =>
        r.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredResults(filtered);
  }, [searchTerm, labResults, categoryFilter]);

  const fetchLabResults = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*, patients(full_name, patient_id)')
        .order('result_date', { ascending: false });

      if (error) throw error;
      setLabResults(data || []);
      setFilteredResults(data || []);
    } catch (error) {
      console.error('Error fetching lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(labResults.map((r) => r.test_category))];

  if (loading) {
    return <div className="p-8">Loading lab results...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Laboratory Results</h1>
          <p className="text-gray-600 mt-2">View and manage patient lab test results</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold">
          <Plus className="w-5 h-5" />
          New Lab Test
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
                placeholder="Search test or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lab Results Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Test Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Result</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Normal Range</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => {
                  const isAbnormal = result.status === 'abnormal';
                  return (
                    <tr key={result.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{result.patients?.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{result.test_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{result.test_category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                        {result.result_value} {result.unit && <span className="text-gray-600">{result.unit}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{result.normal_range || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isAbnormal && <AlertCircle className="w-4 h-4 text-orange-600" />}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isAbnormal
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(result.result_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <Beaker className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p>No lab results found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
