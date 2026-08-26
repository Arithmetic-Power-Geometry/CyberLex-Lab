
export function legalDetails(m,legal){
 return `<details><summary>Explore Indian legal context</summary>
 <p class="tiny">${legal.notice}</p>
 <ul>${legal.india.map(x=>`<li>${x}</li>`).join("")}</ul>
 <p class="tiny">The simulator teaches principles and does not automatically assign criminal liability from short fact patterns.</p></details>`;
}
