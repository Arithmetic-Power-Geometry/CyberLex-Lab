
import fs from "node:fs";
import assert from "node:assert/strict";

const missions=JSON.parse(fs.readFileSync(new URL("../data/missions.json", import.meta.url)));
const zones=JSON.parse(fs.readFileSync(new URL("../data/zones.json", import.meta.url)));
const pools=JSON.parse(fs.readFileSync(new URL("../data/scenario-pools.json", import.meta.url)));

assert.equal(Object.keys(missions).length,33,"Expected 33 missions (0-32)");
for(let i=0;i<=32;i++){
  assert.ok(missions[String(i)],`Missing mission ${i}`);
  const m=missions[String(i)];
  for(const k of ["title","zone","concept","tag","learn_title","learn","why","remember","scenario_type","questions"]) assert.ok(k in m,`Mission ${i} missing ${k}`);
  assert.ok(m.questions.length>=3,`Mission ${i} needs at least 3 questions`);
  for(const q of m.questions){assert.equal(q.length,3);assert.ok(q[1][q[2]]!==undefined,`Bad answer index in mission ${i}`)}
}
assert.equal(zones.length,7);
const all=zones.flatMap(z=>z.missions);
assert.deepEqual(all,[...Array(32)].map((_,i)=>i+1),"Zones should cover missions 1-32 once, in order");
for(const d of pools.domains) assert.ok(d.includes(".example"),`Synthetic domain not .example: ${d}`);
const docRanges=["192.0.2.","198.51.100.","203.0.113."];
for(const ip of pools.ips) assert.ok(docRanges.some(p=>ip.startsWith(p)),`IP outside documentation ranges: ${ip}`);
const app=fs.readFileSync(new URL("../js/app.js", import.meta.url),"utf8").toLowerCase();
for(const banned of ["metasploit","hydra ","nmap ","socket(","subprocess","credential capture"]) assert.ok(!app.includes(banned),`Unsafe token: ${banned}`);
assert.ok(missions["0"].author.includes("Dr. Mohammad Amir Khusru Akhtar"));
console.log("CyberLex package tests: PASS");
