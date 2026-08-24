import { createClient } from "@/lib/supabase/server";
import type { WorkShowcase } from "@/lib/types";
import { isDemoMode } from "@/lib/demo-data";

export async function getActiveWorks(): Promise<WorkShowcase[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("work_showcase")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getAllWorks(): Promise<WorkShowcase[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("work_showcase").select("*").order("sort_order");
  return data ?? [];
}
