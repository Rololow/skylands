"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function resolveOriginFromHeaders(headerList: Headers) {
  const directOrigin = headerList.get("origin");
  if (directOrigin) {
    return directOrigin;
  }

  const forwardedProto = headerList.get("x-forwarded-proto") ?? "https";
  const forwardedHost = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (!forwardedHost) {
    return null;
  }

  return `${forwardedProto}://${forwardedHost}`;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = resolveOriginFromHeaders(headerList);

  if (!origin) {
    redirect("/login?error=Impossible%20de%20d%C3%A9terminer%20l%27URL%20de%20retour");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Connexion Google indisponible")}`);
  }

  redirect(data.url);
}
