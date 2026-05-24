import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Calendar, Pill, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import ChartComponent from '../components/ChartComponent';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    activePrescriptions: 0,
    pendingBills: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [appointmentData, setAppointmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch patient count
        const { count: patientCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        // Fetch today's appointments
        const today = new Date().toISOString().split('T')[0];
        const { count: appointmentCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .gte('appointment_date', today)
          .lt('appointment_date', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

        // Fetch active prescriptions
        const { count: prescriptionCount } = await supabase
          .from('prescriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch pending bills
        const { count: billCount } = await supabase
          .from('bills')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalPatients: patientCount || 0,
          todayAppointments: appointmentCount || 0,
          activePrescriptions: prescriptionCount || 0,
          pendingBills: billCount || 0,
        });

        // Fetch recent activities
        const { data: activities } = await supabase
          .from('appointments')
          .select('id, status, appointment_date, patient_id, patients(full_name)')
          .order('appointment_date', { ascending: false })
          .limit(5);

        if (activities) {
          setRecentActivities(activities);
        }

        // Fetch appointment data for chart
        const { data: appointments } = await supabase
          .from('appointments')
          .select('status')
          .gte('appointment_date', new Date(Date.now() - 7 * 86400000).toISOString());

        if (appointments) {
          const chartData = [
            { name: 'Scheduled', value: appointments.filter(a => a.status === 'scheduled').length },
            { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length },
            { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length },
          ];
          setAppointmentData(chartData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome back, Dr. Abebe Kebede</h1>
        <p className="text-gray-600 mt-2">Here's what's happening in your hospital today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Total Patients"
          value={stats.totalPatients}
          change="12.5%"
          changeType="up"
          icon={Users}
          color="bg-blue-500"
        />
        <StatsCard
          label="Today's Appointments"
          value={stats.todayAppointments}
          change="23.1%"
          changeType="up"
          icon={Calendar}
          color="bg-emerald-500"
        />
        <StatsCard
          label="Active Prescriptions"
          value={stats.activePrescriptions}
          change="5.4%"
          changeType="down"
          icon={Pill}
          color="bg-orange-500"
        />
        <StatsCard
          label="Pending Bills"
          value={stats.pendingBills}
          change="2.1%"
          changeType="up"
          icon={AlertCircle}
          color="bg-red-500"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Appointments Overview</h2>
          <div className="space-y-4">
            {appointmentData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 rounded-full h-2 w-32">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(item.value / 50) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-900 font-semibold w-8">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.patients?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{activity.status} appointment</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Department Performance</h2>
          <div className="space-y-4">
            {['Cardiology', 'Pediatrics', 'Surgery', 'Neurology'].map((dept) => (
              <div key={dept} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{dept}</span>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 rounded-full h-2 w-24">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.random() * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {Math.floor(Math.random() * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-emerald-600">2,456,789 ETB</p>
              <p className="text-xs text-emerald-600 mt-1">25% increase monthly</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Outstanding Bills</p>
              <p className="text-2xl font-bold text-orange-600">1,256,000 ETB</p>
              <p className="text-xs text-orange-600 mt-1">Requires attention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
