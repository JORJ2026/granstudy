/* Gran's Study Time — launch layer: settings, progress, offline, data tools, diagnostics.
   Loaded after hub.js; wraps show/goHome/applyFrame from it. */
(function(){
"use strict";
var VER=window.GST_VERSION||"1.0.0",BUILD=window.GST_BUILD||"";
var $=function(s){return document.querySelector(s)};
var APPNAMES={math:"Math Tutor",words:"Practice",river:"Elk River Bandit"};
var errors=[];

/* ---------- safe storage ---------- */
var mem={},storeOK=true;
function lget(k){try{var v=localStorage.getItem(k);return v===null?(k in mem?mem[k]:null):v}catch(e){return k in mem?mem[k]:null}}
function lset(k,v){mem[k]=v;try{localStorage.setItem(k,v)}catch(e){}}
try{localStorage.setItem("gst_t","1");localStorage.removeItem("gst_t")}catch(e){storeOK=false;var w=$("#storewarn");if(w)w.hidden=false}
function jget(k,d){try{var v=JSON.parse(lget(k));return v&&typeof v==="object"?v:d}catch(e){return d}}

/* ---------- settings ---------- */
var DEF={name:"",mute:false,theme:"auto",text:100,motion:"auto",goal:15,brk:0,wake:false,welcomed:false};
var set=Object.assign({},DEF,jget("gst_settings",{}));
function saveSet(){lset("gst_settings",JSON.stringify(set))}

/* ---------- toasts ---------- */
function toast(msg,btn,fn,ms){
  var t=document.createElement("div");t.className="toast";var s=document.createElement("span");s.textContent=msg;t.appendChild(s);
  if(btn){var b=document.createElement("button");b.textContent=btn;b.onclick=function(){t.remove();fn&&fn()};t.appendChild(b)}
  $("#toasts").appendChild(t);setTimeout(function(){t.remove()},ms||(btn?12000:4000));return t}
function confirmDlg(title,txt,cb){
  var d=$("#dlgConfirm");$("#tConf").textContent=title;$("#confTxt").textContent=txt;
  d.onclose=function(){if(d.returnValue==="yes")cb()};d.returnValue="";d.showModal()}

/* ---------- date + stats ---------- */
function day(d){d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
var stats=jget("gst_stats",{d:{},last:"",g:""});if(!stats.d)stats.d={};
function saveStats(){
  var keys=Object.keys(stats.d).sort();while(keys.length>400)delete stats.d[keys.shift()];
  lset("gst_stats",JSON.stringify(stats))}
function secOf(dk){var o=stats.d[dk];return o?(o.math||0)+(o.words||0)+(o.river||0):0}
function streak(){var n=0,d=new Date();if(secOf(day(d))<60)d.setDate(d.getDate()-1);
  while(secOf(day(d))>=60){n++;d.setDate(d.getDate()-1)}return n}
function bestStreak(){var ks=Object.keys(stats.d).filter(function(k){return secOf(k)>=60}).sort(),best=0,cur=0,prev=null;
  ks.forEach(function(k){var t=new Date(k+"T12:00:00");if(prev&&Math.round((t-prev)/864e5)===1)cur++;else cur=1;if(cur>best)best=cur;prev=t});return best}

/* ---------- home UI ---------- */
function greet(){
  var h=new Date().getHours(),g=h<5?"Up late":h<12?"Good morning":h<18?"Good afternoon":"Good evening";
  $("#greet").textContent=g+(set.name?", "+set.name:"")+"!"}
function renderHome(){
  greet();var m=Math.floor(secOf(day())/60);
  $("#streakn").textContent=streak();$("#todayn").textContent=m;
  var ring=$("#ring");ring.classList.toggle("off",!set.goal);
  if(set.goal){var p=Math.min(1,secOf(day())/(set.goal*60));$("#rfg").style.strokeDashoffset=113.1*(1-p);
    $("#rtxt").textContent=p>=1?"✓":Math.round(p*100)+"%";ring.setAttribute("aria-label","Daily goal: "+m+" of "+set.goal+" minutes")}
  var c=$("#cont");if(stats.last&&APPNAMES[stats.last]){c.hidden=false;c.textContent="▶️ Continue: "+APPNAMES[stats.last]}else c.hidden=true;
  $("#ver").textContent="v"+VER}
$("#cont").onclick=function(){if(stats.last)show(stats.last)};

/* ---------- prefs applied to frames + hub ---------- */
function applyHub(){
  var r=document.documentElement;
  if(set.theme==="auto")r.removeAttribute("data-theme");else r.setAttribute("data-theme",set.theme);
  r.style.fontSize=set.text+"%";
  document.body.classList.toggle("reduce",set.motion==="on");
  var rm=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
  if(set.motion==="off")document.body.classList.remove("reduce");else if(set.motion==="auto"&&rm)document.body.classList.add("reduce");
  var tc=document.querySelector('meta[name=theme-color]');if(tc)tc.content=(set.theme==="dark"||(set.theme==="auto"&&matchMedia("(prefers-color-scheme:dark)").matches))?"#0c1d33":"#bfe9ff"}
var riverForced=false;
function applyPrefs(f,key){
  if(!f)return;var w,d;try{w=f.contentWindow;d=f.contentDocument}catch(e){return}
  if(!w||!d||!d.documentElement)return;
  try{
    var r=d.documentElement;
    if(set.theme==="auto")r.removeAttribute("data-theme");else r.setAttribute("data-theme",set.theme);
    var isRiver=(key==="river")||f===frames.river;
    if(!isRiver){r.style.zoom=set.text===100?"":String(set.text/100)}
    var st=d.getElementById("gst-motion");
    var wantMotion=set.motion==="on"||(set.motion==="auto"&&w.matchMedia&&w.matchMedia("(prefers-reduced-motion:reduce)").matches);
    if(wantMotion&&!st&&d.head){st=d.createElement("style");st.id="gst-motion";st.textContent="*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}";d.head.appendChild(st)}
    if(!wantMotion&&st)st.remove();
    if(w.QUACK&&!w.__gQ){w.__gQ=w.QUACK;w.__gW=w.WOMP}
    if(w.__gQ){if(set.mute){w.QUACK=function(){};w.WOMP=function(){}}else{w.QUACK=w.__gQ;w.WOMP=w.__gW}}
    if(isRiver&&w.erbAudio){if(set.mute){w.erbAudio.mute(true);riverForced=true}else if(riverForced){w.erbAudio.mute(false);riverForced=false}}
  }catch(e){}
}
function applyAll(){applyHub();for(var k in frames)applyPrefs(frames[k],k);syncRiverMute();renderHome()}
function syncRiverMute(){
  /* The Bandit reads its own mute flag when it starts */
  if(set.mute){if(lget("erb_muted")!=="1"){lset("gst_rmute","1");lset("erb_muted","1")}}
  else if(lget("gst_rmute")==="1"){lset("erb_muted","0");lset("gst_rmute","0")}}

var _apply=applyFrame;
applyFrame=function(f){_apply(f);applyPrefs(f);hookErrors(f)};

/* ---------- error capture ---------- */
function logErr(src,msg){errors.push(new Date().toISOString().slice(11,19)+" ["+src+"] "+String(msg).slice(0,200));if(errors.length>20)errors.shift()}
window.addEventListener("error",function(e){logErr("hub",e.message)});
window.addEventListener("unhandledrejection",function(e){logErr("hub",e.reason&&e.reason.message||e.reason)});
function hookErrors(f){try{var w=f.contentWindow;if(!w||w.__gErr)return;w.__gErr=1;
  w.addEventListener("error",function(e){logErr(f.title||"app",e.message)});
  w.addEventListener("unhandledrejection",function(e){logErr(f.title||"app",e.reason&&e.reason.message||e.reason)})}catch(e){}}

/* ---------- navigation: loading overlay, history, deep links ---------- */
var _show=show,_home=goHome,loadT=null,loadingKey=null;
function setLoading(on,k){
  var L=$("#loading");L.hidden=!on;clearTimeout(loadT);$("#loaderr").hidden=true;loadingKey=on?k:null;
  if(on){$("#loadmsg").textContent="Loading "+APPNAMES[k]+"…";loadT=setTimeout(function(){$("#loaderr").hidden=false},12000)}}
$("#retry").onclick=function(){var k=loadingKey;if(!k)return;setLoading(false);if(frames[k]){frames[k].remove();delete frames[k]}go(k)};
$("#loadhome").onclick=function(){setLoading(false);toHome()};
function go(k){
  var first=!frames[k];_show(k);
  if(first&&frames[k]){var f=frames[k];setLoading(true,k);
    f.addEventListener("load",function(){if(loadingKey===k)setLoading(false);applyPrefs(f,k)},{once:true})}
  afterShow(k)}
function afterShow(k){
  stats.last=k;saveStats();sinceTick=0;document.title=APPNAMES[k]+" – Study Time";
  updateRotate();updateWake();renderHome()}
function afterHome(){setLoading(false);document.title="Gran’s Study Time";updateRotate();updateWake();renderHome()}
show=function(k){
  if(!APPNAMES[k])return;
  try{if(!(history.state&&history.state.a===k))history.pushState({a:k},"","#"+k)}catch(e){}
  go(k)};
function toHome(){
  if(history.state&&history.state.a){try{history.back();return}catch(e){}}
  _home();afterHome()}
goHome=function(){toHome()};
$("#hb").onclick=toHome;
window.addEventListener("popstate",function(){
  var a=history.state&&history.state.a;
  if(a&&APPNAMES[a])go(a);else{_home();afterHome()}});
window.addEventListener("hashchange",function(){var h=location.hash.replace("#","");if(APPNAMES[h]&&active!==h){try{history.pushState({a:h},"","#"+h)}catch(e){}go(h)}});
(function initRoute(){
  var h=location.hash.replace("#","");
  try{history.replaceState({},"",location.pathname+location.search)}catch(e){}
  if(APPNAMES[h]){try{history.pushState({a:h},"","#"+h)}catch(e){}go(h)}})();

/* ---------- time tracking, goal, breaks ---------- */
var sinceTick=0,sinceBreak=0;
setInterval(function(){
  if(document.hidden||active===null||!APPNAMES[active])return;
  var dk=day();stats.d[dk]=stats.d[dk]||{};stats.d[dk][active]=(stats.d[dk][active]||0)+5;
  sinceBreak+=5;
  if(set.goal&&stats.g!==dk&&secOf(dk)>=set.goal*60){stats.g=dk;
    toast("🎉 Daily goal reached — great job"+(set.name?", "+set.name:"")+"!");if(!set.mute&&window.QUACK)QUACK(3)}
  if(set.brk&&sinceBreak>=set.brk*60){sinceBreak=0;toast("🧘 Time for a stretch and a sip of water!","OK")}
  sinceTick+=5;if(sinceTick>=15){sinceTick=0;saveStats()}
},5000);
document.addEventListener("visibilitychange",function(){
  if(document.hidden){saveStats();try{speechSynthesis.cancel()}catch(e){}pauseMusic(true);releaseWake()}
  else{pauseMusic(false);updateWake();renderHome()}});
window.addEventListener("pagehide",saveStats);
var paused=false;
function pauseMusic(p){var f=frames.river;if(!f)return;try{var a=f.contentWindow.erbAudio;if(!a)return;
  if(p)paused=a.pauseMusic();else if(paused){paused=false;a.resume()}}catch(e){}}

/* ---------- wake lock, rotate hint, fullscreen ---------- */
var wl=null;
function releaseWake(){try{wl&&wl.release();}catch(e){}wl=null}
function updateWake(){
  if(!set.wake||active===null||document.hidden||!navigator.wakeLock){if(active===null||!set.wake)releaseWake();return}
  if(wl)return;navigator.wakeLock.request("screen").then(function(l){wl=l;l.addEventListener("release",function(){wl=null})}).catch(function(){})}
function updateRotate(){
  var show=active==="river"&&mobile&&window.innerHeight>window.innerWidth&&window.innerWidth<700;
  $("#rotate").hidden=!show}
window.addEventListener("resize",updateRotate);window.addEventListener("orientationchange",function(){setTimeout(updateRotate,200)});
var fsEl=document.documentElement,fsOK=document.fullscreenEnabled||document.webkitFullscreenEnabled;
if(!fsOK)$("#fs").hidden=true;
$("#fs").onclick=function(){try{if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else(fsEl.requestFullscreen||fsEl.webkitRequestFullscreen).call(fsEl)}catch(e){}};

/* ---------- online / offline ---------- */
function net(){$("#offline").hidden=navigator.onLine!==false}
window.addEventListener("online",function(){net();toast("✅ Back online")});window.addEventListener("offline",net);net();

/* ---------- install + share ---------- */
var deferred=null,standalone=window.navigator.standalone===true||(window.matchMedia&&matchMedia("(display-mode:standalone)").matches),isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent);
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e;$("#installbtn").hidden=false});
window.addEventListener("appinstalled",function(){deferred=null;$("#installbtn").hidden=true;toast("📲 Installed! Look for Study Time on your home screen.")});
if(isIOS&&!standalone)$("#installbtn").hidden=false;
$("#installbtn").onclick=function(){
  if(deferred){deferred.prompt();deferred.userChoice.then(function(){deferred=null;$("#installbtn").hidden=true})}
  else toast("Tap the Share button, then “Add to Home Screen”.",null,null,7000)};
