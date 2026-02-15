-- Apply minimal image link + price data for current seeded skylanders
-- Uses external image URLs only (no download/upload)

begin;

alter table public.skylanders
  add column if not exists figure_image_url text,
  add column if not exists card_image_url text;

with input(slug, figure_image_url, price_cents) as (
  values
    ('spyro', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/Spyro1-150x150.png', 100),
    ('trigger-happy', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/TriggerHappy2-150x150.png', 75),
    ('gill-grunt', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/GillGrunt-150x150.png', 25),
    ('stealth-elf', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/08/StealthElf-150x150.png', 100),
    ('terrafin', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/Terrafin-150x150.png', 100),
    ('ignitor', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/Ignitor-150x150.png', 200),
    ('whirlwind', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/Whirlwind2-150x150.png', 150),
    ('chop-chop', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/ChopChop1-150x150.png', 100),
    ('jet-vac', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/JetVac-150x150.png', 100),
    ('cynder', 'http://skylanderscharacterlist.com/wp-content/uploads/2014/02/Cynder-150x150.png', 150),
    ('tree-rex', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/TreeRex-150x150.png', 100),
    ('bouncer', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/Bouncer-150x150.png', 200),
    ('wash-buckler', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/02/WashBuckler-150x150.png', 100),
    ('blast-zone', 'http://skylanderscharacterlist.com/wp-content/uploads/2013/06/BlastZone-150x150.png', 100),
    ('snapshot', 'http://skylanderscharacterlist.com/wp-content/uploads/2014/04/SnapShot-150x150.png', 100),
    ('wildfire', 'http://skylanderscharacterlist.com/wp-content/uploads/2014/06/WildFire-150x150.png', 1700),
    ('spitfire', 'https://skylanderscharacterlist.com/wp-content/uploads/2015/06/SpitFire.png', 300),
    ('hot-streak', 'https://skylanderscharacterlist.com/wp-content/uploads/2015/06/HotStreak.png', 200),
    ('king-pen', 'http://skylanderscharacterlist.com/wp-content/uploads/2016/05/KingPen.png', 200),
    ('golden-queen', 'http://skylanderscharacterlist.com/wp-content/uploads/2016/06/GoldenQueenEdit.png', 200)
)
update public.skylanders s
set figure_image_url = i.figure_image_url
from input i
where s.slug = i.slug;

with input(slug, price_cents) as (
  values
    ('spyro', 100),
    ('trigger-happy', 75),
    ('gill-grunt', 25),
    ('stealth-elf', 100),
    ('terrafin', 100),
    ('ignitor', 200),
    ('whirlwind', 150),
    ('chop-chop', 100),
    ('jet-vac', 100),
    ('cynder', 150),
    ('tree-rex', 100),
    ('bouncer', 200),
    ('wash-buckler', 100),
    ('blast-zone', 100),
    ('snapshot', 100),
    ('wildfire', 1700),
    ('spitfire', 300),
    ('hot-streak', 200),
    ('king-pen', 200),
    ('golden-queen', 200)
)
insert into public.skylander_prices (skylander_id, source, currency, price_cents, observed_at)
select s.id, 'priceandimage_csv_v1', 'EUR', i.price_cents, now()
from input i
join public.skylanders s on s.slug = i.slug;

commit;
