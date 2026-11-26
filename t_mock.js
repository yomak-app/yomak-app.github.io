(function(){
const ME="11111111-1111-4111-8111-111111111111",OT="22222222-2222-4222-8222-222222222222",C1="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",C2="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",G1="cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const now=Date.now(),iso=m=>new Date(now-m*60000).toISOString();
const DB=window.DB={dm_messages:[
 {id:1,chat_id:C1,user_id:OT,body:"السلام عليكم",created_at:iso(300),kind:"text"},
 {id:2,chat_id:C1,user_id:ME,body:"وعليكم السلام، شوف الرابط https://example.com/page?a=1",created_at:iso(200),kind:"text"},
 {id:3,chat_id:C1,user_id:OT,body:"تمام",created_at:iso(100),kind:"text",pinned_at:iso(50)},
 {id:4,chat_id:C1,user_id:ME,body:"رسالة قديمة للتعديل",created_at:iso(30),kind:"text",edited_at:iso(25),reply_to:"3"},
 {id:5,chat_id:C1,user_id:OT,body:"·",created_at:iso(20),kind:"text",unsent_at:iso(19)},
 {id:6,chat_id:C1,user_id:ME,body:"آخر رسالة مني",created_at:iso(5),kind:"text",forwarded:true},
 {id:7,chat_id:C2,user_id:OT,body:"أهلا أنا مش صاحبك",created_at:iso(10),kind:"text"}],
 dm_chats:[{id:C1,user_a:ME,user_b:OT},{id:C2,user_a:ME,user_b:"33333333-3333-4333-8333-333333333333"}],
 dm_reads:[{chat_id:C1,user_id:OT,last_read_id:6}],dm_reactions:[],message_hides:[],user_blocks:[],chat_prefs:[],friendships:[],
 messages:[{id:11,group_id:G1,user_id:OT,body:"رسالة جروب",created_at:iso(40),kind:"text"},{id:12,group_id:G1,user_id:ME,body:"ردي في الجروب",created_at:iso(10),kind:"text"}],
 group_msg_reactions:[],group_reads:[],profiles:[{id:ME,name:"عمر"},{id:OT,name:"أحمد"},{id:"33333333-3333-4333-8333-333333333333",name:"غريب"}],
 groups:[{id:G1,name:"جروب الاختبار",owner:ME,created_at:iso(999)}],group_members:[{group_id:G1,user_id:ME},{group_id:G1,user_id:OT}]};
let nid=100;
window.cs=()=>({uid:ME,access:"t",exp:Date.now()/1e3+9999,email:"o@x.com"});
function filt(rows,q){
  q.forEach((v,k)=>{if(["select","order","limit","on_conflict"].includes(k))return;
    let m;if(m=/^eq\.(.*)$/.exec(v))rows=rows.filter(r=>String(r[k])===m[1]);
    else if(m=/^lt\.(.*)$/.exec(v))rows=rows.filter(r=>Number(r[k])<Number(m[1]));
    else if(m=/^in\.\((.*)\)$/.exec(v)){const s=m[1].split(",");rows=rows.filter(r=>s.includes(String(r[k])))}});
  return rows;
}
window.sb=async function(path,o){
  o=o||{};const u=new URL("http://x"+path),p=u.pathname,q=u.searchParams,meth=o.method||"GET";window.CALLS=(window.CALLS||[]);CALLS.push(meth+" "+path.slice(0,90));
  let m=/^\/rest\/v1\/rpc\/(\w+)/.exec(p);
  if(m){const b=o.body||{},fn=m[1];
    if(fn==="msg_unsend"){const t=DB[b.k==="d"?"dm_messages":"messages"].find(x=>x.id===b.mid&&x.user_id===ME);if(t){t.unsent_at=new Date().toISOString();t.body="·";t.pinned_at=null}}
    if(fn==="msg_pin"){const t=DB[b.k==="d"?"dm_messages":"messages"].find(x=>x.id===b.mid);if(t)t.pinned_at=b.flag?new Date().toISOString():null}
    if(fn==="msg_edit"){const t=DB[b.k==="d"?"dm_messages":"messages"].find(x=>x.id===b.mid);if(Date.now()-new Date(t.created_at)>9e5)throw {message:"edit window closed"};t.body=b.txt;t.edited_at=new Date().toISOString()}
    if(fn==="dm_set_disappear"){const c=DB.dm_chats.find(x=>x.id===b.chat);c.disappear_secs=b.secs;DB.dm_messages.push({id:nid++,chat_id:b.chat,user_id:ME,body:"disappear:"+(b.secs||0),kind:"system",created_at:new Date().toISOString()})}
    return null}
  const t=p.replace("/rest/v1/","");if(!DB[t])return [];
  let rows=DB[t];
  if(meth==="GET"){rows=filt(rows.slice(),q);
    if(q.get("order")==="id.desc")rows.sort((a,b)=>b.id-a.id);
    const l=Number(q.get("limit"));if(l)rows=rows.slice(0,l);return JSON.parse(JSON.stringify(rows))}
  if(meth==="POST"){const b=Object.assign({user_id:ME,created_at:new Date().toISOString()},o.body);
    if(t==="dm_messages"||t==="messages"){b.id=nid++;
      if(t==="dm_messages"&&DB.user_blocks.some(x=>true)&&false)throw {message:"rls"}}
    const key=q.get("on_conflict");
    if(key){const ks=key.split(",");const ex=rows.find(r=>ks.every(k=>String(r[k]??ME)===String(b[k]??ME)));if(ex){Object.assign(ex,o.body);return[ex]}}
    rows.push(b);return[b]}
  if(meth==="DELETE"){const f=filt(rows.slice(),q);DB[t]=rows.filter(r=>!f.includes(r));return f}
  if(meth==="PATCH"){const f=filt(rows.slice(),q);f.forEach(r=>Object.assign(r,o.body));return f}
  return [];
};
window.ME=ME;window.OT=OT;window.C1=C1;window.C2=C2;window.G1=G1;
})();
