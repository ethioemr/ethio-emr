import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Stethoscope, Pill, Beaker, ShoppingCart, DollarSign, Bed, FileText, Settings, UserCog } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: Calendar, label: 'Appointments', path: '/appointments' },
  { icon: Stethoscope, label: 'Consultations', path: '/consultations' },
  { icon: Pill, label: 'Prescriptions', path: '/prescriptions' },
  { icon: Beaker, label: 'Laboratory', path: '/laboratory' },
  { icon: ShoppingCart, label: 'Pharmacy', path: '/pharmacy' },
  { icon: DollarSign, label: 'Billing', path: '/billing' },
  { icon: Bed, label: 'Bed Mgmt', path: '/beds' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: UserCog, label: 'User Mgmt', path: '/user-management', adminOnly: true },
];

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly) {
      return user?.role === 'hospital_admin' || user?.role === 'super_admin';
    }
    return true;
  });

  return (
    <aside className="hidden lg:block w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen overflow-y-auto">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">ETHIO-EMR</h1>
        <p className="text-xs text-blue-200 mt-1">Hospital System</p>
      </div>

      <nav className="p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-blue-700 transition text-left"
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
