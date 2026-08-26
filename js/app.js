
import {createScenario} from "./scenario-engine.js";
import {baseState,applyDelta,index,rank,code} from "./scoring-engine.js";
import {unlockedMission,percent} from "./progress-engine.js";
import {sha256,fakeEvidence} from "./evidence-engine.js";
import {legalDetails} from "./legal-engine.js";
import {certificateHTML} from "./certificate-engine.js";
import {instructorPanel} from "./instructor-mode.js";

const [missions,zones,pools,legal]=await Promise.all([
 fetch("./data/missions.json").then(r=>r.json()),
 fetch("./data/zones.json").then(r=>r.json()),
 fetch("./data/scenario-pools.json").then(r=>r.json()),
 fetch("./data/legal.json").then(r=>r.json())
]);
const qs=new URLSearchParams(location.search);
const mode=qs.get("mode")||"student";
const key="cyberlex-v3";
const fresh={name:"",roll:"",seed:qs.get("seed")||String(Math.floor(Math.random()*9000+1000)),currentMission:Number(qs.get("mission")||0),
 scores:baseState(),completed:[],badges:[],answers:{},difficulty:"Basic",finalPassed:false};
let state={...fresh,...JSON.parse(localStorage.getItem(key)||"{}")};
if(qs.has("mission")) state.currentMission=Number(qs.get("mission"));
if(qs.has("seed")) state.seed=qs.get("seed");
const sc=()=>createScenario(state.seed,pools);
const app=document.querySelector("#app"),hud=document.querySelector("#hud"),nav=document.querySelector("#bottomNav"),toast=document.querySelector("#toast");

