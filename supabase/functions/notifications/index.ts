import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  reason_for_visit: string | null;
  status: string;
  patient_id: string;
  doctor_id: string;
  patients: {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
    patient_id: string;
  };
  users: {
    id: string;
    full_name: string;
  };
}

interface NotificationChannel {
  channel_type: string;
  channel_value: string;
  enabled: boolean;
  is_primary: boolean;
}

interface NotificationSetting {
  channel_type: string;
  enabled: boolean;
  days_before_first_reminder: number;
  hours_before_second_reminder: number;
  provider_config: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "process";

  try {
    // GET /notifications?action=process - Process scheduled notifications
    if (req.method === "GET" && action === "process") {
      return await processScheduledNotifications(supabase);
    }

    // POST /notifications - Queue notifications for an appointment
    if (req.method === "POST") {
      const body = await req.json();
      const { appointmentId, action: postAction } = body;

      if (postAction === "queue") {
        return await queueAppointmentNotifications(supabase, appointmentId);
      }

      if (postAction === "cancel") {
        return await cancelAppointmentNotifications(supabase, appointmentId);
      }

      if (postAction === "send-immediately") {
        const { channelType, recipient, message, patientId, appointmentId } = body;
        return await sendImmediateNotification(
          supabase,
          channelType,
          recipient,
          message,
          patientId,
          appointmentId
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT /notifications/settings - Update notification settings
    if (req.method === "PUT") {
      const body = await req.json();
      const { channelType, settings } = body;

      const { error } = await supabase
        .from("notification_settings")
        .update(settings)
        .eq("channel_type", channelType);

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Settings updated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Process scheduled notifications that are due
async function processScheduledNotifications(supabase: any): Promise<Response> {
  const now = new Date().toISOString();

  // Get pending notifications that are scheduled for now or earlier
  const { data: pendingNotifications, error: fetchError } = await supabase
    .from("notification_queue")
    .select(`
      id,
      appointment_id,
      patient_id,
      channel_type,
      recipient_address,
      message_type,
      message_content,
      scheduled_for
    `)
    .eq("status", "pending")
    .lte("scheduled_for", now)
    .limit(100);

  if (fetchError) {
    return new Response(
      JSON.stringify({ success: false, error: fetchError.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!pendingNotifications || pendingNotifications.length === 0) {
    return new Response(
      JSON.stringify({ success: true, processed: 0, message: "No pending notifications" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let processed = 0;
  let failed = 0;

  for (const notification of pendingNotifications) {
    const result = await sendNotification(
      supabase,
      notification.channel_type,
      notification.recipient_address,
      notification.message_content,
      notification.patient_id,
      notification.appointment_id,
      notification.message_type
    );

    if (result.success) {
      await supabase
        .from("notification_queue")
        .update({ status: "sent", sent_at: now })
        .eq("id", notification.id);
      processed++;
    } else {
      await supabase
        .from("notification_queue")
        .update({
          status: "failed",
          error_message: result.error,
          retry_count: notification.retry_count + 1,
        })
        .eq("id", notification.id);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      processed,
      failed,
      total: pendingNotifications.length,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Queue notifications for a new appointment
async function queueAppointmentNotifications(
  supabase: any,
  appointmentId: string
): Promise<Response> {
  // Get appointment details with patient and doctor info
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_date,
      appointment_type,
      reason_for_visit,
      status,
      patient_id,
      doctor_id,
      patients!appointments_patient_id_fkey (
        id,
        full_name,
        phone,
        email,
        patient_id
      ),
      users!appointments_doctor_id_fkey (
        id,
        full_name
      )
    `
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (appointmentError || !appointment) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Appointment not found",
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get global notification settings
  const { data: settings } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("enabled", true);

  if (!settings || settings.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        message: "No notification channels enabled",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get patient's notification channel preferences
  const { data: patientChannels } = await supabase
    .from("notification_channels")
    .select("*")
    .eq("patient_id", appointment.patient_id)
    .eq("enabled", true);

  const appointmentDate = new Date(appointment.appointment_date);
  const patient = appointment.patients;
  const doctor = appointment.users;

  // Build recipient addresses from patient preferences or defaults
  const recipients: NotificationChannel[] = [];

  for (const setting of settings) {
    const patientPref = patientChannels?.find(
      (c: NotificationChannel) => c.channel_type === setting.channel_type
    );

    if (patientPref) {
      recipients.push({
        channel_type: patientPref.channel_type,
        channel_value: patientPref.channel_value,
        enabled: patientPref.enabled,
        is_primary: patientPref.is_primary,
      });
    } else {
      // Use default contact info from patient record
      if (setting.channel_type === "sms" && patient.phone) {
        recipients.push({
          channel_type: "sms",
          channel_value: patient.phone,
          enabled: true,
          is_primary: true,
        });
      } else if (setting.channel_type === "email" && patient.email) {
        recipients.push({
          channel_type: "email",
          channel_value: patient.email,
          enabled: true,
          is_primary: false,
        });
      }
    }
  }

  // Queue two reminders for each enabled channel
  const notificationsToQueue = [];

  for (const recipient of recipients) {
    const setting = settings.find(
      (s: NotificationSetting) => s.channel_type === recipient.channel_type
    );
    if (!setting || !recipient.channel_value) continue;

    // First reminder: days before the appointment
    const firstReminderDate = new Date(appointmentDate);
    firstReminderDate.setDate(
      firstReminderDate.getDate() - setting.days_before_first_reminder
    );
    firstReminderDate.setHours(9, 0, 0, 0); // Send at 9 AM

    // Second reminder: hours before the appointment
    const secondReminderDate = new Date(appointmentDate);
    secondReminderDate.setHours(
      secondReminderDate.getHours() - setting.hours_before_second_reminder
    );

    const messageFirst = formatMessage(
      "reminder_before_day",
      patient.full_name,
      appointmentDate,
      doctor.full_name,
      appointment.appointment_type,
      appointment.reason_for_visit
    );

    const messageSecond = formatMessage(
      "reminder_same_day",
      patient.full_name,
      appointmentDate,
      doctor.full_name,
      appointment.appointment_type,
      appointment.reason_for_visit
    );

    // Only queue if the reminder time is in the future
    const now = new Date();

    if (firstReminderDate > now) {
      notificationsToQueue.push({
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        channel_type: recipient.channel_type,
        recipient_address: recipient.channel_value,
        message_type: "reminder_before_day",
        message_content: messageFirst,
        scheduled_for: firstReminderDate.toISOString(),
        status: "pending",
      });
    }

    if (secondReminderDate > now) {
      notificationsToQueue.push({
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        channel_type: recipient.channel_type,
        recipient_address: recipient.channel_value,
        message_type: "reminder_same_day",
        message_content: messageSecond,
        scheduled_for: secondReminderDate.toISOString(),
        status: "pending",
      });
    }
  }

  if (notificationsToQueue.length > 0) {
    const { error: insertError } = await supabase
      .from("notification_queue")
      .insert(notificationsToQueue);

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to queue notifications",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Notifications queued successfully",
      queued: notificationsToQueue.length,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Cancel pending notifications for an appointment
async function cancelAppointmentNotifications(
  supabase: any,
  appointmentId: string
): Promise<Response> {
  const { error } = await supabase
    .from("notification_queue")
    .delete()
    .eq("appointment_id", appointmentId)
    .eq("status", "pending");

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "Notifications cancelled" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Send immediate notification
async function sendImmediateNotification(
  supabase: any,
  channelType: string,
  recipient: string,
  message: string,
  patientId: string,
  appointmentId: string
): Promise<Response> {
  const result = await sendNotification(
    supabase,
    channelType,
    recipient,
    message,
    patientId,
    appointmentId,
    "manual"
  );

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Format notification message
function formatMessage(
  type: string,
  patientName: string,
  appointmentDate: Date,
  doctorName: string,
  appointmentType: string,
  reasonForVisit: string | null
): string {
  const dateStr = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = appointmentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const reason = reasonForVisit ? ` for ${reasonForVisit}` : "";

  if (type === "reminder_before_day") {
    return `ETHIO-EMR Reminder: Dear ${patientName}, you have an appointment scheduled for tomorrow (${dateStr}) at ${timeStr} with Dr. ${doctorName}${reason}. Please arrive 15 minutes early. Reply STOP to opt out.`;
  } else if (type === "reminder_same_day") {
    return `ETHIO-EMR Reminder: Dear ${patientName}, your appointment with Dr. ${doctorName} is today at ${timeStr}${reason}. Please arrive 15 minutes early. Reply STOP to opt out.`;
  } else if (type === "confirmation") {
    return `ETHIO-EMR: Dear ${patientName}, your appointment with Dr. ${doctorName} has been confirmed for ${dateStr} at ${timeStr}. Reply STOP to opt out.`;
  } else if (type === "cancellation") {
    return `ETHIO-EMR: Dear ${patientName}, your appointment on ${dateStr} at ${timeStr} has been cancelled. Please contact us to reschedule.`;
  }

  return `ETHIO-EMR: Appointment reminder for ${patientName} - ${dateStr} at ${timeStr}`;
}

// Send notification via appropriate channel
async function sendNotification(
  supabase: any,
  channelType: string,
  recipient: string,
  message: string,
  patientId: string,
  appointmentId: string,
  messageType: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let success = false;
    let errorMessage: string | undefined;

    // Get provider config for this channel
    const { data: setting } = await supabase
      .from("notification_settings")
      .select("provider_config")
      .eq("channel_type", channelType)
      .maybeSingle();

    const config = setting?.provider_config || {};

    switch (channelType) {
      case "sms":
        const smsResult = await sendSMS(recipient, message, config);
        success = smsResult.success;
        if (!success) errorMessage = smsResult.error;
        break;

      case "email":
        const emailResult = await sendEmail(recipient, message, config);
        success = emailResult.success;
        if (!success) errorMessage = emailResult.error;
        break;

      case "whatsapp":
        const waResult = await sendWhatsApp(recipient, message, config);
        success = waResult.success;
        if (!success) errorMessage = waResult.error;
        break;

      case "telegram":
        const tgResult = await sendTelegram(recipient, message, config);
        success = tgResult.success;
        if (!success) errorMessage = tgResult.error;
        break;

      default:
        errorMessage = `Unknown channel type: ${channelType}`;
    }

    // Log the notification
    await supabase.from("notification_logs").insert({
      appointment_id: appointmentId,
      patient_id: patientId,
      channel_type: channelType,
      recipient_address: recipient,
      message_type: messageType,
      message_content: message,
      status: success ? "sent" : "failed",
      error_message: errorMessage,
    });

    return { success, error: errorMessage };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// SMS sender (Twilio implementation)
async function sendSMS(
  to: string,
  message: string,
  config: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const accountSid = config.twilio_account_sid || Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = config.twilio_auth_token || Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = config.from_number || Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    // Simulate success for demo
    console.log(`[SMS DEMO] To: ${to}, Message: ${message}`);
    return { success: true };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: to,
        Body: message,
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "SMS failed" };
  }
}

// Email sender (SMTP via Resend or similar)
async function sendEmail(
  to: string,
  message: string,
  config: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const apiKey = config.api_key || Deno.env.get("RESEND_API_KEY");
  const fromAddress = config.from_address || "noreply@hospital.com";

  if (!apiKey) {
    // Simulate success for demo
    console.log(`[EMAIL DEMO] To: ${to}, Message: ${message}`);
    return { success: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject: "ETHIO-EMR Appointment Reminder",
        text: message,
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Email failed" };
  }
}

// WhatsApp sender (Twilio implementation)
async function sendWhatsApp(
  to: string,
  message: string,
  config: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const accountSid = config.twilio_account_sid || Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = config.twilio_auth_token || Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = config.from_number || Deno.env.get("TWILIO_WHATSAPP_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    // Simulate success for demo
    console.log(`[WHATSAPP DEMO] To: ${to}, Message: ${message}`);
    return { success: true };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: `whatsapp:${fromNumber}`,
        To: `whatsapp:${to}`,
        Body: message,
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "WhatsApp failed" };
  }
}

// Telegram sender
async function sendTelegram(
  chatId: string,
  message: string,
  config: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const botToken = config.bot_token || Deno.env.get("TELEGRAM_BOT_TOKEN");

  if (!botToken) {
    // Simulate success for demo
    console.log(`[TELEGRAM DEMO] Chat: ${chatId}, Message: ${message}`);
    return { success: true };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await response.json();

    if (data.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.description };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Telegram failed" };
  }
}
