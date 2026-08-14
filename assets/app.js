const state={items:[]};

function configured(){
  return window.SUPABASE_URL && !window.SUPABASE_URL.includes("YOUR_") &&
         window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.includes("YOUR_");
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
async function load(){
  const grid=document.getElementById("pdfGrid"), empty=document.getElementById("emptyState");
  if(!configured()){
    grid.innerHTML='<div class="empty">Connect Supabase in <b>assets/config.js</b> to load PDFs.</div>'; return;
  }
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/pdfs?select=*&status=eq.approved&order=created_at.desc`,{headers:{apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${SUPABASE_ANON_KEY}`}});
    if(!r.ok) throw new Error("Could not load PDFs");
    state.items=await r.json(); render();
  }catch(e){grid.innerHTML=`<div class="empty">${esc(e.message)}</div>`}
}
function render(){
  const q=document.getElementById("searchInput").value.toLowerCase(), c=document.getElementById("categoryFilter").value;
  const items=state.items.filter(x=>(!q||`${x.title} ${x.description} ${x.category}`.toLowerCase().includes(q))&&(!c||x.category===c));
  const grid=document.getElementById("pdfGrid"); document.getElementById("emptyState").classList.toggle("hidden",items.length>0);
  grid.innerHTML=items.map(x=>`<article class="card"><div class="pdf-icon">PDF</div><span class="tag">${esc(x.category)}</span><h3>${esc(x.title)}</h3><p>${esc(x.description||"No description")}</p><div class="card-actions"><a class="btn" href="${esc(x.file_url)}" target="_blank" rel="noopener">View</a><a class="btn primary" href="${esc(x.file_url)}" download>Download</a></div></article>`).join("");
}
document.getElementById("searchInput").addEventListener("input",render);
document.getElementById("categoryFilter").addEventListener("change",render);
load().then(()=>{const s=document.getElementById("categoryFilter");[...new Set(state.items.map(x=>x.category).filter(Boolean))].sort().forEach(c=>s.insertAdjacentHTML("beforeend",`<option>${esc(c)}</option>`));});