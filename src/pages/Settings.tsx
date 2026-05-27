import { useState, useEffect } from 'react';
import { Save, Building2, Users, Shield, Bell, User, LogOut, MessageSquare, Mail, Phone, Send } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

interface NotificationSetting {
  id: string;
  channel_type: string;
  enabled: boolean;
  days_before_first_reminder: number;
  hours_before_second_reminder: number;
  provider_config: Record<string, any>;
}

interface NotificationLog {
  id: string;
  appointment_id: string;
  patient_id: string;
  channel_type: string;
  recipient_address: string;
  message_type: string;
  status: string;
  sent_at: string;
}

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [hospitalProfile, setHospitalProfile] = useState({
    name: 'ETHIO-EMR Hospital',
    address: 'Addis Ababa, Ethiopia',
    phone: '+251-11-123-4567',
    email: 'info@hospital.et'
  });
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });
  const [staff, setStaff] = useState<any[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    loadStaff();
    loadNotificationSettings();
    loadNotificationLogs();
  }, []);

  const loadStaff = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .order('channel_type');
      setNotificationSettings(data || []);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const loadNotificationLogs = async () => {
    try {
      const { data } = await supabase
        .from('notification_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);
      setNotificationLogs(data || []);
    } catch (error) {
      console.error('Error loading notification logs:', error);
    }
  };

  const handleUpdateNotificationSetting = async (channelType: string, updates: Partial<NotificationSetting>) => {
    try {
      setSavingNotifications(true);
      const { error } = await supabase
        .from('notification_settings')
        .update(updates)
        .eq('channel_type', channelType);

      if (error) throw error;
      await loadNotificationSettings();
    } catch (error) {
      console.error('Error updating notification setting:', error);
      alert('Failed to update notification settings');
    } finally {
      setSavingNotifications(false);
    }
  };

  const processNotifications = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications?action=process`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );
      const result = await response.json();
      alert(`Processed ${result.processed} notifications, ${result.failed} failed`);
      loadNotificationLogs();
    } catch (error) {
      console.error('Error processing notifications:', error);
      alert('Failed to process notifications');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile(profileData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'hospital', label: 'Hospital', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const channelIcons: Record<string, any> = {
    sms: Phone,
    email: Mail,
    whatsapp: MessageSquare,
    telegram: Send,
  };

  const channelLabels: Record<string, string> = {
    sms: 'SMS',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    hospital_admin: 'Hospital Admin',
    doctor: 'Doctor',
    nurse: 'Nurse',
    receptionist: 'Receptionist',
    pharmacist: 'Pharmacist',
    lab_technician: 'Lab Technician',
    cashier: 'Cashier',
    patient: 'Patient'
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and hospital settings</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSignOut}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex items-center gap-6 mb-6">
                  <div className="bg-blue-100 text-blue-600 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user?.full_name}</h3>
                    <p className="text-gray-500">{roleLabels[user?.role || ''] || user?.role}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Hospital Tab */}
          {activeTab === 'hospital' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Hospital Profile</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                  <input
                    type="text"
                    value={hospitalProfile.name}
                    onChange={(e) => setHospitalProfile({ ...hospitalProfile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={hospitalProfile.address}
                    onChange={(e) => setHospitalProfile({ ...hospitalProfile, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={hospitalProfile.phone}
                      onChange={(e) => setHospitalProfile({ ...hospitalProfile, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={hospitalProfile.email}
                      onChange={(e) => setHospitalProfile({ ...hospitalProfile, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
                  <Save size={18} /> Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Staff Management</h2>
                <span className="text-sm text-gray-500">{staff.length} staff members</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {staff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.full_name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {roleLabels[member.role] || member.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Channels</h2>
                  <button
                    onClick={processNotifications}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Process Queue
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Configure appointment reminder channels. Patients will receive reminders at the configured times.
                </p>

                <div className="space-y-4">
                  {notificationSettings.map((setting) => {
                    const Icon = channelIcons[setting.channel_type] || Bell;
                    return (
                      <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${setting.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              <Icon className={`w-5 h-5 ${setting.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{channelLabels[setting.channel_type] || setting.channel_type}</h3>
                              <p className="text-sm text-gray-500">
                                {setting.enabled ? 'Enabled' : 'Disabled'}
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.enabled}
                              onChange={(e) => handleUpdateNotificationSetting(setting.channel_type, { enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {setting.enabled && (
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Days Before Appointment
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="7"
                                value={setting.days_before_first_reminder}
                                onChange={(e) => handleUpdateNotificationSetting(setting.channel_type, { days_before_first_reminder: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-xs text-gray-400 mt-1">First reminder sent N days before</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hours Before Appointment
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="24"
                                value={setting.hours_before_second_reminder}
                                onChange={(e) => handleUpdateNotificationSetting(setting.channel_type, { hours_before_second_reminder: parseInt(e.target.value) || 2 })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-xs text-gray-400 mt-1">Second reminder sent N hours before</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>SMS/WhatsApp:</strong> Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in environment variables</li>
                    <li><strong>Email:</strong> Set RESEND_API_KEY for email delivery</li>
                    <li><strong>Telegram:</strong> Set TELEGRAM_BOT_TOKEN and patients provide their chat ID</li>
                  </ul>
                </div>
              </div>

              {/* Notification Logs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Channel</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Recipient</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Sent At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {notificationLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No notifications sent yet
                          </td>
                        </tr>
                      ) : (
                        notificationLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                                {log.channel_type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{log.recipient_address}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                              {log.message_type.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(log.sent_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Session Timeout</p>
                    <p className="text-sm text-gray-500">Automatically sign out after 30 minutes of inactivity</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Login Notifications</p>
                    <p className="text-sm text-gray-500">Get notified of new logins to your account</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
