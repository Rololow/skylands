import fs from "node:fs";
import path from "node:path";

const workspaceRoot = process.cwd();
const csvPath = path.join(workspaceRoot, "priceandimage.csv");
const outputPath = path.join(workspaceRoot, "supabase", "006_apply_priceandimage_full.sql");

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const next = line[index + 1];
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePriceToCents(input) {
  const raw = String(input ?? "").trim();
  if (!raw) {
    return null;
  }

  const normalized = raw
    .replace(/\$/g, "")
    .replace(/[\u00A0\u202F\s]/g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.\-]/g, "");

  if (!normalized || normalized === ".") {
    return null;
  }

  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.round(value * 100);
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function maybeSqlString(value) {
  const normalized = String(value ?? "").trim();
  return normalized ? sqlString(normalized) : "null";
}

if (!fs.existsSync(csvPath)) {
  throw new Error(`CSV introuvable: ${csvPath}`);
}

const csv = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);

if (lines.length < 2) {
  throw new Error("CSV vide ou incomplet");
}

const slugCounts = new Map();
const rows = [];

for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
  const parsed = parseCsvLine(lines[lineIndex]);
  const imageUrl = String(parsed[0] ?? "").trim();
  const name = String(parsed[1] ?? "").trim();
  const priceRaw = String(parsed[2] ?? "").trim();

  if (!name) {
    continue;
  }

  const baseSlug = slugify(name) || `item-${lineIndex}`;
  const count = (slugCounts.get(baseSlug) ?? 0) + 1;
  slugCounts.set(baseSlug, count);
  const slug = count === 1 ? baseSlug : `${baseSlug}-${count}`;

  rows.push({
    slug,
    name,
    imageUrl,
    priceCents: parsePriceToCents(priceRaw),
  });
}

const skylanderValuesSql = rows
  .map((row) => `  (${sqlString(row.slug)}, ${sqlString(row.name)}, ${maybeSqlString(row.imageUrl)})`)
  .join(",\n");

const priceRows = rows.filter((row) => Number.isInteger(row.priceCents) && row.priceCents >= 0);
const priceValuesSql = priceRows
  .map((row) => `  (${sqlString(row.slug)}, ${row.priceCents})`)
  .join(",\n");

const sql = `-- Full CSV import: name + image link + price\n-- Generated from priceandimage.csv\n\nbegin;\n\nalter table public.skylanders\n  add column if not exists figure_image_url text,\n  add column if not exists card_image_url text;\n\ninsert into public.skylanders (slug, name, figure_image_url)\nvalues\n${skylanderValuesSql}\non conflict (slug) do update\nset\n  name = excluded.name,\n  figure_image_url = coalesce(nullif(excluded.figure_image_url, ''), public.skylanders.figure_image_url);\n\ndelete from public.skylander_prices\nwhere source = 'priceandimage_csv_full_v1';\n\ninsert into public.skylander_prices (skylander_id, source, currency, price_cents, observed_at)\nselect s.id, 'priceandimage_csv_full_v1', 'EUR', v.price_cents, now()\nfrom (\nvalues\n${priceValuesSql}\n) as v(slug, price_cents)\njoin public.skylanders s on s.slug = v.slug;\n\ncommit;\n`;

fs.writeFileSync(outputPath, sql, "utf8");
console.log(`Generated: ${outputPath}`);
console.log(`Rows: ${rows.length}, prices: ${priceRows.length}`);
