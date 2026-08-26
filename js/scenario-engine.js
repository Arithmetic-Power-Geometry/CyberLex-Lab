
export function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function hashSeed(s){let h=2166136261>>>0;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
export function createScenario(seed,pools){
 const rnd=mulberry32(hashSeed(seed)); const pick=a=>a[Math.floor(rnd()*a.length)];
 return {seed:String(seed),name:pick(pools.names),domain:pick(pools.domains),ip:pick(pools.ips),amount:pick(pools.amounts),time:pick(pools.times),handle:pick(pools.handles),utr:pick(pools.utrs),
 incident:`CX-${Math.floor(rnd()*9000+1000)}`};
}
