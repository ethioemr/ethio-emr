import { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';

interface JitsiMeetingProps {
  roomName: string;
  displayName: string;
  onLeave: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiMeeting({ roomName, displayName, onLeave }: JitsiMeetingProps) {
  const jitsiContainer = useRef<HTMLDivElement>(null);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJitsiScript();
  }, []);

  const loadJitsiScript = () => {
    if (window.JitsiMeetExternalAPI) {
      initializeJitsi();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = initializeJitsi;
    script.onerror = () => setError('Failed to load video conference');
    document.body.appendChild(script);
  };

  const initializeJitsi = () => {
    if (!jitsiContainer.current || !window.JitsiMeetExternalAPI) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: `ETHIOEMR-${roomName}`,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainer.current,
      userInfo: {
        displayName: displayName
      },
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'chat',
          'raisehand', 'videoquality', 'filmstrip',
          'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help'
        ]
      }
    };

    try {
      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener('videoConferenceJoined', () => {
        setIsLoading(false);
      });

      api.addEventListener('videoConferenceLeft', () => {
        onLeave();
      });

      api.addEventListener('audioMuteStatusChanged', ({ muted }: any) => {
        setIsMuted(muted);
      });

      api.addEventListener('videoMuteStatusChanged', ({ muted }: any) => {
        setIsVideoMuted(muted);
      });

      setJitsiApi(api);
    } catch (err) {
      console.error('Jitsi initialization error:', err);
      setError('Failed to initialize video conference');
    }
  };

  const toggleMute = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleVideo');
    }
  };

  const shareScreen = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleShareScreen');
    }
  };

  const hangup = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
    }
    onLeave();
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-900">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Connecting to video consultation...</p>
          </div>
        </div>
      )}

      {/* Jitsi Container */}
      <div ref={jitsiContainer} className="h-full" />

      {/* Custom Controls (fallback) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition ${
              isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoMuted ? 'Start Video' : 'Stop Video'}
          >
            {isVideoMuted ? (
              <VideoOff className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={shareScreen}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition"
            title="Share Screen"
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={hangup}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
