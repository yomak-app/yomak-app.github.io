-- Incoming call: in-app notification (existing) + phone push (new). Additive: replaces the function body only.
create or replace function trg_n_call() returns trigger language plpgsql security definer set search_path=public,extensions as $$
declare nm text; u text; s text;
begin
 if new.kind='offer' and coalesce(new.payload->>'restart','')<>'true' then
  perform notify_user(new.to_uid,new.from_uid,'call',new.call_id::text,'📞 مكالمة واردة');
  begin
   select name into nm from profiles where id=new.from_uid;
   select value into u from push_config where key='url';
   select value into s from push_config where key='secret';
   perform net.http_post(url:=u,headers:=jsonb_build_object('Content-Type','application/json','x-push-secret',s),
    body:=jsonb_build_object('mode','notify','user_id',new.to_uid,'title','📞 مكالمة واردة','body',coalesce(nm,'')||' بيتصل بيك، افتح يومك للرد','tag','call'));
  exception when others then null; end;
 end if; return null; end $$;
