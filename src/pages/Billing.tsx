import { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, FileText, CheckCircle, Clock, AlertCircle, CreditCard, TrendingUp } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Bill {
  id: string;
  bill_id: string;
  patient_id: string;
  description?: string;
  category: string;
  amount: number;
  paid_amount: number;
  status: string;
  due_date?: string;
  paid_date?: string;
  created_at: string;
  patients?: { id: string; patient_id: string; full_name: string; phone: string };
}

export default function Billing() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Bill | null>(null);

  const [formData, setFormData] = useState({
    patient_id: '',
    description: '',
    category: 'consultation',
    amount: 0,
    due_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [billsRes, patientsRes] = await Promise.all([
        supabase
          .from('bills')
          .select('*, patients!bills_patient_id_fkey(id, patient_id, full_name, phone)')
          .order('created_at', { ascending: false }),
        supabase.from('patients').select('id, patient_id, full_name, phone').order('full_name')
      ]);

      setBills(billsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const billId = `BILL-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase
        .from('bills')
        .insert([{
          ...formData,
          bill_id: billId,
          paid_amount: 0,
          status: 'pending'
        }]);

      if (error) throw error;
      setShowModal(false);
      setFormData({ patient_id: '', description: '', category: 'consultation', amount: 0, due_date: '' });
      loadData();
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

  const handlePayment = async (bill: Bill, paymentAmount: number) => {
    try {
      const newPaidAmount = Number(bill.paid_amount) + paymentAmount;
      const newStatus = newPaidAmount >= Number(bill.amount) ? 'paid' : 'partial';
      const paidDate = newStatus === 'paid' ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('bills')
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
          paid_date: paidDate
        })
        .eq('id', bill.id);

      if (error) throw error;
      setShowPaymentModal(null);
      loadData();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.bill_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bills.length,
    totalAmount: bills.reduce((sum, b) => sum + Number(b.amount), 0),
    paidAmount: bills.reduce((sum, b) => sum + Number(b.paid_amount), 0),
    pending: bills.filter(b => b.status === 'pending').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      consultation: 'bg-blue-50 text-blue-600',
      laboratory: 'bg-green-50 text-green-600',
      pharmacy: 'bg-amber-50 text-amber-600',
      radiology: 'bg-cyan-50 text-cyan-600',
      accommodation: 'bg-gray-50 text-gray-600'
    };
    return colors[category] || 'bg-gray-50 text-gray-600';
  };

  const categories = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'accommodation', label: 'Room/Board' }
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
          <h1 className="text-3xl font-bold text-gray-900">Billing & Finance</h1>
          <p className="text-gray-500 mt-1">Manage invoices and payments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus size={20} /> New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Collected</p>
              <p className="text-xl font-bold text-gray-900">{stats.paidAmount.toLocaleString()} ETB</p>
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
            <div className="bg-emerald-50 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalAmount.toLocaleString()} ETB</p>
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
                placeholder="Search by patient or bill ID..."
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
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Bill ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-blue-600 font-medium">{bill.bill_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bill.patients?.full_name}</p>
                      <p className="text-xs text-gray-500">{bill.patients?.patient_id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bill.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryColor(bill.category)}`}>
                      {bill.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{Number(bill.amount).toLocaleString()} ETB</p>
                      <p className="text-xs text-green-600">Paid: {Number(bill.paid_amount).toLocaleString()} ETB</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {bill.status !== 'paid' && bill.status !== 'cancelled' && (
                      <button
                        onClick={() => setShowPaymentModal(bill)}
                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                      >
                        <CreditCard size={16} /> Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900 mb-1">No bills found</p>
                    <p className="text-sm">Create invoices to track payments</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">New Invoice</h2>
            </div>
            <form onSubmit={handleCreateBill} className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Consultation with Dr. Abebe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (ETB) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Process Payment</h2>
              <p className="text-sm text-gray-500 mt-1">Bill: {showPaymentModal.bill_id}</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
                handlePayment(showPaymentModal, amount);
              }}
              className="p-6 space-y-4"
            >
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-medium">{Number(showPaymentModal.amount).toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Already Paid:</span>
                  <span className="font-medium text-green-600">{Number(showPaymentModal.paid_amount).toLocaleString()} ETB</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount (ETB) *</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0.01"
                  max={Number(showPaymentModal.amount) - Number(showPaymentModal.paid_amount)}
                  step="0.01"
                  placeholder="Enter payment amount"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
