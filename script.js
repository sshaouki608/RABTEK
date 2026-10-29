/* رابطك | RABTEK — المنطق التفاعلي. البيانات تجريبية والروابط رسمية، لكن لم يتم التحقق منها آليًا. */
const CATS = {
  game:{n:'الألعاب',c:'#7c5cff'}, app:{n:'التطبيقات',c:'#22a0f0'},
  program:{n:'البرامج',c:'#14b8a6'}, site:{n:'المواقع',c:'#f59e0b'},
  ai:{n:'الذكاء الاصطناعي',c:'#ec4899'}, tool:{n:'الأدوات',c:'#84cc16'}
};
const TYPE = {game:'لعبة',app:'تطبيق',program:'برنامج',site:'موقع',ai:'أداة',tool:'أداة'};

const DATA = [
  {id:'picsart-premium',name:'PicsArt Premium',cat:'app',url:'https://www.mediafire.com/file/llhw1dpz8dfixaz/picsart_premium.apk/file',desc:'تحميل تطبيق بيكس آرت بريمير PicsArt Premium APK لتعديل الصور وتصميم الجرافيك.',added:'2026-10-29',isNew:1,pop:1},
  {id:'capcut-pro',name:'CapCut Pro',cat:'app',url:'https://www.mediafire.com/file/vkmq0koyokxf8le/CapCut_Pro.apk/file',desc:'تحميل تطبيق كاب كات برو CapCut Pro APK للمونتاج وتعديل الفيديو.',added:'2026-10-29',isNew:1,pop:1},
  {id:'minecraft-apk',name:'Minecraft 1.26.70.22',cat:'game',url:'https://www.mediafire.com/file/0wj2i0q3cknkuka/minecraft-26-70-22.apk/file',desc:'تحميل لعبة ماينكرافت إصدار 1.26.70.22 APK.',added:'2026-10-29',isNew:1,pop:1}
];

const $ = s => document.querySelector(s);
const store = {
  get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{ return d } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)) }catch{} }
};
const esc = s => String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const state = {q:'', cat:'all', sort:'new', favOnly:false, favs:new Set(store.get('rabtek:favs',[]))};

function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toast.id); toast.id=setTimeout(()=>t.classList.remove('show'),2200);
}

/* بطاقة مورد */
function card(r){
  const c=CATS[r.cat], fav=state.favs.has(r.id);
  return `<article class="card" style="--c:${c.c}">
    <div class="head"><div class="ico" aria-hidden="true">${esc(r.name[0])}</div><h3>${esc(r.name)}</h3></div>
    <div class="meta"><span class="tag">${c.n}</span><span class="tag">${TYPE[r.cat]}</span>${r.isNew?'<span class="tag new">جديد</span>':''}</div>
    <p>${esc(r.desc)}</p>
    <div class="act"><a class="btn" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">فتح الرابط / التحميل</a>
    <button class="fav" data-id="${r.id}" aria-pressed="${fav}" aria-label="${fav?'إزالة':'إضافة'} ${esc(r.name)} ${fav?'من':'إلى'} المفضلة">${fav?'♥':'♡'}</button></div></article>`;
}

const reveal = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('in');reveal.unobserve(e.target)} }),{threshold:.1});
function fill(sel,list){ const el=$(sel); el.innerHTML=list.map(card).join(''); el.querySelectorAll('.card').forEach(c=>reveal.observe(c)); }

/* عرض كل الأقسام */
function render(){
  const q=state.q.trim().toLowerCase();
  let list=DATA.filter(r=>(state.cat==='all'||r.cat===state.cat)&&(!state.favOnly||state.favs.has(r.id))&&(!q||(r.name+' '+r.desc).toLowerCase().includes(q)));
  list.sort(state.sort==='name'?(a,b)=>a.name.localeCompare(b.name,'ar'):(a,b)=>b.added.localeCompare(a.added));
  fill('#grid',list);
  $('#empty').hidden=list.length>0;
  $('#count').textContent=`(${list.length})`;
  $('#clear').hidden=!state.q;
  document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',String(state.favOnly?c.dataset.k==='fav':!state.favOnly&&c.dataset.k===state.cat)));
  fill('#gLatest',[...DATA].sort((a,b)=>b.added.localeCompare(a.added)).slice(0,6));
  fill('#gPopular',DATA.filter(r=>r.pop).slice(0,6));
  fill('#gAi',DATA.filter(r=>r.cat==='ai'||r.cat==='tool'));
}

