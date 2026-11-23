'use strict';
(() => {
  const data = window.Letter, el = id => document.getElementById(id);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function make(tag, cls, text) {
    const node = document.createElement(tag);
    if(cls) node.className = cls;
    if(text !== undefined) node.textContent = text;
    return node;
  }
  function motif(name) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns,'svg'), use = document.createElementNS(ns,'use');
    const view = {twig:'-8 -90 110 106',bloom:'-28 -28 56 56'};
    svg.setAttribute('viewBox',view[name] || '0 0 24 24');
    svg.setAttribute('aria-hidden','true'); use.setAttribute('href','#'+name); svg.append(use);
    return svg;
  }
  function burst(anchor,count=14) {
    if(reduced() || !Element.prototype.animate) return;
    const rect = anchor.getBoundingClientRect();
    for(let i=0;i<count;i++) {
      const p = make('span','burst',i%3 ? '✧' : '✦'), angle = 2*Math.PI*i/count;
      const distance = 38+Math.random()*85;
      p.setAttribute('aria-hidden','true');
      Object.assign(p.style,{left:(rect.left+rect.width/2)+'px',top:(rect.top+rect.height/2)+'px',fontSize:(7+Math.random()*10)+'px'});
      document.body.append(p);
      p.animate([{transform:'scale(.3)',opacity:0},{opacity:.95,offset:.17},{transform:'translate('+Math.cos(angle)*distance+'px,'+Math.sin(angle)*distance+'px) scale(.75)',opacity:0}],{duration:850+Math.random()*500,easing:'ease-out'}).onfinish=()=>p.remove();
    }
  }
  data.burst = burst;
  const dialog = el('chapterDialog');
  data.chapters.forEach((chapter,i) => {
    const card = make('button','chapter-card'), art = make('span','chapter-motif');
    art.append(motif(chapter.motif));
    card.append(make('span','chapter-index','Chapter '+(i+1)),art,make('span','chapter-name',chapter.title));
    card.setAttribute('aria-haspopup','dialog');
    card.addEventListener('click',() => {
      el('chapterNumber').textContent = 'Chapter '+(i+1)+' of five';
      el('chapterTitle').textContent = chapter.title;
      el('chapterText').textContent = chapter.text;
      el('chapterMotif').replaceChildren(motif(chapter.motif));
      dialog.style.setProperty('--reveal',chapter.motion);
      dialog.showModal();
    });
    el('chapterGrid').append(card);
  });
  function closeChapter(){
    if(dialog.classList.contains('closing')) return;
    dialog.classList.add('closing');
    setTimeout(()=>{dialog.close();dialog.classList.remove('closing');},reduced()?0:220);
  }
  el('closeChapter').addEventListener('click',closeChapter);
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeChapter();});
  dialog.addEventListener('click',e=>{if(e.target===dialog) closeChapter();});
  let index=0;
  const quiz=el('quiz');
  function renderQuestion(focus=false){
    quiz.replaceChildren();
    if(index===data.questions.length){
      const h=make('h3','','You know my heart, Baby Julie.');
      h.tabIndex=-1;
      const replay=make('button','paper-btn','Play again');
      replay.onclick=()=>{index=0;renderQuestion(true);};
      quiz.append(make('span','quiz-count','All four, with love'),h,make('p','quiz-feedback','Every answer brings me back to you.'),replay);
      if(focus)h.focus({preventScroll:true});return;
    }
    const q=data.questions[index], h=make('h3','',q.q), answers=make('div','quiz-options');
    h.tabIndex=-1;
    const feedback=make('p','quiz-feedback'), next=make('button','paper-btn',index===3?'Finish the game':'Next question');
    feedback.setAttribute('role','status');next.hidden=true;
    next.onclick=()=>{index++;renderQuestion(true);};
    q.a.forEach((label,j)=>{
      const b=make('button','',label);answers.append(b);
      b.onclick=()=>{
        const correct=j===q.yes;
        feedback.textContent=correct?q.reply:q.retry;
        if(correct){
          next.hidden=false; burst(b);
          answers.querySelectorAll('button').forEach(item=>item.disabled=true);
          next.focus({preventScroll:true});
        }
      };
    });
    quiz.append(make('span','quiz-count','Question '+(index+1)+' of four'),h,answers,feedback,next);
    if(focus) h.focus({preventScroll:true});
  }
  renderQuestion();
  let bag=[],last=-1;
  function reminder(){
    if(!bag.length){
      bag=data.reminders.map((_,i)=>i);
      for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
      if(bag[bag.length-1]===last) [bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];
    }
    last=bag.pop();return data.reminders[last];
  }
  const output=el('surpriseOutput');
  const gifts=[
    ['Send Me a Hug',()=>{output.append(make('span','heart-gift','♡'),make('p','','Imagine me giving you the warmest hug right now.'));}],
    ['A Thousand Kisses',()=>{
      output.append(make('span','kiss-gift','× × ×'),make('p','','One kiss for your forehead, one for your cheek, and all the rest for when I see you, Baby Julie.'));
      if(!reduced()) for(let i=0;i<12;i++){
        const kiss=make('span','kiss-mark','x');kiss.setAttribute('aria-hidden','true');
        Object.assign(kiss.style,{left:(6+Math.random()*88)+'%',top:(38+Math.random()*50)+'%',animationDelay:(i*.08)+'s'});
        output.append(kiss);kiss.addEventListener('animationend',()=>kiss.remove(),{once:true});
      }
    }],
    ['One More Reminder',()=>output.append(make('p','',reminder()))],
    ['A Secret for You',()=>{
      const note=make('div','secret');
      note.append(make('em','','My sweet Julie,'),make('p','','Sometimes, after we say goodbye, I stay there smiling for a second. You’ve already gone back to your day, and I’m still happy about the few minutes we just shared.'),make('em','','Love, James'));
      output.append(note);
    }]
  ];
  gifts.forEach(([label,action])=>{
    const b=make('button','',label);b.setAttribute('aria-pressed','false');el('surpriseButtons').append(b);
    b.onclick=()=>{el('surpriseButtons').querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===b)));output.replaceChildren();action();if(!reduced()&&output.animate)output.animate([{opacity:.55},{opacity:1}],{duration:350});};
  });
  el('lastThing').onclick=()=>{
    const note=el('lastNote'),show=note.hidden;note.hidden=!show;
    el('lastThing').setAttribute('aria-expanded',String(show));
    el('lastThing').textContent=show?'Fold the note':'One Last Thing, Baby';
    if(show)burst(el('lastThing'));
  };
})();
