
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
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

    const { message }: ChatRequest = await req.json();

    console.log('Processing chat message:', message);

    // For now, provide predefined safety-focused responses
    // In a real implementation, you would integrate with OpenAI or another AI service
    const response = generateSafetyResponse(message);

    // Save the chat message to database
    const { error: dbError } = await supabase
      .from('chat_messages')
      .insert({
        user_id,
        message,
        response
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Log the chat activity
    await supabase.from('activity_logs').insert({
      user_id,
      action_type: 'chat',
      description: 'Used AI assistant chatbot',
      metadata: {
        message_preview: message.substring(0, 100),
        response_preview: response.substring(0, 100)
      }
    });

    return new Response(JSON.stringify({
      success: true,
      response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-support function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error.',
      error_code: 'INTERNAL_ERROR',
      response: "I'm having trouble right now. Please try again or contact support for assistance."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateSafetyResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Emergency and SOS related
  if (lowerMessage.includes('emergency') || lowerMessage.includes('sos') || lowerMessage.includes('help')) {
    return `🚨 **Emergency Assistance**

If you're in immediate danger, please call emergency services (911) right away.

For non-immediate emergencies, you can:
• Use the SOS button in the app to alert your emergency contacts
• Share your live location with trusted contacts
• Start emergency recording for evidence

The app will automatically send your location and alert your emergency contacts when you trigger SOS.

Is there a specific emergency feature you'd like help with?`;
  }

  // Location and tracking
  if (lowerMessage.includes('location') || lowerMessage.includes('tracking') || lowerMessage.includes('share')) {
    return `📍 **Location Features**

SafeGuard offers several location features:

• **Live Location Sharing**: Share your real-time location with emergency contacts via email
• **Location History**: Automatically saves your location when sharing is active
• **Emergency Location**: Your location is automatically shared when SOS is triggered

To start location sharing:
1. Go to Location Sharing in the app
2. Tap "Start Live Sharing"
3. Your contacts will receive email updates with your location

Would you like help setting up any specific location feature?`;
  }

  // Contacts and setup
  if (lowerMessage.includes('contact') || lowerMessage.includes('setup') || lowerMessage.includes('add')) {
    return `👥 **Emergency Contacts**

Setting up emergency contacts is crucial for your safety:

1. **Add Contacts**: Go to Emergency Contacts and add trusted people
2. **Include Details**: Add name, phone, email, and relationship
3. **Set Priority**: Arrange contacts by priority (1 = highest)
4. **Test System**: Send a test alert to ensure contacts receive notifications

**Best Practices**:
• Add at least 3 emergency contacts
• Include local contacts who can respond quickly
• Keep contact information updated
• Inform your contacts they're listed as emergency contacts

Need help adding or managing your emergency contacts?`;
  }

  // Recording and evidence
  if (lowerMessage.includes('record') || lowerMessage.includes('evidence') || lowerMessage.includes('audio') || lowerMessage.includes('video')) {
    return `🎙️ **Recording Features**

SafeGuard helps you collect evidence safely:

• **Emergency Recording**: Automatically starts when SOS is triggered
• **Manual Recording**: Record audio/video evidence anytime
• **Secure Storage**: All recordings are encrypted and stored safely
• **Evidence Upload**: Upload existing photos/videos as evidence

**Recording Tips**:
• Speak clearly and describe what you're seeing
• Keep recordings focused and relevant
• Don't put yourself in more danger to get recordings
• Recordings are automatically saved to your account

Would you like help with any specific recording feature?`;
  }

  // Safety tips and general
  if (lowerMessage.includes('safety') || lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
    return `🛡️ **Safety Tips**

Here are key safety practices:

**Personal Safety**:
• Trust your instincts - if something feels wrong, it probably is
• Stay aware of your surroundings
• Let trusted people know your plans and location
• Keep your phone charged and SafeGuard app accessible

**Using SafeGuard**:
• Set up emergency contacts before you need them
• Practice using the SOS feature
• Keep your location sharing enabled when in potentially unsafe situations
• Review and update your emergency plan regularly

**Emergency Preparedness**:
• Know local emergency numbers
• Have a safety plan for different situations
• Keep important documents accessible
• Consider taking a safety or self-defense course

What specific safety topic would you like to know more about?`;
  }

  // App features and how-to
  if (lowerMessage.includes('how') || lowerMessage.includes('use') || lowerMessage.includes('feature') || lowerMessage.includes('app')) {
    return `📱 **How to Use SafeGuard**

**Main Features**:
• **SOS Alert**: Large red button sends immediate alerts to all emergency contacts
• **Location Sharing**: Share live location updates via email
• **Emergency Contacts**: Manage your trusted contact list
• **Recording**: Audio/video evidence collection
• **Community**: Access support resources and share experiences
• **Activity Log**: Track all your safety activities

**Quick Start**:
1. Add emergency contacts first
2. Test the SOS system with trusted contacts
3. Enable location permissions
4. Familiarize yourself with all features

**For Mobile**:
• iOS: Shake your phone 3 times horizontally to trigger SOS
• Android: Triple-press the power button for emergency SOS

What specific feature would you like to learn about?`;
  }

  // Default response
  return `Hi! I'm your SafeGuard AI assistant. I'm here to help you stay safe and make the most of the app.

**I can help you with**:
• Emergency procedures and SOS alerts
• Setting up and managing emergency contacts
• Location sharing and tracking
• Recording evidence safely
• General safety tips and advice
• How to use app features

**Common questions**:
• "How do I add emergency contacts?"
• "How does the SOS feature work?"
• "How can I share my location?"
• "What safety tips do you recommend?"

What would you like to know about SafeGuard or personal safety?`;
}