/* التصنيفات والفلاتر */
$('#cats').innerHTML=Object.entries(CATS).map(([k,v])=>`<button class="cat" style="--c:${v.c}" data-k="${k}"><b>${v.n}</b><span>${DATA.filter(r=>r.cat===k).length} موارد</span></button>`).join('');
$('#chips').innerHTML=[['all','الكل'],...Object.entries(CATS).map(([k,v])=>[k,v.n]),['fav','♥ المفضلة']].map(([k,n])=>`<button class="chip" data-k="${k}" aria-pressed="false">${n}</button>`).join('');
$('#catSel').innerHTML=Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join('');

function setCat(k){ state.favOnly=k==='fav'; state.cat=state.favOnly?'all':k; render(); }
document.addEventListener('click',e=>{
  const fav=e.target.closest('.fav');
  if(fav){ const id=fav.dataset.id; state.favs.has(id)?(state.favs.delete(id),toast('أُزيل من المفضلة')):(state.favs.add(id),toast('أُضيف إلى المفضلة')); store.set('rabtek:favs',[...state.favs]); render(); return; }
  const cat=e.target.closest('.cat'); if(cat){ setCat(cat.dataset.k); $('#all').scrollIntoView(); return; }
  const chip=e.target.closest('.chip'); if(chip){ setCat(chip.dataset.k); return; }
  const nav=e.target.closest('#menu a'); if(nav){ if(nav.dataset.cat) setCat(nav.dataset.cat); closeMenu(); }
});
$('#q').addEventListener('input',e=>{ state.q=e.target.value; render(); });
$('#heroSearch').addEventListener('submit',e=>{ e.preventDefault(); $('#all').scrollIntoView(); });
$('#clear').onclick=()=>{ $('#q').value=''; state.q=''; render(); toast('تم مسح البحث'); };
$('#reset').onclick=()=>{ $('#q').value=''; Object.assign(state,{q:'',cat:'all',favOnly:false}); render(); };
$('#sort').onchange=e=>{ state.sort=e.target.value; render(); };

/* القائمة والوضع الداكن/الفاتح */
function closeMenu(){ $('#menu').classList.remove('open'); $('#burger').setAttribute('aria-expanded','false'); }
$('#burger').onclick=()=>{ const o=$('#menu').classList.toggle('open'); $('#burger').setAttribute('aria-expanded',String(o)); };
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeMenu(); });
const applyTheme=t=>document.documentElement.dataset.theme=t;
applyTheme(store.get('rabtek:theme',matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));
$('#theme').onclick=()=>{ const t=document.documentElement.dataset.theme==='light'?'dark':'light'; applyTheme(t); store.set('rabtek:theme',t); toast(t==='light'?'الوضع الفاتح':'الوضع الداكن'); };

/* نموذج الاقتراح: حفظ محلي فقط */
$('#form').addEventListener('submit',e=>{
  e.preventDefault();
  const f=e.target, d=Object.fromEntries(new FormData(f)); let ok=true;
  for(const el of f.elements){ if(el.name) el.classList.remove('err'); }
  for(const k of ['name','desc']) if(!d[k].trim()){ f.elements[k].classList.add('err'); ok=false; }
  try{ if(new URL(d.url).protocol!=='https:') throw 0; }catch{ f.elements.url.classList.add('err'); ok=false; }
  if(!ok) return toast('راجع الحقول المحددة (الرابط يبدأ بـ https://)');
  const list=store.get('rabtek:suggestions',[]); list.push({...d,at:new Date().toISOString()}); store.set('rabtek:suggestions',list);
  const text=`اقتراح رابط\nالاسم: ${d.name}\nالرابط: ${d.url}\nالتصنيف: ${CATS[d.cat].n}\nالوصف: ${d.desc}`;
  const box=$('#saved'); box.hidden=false;
  box.innerHTML='<p>حُفظ الاقتراح في متصفحك فقط، ولم يُرسل إلى أحد. انسخ النص وأرسله يدويًا:</p><pre></pre><button class="btn" type="button">نسخ النص</button>';
  box.querySelector('pre').textContent=text;
  box.querySelector('button').onclick=()=>navigator.clipboard?.writeText(text).then(()=>toast('تم النسخ'),()=>toast('تعذر النسخ، حدد النص يدويًا'));
  f.reset(); toast('تم الحفظ محليًا');
});

render();
