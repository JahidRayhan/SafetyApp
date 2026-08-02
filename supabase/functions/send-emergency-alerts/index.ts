
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface EmergencyAlert {
  incident_id: string;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  message_type: 'sms' | 'email' | 'both';
  retry_delivery_id?: string;
  target_contacts?: Array<{
    id: string | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    previous_attempt_number?: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // SECURITY: Verify caller's JWT.
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const callerId = userData.user.id;

    const { incident_id, location, message_type = 'both', retry_delivery_id, target_contacts }: EmergencyAlert = await req.json();

    // Resolve the owning user_id of the incident server-side (never trust client).
    const { data: incidentRow, error: incidentLookupError } = await supabase
      .from('emergency_incidents')
      .select('user_id')
      .eq('id', incident_id)
      .single();

    if (incidentLookupError || !incidentRow) {
      return new Response(JSON.stringify({ success: false, error: 'Incident not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const incidentOwnerId: string = incidentRow.user_id;

    // Authorization: caller must own the incident, OR be an admin retrying a failed delivery.
    let isAuthorized = callerId === incidentOwnerId;
    if (!isAuthorized && retry_delivery_id) {
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', callerId)
        .single();
      if (callerProfile && (callerProfile.role === 'admin' || callerProfile.role === 'govt_admin')) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user_id = incidentOwnerId;

    console.log('Processing emergency alert for incident:', incident_id);

    // Get user profile and emergency contacts
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', user_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    const shouldUseTargetContacts = Array.isArray(target_contacts) && target_contacts.length > 0;

    const { data: contacts, error: contactsError } = shouldUseTargetContacts
      ? { data: target_contacts, error: null }
      : await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user_id)
          .order('priority');

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      throw new Error('Failed to fetch emergency contacts');
    }

    if (!contacts || contacts.length === 0) {
      console.log('No emergency contacts found for user');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No emergency contacts to notify',
        contacts_notified: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create emergency message
    const userName = profile.full_name || 'A SafeGuard user';
    const locationText = location 
      ? `Location: https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'Location not available';
    
    const emergencyMessage = `🚨 EMERGENCY ALERT: ${userName} has activated their emergency button and needs immediate assistance. ${locationText}. This is an automated message from SafeGuard Safety App.`;

    // Process each contact and send emails to ALL contacts
    const results = [];
    let emailsSent = 0;
    
    // Send emails to ALL contacts simultaneously
    const emailPromises = contacts
      .filter(contact => contact.email) // Only contacts with email
      .map(async (contact) => {
        console.log(`Sending email to: ${contact.name} (${contact.email})`);
        
        try {
          const { data: emailResult, error: emailError } = await resend.emails.send({
            from: 'SafeGuard Emergency <onboarding@resend.dev>',
            to: [contact.email],
            subject: '🚨 EMERGENCY ALERT - Immediate Assistance Needed',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                  <h1>🚨 EMERGENCY ALERT</h1>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                  <h2>Immediate Assistance Needed</h2>
                  <p><strong>${userName}</strong> has activated their emergency button and needs immediate assistance.</p>
                  <div style="background-color: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                    <p><strong>Location:</strong> ${location ? `<a href="https://maps.google.com/?q=${location.lat},${location.lng}" target="_blank">View on Google Maps</a>` : 'Location not available'}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Contact Phone:</strong> ${profile.phone_number || 'Not provided'}</p>
                  </div>
                  <p style="color: #dc2626; font-weight: bold;">Please contact ${userName} immediately or call emergency services if needed.</p>
                  <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated message from SafeGuard Safety App.</p>
                </div>
              </div>
            `
          });

          const attemptNumber = retry_delivery_id ? (contact.previous_attempt_number ?? 1) + 1 : 1;

          if (emailError) {
            console.error(`Email error for ${contact.email}:`, emailError);
            await supabase.from('sos_alert_deliveries').insert({
              incident_id,
              user_id,
              contact_id: contact.id,
              channel: 'email',
              recipient_email: contact.email,
              recipient_phone: contact.phone ?? null,
              delivery_status: 'failed',
              error_message: emailError.message,
              resent_from_delivery_id: retry_delivery_id ?? null,
              attempt_number: attemptNumber,
            });
            return { contact, success: false, error: emailError.message };
          } else {
            console.log(`Email sent successfully to ${contact.email}`);
            await supabase.from('sos_alert_deliveries').insert({
              incident_id,
              user_id,
              contact_id: contact.id,
              channel: 'email',
              recipient_email: contact.email,
              recipient_phone: contact.phone ?? null,
              delivery_status: 'sent',
              provider_message_id: emailResult?.id ?? null,
              resent_from_delivery_id: retry_delivery_id ?? null,
              attempt_number: attemptNumber,
            });
            return { contact, success: true };
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`Failed to send email to ${contact.email}:`, error);
          const attemptNumber = retry_delivery_id ? (contact.previous_attempt_number ?? 1) + 1 : 1;
          await supabase.from('sos_alert_deliveries').insert({
            incident_id,
            user_id,
            contact_id: contact.id,
            channel: 'email',
            recipient_email: contact.email,
            recipient_phone: contact.phone ?? null,
            delivery_status: 'failed',
            error_message: message,
            resent_from_delivery_id: retry_delivery_id ?? null,
            attempt_number: attemptNumber,
          });
          return { contact, success: false, error: message };
        }
      });

    // Wait for all emails to complete
    const emailResults = await Promise.all(emailPromises);
    emailsSent = emailResults.filter(result => result.success).length;

    // Log activities for each contact
    for (const contact of contacts) {
      await supabase.from('activity_logs').insert({
        user_id,
        action_type: 'emergency_alert',
        description: `${retry_delivery_id ? 'Emergency alert resent' : 'Emergency alert sent'} to ${contact.name}`,
        metadata: {
          incident_id,
          contact_id: contact.id,
          contact_name: contact.name,
          contact_phone: contact.phone,
          contact_email: contact.email,
          message_type,
          location,
          email_sent: emailResults.find(r => r.contact.id === contact.id)?.success || false,
          retry_delivery_id: retry_delivery_id ?? null
        }
      });

      results.push({
        contact_id: contact.id,
        contact_name: contact.name,
        contact_email: contact.email,
        status: emailResults.find(r => r.contact.id === contact.id)?.success ? 'sent' : 'failed',
        methods: ['email']
      });
    }

    // Update incident with notification status
    const notificationSummary = `Emergency alerts sent to ${emailsSent} out of ${contacts.length} contacts with email addresses`;
    await supabase
      .from('emergency_incidents')
      .update({
        notes: notificationSummary
      })
      .eq('id', incident_id);

    console.log('Emergency alert processing completed');

    return new Response(JSON.stringify({
      success: true,
      message: retry_delivery_id ? 'Failed SOS alert resent.' : 'SOS alerts processed.',
      incident_id,
      contacts_notified: emailsSent,
      emails_sent: emailsSent,
      total_contacts: contacts.length,
      contacts_with_email: contacts.filter(c => c.email).length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-emergency-alerts function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error.',
      error_code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
