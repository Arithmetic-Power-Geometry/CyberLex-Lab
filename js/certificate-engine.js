
export function certificateHTML(name,score,index,rank,code){
 const d=new Date().toLocaleDateString();
 return `<div class="certificate"><h1>CyberLex Lab</h1><p>Certificate of Hands-on Learning Completion</p>
 <div class="name">${name||"Cyber Citizen"}</div>
 <p>completed the guided Cyber Law, Security & Digital Evidence simulation and final assessment.</p>
 <h2>🏆 ${rank}</h2><p>Cyber Judgment Index: <b>${index}</b></p><p>${code}</p><p>${d}</p>
 <p><b>Dr. Mohammad Amir Khusru Akhtar</b><br>Faculty of Computing & Information Technology<br>Usha Martin University</p>
 <p class="tiny">Copyright (C) 2026 Mohammad Amir Khusru Akhtar</p></div>`;
}