function save(){localStorage.setItem(key,JSON.stringify(state));renderHUD()}
function notify(msg){toast.textContent=msg;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2300)}
function renderHUD(){
 const i=index(state.scores);
 hud.innerHTML=`<div class="metric"><span>INDEX</span><b>${i}</b></div><div class="metric"><span>RANK</span><b>${rank(i)}</b></div>
 <div class="metric"><span>EVIDENCE</span><b>${state.scores.evidence}</b></div><div class="metric"><span>JUDGMENT</span><b>${state.scores.judgment}</b></div>`;
}
function renderNav(active="mission"){
 nav.innerHTML=`<button data-nav="home" class="${active==="home"?"active":""}">⌂<br>Home</button>
 <button data-nav="map" class="${active==="map"?"active":""}">◫<br>Map</button>
 <button data-nav="mission" class="${active==="mission"?"active":""}">◎<br>Mission</button>
 <button data-nav="report" class="${active==="report"?"active":""}">▥<br>Report</button>`;
 nav.querySelectorAll("button").forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
}
function navigate(where){
 if(where==="home")return home();
 if(where==="map")return mapView();
 if(where==="report")return reportView();
 missionView(state.currentMission);
}
function score(delta,msg){
 state.scores=applyDelta(state.scores,delta); save(); notify(msg);
}
function nextMission(id){
 if(!state.completed.includes(id)) state.completed.push(id);
 state.currentMission=Math.min(32,id+1); save();
 missionView(state.currentMission);
}
function badgeFor(id){
 const list={2:"🏅 Permission Guardian",6:"🔎 Phishing Hunter",7:"🌐 Domain Detective",8:"🔐 Trust Analyst",18:"🧬 Hash Witness",16:"📁 Evidence Keeper",26:"⚖️ Careful Judge",25:"🚨 Incident Responder",31:"🕵️ Cyber Investigator",32:"🛡️ Cyber Law Guardian"};
 if(list[id]&&!state.badges.includes(list[id])){state.badges.push(list[id]);notify(`Badge unlocked: ${list[id]}`)}
}
function shell(m,body,stage="DISCOVER"){
 const stages=["DISCOVER","EXPERIENCE","DECIDE","CONSEQUENCE","LAW","TEST","UNLOCK"];
 return `<div class="stagebar">${stages.map(x=>`<span class="stage ${x===stage?"active":""}">${x}</span>`).join("")}</div>
 <span class="pill">${m.tag}</span><span class="pill">${m.concept}</span><h1 class="section-title">${m.title}</h1>${body}`;
}
function learnScreen(m){
 return shell(m,`<div class="card"><div class="kicker">WHAT IS IT?</div><h2>${m.learn_title}</h2><p class="lead">${m.learn}</p>
 <div class="why"><b>WHY DOES IT MATTER?</b><br>${m.why}</div><div class="remember"><b>REMEMBER</b><br>${m.remember}</div>
 ${m.author?`<p><b>${m.author}</b></p>`:""}<div class="actions"><button class="btn primary" id="experienceBtn">EXPERIENCE IT →</button></div></div>`,"DISCOVER");
}
function decisionResult(ok,good,bad){
 return `<div class="result ${ok?"good":"bad"}"><div class="score-pop ${ok?"plus":"minus"}">${ok?"+":"−"} JUDGMENT</div>${ok?good:bad}</div>`;
}
function renderScenario(m){
 const S=sc(); let html="", setup=null;
 switch(m.scenario_type){
 case "intro":
   html=`<div class="hero"><div class="kicker">CYBERLEX LAB</div><h1>Your Digital Life Is Now a Case File.</h1><h2>6 Investigation Zones • 33 Missions • 1 Final Cyber Mystery</h2>
   <p>Every incident is simulated. Every decision has a consequence.</p>
   <div class="card"><p><b>Cyber Law</b> deals with rights, responsibilities and legal consequences in the digital world.</p><h2>Does <span style="color:var(--cyan)">CAN</span> mean <span style="color:var(--amber)">MAY</span>?</h2>
   <p><b>Dr. Mohammad Amir Khusru Akhtar</b><br>Faculty of Computing & Information Technology<br>Usha Martin University, Ranchi</p></div>
   <div class="formrow"><label class="field">Student name<input id="studentName" value="${state.name||""}" placeholder="Your name"></label><label class="field">Roll no. (optional)<input id="roll" value="${state.roll||""}" placeholder="Optional"></label></div>
   <div class="actions"><button class="btn primary" id="startIntro">ENTER MISSION CONTROL</button></div>
   <p class="tiny">⚠ Training environment: synthetic accounts, URLs, logs, payments and evidence only. No real system is attacked.</p></div>`;
   setup=()=>document.querySelector("#startIntro").onclick=()=>{state.name=document.querySelector("#studentName").value.trim()||"Cyber Citizen";state.roll=document.querySelector("#roll").value.trim();save();quizScreen(m)};
   break;
 case "browser":
   html=`<div class="card"><h3>LIVE BROWSER LAB</h3><p>Open Chrome → F12 → Console and try:</p><div class="console">navigator.language<br>navigator.userAgent<br>screen.width + " x " + screen.height<br>Intl.DateTimeFormat().resolvedOptions().timeZone<br><br>navigator.geolocation.getCurrentPosition(<br>&nbsp;p => console.log(p.coords.latitude, p.coords.longitude)<br>)</div>
   <p class="tiny">Location is permission-controlled. Do not display precise coordinates publicly unless you intend to.</p><div class="actions"><button class="btn primary" id="doneTry">I TRIED / UNDERSTOOD</button></div></div>`;
   setup=()=>document.querySelector("#doneTry").onclick=()=>quizScreen(m); break;
 case "permissions":
   html=`<div class="incident"><div class="time">SIMULATED CAMPUS APP</div><h2>Scan your induction QR to continue.</h2><p>The app requests: Camera • Microphone • Location • Contacts • Files</p></div>
   <div class="actions"><button class="choice" data-v="bad">ALLOW ALL</button><button class="choice" data-v="good">ALLOW CAMERA ONLY</button><button class="choice" data-v="mid">BLOCK ALL</button></div>`;
   setup=()=>bindChoices(m,{good:["Good: camera fits the QR-scanning purpose.",{privacy:8,judgment:5}],mid:["Safe but may block the intended QR function.",{privacy:2,judgment:1}],bad:["The request is broader than the purpose.",{privacy:-6,judgment:-4}]}); break;
 case "unlocked_phone":
   html=`<div class="phone"><div class="status">11:43 • SIMULATED PHONE</div><div class="app"><b>WhatsApp</b><div class="msg">Nisha: “Please don't share this with anyone…”</div><p>2 unread messages</p></div>
   <button class="choice" data-v="bad">OPEN WHATSAPP</button><button class="choice" data-v="good">LEAVE PHONE</button><button class="choice" data-v="mid">READ PREVIEW ONLY</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: technical access is not permission.",{privacy:8,judgment:6}],mid:["Preview still contains private content; permission matters.",{privacy:-1}],bad:["Unlocked ≠ authorized.",{privacy:-8,judgment:-6}]});break;
 case "password":
   html=`<div class="incident"><div class="time">${S.time}</div><h2>${S.name} sends you another student's username and password.</h2><p>“Just check the account for me.”</p></div><div class="actions"><button class="choice" data-v="bad">LOGIN — PASSWORD WORKS</button><button class="choice" data-v="good">VERIFY AUTHORITY FIRST</button><button class="choice" data-v="mid">LOGIN BUT CHANGE NOTHING</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: verify authorization, not only credentials.",{judgment:8,privacy:4}],mid:["Read-only access can still be unauthorized.",{judgment:-3}],bad:["Authentication of a credential is not authorization.",{judgment:-8,privacy:-4}]});break;
 case "otp":
   html=`<div class="phone"><div class="status">${S.time}</div><div class="app"><b>Incoming call — “Bank Support”</b><p>“We detected fraud. Read the OTP now so I can cancel it.”</p><div class="msg">OTP: 731904 — Do not share.</div></div><button class="choice" data-v="bad">SHARE OTP</button><button class="choice" data-v="good">END CALL + VERIFY OFFICIALLY</button><button class="choice" data-v="mid">SHARE LAST 3 DIGITS</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: independently verify through an official channel.",{response:7,judgment:6}],mid:["Partial secrets can still be sensitive.",{judgment:-3}],bad:["Never surrender an authentication secret under unsolicited pressure.",{response:-8,judgment:-8}]});break;
 case "phishing":
   html=`<div class="email"><div class="from">From: UMU Support &lt;erp-support@${S.domain}&gt;</div><div class="subject">URGENT — ERP account expires in 7 minutes</div><p>Verify immediately or lose access.</p><div class="urlbar">https://${S.domain}/verify</div></div><div class="actions"><button class="choice" data-v="bad">CLICK VERIFY</button><button class="choice" data-v="good">INSPECT + OPEN OFFICIAL ERP INDEPENDENTLY</button><button class="choice" data-v="mid">REPLY “IS THIS REAL?”</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: verify outside the suspicious message.",{investigation:7,judgment:6}],mid:["Replying keeps you inside the attacker's channel.",{investigation:-2}],bad:["Urgency + unverified domain is a strong warning.",{investigation:-7,judgment:-6}]});break;
 case "url":
   html=`<div class="card"><h3>URL X-RAY</h3><div class="urlbar">https://umu.ac.in.security-check.example.com/login</div><p>Tap the organization you believe controls the address in this teaching example.</p>
   <div class="actions"><button class="choice" data-v="bad">umu.ac.in</button><button class="choice" data-v="good">example.com</button><button class="choice" data-v="bad">security-check</button></div><p class="tiny">Teaching simplification: real public-suffix parsing is more complex. The lesson is to identify the actual domain, not familiar words.</p></div>`;
   setup=()=>bindChoices(m,{good:["Correct for this training URL: familiar words are subdomain labels; the base domain is example.com.",{investigation:9,judgment:4}],bad:["Look farther right: trusted-looking text can appear inside a subdomain.",{investigation:-5}]});break;
 case "https":
   html=`<div class="card"><div class="urlbar">🔒 https://secure-refund.example</div><h2>Scholarship Release</h2><p>“Pay ₹${S.amount.toLocaleString("en-IN")} now to unlock your scholarship.”</p></div><div class="actions"><button class="choice" data-v="bad">HTTPS = GENUINE</button><button class="choice" data-v="good">CONNECTION MAY BE SECURE; OFFER STILL NEEDS VERIFICATION</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: transport security does not prove honest intention.",{judgment:8,investigation:4}],bad:["A fraudulent site can also use HTTPS.",{judgment:-8}]});break;
 case "fake_login":
   html=`<div class="card"><div class="urlbar">https://login-umu.${S.domain}/</div><h2>Usha Martin University ERP</h2><div class="formrow"><label class="field">Username<input disabled value="(training only)"></label><label class="field">Password<input disabled value="••••••••"></label></div><p class="tiny">This simulator never accepts real credentials.</p></div><div class="actions"><button class="choice" data-v="good">CLOSE + OPEN OFFICIAL ERP INDEPENDENTLY</button><button class="choice" data-v="bad">ENTER REAL PASSWORD TO TEST</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: verify destination independently.",{investigation:7,response:4}],bad:["Never test an unverified page with real credentials.",{privacy:-6,response:-6}]});break;
 case "social_engineering":
   html=`<div class="phone"><div class="status">${S.time}</div><div class="app"><b>“Dean Office”</b><div class="msg">I am in a meeting. Buy gift cards worth ₹${S.amount.toLocaleString("en-IN")} and send codes now. Urgent.</div></div><button class="choice" data-v="bad">BUY NOW</button><button class="choice" data-v="good">VERIFY THROUGH KNOWN OFFICIAL CONTACT</button><button class="choice" data-v="mid">ASK THIS CHAT FOR PROOF</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: independently verify identity.",{judgment:7,response:5}],mid:["The attacker controls the same chat; verify outside it.",{investigation:-2}],bad:["Authority + urgency + unusual payment request is high risk.",{response:-8,judgment:-6}]});break;
 case "deepfake":
   html=`<div class="grid two"><div class="card"><h3>ORIGINAL</h3><p>Student standing on campus.</p><div style="font-size:5rem;text-align:center">🧑‍🎓</div></div><div class="card"><h3>AI VERSION</h3><p>Realistic synthetic clip claims the student is endorsing a fake scholarship.</p><div style="font-size:5rem;text-align:center">🎭</div></div></div>
   <div class="card"><div class="formrow"><label class="field">Consent<select id="dfConsent"><option>No</option><option>Yes</option></select></label><label class="field">Clearly labeled synthetic?<select id="dfLabel"><option>No</option><option>Yes</option></select></label><label class="field">Impersonation?<select id="dfImp"><option>Yes</option><option>No</option></select></label><label class="field">Likely harm<select id="dfHarm"><option>High</option><option>Medium</option><option>Low</option></select></label></div><button class="btn primary" id="riskBtn">GENERATE LEGAL-RISK PROFILE</button><div id="riskOut"></div></div>`;
   setup=()=>{document.querySelector("#riskBtn").onclick=()=>{const c=document.querySelector("#dfConsent").value==="Yes",l=document.querySelector("#dfLabel").value==="Yes",i=document.querySelector("#dfImp").value==="Yes",h=document.querySelector("#dfHarm").value;const risk=Math.min(100,(c?0:25)+(l?0:20)+(i?30:0)+(h==="High"?25:h==="Medium"?15:5));document.querySelector("#riskOut").innerHTML=`<div class="riskbar"><span>Overall</span><div class="track"><div class="fill" style="width:${risk}%"></div></div><b>${risk}</b></div><p class="tiny">This is a teaching risk indicator, not a legal verdict. Exact legal consequences depend on facts and applicable law.</p><button class="btn secondary" id="toQuiz">CONTINUE</button>`;document.querySelector("#toQuiz").onclick=()=>quizScreen(m)}};break;
 case "fake_social":
   html=`<div class="phone"><div class="status">${S.time}</div><div class="app"><b>Instagram — ${S.handle}</b><p>Uses your photo. Messages friends: “Need ₹${S.amount.toLocaleString("en-IN")} urgently.”</p></div><button class="choice" data-v="bad">MESSAGE ATTACKER</button><button class="choice" data-v="good">SCREENSHOT + COPY URL + WARN + REPORT</button><button class="choice" data-v="bad">DELETE MY REAL ACCOUNT</button></div>`;
   setup=()=>bindChoices(m,{good:["Strong response: preserve, contain and report.",{evidence:7,response:7}],bad:["This does not address the core incident.",{response:-5}]});break;
 case "cyberbullying":
   html=`<div class="phone"><div class="status">Class Group</div><div class="app"><div class="msg">${S.name}: edited image + humiliating caption</div><div class="msg">Others: 😂😂😂</div></div><button class="choice" data-v="bad">JOIN IN</button><button class="choice" data-v="good">PRESERVE + SUPPORT TARGET + REPORT</button><button class="choice" data-v="mid">DELETE CHAT IMMEDIATELY</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: support, preserve useful evidence, report appropriately.",{evidence:5,response:7}],mid:["Immediate deletion may remove useful context.",{evidence:-4}],bad:["Participation amplifies harm.",{judgment:-8,response:-4}]});break;
 case "public_free":
   html=`<div class="card"><h3>Public website image</h3><p>No visible license or reuse terms.</p><div style="font-size:6rem;text-align:center">🖼️</div></div><div class="actions"><button class="choice" data-v="bad">PUBLIC = FREE TO USE</button><button class="choice" data-v="good">CHECK LICENSE / PERMISSION</button><button class="choice" data-v="bad">REMOVE WATERMARK</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: visibility is not the same as reuse permission.",{judgment:7}],bad:["Public availability does not automatically remove rights.",{judgment:-7}]});break;
 case "license":
   html=`<div class="card"><h3>Repository: Student-Analyzer</h3><p>License: MIT</p><p>You copy the entire code and submit it unchanged as “my original project”.</p></div><div class="actions"><button class="choice" data-v="bad">OK — OPEN SOURCE</button><button class="choice" data-v="good">NOT OK AS ORIGINAL AUTHORSHIP</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: license rights and academic integrity are separate.",{judgment:8}],bad:["Open-source licensing does not make plagiarism acceptable.",{judgment:-8}]});break;
 case "evidence_desk":
   html=`<div class="evidence-board">${fakeEvidence(S).slice(0,4).map((e,i)=>`<div class="evidence" data-i="${i}"><div style="font-size:2rem">${e.icon}</div><b>${e.title}</b><p class="tiny">Tap to inspect</p></div>`).join("")}</div><div id="evidenceDetail" class="card" style="margin-top:12px">Select evidence.</div><div class="actions"><button class="btn primary" id="evidContinue">I CHECKED THE CONTEXT</button></div>`;
   setup=()=>{document.querySelectorAll(".evidence").forEach(el=>el.onclick=()=>{const e=fakeEvidence(S)[+el.dataset.i];document.querySelector("#evidenceDetail").innerHTML=`<h3>${e.icon} ${e.title}</h3><div class="console">${e.detail.replaceAll("\n","<br>")}</div>`});document.querySelector("#evidContinue").onclick=()=>quizScreen(m)};break;
 case "metadata":
   html=`<div class="console">File: IMG_${S.seed}.jpg<br>Created: 23:41:08<br>Modified: 23:52:17<br>Device: SIM-DEVICE-07<br>GPS: Removed<br>Size: 1.8 MB</div><h3>Created and Modified times differ. Does this prove tampering?</h3><div class="actions"><button class="choice" data-v="bad">YES</button><button class="choice" data-v="good">NOT ENOUGH INFORMATION</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: the difference is a clue, not automatic proof of malicious tampering.",{investigation:8,judgment:5}],bad:["Avoid overclaiming from one metadata field.",{investigation:-6,judgment:-4}]});break;
 case "hash":
   html=`<div class="card"><label class="field">Evidence A<input id="hashA" value="Transfer ₹5000 now"></label><label class="field">Evidence B — edit one character<input id="hashB" value="Transfer ₹5001 now"></label><div class="actions"><button class="btn primary" id="hashBtn">COMPARE SHA-256</button></div><div id="hashOut"></div></div>`;
   setup=()=>document.querySelector("#hashBtn").onclick=async()=>{const a=document.querySelector("#hashA").value,b=document.querySelector("#hashB").value;const [ha,hb]=await Promise.all([sha256(a),sha256(b)]);document.querySelector("#hashOut").innerHTML=`<div class="console">A: ${ha}<br>B: ${hb}</div><div class="remember">One character changed. The evidence looks almost identical; the fingerprint does not.</div><button class="btn secondary" id="hashQuiz">CONTINUE</button>`;score({evidence:8,investigation:5},"Hash experiment complete");document.querySelector("#hashQuiz").onclick=()=>quizScreen(m)};break;
 case "ip":
   html=`<div class="card"><h3>Attack observed</h3><div class="console">Public IP: ${S.ip}</div><p>Priya's laptop → NAT → ${S.ip}<br>Rahul's phone → NAT → ${S.ip}<br>Arjun's laptop → NAT → ${S.ip}</p></div><h3>Who did it?</h3><div class="actions"><button class="choice" data-v="bad">PRIYA</button><button class="choice" data-v="bad">RAHUL</button><button class="choice" data-v="bad">ARJUN</button><button class="choice" data-v="good">NOT ENOUGH INFORMATION</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: shared public IP is insufficient for human attribution.",{investigation:9,judgment:6}],bad:["Attribution error: NAT allows multiple devices to share a public IP.",{investigation:-8,judgment:-5}]});break;
 case "delete":
   html=`<div class="card"><p>Simulated message: <b>“Pay ₹${S.amount.toLocaleString("en-IN")} now.”</b></p><button class="btn danger" id="deleteBtn">DELETE MESSAGE</button><div id="deleteOut"></div></div>`;
   setup=()=>document.querySelector("#deleteBtn").onclick=()=>{document.querySelector("#deleteOut").innerHTML=`<div class="result info">Message hidden from inbox.<br><br>Training audit log still contains: message ID, sender handle, timestamp and deletion event.</div><div class="remember">Delete ≠ disappear everywhere.</div><button class="btn secondary" id="delQuiz">CONTINUE</button>`;document.querySelector("#delQuiz").onclick=()=>quizScreen(m)};break;
 case "upi":
   html=`<div class="phone"><div class="status">${S.time}</div><div class="app"><b>Caller</b><p>“I sent ₹${S.amount.toLocaleString("en-IN")} by mistake. Scan this QR and enter your UPI PIN to return/receive it.”</p><div style="font-size:5rem;text-align:center">▦</div></div><button class="choice" data-v="bad">SCAN + ENTER PIN</button><button class="choice" data-v="good">VERIFY IN MY OWN BANK/UPI APP</button><button class="choice" data-v="bad">SHARE OTP</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: independently verify before authorizing anything.",{response:9,judgment:5}],bad:["Do not authorize payment or share authentication secrets under pressure.",{response:-9,judgment:-6}]});break;
 case "timer":
   html=`<div class="incident"><div class="time">🚨 UNAUTHORIZED DEBIT</div><h2>₹10,000 debited</h2><p>UTR ${S.utr}</p></div><div class="countdown" id="timer">00:59</div>
   <div class="grid two"><button class="choice" data-v="good">SAVE UTR</button><button class="choice" data-v="good">CONTACT BANK / OFFICIAL FRAUD CHANNEL</button><button class="choice" data-v="mid">CHANGE COMPROMISED CREDENTIALS</button><button class="choice" data-v="bad">DELETE SMS</button></div>`;
   setup=()=>{let t=59;const el=document.querySelector("#timer");const int=setInterval(()=>{t--;if(el)el.textContent=`00:${String(t).padStart(2,"0")}`;if(t<=0)clearInterval(int)},1000);bindChoices(m,{good:["Good priority.",{response:6,evidence:4}],mid:["Useful, especially if credentials may be compromised.",{response:4}],bad:["Preserve useful evidence before deletion.",{evidence:-7}]},()=>clearInterval(int))};break;
 case "reporting":
   html=`<div class="card"><h3>📞 1930 CYBER FINANCIAL FRAUD REPORTING — TRAINING SIMULATION</h3><p>Build a useful Case Pack.</p>
   ${["Transaction amount","Bank/payment service","Transaction ID / UTR","Date/time","Suspect identifier","Screenshot/messages","Favourite colour","College attendance"].map((x,i)=>`<label><input type="checkbox" class="pack" value="${i<6?1:0}"> ${x}</label><br>`).join("")}
   <div class="actions"><button class="btn primary" id="packBtn">CHECK CASE PACK</button></div><div id="packOut"></div></div>`;
   setup=()=>document.querySelector("#packBtn").onclick=()=>{const chosen=[...document.querySelectorAll(".pack:checked")],useful=chosen.reduce((s,x)=>s+Number(x.value),0),junk=chosen.length-useful;document.querySelector("#packOut").innerHTML=`<div class="result ${useful>=5&&junk===0?"good":"info"}"><b>Useful items: ${useful}/6</b><br>Irrelevant items selected: ${junk}</div><button class="btn secondary" id="packQuiz">CONTINUE</button>`;score({evidence:useful-junk,response:Math.max(0,useful-3)},"Case Pack evaluated");document.querySelector("#packQuiz").onclick=()=>quizScreen(m)};break;
 case "complaint":
   const statements=[["₹7,500 left my account at 23:41.","FACT / OBSERVATION"],["Rahul stole my money.","ALLEGATION"],[`The message came from ${S.handle}.`,"OBSERVATION"],["Therefore Rahul operated the account.","INFERENCE"]];
   html=`<div class="card"><h3>Classify each statement</h3>${statements.map((s,i)=>`<div class="quiz-q"><b>${s[0]}</b><select class="classify" data-answer="${s[1]}"><option>FACT / OBSERVATION</option><option>INFERENCE</option><option>ALLEGATION</option></select></div>`).join("")}<button class="btn primary" id="classBtn">CHECK</button><div id="classOut"></div></div>`;
   setup=()=>document.querySelector("#classBtn").onclick=()=>{let c=0;document.querySelectorAll(".classify").forEach(x=>c+=x.value===x.dataset.answer);document.querySelector("#classOut").innerHTML=`<div class="result ${c===4?"good":"info"}">${c}/4 correct. Good complaints separate facts, evidence, inference and allegation.</div><button class="btn secondary" id="classQuiz">CONTINUE</button>`;score({judgment:c*2,investigation:c},"Classification evaluated");document.querySelector("#classQuiz").onclick=()=>quizScreen(m)};break;
 case "response":
   html=`<div class="card"><h3>Order your priorities</h3><p>Compromised account + suspicious messages.</p></div><div class="grid two"><button class="choice" data-v="good">PRESERVE EVIDENCE</button><button class="choice" data-v="mid">CONTAIN / SECURE ACCOUNT</button><button class="choice" data-v="good">REPORT APPROPRIATELY</button><button class="choice" data-v="bad">RETALIATE</button></div>`;
   setup=()=>bindChoices(m,{good:["Strong response priority.",{response:7,evidence:3}],mid:["Also useful: containment and credential security.",{response:6}],bad:["Retaliation is usually not the first response.",{response:-7,judgment:-4}]});break;
 case "court":
   html=`<div class="card"><h3>CASE FILE</h3><p>A screenshot shows a threatening message, but the source account may be spoofed and no original chat export is available.</p><p><b>Facts:</b> screenshot exists.</p><p><b>Missing:</b> source account verification, original message, surrounding context.</p></div><div class="actions"><button class="choice" data-v="bad">DEFINITELY GUILTY</button><button class="choice" data-v="good">NOT ENOUGH INFORMATION</button><button class="choice" data-v="mid">LOWER RISK</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: the screenshot is evidence, but identity and context remain unresolved.",{judgment:10,investigation:5}],mid:["The issue is not necessarily low risk; evidence is incomplete.",{judgment:-2}],bad:["Avoid automatic guilt from incomplete evidence.",{judgment:-9}]});break;
 case "screenshot_truth":
   html=`<div class="card"><h3>Screenshot</h3><div class="console">“Send ₹10,000 or I will publish the photo.”</div></div><div class="evidence-board">
   ${["VIEW FULL CHAT","VIEW TIMESTAMP","VIEW ORIGINAL FILE","VIEW METADATA","VIEW SOURCE ACCOUNT"].map((x,i)=>`<div class="evidence inspect" data-i="${i}">${x}</div>`).join("")}</div><div id="ctx" class="card" style="margin-top:12px">Inspect before judging.</div><div class="actions"><button class="btn primary" id="ctxDone">READY TO TEST</button></div>`;
   setup=()=>{const details=["Earlier messages show an argument; context still incomplete.","Timestamp: ${S.time}","Original file hash available in training record.","Metadata: exported screenshot; device label synthetic.","Source account handle changed twice." ];document.querySelectorAll(".inspect").forEach(x=>x.onclick=()=>document.querySelector("#ctx").textContent=details[+x.dataset.i]);document.querySelector("#ctxDone").onclick=()=>quizScreen(m)};break;
 case "investigation":
   html=`<div class="timeline"><div class="event"><b>23:41</b> Login from ${S.ip}</div><div class="event"><b>23:42</b> Profile edited — Session SIM-${S.seed}</div><div class="event"><b>23:44</b> Message sent — same session</div><div class="event"><b>23:44</b> Another device browsed using same public IP</div></div><h3>Best conclusion?</h3><div class="actions"><button class="choice" data-v="bad">IP PROVES THE STUDENT</button><button class="choice" data-v="good">SESSION CORRELATION HELPS, BUT IDENTITY NEEDS MORE EVIDENCE</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: reconstruct events without overclaiming identity.",{investigation:10,judgment:5}],bad:["One public IP is insufficient for human attribution.",{investigation:-9}]});break;
 case "redlaw":
 case "scope":
   html=`<div class="grid two"><div class="card"><h3>🔴 RED TEAM</h3><p>Technically possible:</p><ul><li>Inspect parameter</li><li>Enumerate endpoint</li><li>Observe response</li></ul></div><div class="card"><h3>⚖️ LAW TEAM</h3><p>Do we have:</p><ul><li>Written authorization?</li><li>Approved target?</li><li>Scope?</li><li>Time window?</li><li>Data-handling rules?</li></ul></div></div><div class="actions"><button class="choice" data-v="bad">TEST PRODUCTION IMMEDIATELY</button><button class="choice" data-v="good">CHECK AUTHORIZATION + SCOPE FIRST</button></div>`;
   setup=()=>bindChoices(m,{good:["Correct: technical possibility does not create authority.",{judgment:9,response:5}],bad:["Safe security testing requires explicit authorization and scope.",{judgment:-9}]});break;
 case "mystery":
   const ev=fakeEvidence(S);
   html=`<div class="incident"><div class="time">CASE ZERO — ${S.incident}</div><h2>Multi-stage cyber incident</h2><p>10:14 phishing email → 10:16 look-alike login → 10:18 session change → 10:23 fake social profile → 10:27 AI voice message → 10:31 friend pays ₹${S.amount.toLocaleString("en-IN")} → 10:36 messages disappear → 10:38 shared campus IP appears.</p></div>
   <h3>Evidence Board</h3><div class="evidence-board">${ev.map((e,i)=>`<div class="evidence mysteryEv" data-i="${i}"><div style="font-size:2rem">${e.icon}</div><b>${e.title}</b></div>`).join("")}</div><div id="mysteryDetail" class="card" style="margin-top:12px">Select evidence.</div>
   <div class="card"><h3>Choose the response package</h3>${["Preserve email, URL, account and transaction evidence","Secure compromised accounts","Warn contacts","Report fake profile/platform","Use prompt official financial-fraud reporting for the payment victim","Attack the phishing server","Delete all messages"].map((x,i)=>`<label><input type="checkbox" class="myst" value="${i<5?1:0}"> ${x}</label><br>`).join("")}<button class="btn primary" id="closeCase">CLOSE THE CASE</button><div id="caseOut"></div></div>`;
   setup=()=>{document.querySelectorAll(".mysteryEv").forEach(x=>x.onclick=()=>{const e=ev[+x.dataset.i];document.querySelector("#mysteryDetail").innerHTML=`<h3>${e.icon} ${e.title}</h3><div class="console">${e.detail.replaceAll("\n","<br>")}</div>`});document.querySelector("#closeCase").onclick=()=>{const sel=[...document.querySelectorAll(".myst:checked")],good=sel.reduce((s,x)=>s+Number(x.value),0),bad=sel.length-good;document.querySelector("#caseOut").innerHTML=`<div class="result ${good===5&&bad===0?"good":"info"}">Correct priorities selected: ${good}/5 • Harmful choices: ${bad}</div><button class="btn secondary" id="mystQuiz">CONTINUE TO CAPSTONE TEST</button>`;score({evidence:good*2-bad*3,response:good*2-bad*4,judgment:good-bad*2,investigation:good},"Final mystery response evaluated");document.querySelector("#mystQuiz").onclick=()=>quizScreen(m)}};break;
 case "final_assessment":
   html=`<div class="card"><h2>Final Mastery Assessment</h2><p>Pass threshold: 70%. You may retry. The Cyber Law Guardian certificate unlocks only after you pass.</p><div class="actions"><button class="btn primary" id="finalStart">START FINAL ASSESSMENT</button></div></div>`;
   setup=()=>document.querySelector("#finalStart").onclick=()=>quizScreen(m,true);break;
 default:
   html=`<div class="card"><p>Interactive mission ready.</p><button class="btn primary" id="generic">CONTINUE</button></div>`;setup=()=>document.querySelector("#generic").onclick=()=>quizScreen(m);
 }
 return {html:shell(m,html,"EXPERIENCE"),setup};
}
function bindChoices(m,map,before=null){
 document.querySelectorAll(".choice").forEach(btn=>btn.onclick=()=>{
   if(before)before();
   const [text,delta]=map[btn.dataset.v]||["Consider the facts carefully.",{}]; score(delta,text);
   app.insertAdjacentHTML("beforeend",`<div class="result ${btn.dataset.v==="good"?"good":btn.dataset.v==="bad"?"bad":"info"}"><b>CONSEQUENCE</b><br>${text}</div><div class="actions"><button class="btn primary" id="toLaw">DISCOVER THE LAW →</button></div>`);
   document.querySelectorAll(".choice").forEach(x=>x.disabled=true);document.querySelector("#toLaw").onclick=()=>lawScreen(m);
 });
}
function lawScreen(m){
 app.innerHTML=shell(m,`<div class="card"><div class="kicker">CYBER LAW PRINCIPLE</div><h2>${m.remember}</h2><p>${m.learn}</p>${legalDetails(m,legal)}<div class="actions"><button class="btn primary" id="lawQuiz">TEST YOURSELF →</button></div></div>`,"LAW");
 document.querySelector("#lawQuiz").onclick=()=>quizScreen(m);
 window.scrollTo(0,0);
}
function quizScreen(m,final=false){
 const qs=m.questions;
 app.innerHTML=shell(m,`<div class="card"><div class="kicker">${final?"FINAL ASSESSMENT":"MASTERY CHECK"}</div><h2>${final?"Prove what you learned":"Pass to unlock the next mission"}</h2><p>${final?"Pass ≥ 70%.":"Pass ≥ 67% (2 of 3). Unlimited retries."}</p>
 ${qs.map((q,i)=>`<div class="quiz-q"><b>${i+1}. ${q[0]}</b>${q[1].map((a,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${a}</label>`).join("")}</div>`).join("")}
 <div class="actions"><button class="btn primary" id="submitQuiz">SUBMIT</button></div><div id="quizResult"></div></div>`,"TEST");
 document.querySelector("#submitQuiz").onclick=()=>{
   let correct=0;qs.forEach((q,i)=>{const x=document.querySelector(`input[name="q${i}"]:checked`);if(x&&Number(x.value)===q[2])correct++});
   const pct=Math.round(correct/qs.length*100),pass=pct>=(final?70:67);
   state.answers[m.title]={correct,total:qs.length,pct,ts:new Date().toISOString()};
   if(pass){
      state.scores=applyDelta(state.scores,{judgment:final?8:3,investigation:final?5:1});
      if(!state.completed.includes(Number(Object.keys(missions).find(k=>missions[k].title===m.title)))) state.completed.push(Number(Object.keys(missions).find(k=>missions[k].title===m.title)));
      if(final)state.finalPassed=true;
      badgeFor(Number(Object.keys(missions).find(k=>missions[k].title===m.title))); save();
   }
   document.querySelector("#quizResult").innerHTML=`<div class="result ${pass?"good":"bad"}"><h3>${pass?"MISSION CLEARED":"MISSION NOT CLEARED YET"}</h3><p>${correct}/${qs.length} correct — ${pct}%</p>${pass?`<p>Concept understood • Scenario completed • Mini-test passed</p>`:`<p>Review the key idea and try again.</p>`}</div>
   <div class="actions">${pass?`<button class="btn primary" id="unlockNext">${final?"VIEW YOUR VICTORY":"UNLOCK NEXT MISSION →"}</button>`:`<button class="btn secondary" id="retry">REVIEW & RETRY</button>`}</div>`;
   if(pass)document.querySelector("#unlockNext").onclick=()=>{const id=Number(Object.keys(missions).find(k=>missions[k].title===m.title)); if(id===32)return victory(); state.currentMission=Math.min(32,id+1);save();missionView(state.currentMission)};
   else document.querySelector("#retry").onclick=()=>{app.innerHTML=learnScreen(m);document.querySelector("#experienceBtn").onclick=()=>{const r=renderScenario(m);app.innerHTML=r.html;r.setup&&r.setup()};};
 };
 window.scrollTo(0,0);
}
function missionView(id){
 const m=missions[id];
 if(!unlockedMission(id,state)){notify("Complete the previous mission first.");return mapView()}
 state.currentMission=id;save();renderNav("mission");app.innerHTML=learnScreen(m);
 document.querySelector("#experienceBtn").onclick=()=>{const r=renderScenario(m);app.innerHTML=r.html;r.setup&&r.setup();window.scrollTo(0,0)};
}
function mapView(){
 renderNav("map");const p=percent(state);
 app.innerHTML=`<div class="kicker">MISSION MAP</div><h1 class="section-title">Your CyberLex Journey</h1><p class="lead">${p}% complete • ${state.completed.length}/33 missions cleared</p><div class="progress-shell"><div class="progress-bar" style="width:${p}%"></div></div><div class="grid two" style="margin-top:18px">
 ${zones.map(z=>{const locked=z.missions.some((mid,i)=>!unlockedMission(mid,state)&&!state.completed.includes(mid));return `<div class="card zone ${locked?"locked":""}"><div class="zone-num">0${z.id}</div><h2>${z.title}</h2><p class="muted">${z.subtitle}</p><div class="mission-list">${z.missions.map(mid=>`<div class="mission-row"><span>${state.completed.includes(mid)?"✅":unlockedMission(mid,state)?"▶":"🔒"} ${missions[mid].title}</span><span>${state.completed.includes(mid)?"CLEARED":unlockedMission(mid,state)?"READY":"LOCKED"}</span></div>`).join("")}</div></div>`}).join("")}</div>`;
}
function reportView(){
 renderNav("report");const i=index(state.scores),r=rank(i);
 app.innerHTML=`<div class="kicker">YOUR CYBER JUDGMENT REPORT</div><h1 class="section-title">${r}</h1><p class="lead">${state.name||"Cyber Citizen"} • ${state.completed.length}/33 missions cleared</p>
 <div class="grid three">${Object.entries(state.scores).map(([k,v])=>`<div class="card"><div class="kicker">${k.toUpperCase()}</div><div style="font-size:2.4rem;font-weight:900">${v}</div><div class="progress-shell"><div class="progress-bar" style="width:${v}%"></div></div></div>`).join("")}</div>
 <div class="card"><h3>Badges</h3>${state.badges.length?state.badges.map(b=>`<span class="badge">${b}</span>`).join(""):"<p class='muted'>Clear missions to unlock badges.</p>"}</div>
 <div class="card"><h3>Result code</h3><div class="console">${code(state.scores)}</div><div class="actions"><button class="btn secondary" id="exportBtn">EXPORT MY REPORT</button>${state.finalPassed?`<button class="btn primary" id="certBtn">VIEW CERTIFICATE</button>`:""}</div></div>`;
 document.querySelector("#exportBtn").onclick=()=>downloadJSON();
 const cert=document.querySelector("#certBtn");if(cert)cert.onclick=()=>victory();
}
function downloadJSON(){
 const blob=new Blob([JSON.stringify({...state,resultCode:code(state.scores)},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="CyberLex_Report.json";a.click();URL.revokeObjectURL(a.href)
}
function victory(){
 renderNav("report");const i=index(state.scores),r=rank(i);
 app.innerHTML=`<div class="hero"><div class="kicker">MISSION COMPLETE</div><h1>🏆 YOU LEARNED CYBER LAW THROUGH HANDS-ON INVESTIGATION.</h1><h2>You did not just read it. You experienced it, tested it, investigated it and applied it.</h2>
 <p>Privacy • Permission • Authentication • Phishing • Digital Evidence • AI/Deepfakes • Fraud • Reporting • Responsibility</p>
 <div class="card"><h2>🛡️ CYBER LAW GUARDIAN</h2><p>Final Cyber Judgment Index: <b>${i}</b></p><p>Missions cleared: ${state.completed.length}/33</p><p>Final assessment: ${state.finalPassed?"PASSED":"NOT YET PASSED"}</p></div>
 <div class="remember">You now know that in the digital world, what CAN be done is not always what MAY be done.</div>
 <div class="actions"><button class="btn primary" id="showCert">VIEW CERTIFICATE</button><button class="btn secondary" id="reportAgain">MY REPORT</button><button class="btn secondary" id="replay">REPLAY FINAL MYSTERY</button></div><div id="certArea"></div></div>`;
 document.querySelector("#showCert").onclick=()=>document.querySelector("#certArea").innerHTML=certificateHTML(state.name,state.scores,i,r,code(state.scores));
 document.querySelector("#reportAgain").onclick=reportView;document.querySelector("#replay").onclick=()=>missionView(31);
}
function home(){
 renderNav("home");

 app.innerHTML=`<div class="hero">
 <div class="kicker">CYBERLEX LAB</div>

 <h1>Your Digital Life Is Now a Case File.</h1>

 <h2>Interactive Cyber Law, Security & Digital Evidence Simulator</h2>

 <p>LEARN → EXPERIENCE → DECIDE → INVESTIGATE → DISCOVER LAW → TEST → SCORE → UNLOCK</p>

 <div class="actions">
   <button class="btn primary" id="resume">
     ${state.completed.length?"RESUME MISSION":"START MISSION"}
   </button>

   <button class="btn secondary" id="mapGo">
     VIEW MISSION MAP
   </button>

   ${mode==="instructor"
     ? `<button class="btn secondary" id="instGo">INSTRUCTOR PANEL</button>`
     : ""}
 </div>

 <p class="tiny" style="margin-top:18px;">
   <a href="https://doi.org/10.5281/zenodo.22113998"
      target="_blank"
      rel="noopener noreferrer">
      📘 <b>USER GUIDE</b>
   </a>
 </p>

 <p>
   <b>Dr. Mohammad Amir Khusru Akhtar</b><br>
   Faculty of Computing & Information Technology<br>
   Usha Martin University
 </p>

 <p class="tiny">
   Copyright (C) 2026 Mohammad Amir Khusru Akhtar
 </p>

 </div>`;

 document.querySelector("#resume").onclick=()=>missionView(state.currentMission);
 document.querySelector("#mapGo").onclick=mapView;

 if(mode==="instructor")
   document.querySelector("#instGo").onclick=instructorView;
}
function instructorView(){
 renderNav("home");app.innerHTML=instructorPanel(state);
 document.querySelector("#makeClassLink").onclick=()=>{const mid=document.querySelector("#instMission").value,seed=document.querySelector("#instSeed").value;const u=new URL(location.href);u.search=`?mode=student&mission=${mid}&seed=${encodeURIComponent(seed)}`;document.querySelector("#classLink").textContent=u.toString();navigator.clipboard?.writeText(u.toString());notify("Class link copied if clipboard permission allowed.")};
 document.querySelector("#instOpen").onclick=()=>{state.seed=document.querySelector("#instSeed").value;state.currentMission=Number(document.querySelector("#instMission").value);save();missionView(state.currentMission)};
}
document.querySelector("#menuBtn").onclick=()=>mapView();
renderHUD();renderNav("home");
if(mode==="instructor")home(); else if(qs.has("mission"))missionView(state.currentMission); else home();
if("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