$("#sharebtn").onclick=function(){
  var url=location.origin&&location.origin!=="null"?location.origin+location.pathname:location.href;
  if(navigator.share){navigator.share({title:"Gran’s Study Time",text:"Math, spelling and a fun game — free and private.",url:url}).catch(function(){})}
  else if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){toast("🔗 Link copied")},function(){toast(url)})}
  else toast(url)};

/* ---------- service worker + updates ---------- */
var swReg=null;
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")){
  var reloading=false;
  navigator.serviceWorker.addEventListener("controllerchange",function(){if(reloading)return;reloading=true;location.reload()});
  navigator.serviceWorker.register("sw.js").then(function(reg){
    swReg=reg;
    function watch(w){w.addEventListener("statechange",function(){if(w.state==="installed"&&navigator.serviceWorker.controller)ready(w)})}
    if(reg.waiting&&navigator.serviceWorker.controller)ready(reg.waiting);
    reg.addEventListener("updatefound",function(){reg.installing&&watch(reg.installing)})
  }).catch(function(e){logErr("sw",e.message)})}
function ready(w){toast("✨ A new version is ready.","Update",function(){w.postMessage("SKIP_WAITING")},30000)}
$("#bUpdate").onclick=function(){
  if(!swReg){toast("Updates are checked automatically when online.");return}
  swReg.update().then(function(){setTimeout(function(){if(!swReg.waiting)toast("You’re on the latest version ✔")},1200)}).catch(function(){toast("Couldn’t check — are you online?")})};

