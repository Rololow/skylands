import Link from "next/link";
import { redirect } from "next/navigation";
import { toggleCollectionItem } from "@/app/collection/actions";
import { createClient } from "@/lib/supabase/server";

type Skylander = {
  id: number;
  name: string;
  element: string | null;
  series: string | null;
};

type CollectionItem = {
  skylander_id: number;
  quantity: number;
};

type PriceRow = {
  skylander_id: number;
  price_cents: number;
};

export default async function CollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: collection, error: collectionError } = await supabase
    .from("user_collection")
    .select("skylander_id, quantity")
    .eq("user_id", user.id)
    .eq("item_condition", "loose");

  const { data: skylanders, error: skylandersError } = await supabase
    .from("skylanders")
    .select("id, name, element, series")
    .order("name", { ascending: true });

  const collectionTyped = (collection as CollectionItem[] | null) ?? [];
  const ownedSkylanderIds = collectionTyped.map((item) => item.skylander_id);

  const { data: prices, error: pricesError } = ownedSkylanderIds.length
    ? await supabase
        .from("skylander_prices")
        .select("skylander_id, price_cents, observed_at")
        .in("skylander_id", ownedSkylanderIds)
        .order("observed_at", { ascending: false })
    : { data: [], error: null };

  if (skylandersError || collectionError || pricesError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-10">
        <h1 className="text-2xl font-semibold">Ma collection</h1>
        <p className="text-sm text-red-600">Impossible de charger la checklist pour le moment.</p>
        <Link href="/" className="text-sm underline">
          Retour accueil
        </Link>
      </main>
    );
  }

  const ownedIds = new Set(collectionTyped.map((item) => item.skylander_id));

  const latestPriceBySkylander = new Map<number, number>();
  ((prices as PriceRow[] | null) ?? []).forEach((row) => {
    if (!latestPriceBySkylander.has(row.skylander_id)) {
      latestPriceBySkylander.set(row.skylander_id, row.price_cents);
    }
  });

  const totalCents = collectionTyped.reduce((sum, item) => {
    const latestPrice = latestPriceBySkylander.get(item.skylander_id) ?? 0;
    return sum + latestPrice * item.quantity;
  }, 0);

  const totalItems = collectionTyped.reduce((sum, item) => sum + item.quantity, 0);
  const totalEuro = (totalCents / 100).toFixed(2);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Ma checklist Skylanders</h1>
      <p className="text-sm text-zinc-600">Clique pour cocher/décocher un item dans ta collection.</p>
      <p className="text-sm text-zinc-700">
        Valeur estimée: <span className="font-semibold">{totalEuro} €</span> ({totalItems} item(s))
      </p>

      {(skylanders as Skylander[] | null)?.length ? (
        <ul className="space-y-2">
          {(skylanders as Skylander[]).map((skylander) => {
            const isOwned = ownedIds.has(skylander.id);

            return (
              <li key={skylander.id}>
                <form action={toggleCollectionItem}>
                  <input type="hidden" name="skylanderId" value={skylander.id} />
                  <input type="hidden" name="isOwned" value={String(isOwned)} />
                  <button type="submit" className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left">
                    <span>
                      <span className="font-medium">{skylander.name}</span>
                      <span className="ml-2 text-sm text-zinc-500">
                        {[skylander.element, skylander.series].filter(Boolean).join(" • ")}
                      </span>
                    </span>
                    <span aria-label={isOwned ? "Possédé" : "Non possédé"}>{isOwned ? "☑" : "☐"}</span>
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-zinc-600">Aucun Skylander dans le catalogue pour l’instant.</p>
      )}

      <Link href="/" className="text-sm underline">
        Retour accueil
      </Link>
    </main>
  );
}
