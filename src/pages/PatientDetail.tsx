import { ArrowLeft, CreditCard as Edit2, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PatientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const patient = {
    mrn: 'MRN001',
    name: 'Ahmed Hassan',
    age: 45,
    gender: 'Male',
    phone: '+251911223344',
    email: 'ahmed@example.com',
    bloodType: 'O+',
    allergies: 'Penicillin',
    address: 'Addis Ababa',
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-gray-600 mt-1">MRN: {patient.mrn}</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
            <Edit2 size={18} />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Age</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{patient.age}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{patient.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Blood Type</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{patient.bloodType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-2xl font-bold text-green-600 mt-1">Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900">{patient.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-gray-900">{patient.address}</p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Allergies</p>
              <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {patient.allergies}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Blood Type</p>
              <p className="text-gray-900">{patient.bloodType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Consultations */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Consultations</h2>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
            <Plus size={18} /> Add
          </button>
        </div>
        <p className="text-gray-600">No consultations recorded</p>
      </div>
    </div>
  );
}
