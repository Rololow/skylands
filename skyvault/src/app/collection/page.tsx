import Link from "next/link";
import { redirect } from "next/navigation";
import { toggleCollectionItem } from "@/app/collection/actions";
import AppHeader from "@/components/app-header";
import CollectionValueChart from "@/components/collection-value-chart";
import GroupedSkylandersGrid from "@/components/grouped-skylanders-grid";
import { createClient } from "@/lib/supabase/server";

type Skylander = {
  id: number;
  name: string;
  series: string | null;
  element: string | null;
  item_type: string | null;
  variant: string | null;
  figure_image_url: string | null;
};

type CollectionItem = {
  skylander_id: number;
  quantity: number;
};

type PriceRow = {
  skylander_id: number;
  price_cents: number;
  observed_at: string;
};

type CollectionPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
  const params = await searchParams;
  const searchTerm = (params.q ?? "").trim().toLowerCase();
  const sort = params.sort ?? "name_asc";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const pageSize = 50;

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
    .select("id, name, series, element, item_type, variant, figure_image_url")
    .order("name", { ascending: true });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  const isModerator = profile?.role === "moderator" || profile?.role === "admin";

  const collectionTyped = (collection as CollectionItem[] | null) ?? [];
  const skylandersTyped = (skylanders as Skylander[] | null) ?? [];
  const ownedIds = new Set(collectionTyped.map((item) => item.skylander_id));
  const ownedSkylanderIds = Array.from(ownedIds);

  const { data: prices, error: pricesError } = ownedSkylanderIds.length
    ? await supabase
        .from("skylander_prices")
        .select("skylander_id, price_cents, observed_at")
        .in("skylander_id", ownedSkylanderIds)
        .order("observed_at", { ascending: true })
    : { data: [], error: null };

  if (skylandersError || collectionError || pricesError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Ma collection</h1>
        <p className="text-sm text-red-600">Impossible de charger la checklist pour le moment.</p>
        <Link href="/" className="text-sm underline">
          Retour accueil
        </Link>
      </main>
    );
  }

  const pricesTyped = (prices as PriceRow[] | null) ?? [];

  // Calculate latest prices
  const latestPriceBySkylander = new Map<number, number>();
  [...pricesTyped].reverse().forEach((row) => {
    if (!latestPriceBySkylander.has(row.skylander_id)) {
      latestPriceBySkylander.set(row.skylander_id, row.price_cents);
    }
  });

  // Calculate historical collection value
  const dateValueMap = new Map<string, number>();
  pricesTyped.forEach((row) => {
    const date = row.observed_at.split('T')[0]; // Get just the date part
    if (!dateValueMap.has(date)) {
      dateValueMap.set(date, 0);
    }
  });

  // For each date, calculate total collection value
  const chartData = Array.from(dateValueMap.keys()).map((date) => {
    const pricesBySkylander = new Map<number, number>();
    
    // Get the most recent price for each skylander up to this date
    pricesTyped.forEach((row) => {
      if (row.observed_at.split('T')[0] <= date) {
        pricesBySkylander.set(row.skylander_id, row.price_cents);
      }
    });
    
    // Calculate total value for this date
    const totalValue = collectionTyped.reduce((sum, item) => {
      const price = pricesBySkylander.get(item.skylander_id) ?? 0;
      return sum + (price * item.quantity);
    }, 0);
    
    return {
      date,
      value: totalValue / 100,
    };
  }).filter((point) => point.value > 0);

  const totalCents = collectionTyped.reduce((sum, item) => {
    const latestPrice = latestPriceBySkylander.get(item.skylander_id) ?? 0;
    return sum + latestPrice * item.quantity;
  }, 0);

  const totalItems = collectionTyped.reduce((sum, item) => sum + item.quantity, 0);
  const totalEuro = (totalCents / 100).toFixed(2);

  // Only show owned Skylanders
  const ownedSkylanders = skylandersTyped.filter((skylander) => ownedIds.has(skylander.id));

  const filteredSkylanders = ownedSkylanders.filter((skylander) => {
    const nameMatches = searchTerm ? skylander.name.toLowerCase().includes(searchTerm) : true;
    return nameMatches;
  });

  filteredSkylanders.sort((left, right) => {
    if (sort === "price_desc") {
      return (latestPriceBySkylander.get(right.id) ?? 0) - (latestPriceBySkylander.get(left.id) ?? 0);
    }

    if (sort === "price_asc") {
      return (latestPriceBySkylander.get(left.id) ?? 0) - (latestPriceBySkylander.get(right.id) ?? 0);
    }

    return left.name.localeCompare(right.name);
  });

  const totalPages = Math.max(1, Math.ceil(filteredSkylanders.length / pageSize));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSkylanders = filteredSkylanders.slice(startIndex, startIndex + pageSize);

  const makePageHref = (page: number) => {
    const query = new URLSearchParams();

    if (params.q) {
      query.set("q", params.q);
    }
    if (sort !== "name_asc") {
      query.set("sort", sort);
    }
    if (page > 1) {
      query.set("page", String(page));
    }

    const encoded = query.toString();
    return encoded ? `/collection?${encoded}` : "/collection";
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
      <AppHeader showListLink showModeratorLink={isModerator} />
      <h1 className="text-2xl font-semibold">Ma collection</h1>
      <p className="text-sm text-zinc-600">Voici les Skylanders que tu possèdes. Clique pour les retirer de ta collection.</p>
      <p className="text-sm text-zinc-700">
        Valeur estimée: <span className="font-semibold">{totalEuro} €</span> ({totalItems} item(s))
      </p>

      <CollectionValueChart data={chartData} />

      <form method="get" className="flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Rechercher dans ma collection"
          className="flex-1 rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm [&>option]:bg-white [&>option]:text-black"
        >
          <option value="name_asc">Tri: Nom (A-Z)</option>
          <option value="price_desc">Tri: Plus cher</option>
          <option value="price_asc">Tri: Moins cher</option>
        </select>
        <button type="submit" className="rounded-md border border-zinc-500 px-4 py-2 text-sm">
          Filtrer
        </button>
        <Link href="/collection" className="rounded-md border border-zinc-500 px-4 py-2 text-center text-sm">
          Réinitialiser
        </Link>
      </form>

      {filteredSkylanders.length ? (
        <>
          <GroupedSkylandersGrid
            skylanders={filteredSkylanders}
            ownedIds={ownedIds}
            toggleAction={toggleCollectionItem}
          />
          
          <div className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-center">
            {filteredSkylanders.length} résultat(s)
          </div>
        </>
      ) : (
        <div className="rounded-md border border-zinc-700 p-6 text-center">
          <p className="text-sm text-zinc-600">
            {ownedSkylanders.length === 0 
              ? "Ta collection est vide. Va dans la liste pour ajouter des Skylanders !" 
              : "Aucun résultat pour cette recherche."}
          </p>
          {ownedSkylanders.length === 0 && (
            <Link href="/list" className="mt-3 inline-block rounded-md border border-zinc-500 px-4 py-2 text-sm">
              Parcourir la liste
            </Link>
          )}
        </div>
      )}

      <Link href="/" className="text-sm underline">
        Retour accueil
      </Link>
    </main>
  );
}
