import Link from "next/link";
import { logout } from "@/app/auth/actions";

type AppHeaderProps = {
  isModerator: boolean;
};

export default function AppHeader({ isModerator }: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-800 px-3 py-2">
      <nav className="flex items-center gap-2">
        <Link href="/collection" className="rounded-md border border-zinc-700 px-3 py-2 text-sm">
          Collection
        </Link>
        {isModerator ? (
          <Link href="/moderator" className="rounded-md border border-zinc-700 px-3 py-2 text-sm">
            Modérateur
          </Link>
        ) : null}
      </nav>

      <form action={logout}>
        <button type="submit" className="rounded-md bg-black px-3 py-2 text-sm text-white">
          Déconnexion
        </button>
      </form>
    </header>
  );
}
