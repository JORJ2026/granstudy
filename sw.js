/* Gran's Study Time service worker — bump VERSION on every release. */
const VERSION="1.1.0";
const CACHE="gst-"+VERSION;
const CORE=["./","index.html","styles.css","hub.js","launch.js","quack.js","version.js","manifest.webmanifest","favicon.ico","about.html","help.html","privacy.html","404.html","pages.css",
"icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png","icons/favicon-32.png",
"apps/math.html","apps/math.css","apps/math.js","apps/quack.js","apps/words.html","apps/words.css","apps/words.js","apps/words-duck.js",
"apps/river-bandit/index.html","apps/river-bandit/style.css","apps/river-bandit/app.js"];
/* big files: cached best-effort so a slow connection can't block install */
const BIG=["apps/words-data.js","apps/river-bandit/img/dumpster.png","apps/river-bandit/img/mode-free.png","apps/river-bandit/img/mode-platformer.png","apps/river-bandit/img/mode-runner.png","apps/river-bandit/img/mode-spelling.png",
"apps/river-bandit/audio/jump.mp3","apps/river-bandit/audio/slide.mp3","apps/river-bandit/audio/spin.mp3","apps/river-bandit/audio/coin.mp3","apps/river-bandit/audio/hit.mp3",
"apps/river-bandit/audio/funky-soundtrack.mp3","apps/river-bandit/audio/intro-polka.mp3","apps/river-bandit/audio/100-womps.mp3","apps/river-bandit/audio/boardwalk-bounce.mp3","apps/river-bandit/audio/campfire-jig.mp3","apps/river-bandit/audio/cattail-shuffle.mp3","apps/river-bandit/audio/dumpster-dive.mp3","apps/river-bandit/audio/fireflies.mp3","apps/river-bandit/audio/frog-chorus.mp3","apps/river-bandit/audio/lazy-river.mp3","apps/river-bandit/audio/midnight-ferry.mp3","apps/river-bandit/audio/moonlit-trash-run.mp3","apps/river-bandit/audio/night-heist.mp3","apps/river-bandit/audio/old-mill-waltz.mp3","apps/river-bandit/audio/pine-tree-parade.mp3","apps/river-bandit/audio/raccoon-polka.mp3","apps/river-bandit/audio/rapids.mp3","apps/river-bandit/audio/sneaky-possum.mp3","apps/river-bandit/audio/snowy-banks.mp3","apps/river-bandit/audio/sunrise-paddle.mp3","apps/river-bandit/audio/sunset-cruise.mp3","apps/river-bandit/audio/turbo-trash.mp3","apps/river-bandit/audio/victory-lap.mp3"];

self.addEventListener("install",e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await c.addAll(CORE);
    await Promise.all(BIG.map(u=>c.add(u).catch(()=>{})));
  })());
});
self.addEventListener("activate",e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k.startsWith("gst-")&&k!==CACHE)await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("message",e=>{if(e.data==="SKIP_WAITING")self.skipWaiting()});

async function rangeResponse(req,res){
  const h=req.headers.get("range"),m=/bytes=(\d*)-(\d*)/.exec(h||"");
  if(!m)return res;
  const buf=await res.arrayBuffer(),size=buf.byteLength;
  let s=m[1]===""?size-parseInt(m[2],10):parseInt(m[1],10),en=m[1]===""||m[2]===""?size-1:parseInt(m[2],10);
  s=Math.max(0,s);en=Math.min(size-1,en);
  if(s>en)return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+size}});
  return new Response(buf.slice(s,en+1),{status:206,statusText:"Partial Content",headers:{"Content-Type":res.headers.get("Content-Type")||"application/octet-stream","Content-Range":`bytes ${s}-${en}/${size}`,"Content-Length":String(en-s+1)}});
}

self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.hostname==="api.dictionaryapi.dev")return;           // always live
  if(url.origin!==location.origin){                            // fonts etc: stale-while-revalidate
    if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
      e.respondWith((async()=>{
        const c=await caches.open(CACHE),hit=await c.match(req);
        const net=fetch(req).then(r=>{c.put(req,r.clone());return r}).catch(()=>hit);
        return hit||net;
      })());
    }
    return;
  }
  if(req.mode==="navigate"){                                   // pages: network first, cache fallback
    e.respondWith((async()=>{
      try{
        const r=await fetch(req);
        if(r.ok){const c=await caches.open(CACHE);c.put(req,r.clone())}
        return r;
      }catch(_){
        const c=await caches.open(CACHE);
        return (await c.match(req,{ignoreSearch:true}))||(await c.match("index.html"))||Response.error();
      }
    })());
    return;
  }
  e.respondWith((async()=>{                                    // assets: cache first
    const c=await caches.open(CACHE);
    let res=await c.match(req,{ignoreSearch:true});
    if(!res){
      try{res=await fetch(url.href);if(res.ok&&res.status===200)c.put(url.href,res.clone())}
      catch(_){return Response.error()}
    }
    return req.headers.has("range")?rangeResponse(req,res):res;
  })());
});