/* ---------- settings dialog ---------- */
function fillSet(){
  $("#sName").value=set.name;$("#sSound").value=set.mute?"off":"on";$("#sTheme").value=set.theme;$("#sText").value=String(set.text);
  $("#sMotion").value=set.motion;$("#sGoal").value=String(set.goal);$("#sBreak").value=String(set.brk);$("#sWake").value=set.wake?"on":"off";
  if(!navigator.wakeLock)$("#sWake").disabled=true}
function readSet(){
  set.name=$("#sName").value.trim().slice(0,20);set.mute=$("#sSound").value==="off";set.theme=$("#sTheme").value;set.text=+$("#sText").value;
  set.motion=$("#sMotion").value;set.goal=+$("#sGoal").value;set.brk=+$("#sBreak").value;set.wake=$("#sWake").value==="on";
  saveSet();applyAll();updateWake()}
["#sName","#sSound","#sTheme","#sText","#sMotion","#sGoal","#sBreak","#sWake"].forEach(function(s){$(s).addEventListener("change",readSet);$(s).addEventListener("input",readSet)});
function openDlg(id,fn){var d=$(id);if(d.open)return;fn&&fn();d.showModal()}
$("#setbtn").onclick=function(){openDlg("#dlgSet",function(){fillSet();diag()})};
$("#progbtn").onclick=function(){openDlg("#dlgProg",renderProg)};
$("#kbdlink").onclick=function(e){e.preventDefault();openDlg("#dlgKeys")};
document.querySelectorAll("dialog").forEach(function(d){d.addEventListener("click",function(e){if(e.target===d)d.close()})});

