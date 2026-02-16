"use client";

import Link from "next/link";

type ListFiltersProps = {
  defaultQuery: string;
  defaultSort: string;
  defaultSeries: string;
  defaultElement: string;
  defaultOwned: boolean;
  seriesOptions: string[];
  elementOptions: string[];
};

export default function ListFilters({
  defaultQuery,
  defaultSort,
  defaultSeries,
  defaultElement,
  defaultOwned,
  seriesOptions,
  elementOptions,
}: ListFiltersProps) {
  return (
    <form method="get" className="grid gap-2 rounded-md border border-zinc-800 p-3 sm:grid-cols-2 lg:grid-cols-4">
      <input
        type="search"
        name="q"
        defaultValue={defaultQuery}
        placeholder="Rechercher un nom"
        className="rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm"
      />
      <select
        name="sort"
        defaultValue={defaultSort}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm [&>option]:bg-white [&>option]:text-black"
      >
        <option value="name_asc">Tri: Nom (A-Z)</option>
        <option value="price_desc">Tri: Plus cher</option>
        <option value="price_asc">Tri: Moins cher</option>
      </select>
      <select
        name="series"
        defaultValue={defaultSeries}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm [&>option]:bg-white [&>option]:text-black"
      >
        <option value="">Jeu: Tous</option>
        {seriesOptions.map((series) => (
          <option key={series} value={series}>
            {series}
          </option>
        ))}
      </select>
      <select
        name="element"
        defaultValue={defaultElement}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm [&>option]:bg-white [&>option]:text-black"
      >
        <option value="">Type: Tous</option>
        {elementOptions.map((element) => (
          <option key={element} value={element}>
            {element}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm">
        <input
          type="checkbox"
          name="owned"
          value="1"
          defaultChecked={defaultOwned}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        />
        Seulement cochés
      </label>
      <button type="submit" className="rounded-md border border-zinc-500 px-3 py-2 text-sm sm:col-span-2 lg:col-span-1">
        Appliquer
      </button>
      <Link
        href="/list"
        className="rounded-md border border-zinc-500 px-3 py-2 text-center text-sm sm:col-span-2 lg:col-span-1"
      >
        Réinitialiser
      </Link>
    </form>
  );
}
