
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, conversation_id, user_id } = await req.json()

    // Basic chatbot responses - in a real implementation, you'd use OpenAI or another AI service
    const responses = {
      // Safety and emergency responses
      'emergency': [
        "If you're in immediate danger, please call emergency services (911) right away. Your safety is the top priority.",
        "For immediate emergencies, contact local emergency services. I can help you with safety planning and resources."
      ],
      'help': [
        "I'm here to help you with safety concerns, emergency planning, and using SafeGuard features. What would you like to know?",
        "How can I assist you with your safety needs today? I can help with emergency contacts, safety tips, or app features."
      ],
      'safety': [
        "Here are some safety tips: Always let someone know where you're going, trust your instincts, stay aware of your surroundings, and keep emergency contacts updated.",
        "Safety planning is important. Make sure your emergency contacts are current, consider safe zones in your area, and practice using the SOS feature."
      ],
      'contacts': [
        "You can manage your emergency contacts in the 'Emergency Contacts' section. Make sure to include people who can respond quickly in different situations.",
        "Emergency contacts should include family, friends, and local authorities. Update their information regularly and let them know they're listed."
      ],
      'sos': [
        "The SOS button sends alerts to your emergency contacts and shares your location. It also starts automatic recording for evidence.",
        "When you press SOS, wait for the 3-second countdown to complete. This prevents accidental activation while ensuring quick access in emergencies."
      ],
      'recording': [
        "Emergency recordings are automatically started when SOS is activated. They're stored securely and can be accessed by authorities if needed.",
        "Audio and video recordings during emergencies serve as evidence and help responders understand your situation better."
      ],
      'location': [
        "Location sharing helps emergency contacts and authorities find you quickly. Your location is only shared during emergencies or when you explicitly allow it.",
        "Keeping location services enabled ensures accurate emergency response. Your privacy is protected with secure, encrypted location data."
      ]
    };

    // Simple keyword matching for responses
    let response = "I understand you're reaching out for help. I'm here to assist with safety concerns, emergency planning, and SafeGuard features. Could you please be more specific about what you need help with?";

    const messageLower = message.toLowerCase();
    
    // Check for keywords and provide appropriate responses
    for (const [key, responseArray] of Object.entries(responses)) {
      if (messageLower.includes(key)) {
        response = responseArray[Math.floor(Math.random() * responseArray.length)];
        break;
      }
    }

    // Handle common greetings
    if (messageLower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      response = "Hello! I'm your SafeGuard AI assistant. I'm here to help you with safety questions, emergency planning, and using the app's features. How can I assist you today?";
    }

    // Handle thank you messages
    if (messageLower.includes('thank')) {
      response = "You're welcome! I'm always here to help with your safety needs. Don't hesitate to reach out if you have more questions about emergency preparedness or using SafeGuard.";
    }

    // Handle questions about features
    if (messageLower.includes('how') && messageLower.includes('work')) {
      response = "SafeGuard works by providing you with emergency tools like SOS alerts, location sharing, emergency contacts, and automatic recording. Each feature is designed to help you stay safe and get help quickly when needed.";
    }

    console.log(`Chatbot request from user ${user_id}: ${message}`);
    console.log(`Response: ${response}`);

    return new Response(
      JSON.stringify({ 
        response,
        conversation_id,
        user_id,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in chatbot function:', error);
    return new Response(
      JSON.stringify({ 
        response: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or contact support if the issue persists.",
        error: true
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
