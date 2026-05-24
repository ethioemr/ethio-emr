import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu, X, LayoutDashboard, Users, Calendar, Pill, Beaker, CreditCard,
  Video, Settings, LogOut, ChevronDown, Stethoscope, Bell, Search
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: any) => void;
  staffName: string;
}

export default function Sidebar({ currentPage, onPageChange, staffName }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'lab-results', label: 'Laboratory', icon: Flask },
    { id: 'billing', label: 'Billing & Finance', icon: CreditCard },
    { id: 'consultation', label: 'Consultation', icon: Video },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-lg"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-0 md:w-20'
        } overflow-hidden`}
      >
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white p-2 rounded-lg">
              <Stethoscope className="w-5 h-5 text-blue-900" />
            </div>
            {isOpen && <h1 className="text-xl font-bold">ETHIO-EMR</h1>}
          </div>

          {isOpen && (
            <div className="space-y-4 mb-6">
              <div className="bg-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-100">Dr. Abebe Kebede</p>
                <p className="text-xs text-blue-200">Senior Admin</p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-700 hover:bg-blue-600 rounded-lg p-2 text-sm font-medium transition">
                  <Bell className="w-4 h-4 mx-auto" />
                </button>
                <button className="flex-1 bg-blue-700 hover:bg-blue-600 rounded-lg p-2 text-sm font-medium transition">
                  <Search className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="space-y-2 px-3 overflow-y-auto max-h-[calc(100vh-280px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-blue-900 font-semibold'
                    : 'text-blue-100 hover:bg-blue-700'
                } ${!isOpen && 'justify-center'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-blue-700 p-3">
          {isOpen && (
            <div className="space-y-2 mb-4">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition">
                <Settings className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
