/*
  # Create Notification System for Appointments

  Implements a multi-channel notification system supporting SMS, Email, WhatsApp, and Telegram.

  1. New Tables
    - `notification_settings`: Global notification configuration
    - `notification_channels`: Patient notification preferences
    - `notification_queue`: Queue of pending notifications
    - `notification_logs`: History of sent notifications

  2. Features
    - Configurable reminder timing (days before, hours before)
    - Multiple notification channels per patient
    - Appointment reminders sent automatically
    - Two reminder times: before appointment day, and on appointment day

  3. Security
    - RLS enabled on all tables
    - Only authenticated users can manage their own notifications
    - Admins can view all notification logs
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notification Settings (Global configuration)
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type text NOT NULL CHECK (channel_type IN ('sms', 'email', 'whatsapp', 'telegram')),
  enabled boolean DEFAULT true,
  days_before_first_reminder integer DEFAULT 1,
  hours_before_second_reminder integer DEFAULT 2,
  provider_config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(channel_type)
);

-- Patient Notification Channel Preferences
CREATE TABLE IF NOT EXISTS notification_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  channel_type text NOT NULL CHECK (channel_type IN ('sms', 'email', 'whatsapp', 'telegram')),
  channel_value text NOT NULL,
  enabled boolean DEFAULT true,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(patient_id, channel_type)
);

-- Notification Queue (Pending notifications to be sent)
CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  channel_type text NOT NULL CHECK (channel_type IN ('sms', 'email', 'whatsapp', 'telegram')),
  recipient_address text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('reminder_before_day', 'reminder_same_day', 'confirmation', 'cancellation')),
  message_content text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Notification Logs (History of all sent notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  channel_type text NOT NULL,
  recipient_address text NOT NULL,
  message_type text NOT NULL,
  message_content text NOT NULL,
  status text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  error_message text
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_settings
CREATE POLICY "Admins can manage notification settings"
  ON notification_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital_admin', 'super_admin'))
  );

CREATE POLICY "All authenticated users can view notification settings"
  ON notification_settings FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for notification_channels
CREATE POLICY "Users can view their own notification channels"
  ON notification_channels FOR SELECT
  TO authenticated
  USING (patient_id IN (SELECT id FROM patients WHERE email = (SELECT email FROM users WHERE id = auth.uid())));

CREATE POLICY "Admins can manage all notification channels"
  ON notification_channels FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital_admin', 'super_admin', 'receptionist', 'nurse'))
  );

-- RLS Policies for notification_queue
CREATE POLICY "Service role manages notification queue"
  ON notification_queue FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital_admin', 'super_admin'))
  );

-- RLS Policies for notification_logs
CREATE POLICY "Admins can view all notification logs"
  ON notification_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hospital_admin', 'super_admin'))
  );

-- Insert default notification settings
INSERT INTO notification_settings (channel_type, enabled, days_before_first_reminder, hours_before_second_reminder, provider_config)
VALUES 
  ('sms', true, 1, 2, '{"provider": "twilio", "from_number": ""}'::jsonb),
  ('email', true, 1, 2, '{"provider": "smtp", "from_address": "noreply@hospital.com"}'::jsonb),
  ('whatsapp', false, 1, 2, '{"provider": "twilio", "from_number": ""}'::jsonb),
  ('telegram', false, 1, 2, '{"provider": "telegram", "bot_token": ""}'::jsonb)
ON CONFLICT (channel_type) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_channels_patient ON notification_channels(patient_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_patient ON notification_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
