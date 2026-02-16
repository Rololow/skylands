import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    const isModerator = profile?.role === "moderator" || profile?.role === "admin";

    redirect(isModerator ? "/moderator" : "/collection");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6">
      <Image
        src="https://static.wikia.nocookie.net/skylanders/images/0/00/Skylanders_Logo.png/revision/latest?cb=20200327134807"
        alt="Skylanders logo"
        width={260}
        height={92}
        priority
      />
      <h1 className="text-3xl font-semibold">SkyVault</h1>

      <div className="flex items-center gap-4">
        <Link href="/login" className="rounded-md bg-black px-3 py-2 text-white">
          Connexion
        </Link>
        <Link href="/signup" className="rounded-md border px-3 py-2">
          Inscription
        </Link>
      </div>
    </main>
  );
}
