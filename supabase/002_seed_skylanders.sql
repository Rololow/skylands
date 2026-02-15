-- Seed initial Skylanders catalog (MVP)
-- Safe to re-run (upsert by slug)

begin;

insert into public.skylanders (slug, name, element, series, variant)
values
  ('spyro', 'Spyro', 'Magic', 'Spyro''s Adventure', null),
  ('trigger-happy', 'Trigger Happy', 'Tech', 'Spyro''s Adventure', null),
  ('gill-grunt', 'Gill Grunt', 'Water', 'Spyro''s Adventure', null),
  ('stealth-elf', 'Stealth Elf', 'Life', 'Spyro''s Adventure', null),
  ('terrafin', 'Terrafin', 'Earth', 'Spyro''s Adventure', null),
  ('ignitor', 'Ignitor', 'Fire', 'Spyro''s Adventure', null),
  ('whirlwind', 'Whirlwind', 'Air', 'Spyro''s Adventure', null),
  ('chop-chop', 'Chop Chop', 'Undead', 'Spyro''s Adventure', null),
  ('jet-vac', 'Jet-Vac', 'Air', 'Giants', null),
  ('cynder', 'Cynder', 'Undead', 'Giants', null),
  ('tree-rex', 'Tree Rex', 'Life', 'Giants', 'Giant'),
  ('bouncer', 'Bouncer', 'Tech', 'Giants', 'Giant'),
  ('wash-buckler', 'Wash Buckler', 'Water', 'Swap Force', 'Swap Force'),
  ('blast-zone', 'Blast Zone', 'Fire', 'Swap Force', 'Swap Force'),
  ('snapshot', 'Snap Shot', 'Water', 'Trap Team', 'Trap Master'),
  ('wildfire', 'Wildfire', 'Fire', 'Trap Team', 'Trap Master'),
  ('spitfire', 'Spitfire', 'Fire', 'SuperChargers', 'SuperCharger'),
  ('hot-streak', 'Hot Streak', 'Fire', 'SuperChargers', 'Vehicle'),
  ('king-pen', 'King Pen', 'Water', 'Imaginators', 'Sensei'),
  ('golden-queen', 'Golden Queen', 'Earth', 'Imaginators', 'Sensei')
on conflict (slug) do update
set
  name = excluded.name,
  element = excluded.element,
  series = excluded.series,
  variant = excluded.variant;

commit;
