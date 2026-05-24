import { Download, Calendar } from 'lucide-react';

export default function Reports() {
  const reports = [
    { id: 1, name: 'Patient Census Report', date: '2025-05-24', type: 'Daily' },
    { id: 2, name: 'Financial Summary', date: '2025-05-24', type: 'Monthly' },
    { id: 3, name: 'Lab Results Report', date: '2025-05-24', type: 'Weekly' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Generate and view hospital reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Patients</h3>
          <p className="text-3xl font-bold text-gray-900">1,234</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-green-600">1.5M ETB</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Occupancy</h3>
          <p className="text-3xl font-bold text-blue-600">78%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Reports</h2>
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-600">{r.type} • {r.date}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
                <Download size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
