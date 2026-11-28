-- v75: blocks apply everywhere (posts, comments, stories, reels, group messages, calls); report users/stories. Additive: new functions + restrictive policies only.
create or replace function public.block_pair(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_blocks where (blocker = a and blocked = b) or (blocker = b and blocked = a)) $$;
revoke all on function public.block_pair(uuid, uuid) from public;
grant execute on function public.block_pair(uuid, uuid) to authenticated;

drop policy if exists "no blocked content" on public.service_posts;
create policy "no blocked content" on public.service_posts as restrictive for select to authenticated using (not public.block_pair(auth.uid(), user_id));
drop policy if exists "no blocked content" on public.post_comments;
create policy "no blocked content" on public.post_comments as restrictive for select to authenticated using (not public.block_pair(auth.uid(), user_id));
drop policy if exists "no blocked content" on public.stories;
create policy "no blocked content" on public.stories as restrictive for select to authenticated using (not public.block_pair(auth.uid(), user_id));
drop policy if exists "no blocked content" on public.reels;
create policy "no blocked content" on public.reels as restrictive for select to authenticated using (not public.block_pair(auth.uid(), user_id));
drop policy if exists "no blocked content" on public.messages;
create policy "no blocked content" on public.messages as restrictive for select to authenticated using (not public.block_pair(auth.uid(), user_id));

drop policy if exists "no call when blocked" on public.call_signals;
create policy "no call when blocked" on public.call_signals as restrictive for insert to authenticated with check (not public.block_pair(auth.uid(), to_uid));

alter table public.reports drop constraint if exists reports_kind_check;
alter table public.reports add constraint reports_kind_check check (kind in ('post','message','dm','group','service','office','property','review','comment','page','page_post','market','reel','job','user','story'));
