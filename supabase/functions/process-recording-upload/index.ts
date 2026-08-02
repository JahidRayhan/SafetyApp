
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecordingUpload {
  incident_id: string;
  file_path: string;
  file_type: 'audio' | 'video' | 'image';
  file_size: number;
  duration_seconds?: number;
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

    // SECURITY: Verify caller's JWT and derive user_id from it.
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

    const uploadData: RecordingUpload = await req.json();
    console.log('Processing recording upload:', { ...uploadData, user_id });

    // Verify the file exists in storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('emergency-recordings')
      .list(user_id, {
        search: uploadData.file_path.split('/').pop()
      });

    if (fileError || !fileData || fileData.length === 0) {
      console.error('File not found in storage:', fileError);
      throw new Error('Recording file not found in storage');
    }

    // Insert recording metadata into database
    const { data: recording, error: dbError } = await supabase
      .from('recordings')
      .insert({
        incident_id: uploadData.incident_id,
        user_id: user_id,
        file_path: uploadData.file_path,
        file_type: uploadData.file_type,
        file_size: uploadData.file_size,
        duration_seconds: uploadData.duration_seconds || 0
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save recording metadata');
    }

    // Log the recording upload
    await supabase.from('activity_logs').insert({
      user_id: user_id,
      action_type: 'evidence_upload',
      description: `Emergency ${uploadData.file_type} recording uploaded`,
      metadata: {
        incident_id: uploadData.incident_id,
        recording_id: recording.id,
        file_path: uploadData.file_path,
        file_size: uploadData.file_size,
        duration_seconds: uploadData.duration_seconds
      }
    });

    // In a real implementation, you might also:
    // - Generate transcripts for audio/video files
    // - Extract metadata from files
    // - Send notifications to relevant authorities
    // - Backup to additional secure storage

    console.log('Recording upload processed successfully');

    return new Response(JSON.stringify({
      success: true,
      recording_id: recording.id,
      message: 'Recording uploaded and processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-recording-upload function:', error);
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
