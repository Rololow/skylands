import Image from "next/image";

type Skylander = {
  id: number;
  name: string;
  series: string | null;
  element: string | null;
  item_type: string | null;
  variant: string | null;
  figure_image_url: string | null;
};

type GroupedSkylandersGridProps = {
  skylanders: Skylander[];
  ownedIds: Set<number>;
  toggleAction: (formData: FormData) => Promise<void>;
};

type GroupedData = {
  series: string;
  categories: {
    category: string;
    elements: {
      element: string;
      items: Skylander[];
    }[];
  }[];
};

function determineCategory(skylander: Skylander): string {
  const variant = skylander.variant?.toLowerCase() || "";
  const itemType = skylander.item_type?.toLowerCase() || "";
  
  // Giant Skylanders
  if (variant.includes("giant") || itemType.includes("giant")) {
    return "Giant Skylanders";
  }
  
  // LightCore
  if (variant.includes("lightcore") || itemType.includes("lightcore")) {
    return "LightCore Skylanders";
  }
  
  // Series 2
  if (variant.includes("series 2") || variant.includes("series2")) {
    return "Returning (Series 2) Skylanders";
  }
  
  // Series 1
  if (variant.includes("series 1") || variant.includes("series1")) {
    return "New (Series 1) Skylanders";
  }
  
  // Magic Items
  if (itemType.includes("objet") || itemType.includes("object") || itemType.includes("magic item")) {
    return "Magic Items";
  }
  
  // Chase Variants (metallic, glow, flocked, etc.)
  if (variant.includes("metallic") || variant.includes("glow") || variant.includes("flocked") || 
      variant.includes("sparkle") || variant.includes("stone") || variant.includes("pumpkin") ||
      variant.includes("e3") || variant.includes("employee")) {
    return "Chase Variants";
  }
  
  // In-Game Variants (legendary, jade, granite, etc.)
  if (variant.includes("legendary") || variant.includes("jade") || variant.includes("granite") ||
      variant.includes("molten") || variant.includes("polar") || variant.includes("punch") ||
      variant.includes("royal") || variant.includes("scarlet") || variant.includes("gnarly") ||
      variant.includes("sidekick")) {
    return "In-Game Variants";
  }
  
  // Cards
  if (itemType.includes("carte") || itemType.includes("card")) {
    return "Cartes";
  }
  
  // Default to Figurines
  return "Figurines";
}

export default function GroupedSkylandersGrid({ 
  skylanders, 
  ownedIds, 
  toggleAction 
}: GroupedSkylandersGridProps) {
  // Group by series -> category -> element
  const grouped = new Map<string, Map<string, Map<string, Skylander[]>>>();

  skylanders.forEach((skylander) => {
    const series = skylander.series || "Non classé";
    const category = determineCategory(skylander);
    const element = skylander.element || "Autre";

    if (!grouped.has(series)) {
      grouped.set(series, new Map());
    }
    const seriesGroup = grouped.get(series)!;

    if (!seriesGroup.has(category)) {
      seriesGroup.set(category, new Map());
    }
    const categoryGroup = seriesGroup.get(category)!;

    if (!categoryGroup.has(element)) {
      categoryGroup.set(element, []);
    }
    categoryGroup.get(element)!.push(skylander);
  });

  // Convert to array format for rendering
  const groupedData: GroupedData[] = [];
  grouped.forEach((seriesGroup, series) => {
    const categories: GroupedData['categories'] = [];
    seriesGroup.forEach((categoryGroup, category) => {
      const elements: GroupedData['categories'][0]['elements'] = [];
      categoryGroup.forEach((items, element) => {
        elements.push({ element, items });
      });
      // Sort elements alphabetically
      elements.sort((a, b) => a.element.localeCompare(b.element));
      categories.push({ category, elements });
    });
    
    // Sort categories in specific order
    const categoryOrder = [
      'Giant Skylanders',
      'New (Series 1) Skylanders',
      'Returning (Series 2) Skylanders',
      'LightCore Skylanders',
      'Figurines',
      'Magic Items',
      'Cartes',
      'In-Game Variants',
      'Chase Variants'
    ];
    categories.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.category.localeCompare(b.category);
    });
    
    groupedData.push({ series, categories });
  });

  // Sort series/games in chronological order
  const seriesOrder = [
    "Spyro's Adventure",
    'Spyro\'s Adventure',
    'Giants',
    'Swap Force',
    'Trap Team',
    'SuperChargers',
    'Imaginators'
  ];
  groupedData.sort((a, b) => {
    const aIndex = seriesOrder.indexOf(a.series);
    const bIndex = seriesOrder.indexOf(b.series);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.series.localeCompare(b.series);
  });

  if (groupedData.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {groupedData.map((seriesGroup) => (
        <div key={seriesGroup.series} className="flex flex-col gap-4">
          <h2 className="text-xl font-bold border-b border-zinc-700 pb-2">{seriesGroup.series}</h2>
          
          {seriesGroup.categories.map((categoryGroup) => (
            <div key={categoryGroup.category} className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-zinc-400 pl-2">{categoryGroup.category}</h3>
              
              {categoryGroup.elements.map((elementGroup) => (
                <div key={elementGroup.element} className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-zinc-500 pl-4">{elementGroup.element}</h4>
                  
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pl-4">
                    {elementGroup.items.map((skylander) => {
                      const isOwned = ownedIds.has(skylander.id);

                      return (
                        <li key={skylander.id}>
                          <form action={toggleAction}>
                            <input type="hidden" name="skylanderId" value={skylander.id} />
                            <input type="hidden" name="isOwned" value={String(isOwned)} />
                            <button
                              type="submit"
                              className={`relative flex aspect-square w-full flex-col overflow-hidden rounded-md border text-left ${
                                isOwned ? "border-emerald-500" : "border-zinc-700"
                              }`}
                            >
                              <span
                                className="relative h-full w-full bg-gradient-to-b from-zinc-900 to-zinc-950 p-2"
                                style={{
                                  backgroundImage:
                                    "linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%, rgba(255,255,255,0.04)), linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%, rgba(255,255,255,0.04))",
                                  backgroundPosition: "0 0, 8px 8px",
                                  backgroundSize: "16px 16px",
                                }}
                              >
                                <Image
                                  src={skylander.figure_image_url || "https://placehold.co/300x300?text=No+Image"}
                                  alt={skylander.name}
                                  fill
                                  className="object-contain p-2"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                />
                              </span>
                              <span className="absolute right-2 top-2 rounded bg-black/80 px-1.5 py-0.5 text-xs">
                                {isOwned ? "✓" : "○"}
                              </span>
                              <span className="absolute inset-x-0 bottom-0 bg-black/80 px-2 py-1 text-xs font-medium text-white">
                                {skylander.name}
                              </span>
                            </button>
                          </form>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
