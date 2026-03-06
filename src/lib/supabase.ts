import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null = null;

export function createServerClient() {
  if (serverClient) return serverClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables not set");
  }

  serverClient = createClient(url, key);
  return serverClient;
}