/* ---------- progress dialog ---------- */
function renderProg(){
  var tot={math:0,words:0,river:0},days=0;
  Object.keys(stats.d).forEach(function(k){var o=stats.d[k],s=secOf(k);if(s>=60)days++;["math","words","river"].forEach(function(a){tot[a]+=o[a]||0})});
  var bars="",lab="",max=1,vals=[];
  for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var m=Math.floor(secOf(day(d))/60);vals.push([m,["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()],i===0]);if(m>max)max=m}
  vals.forEach(function(v){bars+='<div class="'+(v[2]?"t":"")+'" style="height:'+Math.max(4,Math.round(v[0]/max*80))+'px" title="'+v[0]+' min"></div>';lab+="<span>"+v[1]+"</span>"});
  var hs=lget("bb2")||"0",tr=lget("erb_trash_count")||"0",mn=function(s){var m=Math.round(s/60);return m>=60?Math.floor(m/60)+" h "+m%60+" min":m+" min"};
  $("#progBody").innerHTML='<p><b>Last 7 days</b> (minutes)</p><div class="bars" role="img" aria-label="Minutes studied in the last 7 days">'+bars+'</div><div class="barl">'+lab+'</div><table>'+
    '<tr><td>🔥 Current streak</td><td>'+streak()+' days</td></tr><tr><td>🏅 Best streak</td><td>'+bestStreak()+' days</td></tr><tr><td>📅 Days studied</td><td>'+days+'</td></tr>'+
    '<tr><td>🔢 Math Tutor</td><td>'+mn(tot.math)+'</td></tr><tr><td>📝 Practice</td><td>'+mn(tot.words)+'</td></tr><tr><td>🦝 Elk River Bandit</td><td>'+mn(tot.river)+'</td></tr>'+
    '<tr><td>⭐ Bandit best score</td><td>'+String(hs).replace(/[^0-9.]/g,"")+'</td></tr><tr><td>🗑️ Trash collected</td><td>'+String(tr).replace(/[^0-9]/g,"")+'</td></tr></table>'}

/* ---------- backup / restore / erase ---------- */
$("#bBackup").onclick=function(){
  var data={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);data[k]=localStorage.getItem(k)}}catch(e){}
  var blob=new Blob([JSON.stringify({app:"granstudy",version:VER,exported:new Date().toISOString(),data:data},null,1)],{type:"application/json"});
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="study-time-backup-"+day()+".json";document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);toast("⬇️ Backup downloaded")};
$("#bRestore").onclick=function(){$("#fRestore").click()};
$("#fRestore").onchange=function(){
  var f=this.files[0];this.value="";if(!f)return;
  if(f.size>5e6){toast("That file is too big to be a backup.");return}
  var r=new FileReader();r.onload=function(){
    var j;try{j=JSON.parse(r.result)}catch(e){toast("That doesn’t look like a backup file.");return}
    if(!j||j.app!=="granstudy"||!j.data||typeof j.data!=="object"){toast("That doesn’t look like a Study Time backup.");return}
    var keys=Object.keys(j.data).filter(function(k){return typeof j.data[k]==="string"});
    confirmDlg("Restore backup?","This replaces your current progress with the backup from "+String(j.exported||"").slice(0,10)+" ("+keys.length+" items).",function(){
      try{localStorage.clear();keys.forEach(function(k){localStorage.setItem(k,j.data[k])})}catch(e){toast("Couldn’t save — storage is full or blocked.");return}
      toast("✅ Restored — reloading…");setTimeout(function(){location.reload()},900)})};
  r.readAsText(f)};
