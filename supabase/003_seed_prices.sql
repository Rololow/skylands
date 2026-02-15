-- Seed initial prices in EUR cents (MVP)
-- Safe to re-run: removes previous seed_v1 rows and re-inserts

begin;

delete from public.skylander_prices
where source = 'seed_v1';

insert into public.skylander_prices (skylander_id, source, currency, price_cents, observed_at)
select s.id, 'seed_v1', 'EUR', p.price_cents, now()
from public.skylanders s
join (
  values
    ('spyro', 899),
    ('trigger-happy', 999),
    ('gill-grunt', 899),
    ('stealth-elf', 1099),
    ('terrafin', 1199),
    ('ignitor', 999),
    ('whirlwind', 1099),
    ('chop-chop', 1299),
    ('jet-vac', 799),
    ('cynder', 999),
    ('tree-rex', 1999),
    ('bouncer', 2199),
    ('wash-buckler', 1499),
    ('blast-zone', 1499),
    ('snapshot', 1799),
    ('wildfire', 1899),
    ('spitfire', 1699),
    ('hot-streak', 1299),
    ('king-pen', 1599),
    ('golden-queen', 1699)
) as p(slug, price_cents)
  on p.slug = s.slug;

commit;
