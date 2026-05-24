import { Plus, Search } from 'lucide-react';

export default function Prescriptions() {
  const prescriptions = [
    { id: 1, drug: 'Amoxicillin', patient: 'Ahmed Hassan', dosage: '500mg', frequency: 'Twice daily' },
    { id: 2, drug: 'Metformin', patient: 'Hana Tesfaye', dosage: '500mg', frequency: 'Twice daily' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-2">Manage patient prescriptions</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} /> New Prescription
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search prescriptions..."
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {prescriptions.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{p.drug}</h3>
                <p className="text-sm text-gray-600 mt-1">Patient: {p.patient}</p>
                <p className="text-sm text-gray-600">Dosage: {p.dosage} - {p.frequency}</p>
              </div>
              <button className="text-blue-600 hover:underline">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
