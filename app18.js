/* Item 1: fast start. No 4-step setup. Country comes from the phone timezone,
   the first city of the region is used, and the name defaults to a guest name.
   The user can still change place/name later (tap the location, or Profile). */
(function(){
  try{
    if(typeof d==="undefined"||(d.name&&d.city))return;
    var tz="";try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(e){}
    var c=/Riyadh|Kuwait|Qatar|Bahrain|Dubai|Muscat|Aden/.test(tz)?"SA":"EG";
    var g=(typeof GEO!=="undefined"&&GEO[c])||null;
    if(!g)return;
    var r=Object.keys(g)[0],ct=(g[r]||[])[0];
    if(!r||!ct)return;
    d.country=c;d.region=r;d.city=ct;d.name=d.name||"ضيف";d.auto=true;
    if(typeof save==="function")save();
    if(typeof showApp==="function"&&document.getElementById("app"))showApp();
  }catch(e){console.warn("fast-start",e)}
})();
