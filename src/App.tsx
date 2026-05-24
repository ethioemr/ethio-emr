import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import LabResults from './pages/LabResults';
import Billing from './pages/Billing';
import Consultation from './pages/Consultation';
import PatientDetails from './pages/PatientDetails';
import Login from './pages/Login';

type Page = 'dashboard' | 'patients' | 'appointments' | 'prescriptions' | 'lab-results' | 'billing' | 'consultation' | 'patient-details';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');

  useEffect(() => {
    if (user) {
      const fetchStaffInfo = async () => {
        const { data } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        if (data) setStaffName(data.full_name);
      };
      fetchStaffInfo();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-blue-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentPage('patient-details');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        staffName={staffName}
      />
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'patients' && <Patients onSelectPatient={handleSelectPatient} />}
        {currentPage === 'appointments' && <Appointments />}
        {currentPage === 'prescriptions' && <Prescriptions />}
        {currentPage === 'lab-results' && <LabResults />}
        {currentPage === 'billing' && <Billing />}
        {currentPage === 'consultation' && <Consultation />}
        {currentPage === 'patient-details' && selectedPatientId && (
          <PatientDetails
            patientId={selectedPatientId}
            onBack={() => setCurrentPage('patients')}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
