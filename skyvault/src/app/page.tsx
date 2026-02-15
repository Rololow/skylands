import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("role").eq("id", user.id).single()
    : { data: null };

  const isModerator = profile?.role === "moderator" || profile?.role === "admin";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold">SkyVault</h1>

      {user ? (
        <>
          <p className="text-zinc-700">Connecté en tant que {user.email}</p>
          <Link href="/collection" className="w-fit rounded-md border px-3 py-2">
            Ouvrir ma checklist
          </Link>
          {isModerator ? (
            <Link href="/moderator" className="w-fit rounded-md border px-3 py-2">
              Dashboard modérateur
            </Link>
          ) : null}
          <form action={logout}>
            <button type="submit" className="rounded-md bg-black px-3 py-2 text-white">
              Se déconnecter
            </button>
          </form>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/login" className="rounded-md bg-black px-3 py-2 text-white">
            Connexion
          </Link>
          <Link href="/signup" className="rounded-md border px-3 py-2">
            Inscription
          </Link>
        </div>
      )}
    </main>
  );
}
