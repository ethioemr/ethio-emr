import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, Users, DollarSign, Activity, FileText, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function Reports() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingLabs: 0,
    pendingBills: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [appointmentTrend, setAppointmentTrend] = useState<any[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([]);
  const [patientDemographics, setPatientDemographics] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Load stats
      const [patientsRes, doctorsRes, appointmentsRes, labsRes, billsRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'doctor'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bills').select('id, amount, paid_amount', { count: 'exact' })
      ]);

      const totalRevenue = billsRes.data?.reduce((sum: number, b: any) => sum + (Number(b.paid_amount) || 0), 0) || 0;
      const pendingBills = billsRes.data?.filter((b: any) => Number(b.paid_amount) < Number(b.amount)).length || 0;

      setStats({
        totalPatients: patientsRes.count || 0,
        totalDoctors: doctorsRes.count || 0,
        totalAppointments: appointmentsRes.count || 0,
        totalRevenue,
        pendingLabs: labsRes.count || 0,
        pendingBills
      });

      // Generate sample trend data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
      const trendData = months.map((month, i) => ({
        month,
        patients: Math.floor(Math.random() * 50) + 10,
        appointments: Math.floor(Math.random() * 40) + 15,
        revenue: Math.floor(Math.random() * 100000) + 50000
      }));
      setAppointmentTrend(trendData);

      // Revenue by category
      const categories = [
        { name: 'Consultation', value: Math.floor(Math.random() * 50000) + 30000, color: '#3b82f6' },
        { name: 'Laboratory', value: Math.floor(Math.random() * 30000) + 15000, color: '#10b981' },
        { name: 'Pharmacy', value: Math.floor(Math.random() * 40000) + 25000, color: '#f59e0b' },
        { name: 'Radiology', value: Math.floor(Math.random() * 20000) + 10000, color: '#ef4444' },
        { name: 'Room/Board', value: Math.floor(Math.random() * 60000) + 40000, color: '#8b5cf6' }
      ];
      setRevenueByCategory(categories);

      // Patient demographics
      const demographics = [
        { name: 'Male', value: 55, color: '#3b82f6' },
        { name: 'Female', value: 45, color: '#ec4899' }
      ];
      setPatientDemographics(demographics);

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type: string) => {
    alert(`Exporting ${type} report... (Feature ready for implementation)`);
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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Generate and view hospital reports</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Patients</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Doctors</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalDoctors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Appointments</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalAppointments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Labs</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingLabs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-50 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Bills</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingBills}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Patient & Appointment Trends</h2>
            <button
              onClick={() => exportReport('trends')}
              className="text-blue-600 hover:text-blue-700"
            >
              <Download size={20} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Trends</h2>
            <button
              onClick={() => exportReport('revenue')}
              className="text-blue-600 hover:text-blue-700"
            >
              <Download size={20} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue by Category</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Patient Demographics</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={patientDemographics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {patientDemographics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Export Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Report Export</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => exportReport('patient-census')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Patient Census</p>
              <p className="text-xs text-gray-500">Daily patient report</p>
            </div>
          </button>
          <button
            onClick={() => exportReport('financial')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <DollarSign className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Financial Summary</p>
              <p className="text-xs text-gray-500">Revenue & billing</p>
            </div>
          </button>
          <button
            onClick={() => exportReport('lab')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Activity className="w-5 h-5 text-amber-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Lab Results</p>
              <p className="text-xs text-gray-500">Test statistics</p>
            </div>
          </button>
          <button
            onClick={() => exportReport('appointments')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Calendar className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Appointments</p>
              <p className="text-xs text-gray-500">Scheduling report</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
