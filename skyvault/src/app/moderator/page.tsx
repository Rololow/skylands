import Link from "next/link";
import { redirect } from "next/navigation";
import AppHeader from "@/components/app-header";
import { createSkylander, createSkylanderPrice } from "@/app/moderator/actions";
import { createClient } from "@/lib/supabase/server";

type Profile = {
  role: "user" | "moderator" | "admin";
};

type Skylander = {
  id: number;
  name: string;
  slug: string;
  element: string | null;
  series: string | null;
  figure_image_url: string | null;
  card_image_url: string | null;
};

type PriceRow = {
  id: number;
  skylander_id: number;
  source: string;
  currency: string;
  price_cents: number;
  observed_at: string;
};

export default async function ModeratorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  const role = (profile as Profile | null)?.role;
  const isModerator = role === "moderator" || role === "admin";

  if (!isModerator) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-10">
        <h1 className="text-2xl font-semibold">Dashboard modérateur</h1>
        <p className="text-sm text-red-600">Accès refusé.</p>
        <Link href="/" className="text-sm underline">
          Retour accueil
        </Link>
      </main>
    );
  }

  const { data: skylanders } = await supabase
    .from("skylanders")
    .select("id, name, slug, element, series, figure_image_url, card_image_url")
    .order("name", { ascending: true })
    .limit(200);

  const { data: prices } = await supabase
    .from("skylander_prices")
    .select("id, skylander_id, source, currency, price_cents, observed_at")
    .order("observed_at", { ascending: false })
    .limit(20);

  const skylandersTyped = (skylanders as Skylander[] | null) ?? [];
  const pricesTyped = (prices as PriceRow[] | null) ?? [];
  const namesById = new Map<number, string>(skylandersTyped.map((item) => [item.id, item.name]));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <AppHeader showCollectionLink showListLink />
      <h1 className="text-2xl font-semibold">Dashboard modérateur</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Ajouter un Skylander</h2>
        <form action={createSkylander} className="grid gap-3 md:grid-cols-2">
          <input name="name" required placeholder="Nom" className="rounded-md border px-3 py-2" />
          <input name="slug" required placeholder="Slug (ex: trigger-happy)" className="rounded-md border px-3 py-2" />
          <input name="element" placeholder="Element (optionnel)" className="rounded-md border px-3 py-2" />
          <input name="series" placeholder="Série (optionnel)" className="rounded-md border px-3 py-2" />
          <input name="figureImageUrl" placeholder="URL image figurine" className="rounded-md border px-3 py-2" />
          <input name="cardImageUrl" placeholder="URL image carte" className="rounded-md border px-3 py-2" />
          <button type="submit" className="w-fit rounded-md bg-black px-3 py-2 text-white">
            Ajouter
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Ajouter un prix</h2>
        <form action={createSkylanderPrice} className="grid gap-3 md:grid-cols-2">
          <select name="skylanderId" required className="rounded-md border px-3 py-2">
            <option value="">Choisir un Skylander</option>
            {skylandersTyped.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input name="source" required placeholder="Source (ex: vinted)" className="rounded-md border px-3 py-2" />
          <input name="currency" defaultValue="EUR" maxLength={3} className="rounded-md border px-3 py-2" />
          <input
            name="priceCents"
            type="number"
            min={0}
            required
            placeholder="Prix en centimes (ex: 1299)"
            className="rounded-md border px-3 py-2"
          />
          <button type="submit" className="w-fit rounded-md bg-black px-3 py-2 text-white">
            Enregistrer
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Derniers prix</h2>
        {pricesTyped.length ? (
          <ul className="space-y-2">
            {pricesTyped.map((price) => (
              <li key={price.id} className="rounded-md border px-3 py-2 text-sm">
                {namesById.get(price.skylander_id) ?? `#${price.skylander_id}`} • {price.source} • {price.price_cents} {price.currency}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-600">Aucun prix enregistré.</p>
        )}
      </section>

      <Link href="/" className="text-sm underline">
        Retour accueil
      </Link>
    </main>
  );
}
