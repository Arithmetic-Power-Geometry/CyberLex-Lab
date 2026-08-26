
export async function sha256(text){const b=new TextEncoder().encode(text);const h=await crypto.subtle.digest("SHA-256",b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("")}
export function fakeEvidence(sc){
 return [
  {icon:"📧",title:"Email",detail:`From: scholarship@${sc.domain}\nTime: ${sc.time}\nSubject: URGENT Scholarship Verification`},
  {icon:"🌐",title:"URL",detail:`https://${sc.domain}/verify`},
  {icon:"🔐",title:"Login log",detail:`${sc.time} | IP ${sc.ip} | Session SIM-${sc.seed}`},
  {icon:"📱",title:"Social profile",detail:`Handle: ${sc.handle}\nCreated: ${sc.time}`},
  {icon:"🎙️",title:"AI audio",detail:"Synthetic training audio label: GENERATED / source unknown"},
  {icon:"💳",title:"Transaction",detail:`₹${sc.amount.toLocaleString("en-IN")} | UTR ${sc.utr}`},
  {icon:"🌍",title:"IP",detail:`Public documentation IP: ${sc.ip}\nShared NAT possible`},
  {icon:"📸",title:"Screenshot",detail:"Training screenshot: cropped view; original context available separately"}
 ];
}