$("#bErase").onclick=function(){confirmDlg("Erase everything?","This deletes all progress, scores, streaks and settings on this device. It can’t be undone.",function(){
  try{localStorage.clear()}catch(e){}mem={};toast("🗑️ Erased — reloading…");setTimeout(function(){location.href=location.pathname},900)})};

/* ---------- diagnostics ---------- */
function diag(){
  var lines=["Gran’s Study Time v"+VER+(BUILD?" ("+BUILD+")":""),"Online: "+navigator.onLine,"Installed app: "+standalone,"Service worker: "+("serviceWorker" in navigator?(navigator.serviceWorker.controller?"active":"not controlling"):"unsupported"),
    "Storage works: "+storeOK,"Screen: "+innerWidth+"x"+innerHeight+" @"+(window.devicePixelRatio||1)+"x","Mobile view: "+mobile,"Theme: "+set.theme+", text "+set.text+"%","Browser: "+navigator.userAgent];
  var n=0,b=0;try{n=localStorage.length;for(var i=0;i<n;i++){var k=localStorage.key(i);b+=k.length+(localStorage.getItem(k)||"").length}}catch(e){}
  lines.push("Saved items: "+n+" (~"+Math.round(b/1024)+" KB)");
  lines.push("Recent errors: "+(errors.length?"\n  "+errors.join("\n  "):"none"));
  var el=$("#diagTxt");el.textContent=lines.join("\n");
  if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(function(e){el.textContent+="\nDevice storage used: "+Math.round((e.usage||0)/1048576)+" MB"}).catch(function(){})}
