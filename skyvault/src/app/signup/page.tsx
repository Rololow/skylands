import Link from "next/link";
import { signInWithGoogle, signup } from "@/app/auth/actions";

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Inscription</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <form action={signInWithGoogle}>
        <button type="submit" className="w-full rounded-md border px-3 py-2">
          Continuer avec Google
        </button>
      </form>

      <p className="text-xs text-zinc-500">ou</p>

      <form action={signup} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-md border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Mot de passe"
          className="rounded-md border px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-black px-3 py-2 text-white">
          Créer le compte
        </button>
      </form>

      <p className="text-sm text-zinc-600">
        Déjà inscrit ? <Link href="/login" className="underline">Se connecter</Link>
      </p>
    </main>
  );
}
