-- Seed initial Skylanders catalog (MVP)
-- Safe to re-run (upsert by slug)

begin;

alter table public.skylanders
  add column if not exists figure_image_url text,
  add column if not exists card_image_url text;

insert into public.skylanders (slug, name, element, series, variant, figure_image_url, card_image_url)
values
  ('spyro', 'Spyro', 'Magic', 'Spyro''s Adventure', null, null, null),
  ('trigger-happy', 'Trigger Happy', 'Tech', 'Spyro''s Adventure', null, null, null),
  ('gill-grunt', 'Gill Grunt', 'Water', 'Spyro''s Adventure', null, null, null),
  ('stealth-elf', 'Stealth Elf', 'Life', 'Spyro''s Adventure', null, null, null),
  ('terrafin', 'Terrafin', 'Earth', 'Spyro''s Adventure', null, null, null),
  ('ignitor', 'Ignitor', 'Fire', 'Spyro''s Adventure', null, null, null),
  ('whirlwind', 'Whirlwind', 'Air', 'Spyro''s Adventure', null, null, null),
  ('chop-chop', 'Chop Chop', 'Undead', 'Spyro''s Adventure', null, null, null),
  ('jet-vac', 'Jet-Vac', 'Air', 'Giants', null, null, null),
  ('cynder', 'Cynder', 'Undead', 'Giants', null, null, null),
  ('tree-rex', 'Tree Rex', 'Life', 'Giants', 'Giant', null, null),
  ('bouncer', 'Bouncer', 'Tech', 'Giants', 'Giant', null, null),
  ('wash-buckler', 'Wash Buckler', 'Water', 'Swap Force', 'Swap Force', null, null),
  ('blast-zone', 'Blast Zone', 'Fire', 'Swap Force', 'Swap Force', null, null),
  ('snapshot', 'Snap Shot', 'Water', 'Trap Team', 'Trap Master', null, null),
  ('wildfire', 'Wildfire', 'Fire', 'Trap Team', 'Trap Master', null, null),
  ('spitfire', 'Spitfire', 'Fire', 'SuperChargers', 'SuperCharger', null, null),
  ('hot-streak', 'Hot Streak', 'Fire', 'SuperChargers', 'Vehicle', null, null),
  ('king-pen', 'King Pen', 'Water', 'Imaginators', 'Sensei', null, null),
  ('golden-queen', 'Golden Queen', 'Earth', 'Imaginators', 'Sensei', null, null)
on conflict (slug) do update
set
  name = excluded.name,
  element = excluded.element,
  series = excluded.series,
  variant = excluded.variant,
  figure_image_url = coalesce(excluded.figure_image_url, public.skylanders.figure_image_url),
  card_image_url = coalesce(excluded.card_image_url, public.skylanders.card_image_url);

commit;
