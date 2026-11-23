'use strict';
(() => {
  const el=id=>document.getElementById(id), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const entrance=el('entrance'), inside=el('inside'), nav=el('nav'), menu=el('navToggle');
  const sky=document.querySelector('.sky'),art=document.querySelector('.art');
  for(let i=0;i<54;i++){
    const star=document.createElement('i');
    star.textContent=i%8===0?'✧':'·';
    Object.assign(star.style,{top:(Math.random()*95)+'%',left:(Math.random()*100)+'%',fontSize:(i%8===0?9+Math.random()*7:6+Math.random()*12)+'px'});
    star.style.setProperty('--opacity',(.24+Math.random()*.38).toFixed(2));
    star.style.setProperty('--period',(3+Math.random()*4)+'s');
    star.style.setProperty('--delay',(-Math.random()*6)+'s');
    sky.append(star);
  }
  const pause=ms=>new Promise(done=>setTimeout(done,ms));
  async function enter(){
    const open=el('openLetter');open.disabled=true;
    window.Letter.startMusic();
    entrance.classList.add('opening');
    window.Letter.burst(document.querySelector('.seal'),30);
    const skip=reduced.matches;
    if(!skip){
      await pause(800);
      const words='Come sit with me a while, Baby Julie.';
      el('intro').setAttribute('aria-label',words);
      for(let i=1;i<=words.length;i++){el('intro').textContent=words.slice(0,i);await pause(43);}
      await pause(1830);
      if(entrance.animate) await entrance.animate([{opacity:1},{opacity:0}],{duration:650,fill:'forwards'}).finished;
    }
    entrance.hidden=true;inside.hidden=false;inside.classList.add('visible');nav.hidden=false;menu.hidden=false;
    window.scrollTo({top:0,behavior:'instant'});el('welcomeTitle').focus({preventScroll:true});
    syncProgress();observeSections();
  }
  el('openLetter').addEventListener('click',enter,{once:true});
  function setMenu(open){menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('mobile-open',open);}
  menu.onclick=()=>setMenu(menu.getAttribute('aria-expanded')!=='true');
  nav.addEventListener('click',()=>setMenu(false));
  document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!menu.contains(e.target))setMenu(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus();}});
  const progress=el('progress');
  function syncProgress(){const range=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(!inside.hidden&&range>0?Math.min(1,Math.max(0,scrollY/range)):0)+')';}
  addEventListener('scroll',syncProgress,{passive:true});addEventListener('resize',syncProgress);
  function revealGolden(){
    if(reduced.matches) return;
    const p=el('goldenText'),parts=p.textContent.match(/[^.!?]+[.!?]+/g);
    if(!parts)return;
    const spans=parts.map((sentence,i)=>{const span=document.createElement('span');span.textContent=sentence;span.className='golden-sentence';span.style.setProperty('--delay',(i*.55)+'s');return span;});
    p.replaceChildren(...spans);
  }
  function observeSections(){
    if(!('IntersectionObserver' in window)){revealGolden();return;}
    const sectionObserver=new IntersectionObserver(entries=>{
      for(const entry of entries) if(entry.isIntersecting){
        nav.querySelectorAll('a').forEach(a=>{
          const match=a.hash==='#'+entry.target.id;
          a.classList.toggle('current',match);
          if(match)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
        });
      }
    },{rootMargin:'-12% 0px -50% 0px'});
    inside.querySelectorAll('section').forEach(s=>sectionObserver.observe(s));
    const goldenObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){revealGolden();goldenObserver.disconnect();}});
    goldenObserver.observe(el('goldenText'));
  }
  const cursor=document.querySelector('.cursor');
  if(matchMedia('(pointer:fine)').matches){
    document.addEventListener('pointermove',e=>{
      if(reduced.matches){cursor.classList.remove('active');return;}
      cursor.classList.add('active');cursor.classList.toggle('hover',Boolean(e.target.closest('button,a,input')));
      cursor.style.transform='translate('+e.clientX+'px,'+e.clientY+'px) translate(-50%,-50%)';
      if(!entrance.hidden&&!entrance.classList.contains('opening')){
        art.style.setProperty('--dx',((e.clientX/innerWidth-.5)*4)+'px');
        art.style.setProperty('--dy',((e.clientY/innerHeight-.5)*3)+'px');
      }
    },{passive:true});
    document.addEventListener('pointerout',e=>{if(!e.relatedTarget)cursor.classList.remove('active');});
  }
})();
