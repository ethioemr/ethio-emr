import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, DollarSign, Download, AlertCircle } from 'lucide-react';

export default function Billing() {
  const [bills, setBills] = useState<any[]>([]);
  const [filteredBills, setFilteredBills] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [totals, setTotals] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    let filtered = bills;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    filtered = filtered.filter(
      (b) =>
        b.bill_id.includes(searchTerm) ||
        b.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredBills(filtered);
  }, [searchTerm, bills, statusFilter]);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*, patients(full_name, patient_id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBills(data || []);
      setFilteredBills(data || []);

      if (data) {
        const total = data.reduce((sum, b) => sum + b.amount, 0);
        const paid = data.reduce((sum, b) => sum + b.paid_amount, 0);
        const pending = total - paid;
        setTotals({ total, paid, pending });
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading billing information...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Billing & Finance</h1>
          <p className="text-gray-600 mt-2">Manage patient bills and invoices</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold">
          <Plus className="w-5 h-5" />
          New Invoice
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totals.total.toLocaleString()} ETB
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Paid Amount</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {totals.paid.toLocaleString()} ETB
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-emerald-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Amount</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {totals.pending.toLocaleString()} ETB
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </div>
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
                placeholder="Search bill ID or patient..."
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
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bill ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Paid</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Balance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => {
                  const balance = bill.amount - bill.paid_amount;
                  return (
                    <tr key={bill.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-blue-600">{bill.bill_id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{bill.patients?.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{bill.category}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {bill.amount.toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                        {bill.paid_amount.toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                        {balance.toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          bill.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bill.status === 'pending'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A'}
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
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p>No bills found</p>
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
