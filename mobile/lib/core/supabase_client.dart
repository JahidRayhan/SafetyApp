import 'package:supabase_flutter/supabase_flutter.dart';

/// Same Supabase project the original React/Capacitor app uses (see its
/// src/integrations/supabase/client.ts) — same schema, same data, so the
/// Flutter and web builds can run against one shared backend.
///
/// This is the anon/publishable key, which is meant to be public in
/// client code — it only grants what your RLS policies allow. Do not put
/// a service_role key here or in any client app, ever.
const String supabaseUrl = 'https://hfogbmlwlecbocsojkoj.supabase.co';
const String supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmb2dibWx3bGVjYm9jc29qa29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDkwNjAsImV4cCI6MjA2MzU4NTA2MH0.4KdSoMQJxuo4eTad_cHTARfjXeAuNFyEUALL04MYxkE';

Future<void> initSupabase() async {
  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
}

/// Shorthand accessor used throughout the services.
SupabaseClient get supabase => Supabase.instance.client;
