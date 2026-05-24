import { Plus, Search } from 'lucide-react';

export default function Laboratory() {
  const tests = [
    { id: 1, test: 'Complete Blood Count (CBC)', patient: 'Ahmed Hassan', status: 'Completed', date: '2025-05-24' },
    { id: 2, test: 'Fasting Blood Sugar', patient: 'Hana Tesfaye', status: 'Pending', date: '2025-05-24' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Laboratory</h1>
          <p className="text-gray-600 mt-2">Manage lab tests and results</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} /> New Test Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search lab results..."
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {tests.map((t) => (
          <div key={t.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t.test}</h3>
                <p className="text-sm text-gray-600 mt-1">Patient: {t.patient}</p>
                <p className="text-sm text-gray-600">Date: {t.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
