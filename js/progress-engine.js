
export function unlockedMission(id,progress){
 if(id===0)return true;
 if(id===1)return progress.completed.includes(0);
 return progress.completed.includes(id-1);
}
export function missionPassed(id,progress){return progress.completed.includes(id)}
export function percent(progress,total=33){return Math.round(progress.completed.length/total*100)}
export function canFinal(progress){return Array.from({length:31},(_,i)=>i).every(i=>progress.completed.includes(i))}
