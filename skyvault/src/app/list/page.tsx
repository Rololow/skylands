import Link from "next/link";
import { redirect } from "next/navigation";
import { toggleCollectionItem } from "@/app/collection/actions";
import ListFilters from "@/app/list/filters";
import AppHeader from "@/components/app-header";
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
};

type ListPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    series?: string;
    element?: string;
    owned?: string;
    page?: string;
  }>;
};

export default async function ListPage({ searchParams }: ListPageProps) {
  const params = await searchParams;
  const searchTerm = (params.q ?? "").trim().toLowerCase();
  const sort = params.sort ?? "name_asc";
  const selectedSeries = (params.series ?? "").trim();
  const selectedElement = (params.element ?? "").trim();
  const onlyOwned = params.owned === "1";
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
  const allSkylanderIds = skylandersTyped.map((item) => item.id);

  const { data: prices, error: pricesError } = allSkylanderIds.length
    ? await supabase
        .from("skylander_prices")
        .select("skylander_id, price_cents, observed_at")
        .in("skylander_id", allSkylanderIds)
        .order("observed_at", { ascending: false })
    : { data: [], error: null };

  if (skylandersError || collectionError || pricesError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Liste des Skylanders</h1>
        <p className="text-sm text-red-600">Impossible de charger la liste pour le moment.</p>
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

  const seriesOptions = [...new Set(skylandersTyped.map((item) => item.series).filter((value): value is string => Boolean(value)))].sort();
  const elementOptions = [...new Set(skylandersTyped.map((item) => item.element).filter((value): value is string => Boolean(value)))].sort();

  const filteredSkylanders = skylandersTyped.filter((skylander) => {
    const nameMatches = searchTerm ? skylander.name.toLowerCase().includes(searchTerm) : true;
    const seriesMatches = selectedSeries ? skylander.series === selectedSeries : true;
    const elementMatches = selectedElement ? skylander.element === selectedElement : true;
    const ownedMatches = onlyOwned ? ownedIds.has(skylander.id) : true;
    return nameMatches && seriesMatches && elementMatches && ownedMatches;
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
    if (selectedSeries) {
      query.set("series", selectedSeries);
    }
    if (selectedElement) {
      query.set("element", selectedElement);
    }
    if (onlyOwned) {
      query.set("owned", "1");
    }
    if (page > 1) {
      query.set("page", String(page));
    }

    const encoded = query.toString();
    return encoded ? `/list?${encoded}` : "/list";
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
      <AppHeader showCollectionLink showModeratorLink={isModerator} />
      <h1 className="text-2xl font-semibold">Liste complète des Skylanders</h1>
      <p className="text-sm text-zinc-600">Parcours tous les Skylanders disponibles. Clique pour ajouter/retirer de ta collection.</p>

      <ListFilters
        defaultQuery={params.q ?? ""}
        defaultSort={sort}
        defaultSeries={selectedSeries}
        defaultElement={selectedElement}
        defaultOwned={onlyOwned}
        seriesOptions={seriesOptions}
        elementOptions={elementOptions}
      />

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
        <p className="text-sm text-zinc-600">Aucun résultat pour les filtres actuels.</p>
      )}

      <Link href="/" className="text-sm underline">
        Retour accueil
      </Link>
    </main>
  );
}
