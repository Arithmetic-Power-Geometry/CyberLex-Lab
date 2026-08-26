const CACHE="cyberlex-v3";
const ASSETS=["./","./index.html","./css/cyberlex.css","./css/mobile.css","./js/app.js","./js/scenario-engine.js","./js/scoring-engine.js","./js/progress-engine.js","./js/evidence-engine.js","./js/legal-engine.js","./js/certificate-engine.js","./js/instructor-mode.js","./data/missions.json","./data/zones.json","./data/scenario-pools.json","./data/legal.json","./manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp}).catch(()=>caches.match("./index.html"))))});
