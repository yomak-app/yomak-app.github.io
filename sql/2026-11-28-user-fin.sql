create table if not exists public.user_fin(
 user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
 data jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now());
alter table public.user_fin enable row level security;
drop policy if exists "uf own select" on public.user_fin;
create policy "uf own select" on public.user_fin for select to authenticated using (user_id = auth.uid());
drop policy if exists "uf own insert" on public.user_fin;
create policy "uf own insert" on public.user_fin for insert to authenticated with check (user_id = auth.uid() and pg_column_size(data) < 2000000);
drop policy if exists "uf own update" on public.user_fin;
create policy "uf own update" on public.user_fin for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and pg_column_size(data) < 2000000);
drop policy if exists "uf own delete" on public.user_fin;
create policy "uf own delete" on public.user_fin for delete to authenticated using (user_id = auth.uid());
