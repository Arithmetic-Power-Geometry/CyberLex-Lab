
export const scoreKeys=["evidence","privacy","judgment","response","investigation"];
export function baseState(){return{evidence:50,privacy:50,judgment:50,response:50,investigation:50}}
export function clamp(v){return Math.max(0,Math.min(100,v))}
export function applyDelta(scores,delta={}){const n={...scores};for(const k of scoreKeys)n[k]=clamp(n[k]+(delta[k]||0));return n}
export function index(scores){return Math.round(scoreKeys.reduce((s,k)=>s+scores[k],0)/scoreKeys.length)}
export function rank(i){if(i>=90)return"Cyber Law Guardian";if(i>=80)return"Cyber Investigator";if(i>=70)return"Evidence Analyst";if(i>=60)return"Cyber Observer";return"Digital Rookie"}
export function code(scores){return `CYBERLEX-${index(scores)}-E${scores.evidence}-P${scores.privacy}-J${scores.judgment}-R${scores.response}-I${scores.investigation}`}
