let supabaseClient=null;
function configured(){return window.SUPABASE_URL&&!window.SUPABASE_URL.includes("YOUR_")&&window.SUPABASE_ANON_KEY&&!window.SUPABASE_ANON_KEY.includes("YOUR_")}
function msg(el,text,type=""){el.textContent=text;el.className=`message ${type}`;}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

async function init(){
  if(!configured()){msg(document.getElementById("loginMessage"),"Add Supabase URL and anon key in assets/config.js.","error");return}
  const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=async()=>{
    supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
    const {data}=await supabaseClient.auth.getSession();
    if(data.session) showDashboard(); else showLogin();
  };document.head.appendChild(s);
}
function showLogin(){document.getElementById("loginPanel").classList.remove("hidden");document.getElementById("dashboard").classList.add("hidden")}
async function showDashboard(){document.getElementById("loginPanel").classList.add("hidden");document.getElementById("dashboard").classList.remove("hidden");await loadAdmin()}
document.getElementById("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!supabaseClient)return;
 const {error}=await supabaseClient.auth.signInWithPassword({email:email.value,password:password.value});
 if(error)msg(loginMessage,error.message,"error");else showDashboard();
});
logoutBtn.addEventListener("click",async()=>{await supabaseClient.auth.signOut();showLogin()});

async function loadAdmin(){
 const {data,error}=await supabaseClient.from("pdfs").select("*").order("created_at",{ascending:false});
 if(error){msg(uploadMessage,error.message,"error");return}
 totalCount.textContent=data.length;categoryCount.textContent=new Set(data.map(x=>x.category)).size;
 adminList.innerHTML=data.length?data.map(x=>`<div class="admin-item"><div><h3>${esc(x.title)}</h3><p>${esc(x.category)} · ${esc(x.status)}</p></div><div class="admin-actions"><a class="btn" href="${esc(x.file_url)}" target="_blank">View</a><button class="btn danger" onclick="deletePdf('${esc(x.id)}','${esc(x.storage_path||"")}')">Delete</button></div></div>`).join(""):"<p>No PDFs yet.</p>";
}
uploadForm.addEventListener("submit",async e=>{
 e.preventDefault();
 if(!supabaseClient)return;
 const file=pdfFile.files[0];if(!file||file.type!=="application/pdf"){msg(uploadMessage,"Please select a PDF file.","error");return}
 msg(uploadMessage,"Uploading...");
 try{
  const path=`${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
  const up=await supabaseClient.storage.from(SUPABASE_BUCKET).upload(path,file,{contentType:"application/pdf"});
  if(up.error)throw up.error;
  const {data:urlData}=supabaseClient.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  const ins=await supabaseClient.from("pdfs").insert({title:pdfTitle.value,description:pdfDescription.value,category:pdfCategory.value,status:"approved",file_url:urlData.publicUrl,storage_path:path});
  if(ins.error)throw ins.error;
  uploadForm.reset();msg(uploadMessage,"PDF uploaded successfully.","success");await loadAdmin();
 }catch(e){msg(uploadMessage,e.message,"error")}
});
async function deletePdf(id,path){
 if(!confirm("Delete this PDF?"))return;
 const d=await supabaseClient.from("pdfs").delete().eq("id",id);
 if(d.error){alert(d.error.message);return}
 if(path)await supabaseClient.storage.from(SUPABASE_BUCKET).remove([path]);
 await loadAdmin();
}
init();