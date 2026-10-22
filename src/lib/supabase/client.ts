"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";

export function createSupabaseBrowserClient() {
  const { url, key } = getSupabasePublicConfig();
  return createBrowserClient(url, key);
}
