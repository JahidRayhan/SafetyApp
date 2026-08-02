// Canonical Supabase client for the SafeGuard application.
// Do not import the generated types file directly — use `@/core/database/schema`.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = "https://hfogbmlwlecbocsojkoj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmb2dibWx3bGVjYm9jc29qa29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDkwNjAsImV4cCI6MjA2MzU4NTA2MH0.4KdSoMQJxuo4eTad_cHTARfjXeAuNFyEUALL04MYxkE";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);
