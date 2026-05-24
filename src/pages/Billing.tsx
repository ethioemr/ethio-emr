import { Plus, Search } from 'lucide-react';

export default function Billing() {
  const invoices = [
    { id: 1, invoice: 'INV-001', patient: 'Ahmed Hassan', amount: 2500, paid: 2500, status: 'Paid' },
    { id: 2, invoice: 'INV-002', patient: 'Hana Tesfaye', amount: 3500, paid: 0, status: 'Pending' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Billing & Finance</h1>
          <p className="text-gray-600 mt-2">Manage invoices and payments</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} /> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paid</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-blue-600">{inv.invoice}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{inv.patient}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{inv.amount} ETB</td>
                <td className="px-6 py-4 text-sm text-gray-600">{inv.paid} ETB</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
