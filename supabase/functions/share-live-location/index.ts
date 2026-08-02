import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface LocationShare {
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  sharing_duration_minutes?: number;
  session_id?: string;
  is_update?: boolean;
  incident_id?: string;
}

function buildStaticMapUrl(lat: number, lng: number) {
  // Free, keyless static map embed via OpenStreetMap staticmap service
  // (Google Static Maps requires an API key; we use a keyless OSM-backed renderer.)
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=600x300&markers=${lat},${lng},red-pushpin`;
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
    const user_id = userData.user.id;

    const {
      location,
      sharing_duration_minutes = 60,
      session_id,
      is_update = false,
      incident_id,
    }: LocationShare = await req.json();

    if (
      !location ||
      typeof location.lat !== 'number' ||
      typeof location.lng !== 'number'
    ) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid location' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log('Processing location share for user:', user_id, 'is_update:', is_update);

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

    // ===== Manage live_location_sessions row =====
    let session = null as null | { id: string; expires_at: string };

    if (session_id) {
      const { data: existing } = await supabase
        .from('live_location_sessions')
        .select('id, expires_at, status, user_id')
        .eq('id', session_id)
        .maybeSingle();

      if (existing && existing.user_id === user_id && existing.status === 'active') {
        session = { id: existing.id, expires_at: existing.expires_at };
      }
    }

    if (!session) {
      const expires_at = new Date(Date.now() + sharing_duration_minutes * 60_000).toISOString();
      const { data: created, error: createErr } = await supabase
        .from('live_location_sessions')
        .insert({
          user_id,
          incident_id: incident_id ?? null,
          status: 'active',
          expires_at,
          last_lat: location.lat,
          last_lng: location.lng,
          last_accuracy: location.accuracy ?? null,
          last_updated_at: new Date().toISOString(),
        })
        .select('id, expires_at')
        .single();
      if (createErr) {
        console.error('Failed to create session:', createErr);
        throw new Error('Failed to create sharing session');
      }
      session = created;
    } else {
      await supabase
        .from('live_location_sessions')
        .update({
          last_lat: location.lat,
          last_lng: location.lng,
          last_accuracy: location.accuracy ?? null,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);
    }

    if (!contacts || contacts.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No emergency contacts to share location with',
        contacts_notified: 0,
        session_id: session.id,
        expires_at: session.expires_at,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userName = profile.full_name || 'A SafeGuard user';
    const googleMapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    const staticMapUrl = buildStaticMapUrl(location.lat, location.lng);
    const expiryTime = new Date(session.expires_at).toLocaleString();
    const subjectPrefix = is_update ? '🔄 Updated location' : '📍 Live location sharing started';

    const emailPromises = contacts
      .filter((contact) => contact.email)
      .map(async (contact) => {
        try {
          const { data: emailResult, error: emailError } = await resend.emails.send({
            from: 'SafeGuard Location <onboarding@resend.dev>',
            to: [contact.email],
            subject: `${subjectPrefix} — ${userName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin:0;">${is_update ? '🔄 Location Update' : '📍 Live Location Sharing'}</h1>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                  <h2>${userName} ${is_update ? 'has moved' : 'is sharing their location'}</h2>
                  <p>
                    <a href="${googleMapsUrl}" target="_blank">
                      <img src="${staticMapUrl}" alt="Map preview" style="max-width:100%;border-radius:8px;border:1px solid #ddd;" />
                    </a>
                  </p>
                  <div style="background-color: white; padding: 15px; border-left: 4px solid #059669; margin: 20px 0;">
                    <p><strong>Open in maps:</strong> <a href="${googleMapsUrl}" target="_blank" style="color: #059669;">View live location</a></p>
                    <p><strong>Updated at:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Auto-stops at:</strong> ${expiryTime}</p>
                    <p><strong>Accuracy:</strong> ±${Math.round(location.accuracy || 0)}m</p>
                  </div>
                  <p style="font-size: 12px; color: #666; margin-top: 30px;">Automated message from SafeGuard. Sharing stops automatically when the user cancels or the session expires.</p>
                </div>
              </div>
            `,
          });

          if (emailError) {
            console.error(`Email error for ${contact.email}:`, emailError);
            return { contact, success: false };
          }
          return { contact, success: true };
        } catch (error) {
          console.error(`Failed to send location email to ${contact.email}:`, error);
          return { contact, success: false };
        }
      });

    const emailResults = await Promise.all(emailPromises);
    const emailsSent = emailResults.filter((r) => r.success).length;

    // Update session counters
    const { data: currentCounts } = await supabase
      .from('live_location_sessions')
      .select('updates_sent, contacts_notified')
      .eq('id', session.id)
      .single();

    await supabase
      .from('live_location_sessions')
      .update({
        updates_sent: (currentCounts?.updates_sent ?? 0) + 1,
        contacts_notified: Math.max(currentCounts?.contacts_notified ?? 0, emailsSent),
      })
      .eq('id', session.id);

    await supabase.from('activity_logs').insert({
      user_id,
      action_type: 'location_sharing',
      description: is_update
        ? `Live location update sent to ${emailsSent} contacts`
        : `Live location sharing started — ${emailsSent} contacts notified`,
      metadata: {
        location,
        contacts_notified: emailsSent,
        session_id: session.id,
        is_update,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      contacts_notified: emailsSent,
      total_contacts: contacts.length,
      contacts_with_email: contacts.filter((c) => c.email).length,
      location_url: googleMapsUrl,
      static_map_url: staticMapUrl,
      session_id: session.id,
      expires_at: session.expires_at,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in share-live-location function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error.',
      error_code: 'INTERNAL_ERROR',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
