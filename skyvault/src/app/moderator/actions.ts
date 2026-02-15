"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertModerator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, isModerator: false };
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  const isModerator = profile?.role === "moderator" || profile?.role === "admin";

  return { supabase, user, isModerator };
}

export async function createSkylander(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const element = String(formData.get("element") ?? "").trim() || null;
  const series = String(formData.get("series") ?? "").trim() || null;

  if (!name || !slug) {
    return;
  }

  const { supabase, isModerator } = await assertModerator();
  if (!isModerator) {
    return;
  }

  await supabase.from("skylanders").insert({
    name,
    slug,
    element,
    series,
  });

  revalidatePath("/moderator");
  revalidatePath("/collection");
}

export async function createSkylanderPrice(formData: FormData) {
  const skylanderId = Number(formData.get("skylanderId"));
  const source = String(formData.get("source") ?? "").trim();
  const currency = String(formData.get("currency") ?? "EUR").trim().toUpperCase();
  const priceCents = Number(formData.get("priceCents"));

  if (!Number.isFinite(skylanderId) || !source || !Number.isFinite(priceCents) || priceCents < 0) {
    return;
  }

  const { supabase, user, isModerator } = await assertModerator();
  if (!isModerator || !user) {
    return;
  }

  await supabase.from("skylander_prices").insert({
    skylander_id: skylanderId,
    source,
    currency,
    price_cents: Math.round(priceCents),
    created_by: user.id,
  });

  revalidatePath("/moderator");
}
