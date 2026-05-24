import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, Activity, Beaker, CreditCard, TrendingUp } from 'lucide-react';
import { supabase } from '../services/supabase';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingLabs: number;
  pendingBills: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingLabs: 0,
    pendingBills: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [patientsRes, doctorsRes, appointmentsRes, labsRes, billsRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'doctor'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bills').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const { data: billsData } = await supabase
        .from('bills')
        .select('amount, paid_amount')
        .eq('status', 'paid');

      const totalRevenue = billsData?.reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0) || 0;

      setStats({
        totalPatients: patientsRes.count || 0,
        totalDoctors: doctorsRes.count || 0,
        totalAppointments: appointmentsRes.count || 0,
        pendingLabs: labsRes.count || 0,
        pendingBills: billsRes.count || 0,
        totalRevenue,
      });

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, patients!appointments_patient_id_fkey(full_name), users!appointments_doctor_id_fkey(full_name)')
        .order('appointment_date', { ascending: false })
        .limit(5);

      setRecentAppointments(appointments || []);

      const { data: patients } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentPatients(patients || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Mon', patients: 12, appointments: 8 },
    { name: 'Tue', patients: 15, appointments: 10 },
    { name: 'Wed', patients: 8, appointments: 14 },
    { name: 'Thu', patients: 20, appointments: 18 },
    { name: 'Fri', patients: 18, appointments: 15 },
    { name: 'Sat', patients: 10, appointments: 6 },
    { name: 'Sun', patients: 5, appointments: 3 },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to ETHIO-EMR Hospital Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDoctors}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAppointments}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalRevenue.toLocaleString()} ETB</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center gap-4">
            <Beaker className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-sm opacity-80">Pending Lab Results</p>
              <p className="text-2xl font-bold">{stats.pendingLabs}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center gap-4">
            <CreditCard className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-sm opacity-80">Pending Bills</p>
              <p className="text-2xl font-bold">{stats.pendingBills}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-sm opacity-80">Weekly Growth</p>
              <p className="text-2xl font-bold">+12.5%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Patient Visits</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="appointments" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Patient</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Doctor</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt: any) => (
                  <tr key={apt.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{apt.patients?.full_name || 'N/A'}</td>
                    <td className="py-3 text-sm text-gray-600">{apt.users?.full_name || 'N/A'}</td>
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
                {recentAppointments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">No appointments found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Phone</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient: any) => (
                  <tr key={patient.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{patient.full_name}</td>
                    <td className="py-3 text-sm text-gray-600">{patient.patient_id}</td>
                    <td className="py-3 text-sm text-gray-600">{patient.phone}</td>
                  </tr>
                ))}
                {recentPatients.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">No patients found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
