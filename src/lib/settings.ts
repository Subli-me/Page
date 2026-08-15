import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";
import { isDemoMode, DEMO_SETTINGS } from "@/lib/demo-data";

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (isDemoMode()) return DEMO_SETTINGS;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data ?? DEMO_SETTINGS;
});
