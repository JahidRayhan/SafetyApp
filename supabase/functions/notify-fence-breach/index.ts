import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface BreachBody {
  zone_id: string;
  zone_name: string;
  zone_type?: string;
  location: { lat: number; lng: number; accuracy?: number };
  session_id?: string;
  incident_id?: string;
  distance_meters?: number;
}

function staticMap(lat: number, lng: number) {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=600x300&markers=${lat},${lng},red-pushpin`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const user_id = userData.user.id;

    const body: BreachBody = await req.json();
    if (!body?.zone_id || !body?.location || typeof body.location.lat !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Require an active incident to send fence breach alerts
    if (body.incident_id) {
      const { data: inc } = await supabase
        .from('emergency_incidents')
        .select('id, status, user_id')
        .eq('id', body.incident_id)
        .maybeSingle();
      if (!inc || inc.user_id !== user_id || inc.status !== 'active') {
        return new Response(JSON.stringify({ error: 'No active incident' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'incident_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles').select('full_name').eq('id', user_id).single();
    const userName = profile?.full_name || 'A SafeGuard user';

    const { data: contacts } = await supabase
      .from('emergency_contacts').select('*').eq('user_id', user_id);

    const { lat, lng } = body.location;
    const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const img = staticMap(lat, lng);

    const recipients = (contacts ?? []).filter((c) => c.email);
    const results = await Promise.all(recipients.map(async (c) => {
      try {
        const { error } = await resend.emails.send({
          from: 'SafeGuard Alerts <onboarding@resend.dev>',
          to: [c.email],
          subject: `🚨 ${userName} left safe zone "${body.zone_name}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color:#dc2626;color:white;padding:20px;text-align:center;">
                <h1 style="margin:0;">🚨 Safe Zone Breach</h1>
              </div>
              <div style="padding:20px;background:#fff7f7;">
                <h2>${userName} has left the safe zone "<strong>${body.zone_name}</strong>" during an active emergency.</h2>
                <p><a href="${mapUrl}" target="_blank"><img src="${img}" style="max-width:100%;border-radius:8px;border:1px solid #ddd;" alt="Map"/></a></p>
                <p><strong>Open in maps:</strong> <a href="${mapUrl}" target="_blank">View location</a></p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                ${body.distance_meters ? `<p><strong>Distance from zone:</strong> ${Math.round(body.distance_meters)} m</p>` : ''}
                <p style="font-size:12px;color:#666;">Automated alert from SafeGuard geo-fencing.</p>
              </div>
            </div>`,
        });
        return !error;
      } catch (e) {
        console.error('breach email failed', e);
        return false;
      }
    }));

    const sent = results.filter(Boolean).length;

    await supabase.from('activity_logs').insert({
      user_id,
      action_type: 'geofence_breach',
      description: `Left safe zone "${body.zone_name}" — ${sent} contacts notified`,
      metadata: {
        zone_id: body.zone_id,
        zone_name: body.zone_name,
        location: body.location,
        incident_id: body.incident_id,
        session_id: body.session_id,
        contacts_notified: sent,
      },
    });

    return new Response(JSON.stringify({ success: true, contacts_notified: sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('notify-fence-breach error:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
