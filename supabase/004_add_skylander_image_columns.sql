-- Add figure/card image columns for existing projects

begin;

alter table public.skylanders
  add column if not exists figure_image_url text,
  add column if not exists card_image_url text;

update public.skylanders
set figure_image_url = coalesce(figure_image_url, image_url)
where image_url is not null;

commit;
