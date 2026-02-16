-- Add item_type column to skylanders table
-- This differentiates between figure, card, and object types

alter table public.skylanders
add column if not exists item_type text;

-- Create index for better query performance
create index if not exists idx_skylanders_item_type on public.skylanders (item_type);

-- Set default values based on existing data
-- Most items are figures by default
update public.skylanders
set item_type = 'figure'
where item_type is null;

comment on column public.skylanders.item_type is 'Type of item: figure, card, object, etc.';
