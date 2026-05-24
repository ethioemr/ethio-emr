import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Video, Phone, Maximize2, Minimize2, Mic, MicOff, Volume2, VolumeX, LogOut } from 'lucide-react';

export default function Consultation() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*, patients(full_name, phone), users(full_name)')
        .eq('status', 'scheduled')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setConsultations(data || []);
      if (data && data.length > 0) {
        setActiveConsultation(data[0]);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading consultations...</div>;
  }

  if (!activeConsultation) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Consultation Room</h1>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No active consultations at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullScreen ? 'fixed inset-0' : 'p-6 md:p-8 max-w-7xl mx-auto'}`}>
      {!isFullScreen && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Consultation Room</h1>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-2">
          <div className={`bg-black rounded-xl overflow-hidden shadow-2xl ${isFullScreen ? 'h-screen' : 'h-96'}`}>
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
              <img
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Doctor"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <p className="text-white text-lg font-semibold">{activeConsultation.users?.full_name}</p>
                <p className="text-gray-300 text-sm">Patient: {activeConsultation.patients?.full_name}</p>
              </div>

              {/* Local Video Preview */}
              <div className="absolute bottom-4 right-4 w-32 h-32 bg-gray-800 rounded-lg border-2 border-blue-500 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Local"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Consultation Controls */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  isMuted
                    ? 'bg-red-500 text-white'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  !isVideoOn
                    ? 'bg-red-500 text-white'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                <Video className="w-5 h-5" />
                {isVideoOn ? 'Stop Video' : 'Start Video'}
              </button>

              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>

              <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                <LogOut className="w-5 h-5" />
                End Call
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-gray-900">12:34</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{activeConsultation.type}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-emerald-600 capitalize">{activeConsultation.status}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Connection</p>
                <p className="text-lg font-semibold text-emerald-600">Connected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Details & Queue */}
        <div className="space-y-6">
          {/* Current Consultation Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Current Consultation</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Patient Name</p>
                <p className="text-lg font-semibold text-gray-900">{activeConsultation.patients?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="text-lg font-semibold text-gray-900">{activeConsultation.users?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-lg font-semibold text-gray-900">{activeConsultation.patients?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room ID</p>
                <p className="text-lg font-mono font-semibold text-blue-600">{activeConsultation.room_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Upcoming Consultations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {consultations.slice(1, 5).map((consultation) => (
                <button
                  key={consultation.id}
                  onClick={() => setActiveConsultation(consultation)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                >
                  <p className="text-sm font-semibold text-gray-900">{consultation.patients?.full_name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(consultation.start_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat/Notes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Notes</h3>
            <textarea
              placeholder="Add consultation notes..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
            />
            <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