$("#bDiag").onclick=function(){var t=$("#diagTxt").textContent;
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast("📋 Copied")},function(){toast("Select the text and copy it by hand.")});else toast("Select the text and copy it by hand.")};

/* ---------- welcome tour ---------- */
var tour=["Welcome to Gran’s Study Time! Pick Math, Practice or Elk River Bandit — all free, private and ad-free. 🦆","Tap ⚙️ to set a daily goal. The ring on the home screen fills up as you study, and your streak grows each day. 🔥","Install it to your home screen and it works even without internet. Tap 🏆 any time to see your progress. 🏆"],ti=0;
function tourShow(){$("#tourTxt").textContent=tour[ti];$("#tourNext").textContent=ti===tour.length-1?"Let’s go!":"Next";
  $("#tourDots").innerHTML=tour.map(function(_,i){return "<i"+(i===ti?' class="on"':"")+"></i>"}).join("")}
function tourEnd(){set.welcomed=true;saveSet();$("#dlgTour").close()}
$("#tourNext").onclick=function(){if(ti<tour.length-1){ti++;tourShow()}else tourEnd()};$("#tourSkip").onclick=tourEnd;
$("#dlgTour").addEventListener("cancel",function(){set.welcomed=true;saveSet()});

/* ---------- keyboard shortcuts (home screen) ---------- */
document.addEventListener("keydown",function(e){
  if(e.ctrlKey||e.metaKey||e.altKey)return;var t=e.target,tn=t&&t.tagName;
  if(tn==="INPUT"||tn==="TEXTAREA"||tn==="SELECT"||document.querySelector("dialog[open]"))return;
  if(e.key==="Escape"&&active!==null){toHome();return}
  if(active!==null)return;
  var m={"1":"math","2":"words","3":"river"};
  if(m[e.key])show(m[e.key]);
  else if(e.key==="s"||e.key==="S")$("#setbtn").click();
  else if(e.key==="p"||e.key==="P")$("#progbtn").click();
  else if(e.key==="?")$("#kbdlink").click()});

/* ---------- boot ---------- */
applyAll();setInterval(greet,60000);
var _sm=setMobile;setMobile=function(on,save){_sm(on,save);updateRotate()};
if(!set.welcomed&&active===null)setTimeout(function(){if(!set.welcomed&&active===null){ti=0;tourShow();$("#dlgTour").showModal()}},600);
window.GST={version:VER,settings:set,stats:stats,toast:toast};
})();
