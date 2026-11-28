-- v83: admin read of group messages only when reported; hide-post; server-side log of admin deletes. Additive.
drop policy if exists "msgs admin read" on public.messages;
create policy "msgs admin read" on public.messages for select using (public.is_admin() and exists (select 1 from public.reports r where r.kind='message' and r.target = messages.id::text));

alter table public.posts drop constraint if exists posts_status_check;
alter table public.posts add constraint posts_status_check check (status = any (array['published','pending','hidden']));

create or replace function public.admin_hide_post(pid uuid, hide boolean) returns void
language plpgsql security definer set search_path = public as $$
declare o uuid;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update public.posts set status = case when hide then 'hidden' else 'published' end where id = pid returning user_id into o;
  if not found then raise exception 'not found'; end if;
  insert into public.admin_log(admin, action, target_user, details) values (auth.uid(), case when hide then 'hide_post' else 'unhide_post' end, o, left(pid::text,40));
end $$;
revoke all on function public.admin_hide_post(uuid, boolean) from public, anon;
grant execute on function public.admin_hide_post(uuid, boolean) to authenticated;

create or replace function public.trg_admin_delete_log() returns trigger
language plpgsql security definer set search_path = public as $$
declare j jsonb := to_jsonb(old); o uuid;
begin
  if auth.uid() is not null and public.is_admin() then
    begin o := coalesce(j->>'user_id', j->>'author', j->>'owner', j->>'requester')::uuid; exception when others then o := null; end;
    if o is distinct from auth.uid() then
      insert into public.admin_log(admin, action, target_user, details) values (auth.uid(), 'sys_delete', o, left(tg_table_name||': '||coalesce(j->>'title', j->>'name', j->>'body', j->>'id',''),300));
    end if;
  end if;
  return old;
end $$;
revoke all on function public.trg_admin_delete_log() from public, anon, authenticated;

do $$ declare t text; begin
  foreach t in array array['posts','post_comments','service_posts','market_listings','reels','reel_comments','stories','groups','pages','page_posts','job_posts','offices','office_reviews','properties','messages'] loop
    if to_regclass('public.'||t) is not null then
      execute format('drop trigger if exists admin_del_log on public.%I', t);
      execute format('create trigger admin_del_log after delete on public.%I for each row execute function public.trg_admin_delete_log()', t);
    end if;
  end loop; end $$;
