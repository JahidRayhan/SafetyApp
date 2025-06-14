
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface EmergencyAlert {
  incident_id: string;
  user_id: string;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  message_type: 'sms' | 'email' | 'both';
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

    const { incident_id, user_id, location, message_type = 'both' }: EmergencyAlert = await req.json();

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

    const { data: contacts, error: contactsError } = await supabase
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

    // Process each contact
    const results = [];
    let emailsSent = 0;
    
    for (const contact of contacts) {
      console.log(`Notifying contact: ${contact.name} (${contact.phone})`);
      
      try {
        // Log the notification attempt
        await supabase.from('activity_logs').insert({
          user_id,
          action_type: 'emergency_alert',
          description: `Emergency alert sent to ${contact.name}`,
          metadata: {
            incident_id,
            contact_id: contact.id,
            contact_name: contact.name,
            contact_phone: contact.phone,
            contact_email: contact.email,
            message_type,
            location
          }
        });

        const contactResult = {
          contact_id: contact.id,
          contact_name: contact.name,
          status: 'sent',
          methods: []
        };

        // Send email using Resend
        if ((message_type === 'email' || message_type === 'both') && contact.email) {
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
                    </div>
                    <p style="color: #dc2626; font-weight: bold;">Please contact ${userName} immediately or call emergency services if needed.</p>
                    <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated message from SafeGuard Safety App.</p>
                  </div>
                </div>
              `
            });

            if (emailError) {
              console.error(`Email error for ${contact.email}:`, emailError);
            } else {
              console.log(`Email sent successfully to ${contact.email}`);
              contactResult.methods.push('email');
              emailsSent++;
            }
          } catch (emailError) {
            console.error(`Failed to send email to ${contact.email}:`, emailError);
          }
        }

        // Log SMS attempt (for manual fallback)
        if ((message_type === 'sms' || message_type === 'both') && contact.phone) {
          console.log(`SMS would be sent to ${contact.phone}: ${emergencyMessage}`);
          contactResult.methods.push('sms_logged');
          
          // Store SMS for manual sending
          await supabase.from('activity_logs').insert({
            user_id,
            action_type: 'sms_manual_required',
            description: `Manual SMS needed for ${contact.name} at ${contact.phone}`,
            metadata: {
              incident_id,
              contact_id: contact.id,
              phone: contact.phone,
              message: emergencyMessage
            }
          });
        }

        results.push(contactResult);

      } catch (contactError) {
        console.error(`Failed to notify contact ${contact.name}:`, contactError);
        results.push({
          contact_id: contact.id,
          contact_name: contact.name,
          status: 'failed',
          error: contactError.message
        });
      }
    }

    // Update incident with notification status
    const notificationSummary = `Emergency alerts sent: ${emailsSent} emails, ${results.filter(r => r.methods?.includes('sms_logged')).length} SMS logged for manual sending`;
    await supabase
      .from('emergency_incidents')
      .update({
        notes: notificationSummary
      })
      .eq('id', incident_id);

    console.log('Emergency alert processing completed');

    return new Response(JSON.stringify({
      success: true,
      incident_id,
      contacts_notified: results.filter(r => r.status === 'sent').length,
      emails_sent: emailsSent,
      total_contacts: contacts.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-emergency-alerts function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
