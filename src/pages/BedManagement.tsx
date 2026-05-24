import { Bed as BedIcon, Plus } from 'lucide-react';

export default function BedManagement() {
  const wards = [
    {
      name: 'General Ward A',
      total: 20,
      occupied: 12,
      available: 8,
      beds: [
        { number: 'A101', status: 'occupied', patient: 'Ahmed Hassan' },
        { number: 'A102', status: 'available', patient: null },
      ],
    },
    {
      name: 'ICU Ward',
      total: 8,
      occupied: 5,
      available: 3,
      beds: [
        { number: 'ICU01', status: 'occupied', patient: 'Hana Tesfaye' },
        { number: 'ICU02', status: 'occupied', patient: 'Bekele Birru' },
      ],
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Bed Management</h1>
          <p className="text-gray-600 mt-2">Manage hospital beds and admissions</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} /> New Admission
        </button>
      </div>

      <div className="grid gap-6">
        {wards.map((ward, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{ward.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {ward.occupied} occupied of {ward.total} beds ({ward.available} available)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {ward.beds.map((bed) => (
                <div key={bed.number} className={`p-3 rounded-lg text-center text-sm font-medium cursor-pointer transition ${
                  bed.status === 'occupied'
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}>
                  <BedIcon size={16} className="mx-auto mb-1" />
                  {bed.number}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
