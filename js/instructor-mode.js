
export function instructorPanel(state,go){
 const q=new URLSearchParams(location.search);
 const seed=q.get("seed")||state.seed;
 return `<section class="card"><span class="pill">INSTRUCTOR MODE</span><h2>Class Control Panel</h2>
 <div class="formrow"><label class="field">Mission<select id="instMission">${Array.from({length:33},(_,i)=>`<option value="${i}" ${i==state.currentMission?"selected":""}>Mission ${i}</option>`).join("")}</select></label>
 <label class="field">Difficulty<select id="instDiff"><option>Basic</option><option>Investigator</option><option>Expert</option></select></label>
 <label class="field">Scenario seed<input id="instSeed" value="${seed}"></label>
 <label class="field">Timer<select id="instTimer"><option value="0">Off</option><option value="60">60 sec</option><option value="90">90 sec</option></select></label></div>
 <div class="actions"><button class="btn primary" id="makeClassLink">Create class link</button><button class="btn secondary" id="instOpen">Open selected mission</button></div>
 <div id="classLink" class="console"></div><p class="tiny">Students using the same seed receive the same generated scenario. GitHub Pages has no central live-sync backend.</p></section>`;
}
