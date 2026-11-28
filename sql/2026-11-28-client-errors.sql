create table if not exists public.client_errors(
 id bigserial primary key, at timestamptz not null default now(), uid uuid default auth.uid(),
 kind text not null default 'error', msg text, src text, stack text, page text, build text, ua text, ms integer);
alter table public.client_errors enable row level security;
drop policy if exists "ce insert" on public.client_errors;
create policy "ce insert" on public.client_errors for insert to anon, authenticated
 with check (kind in ('error','promise','perf','slow') and length(coalesce(msg,''))<=400 and length(coalesce(stack,''))<=1500 and (uid is null or uid=auth.uid()));
drop policy if exists "ce admin read" on public.client_errors;
create policy "ce admin read" on public.client_errors for select to authenticated using (is_admin());
drop policy if exists "ce admin delete" on public.client_errors;
create policy "ce admin delete" on public.client_errors for delete to authenticated using (is_admin());
create index if not exists client_errors_at on public.client_errors(at desc);
