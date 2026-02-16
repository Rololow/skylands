import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/auth/actions";

type AppHeaderProps = {
  showCollectionLink?: boolean;
  showModeratorLink?: boolean;
  showLogout?: boolean;
};

export default function AppHeader({
  showCollectionLink = false,
  showModeratorLink = false,
  showLogout = true,
}: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Image
          src="https://static.wikia.nocookie.net/skylanders/images/0/00/Skylanders_Logo.png/revision/latest?cb=20200327134807"
          alt="Skylanders logo"
          width={160}
          height={56}
        />
        <span className="text-lg font-semibold">SkyVault</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showCollectionLink ? (
          <Link href="/collection" className="rounded-md border px-3 py-2 text-sm">
            Collection
          </Link>
        ) : null}
        {showModeratorLink ? (
          <Link href="/moderator" className="rounded-md border px-3 py-2 text-sm">
            Modération
          </Link>
        ) : null}
        {showLogout ? (
          <form action={logout}>
            <button type="submit" className="rounded-md bg-black px-3 py-2 text-sm text-white">
              Déconnexion
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
