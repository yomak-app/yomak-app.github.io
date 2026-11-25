// Pi edition: inside Pi Browser the only way in is Pi sign-in (Pi Mainnet listing rule). Outside Pi Browser nothing changes.
(function(){
  if(!/PiBrowser/i.test(navigator.userAgent||""))return;
  document.documentElement.classList.add("pi-only");
  var st=document.createElement("style");
  st.textContent='html.pi-only label[for=aName],html.pi-only #aName,html.pi-only label[for=aMail],html.pi-only #aMail,html.pi-only label[for=aPass],html.pi-only #aPass,html.pi-only button[onclick^="doAuth"],html.pi-only button[onclick^="gateMode"],html.pi-only button[onclick^="authModal"],html.pi-only .chips:has(button[onclick^="authModal"]),html.pi-only .gbox>p.muted:last-child{display:none!important}html.pi-only a[href*="wa.me"],html.pi-only a.fb-wa{display:none!important}';
  document.head.appendChild(st);
  window.oauthBtns=function(){return'<div class="oauth"><button class="primary" type="button" onclick="piLogin()">🟣 المتابعة بحساب Pi</button></div>'};
  var _wo=window.open;window.open=function(u){if(/wa\.me|whatsapp\.com/i.test(String(u||"")))return null;return _wo.apply(window,arguments)};
  window.oauthStart=function(){msg("الدخول داخل Pi Browser يتم بحساب Pi فقط")};
})();
