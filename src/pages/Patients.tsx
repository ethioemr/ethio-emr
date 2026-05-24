import { useState } from 'react';
import { Users, Plus, Search } from 'lucide-react';

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    { id: 1, mrn: 'MRN001', name: 'Ahmed Hassan', age: 45, phone: '+251911223344' },
    { id: 2, mrn: 'MRN002', name: 'Hana Abebe', age: 32, phone: '+251922334455' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-2">Manage hospital patients</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} /> Add Patient
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">MRN</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Age</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-blue-600">{patient.mrn}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{patient.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.age}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
