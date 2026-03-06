(()=>{const e=document.getElementById('bloqio-topbar');if(!e)return;const B=v=>String(v)==='true',D=!!(window.Shopify&&window.Shopify.designMode);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');
const dec=s=>{const t=document.createElement('textarea');t.innerHTML=String(s);return t.value};
const p2=n=>String(n).padStart(2,'0');
const norm=k=>String(k||'').trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');

const on=()=>B(e.dataset.enabled);
const okDev=()=>{const hm=B(e.dataset.hideMobile),hd=B(e.dataset.hideDesktop),m=matchMedia('(max-width: 749px)').matches;return !((m&&hm)||(!m&&hd))};

const ensureSprite=async()=>{if(document.getElementById('bloqio-icons-sprite'))return true;const url=(e.dataset.bloqioSpriteUrl||'').trim();if(!url)return false;
try{const r=await fetch(url,{credentials:'same-origin'});if(!r.ok)return false;const txt=await r.text();const tmp=document.createElement('div');tmp.innerHTML=txt.trim();
const svg=tmp.querySelector('svg');if(!svg)return false;svg.id='bloqio-icons-sprite';svg.setAttribute('aria-hidden','true');svg.style.position='absolute';svg.style.width='0';svg.style.height='0';svg.style.overflow='hidden';document.body.prepend(svg);return true;}catch(_){return false;}};

const iconOn=()=>e.dataset.iconEnabled==null?true:B(e.dataset.iconEnabled);
const iconHTML=k=>{if(!iconOn())return'';k=norm(k);if(!k)return'';const href=`#bloqio-icon-${k}`;return`<svg class="bloqio-topbar__icon" aria-hidden="true" focusable="false"><use href="${esc(href)}" xlink:href="${esc(href)}"></use></svg>`};

const msgEl=e.querySelector('.bloqio-topbar__msg'),ctaEl=e.querySelector('.bloqio-topbar__cta'),xEl=e.querySelector('.bloqio-topbar__x');
if(!msgEl){e.style.display='none';return;}

const applySticky=()=>{const s=B(e.dataset.sticky);if(s){e.classList.add('is-sticky');document.body&&document.body.classList.add('bloqio-topbar--on');
try{const h=Math.ceil(e.getBoundingClientRect().height||0);document.documentElement.style.setProperty('--bloqio-topbar-h',h?`${h}px`:'0px');}catch(_){}}else{e.classList.remove('is-sticky');document.body&&document.body.classList.remove('bloqio-topbar--on');
try{document.documentElement.style.setProperty('--bloqio-topbar-h','0px');}catch(_){}}};

const dismissKey='bloqio_topbar_dismiss_until';
if(B(e.dataset.dismiss)&&!D){e.classList.add('can-dismiss');const u=parseInt(localStorage.getItem(dismissKey)||'0',10);if(u&&Date.now()<u){e.style.display='none';return;}}
if(xEl){if(B(e.dataset.dismiss))xEl.addEventListener('click',()=>{const h=Math.max(1,parseInt(e.dataset.rememberHours||'24',10));
try{localStorage.setItem(dismissKey,String(Date.now()+h*3600000));}catch(_){ }e.style.display='none';document.body&&document.body.classList.remove('bloqio-topbar--on');});
else xEl.style.display='none';}
if(ctaEl&&(!ctaEl.getAttribute('href')||ctaEl.getAttribute('href')===''))ctaEl.style.display='none';

const parseMsgs=()=>{const s=dec(e.dataset.messages||'');const raw=s.split('|').map(x=>x.trim()).filter(Boolean);
const out=raw.map(line=>{const k=line.indexOf(':');if(k===-1)return{t:'m',i:'',x:line};return{t:'m',i:line.slice(0,k).trim(),x:line.slice(k+1).trim()}}).filter(m=>m.x);
return out.length?out:[{t:'m',i:'truck',x:'Envío rápido 24–72h'}]};

let endStr=null,endDate=null;const parseEnd=s=>{const m=s.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);if(!m)return null;const[_,y,mo,d,hh,mm]=m;return new Date(+y,+mo-1,+d,+hh,+mm,0)};
const cdOn=()=>B(e.dataset.countdown),cdInRot=()=>B(e.dataset.countdownInRotation);
const getEnd=()=>{if(!cdOn())return null;const s=(e.dataset.countdownEnd||'').trim();if(!s)return null;if(s!==endStr){endStr=s;endDate=parseEnd(s)}return endDate};
const fmtCd=()=>{const ed=getEnd();if(!ed)return null;const diff=ed.getTime()-Date.now();if(diff<=0)return null;const sec=Math.floor(diff/1000);
const days=Math.floor(sec/86400),rem=sec%86400,hh=Math.floor(rem/3600),mm=Math.floor((rem%3600)/60),ss=rem%60;
const pre=dec((e.dataset.countdownPrefix||'Oferta termina en')).trim();const suf=dec((e.dataset.countdownSuffix||'')).trim();
const time=`${p2(days)}d:${p2(hh)}h:${p2(mm)}m:${p2(ss)}s`;return(!pre&&!suf)?time:(!pre?`${time}${suf?' '+suf:''}`:`${pre} ${time}${suf?' '+suf:''}`)};
const getList=()=>{const base=parseMsgs();if(cdOn()&&getEnd())return cdInRot()?[{t:'c',i:'bolt',x:''},...base]:[{t:'c',i:'bolt',x:''}];return base};

const render=m=>{if(!m)return; if(m.t==='c'){const t=fmtCd();if(!t){const l=parseMsgs();return render(l[0]);}
const te=esc(t),svg=iconHTML('bolt');msgEl.innerHTML=svg?`<span class="bloqio-topbar__msgIcon">${svg}</span><span class="bloqio-topbar__msgText">${te}</span>`:`<span class="bloqio-topbar__msgText">${te}</span>`;return;}
const tx=esc(m.x||''),svg=iconHTML(m.i);msgEl.innerHTML=svg?`<span class="bloqio-topbar__msgIcon">${svg}</span><span class="bloqio-topbar__msgText">${tx}</span>`:`<span class="bloqio-topbar__msgText">${tx}</span>`;};

const rotOn=()=>B(e.dataset.rotate),rotSec=()=>Math.max(2,parseInt(e.dataset.rotateSeconds||'5',10));
const start=()=>{applySticky();e.style.display='block';let l=getList(),i=0;render(l[0]);
try{e.__ct&&clearInterval(e.__ct);e.__rt&&clearInterval(e.__rt);}catch(_){}
e.__ct=setInterval(()=>{l=getList();const cur=l[i%l.length];if(cur&&cur.t==='c')render(cur)},1000);
if(rotOn())e.__rt=setInterval(()=>{l=getList();if(!rotOn()||l.length<=1){applySticky();return;}i=(i+1)%l.length;render(l[i])},rotSec()*1000);
if(D&&window.MutationObserver){const w=new Set(['data-enabled','data-messages','data-rotate','data-rotate-seconds','data-countdown','data-countdown-in-rotation','data-countdown-end','data-countdown-prefix','data-countdown-suffix','data-hide-mobile','data-hide-desktop','data-sticky','data-icon-enabled']);
new MutationObserver(ms=>{for(const m of ms){if(m.type==='attributes'&&w.has(m.attributeName)){start();break;}}}).observe(e,{attributes:true});}};

const boot=async()=>{if(!on()||!okDev()){e.style.display='none';return;}await ensureSprite();start();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();