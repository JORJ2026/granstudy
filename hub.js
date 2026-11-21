
const APPS={
  math:{title:"Gran’s Math Tutor",src:"apps/math.html"},
  words:{title:"Practice",src:"apps/words.html"}
};
const $=s=>document.querySelector(s),shell=$("#shell"),home=$("#home"),bar=$("#bar");
const frames={};let active=null;
function show(k){
  active=k;home.hidden=true;bar.classList.add("on");$("#bt").textContent=APPS[k].title;
  if(!frames[k]){
    const f=document.createElement("iframe");f.className="frame";f.title=APPS[k].title;
    f.setAttribute("allow","autoplay");f.src=APPS[k].src;shell.appendChild(f);frames[k]=f;
  }
  for(const j in frames)frames[j].hidden=j!==k;if(k=="math"){try{frames[k].contentWindow.welcome()}catch(e){}}
  try{frames[k].focus()}catch(e){}
}
function goHome(){
  active=null;bar.classList.remove("on");home.hidden=false;
  for(const j in frames)frames[j].hidden=true;
  try{speechSynthesis.cancel()}catch(e){}
}
document.querySelectorAll(".app").forEach(b=>b.onclick=()=>show(b.dataset.a));
$("#hb").onclick=goHome;
window.addEventListener("message",function(e){if(e.data&&typeof e.data.henryExam!=="undefined")bar.style.display=e.data.henryExam?"none":""});
$("#hero").onclick=()=>QUACK(1);$("#hero").onkeydown=e=>{if(e.key==="Enter"||e.key===" ")QUACK(1)};
