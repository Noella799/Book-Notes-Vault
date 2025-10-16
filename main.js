const KEY="bnv:data:v1",SKEY="bnv:settings:v1";
const storage={load:()=>JSON.parse(localStorage.getItem(KEY)||"[]"),
save:d=>localStorage.setItem(KEY,JSON.stringify(d)),
loadS:()=>JSON.parse(localStorage.getItem(SKEY)||"{}"),
saveS:s=>localStorage.setItem(SKEY,JSON.stringify(s))};

const re={
title:/^\S(?:.*\S)?$/,author:/^\S(?:.*\S)?$/,pages:/^(0|[1-9]\d*)$/,
date:/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
tag:/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,dup:/\b(\w+)\s+\1\b/i};
const compile=(i,f="i")=>{try{return i?new RegExp(i,f):null}catch{return null}};
const mark=(t,r)=>!r?t:at.replace(r,m=>`<mark>${m}</mark>`);

let data=storage.load(),set=Object.assign({speed:1.5,target:1000},storage.loadS());
if(!data.length){
 const d=n=>new Date(Date.now()-n*86400000).toISOString().slice(0,10);
 const n=new Date().toISOString();
 data=[
  {id:"1",title:"Clean Code",author:"Robert C. Martin",pages:464,tag:"Programming",dateAdded:d(2),createdAt:n,updatedAt:n},
  {id:"2",title:"Deep Work",author:"Cal Newport",pages:304,tag:"Focus",dateAdded:d(5),createdAt:n,updatedAt:n},
  {id:"3",title:"Atomic Habits",author:"James Clear",pages:320,tag:"Habits",dateAdded:d(1),createdAt:n,updatedAt:n}
 ];
 storage.save(data);
}

const $=id=>document.getElementById(id);
const els={tb:$("tbody"),search:$("search"),title:$("title"),author:$("author"),pages:$("pages"),tag:$("tag"),
date:$("dateAdded"),err:$("formErrors"),speed:$("readSpeed"),target:$("targetPages"),
count:$("stat-count"),pagesStat:$("stat-pages"),top:$("stat-top"),bars:$("bars"),cap:$("capMsg")};

function render(){
 const rows=data.map(r=>`<tr>
 <td data-label="Date">${r.dateAdded}</td>
 <td data-label="Title">${r.title}</td>
 <td data-label="Author">${r.author}</td>
 <td data-label="Tag">${r.tag}</td>
 <td data-label="Pages">${r.pages}</td>
 <td data-label="Actions"><button onclick="edit('${r.id}')">Edit</button>
 <button onclick="delRec('${r.id}')">Del</button></td></tr>`).join("");
 els.tb.innerHTML=rows;stats();
}
function stats(){
 els.count.textContent=data.length;
 const sum=data.reduce((s,r)=>s+r.pages,0);
 els.pagesStat.textContent=sum;
 const top=Object.entries(data.reduce((m,r)=>(m[r.tag]=(m[r.tag]||0)+1,m),{})).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—";
 els.top.textContent=top;
 const days=[...Array(7)].map((_,i)=>{const d=new Date(Date.now()-(6-i)*86400000).toISOString().slice(0,10);
  return data.filter(r=>r.dateAdded===d).length});
 const max=Math.max(1,...days);
 els.bars.innerHTML=days.map(v=>`<div class='bar' style='height:${v/max*100}%'></div>`).join("");
 const month=new Date().toISOString().slice(0,7);
 const monthPages=data.filter(r=>r.dateAdded.startsWith(month)).reduce((s,r)=>s+r.pages,0);
 if(set.target>0){
  const diff=set.target-monthPages;
  if(diff>=0){els.cap.className='ok';els.cap.textContent=`${diff} pages left`;}
  else{els.cap.className='bad';els.cap.textContent=`Over by ${Math.abs(diff)} pages`;}
 }
}
function edit(id){
 const r=data.find(x=>x.id===id);
 $("recId").value=r.id;els.title.value=r.title;els.author.value=r.author;
 els.pages.value=r.pages;els.tag.value=r.tag;els.date.value=r.dateAdded;
}
function delRec(id){data=data.filter(r=>r.id!==id);storage.save(data);render();}
$("bkForm").onsubmit=e=>{
 e.preventDefault();
 const t=els.title.value.trim(),a=els.author.value.trim(),p=els.pages.value.trim(),tag=els.tag.value.trim(),d=els.date.value.trim();
 const errs=[];if(!re.title.test(t))errs.push("Bad title");if(re.dup.test(t))errs.push("Dup word");
 if(!re.author.test(a))errs.push("Bad author");if(!re.pages.test(p))errs.push("Bad pages");
 if(!re.date.test(d))errs.push("Bad date");if(!re.tag.test(tag))errs.push("Bad tag");
 if(errs.length){els.err.textContent=errs.join(" ");return}
 const id=$("recId").value||Math.random().toString(36).slice(2,8);
 const r={id,title:t,author:a,pages:+p,tag,dateAdded:d,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
 const i=data.findIndex(x=>x.id===id);if(i>-1)data[i]=r;else data.push(r);
 storage.save(data);els.err.textContent="";e.target.reset();render();
};
$("saveSettings").onclick=()=>{set.speed=+els.speed.value||1.5;set.target=+els.target.value||0;storage.saveS(set);render();}
els.search.oninput=()=>{const rexp=compile(els.search.value);if(!rexp){render();return}
 const f=data.filter(r=>rexp.test(r.title)||rexp.test(r.author)||rexp.test(r.tag));
 els.tb.innerHTML=f.map(r=>`<tr><td>${r.dateAdded}</td><td>${mark(r.title,rexp)}</td><td>${mark(r.author,rexp)}</td><td>${mark(r.tag,rexp)}</td><td>${r.pages}</td><td></td></tr>`).join("");
};
render();

