import './style.css';
import {loadMyGnome} from '@lawn/gnome';
import {WORKS} from './content';
import {createState,advance,dispatch} from './typing';
import {createInput} from './input';
import {createWorld} from './world';
import {createDesk} from './desk';
import {createAchievements} from './achievements';
import type {Mode,Command} from './contracts';
async function start(){
 await loadMyGnome();
 const parent=document.querySelector<HTMLElement>('#ui')!,root=document.createElement('main');root.id='mmm-root';parent.append(root);
 root.innerHTML=`<header class="mmm-header"><div><span class="mmm-eyebrow">THE LITERARY WORKSHOP</span><h1>Many, Many Monkeys</h1></div><div id="mmm-hud"><strong id="mmm-cash">$0.00</strong><button id="mmm-pause">Pause</button></div></header>
 <aside id="mmm-explore-hint"><span class="mmm-eyebrow">ONE DESK. A GREAT DEAL OF SHAKESPEARE.</span><h2>A small beginning.</h2><p>Walk up to the green typewriter.<br>Every correct character is a penny earned.</p><button id="mmm-sit">Sit at the writing desk</button><p class="mmm-controls">WASD / arrows · drag to look<br>Space to jump · E to sit</p></aside>
 <button id="mmm-leave">Stand up <span>Esc</span></button>
 <section id="mmm-pause-panel" role="dialog" aria-modal="true" aria-labelledby="mmm-pause-title"><div class="mmm-intro"><span class="mmm-eyebrow">MANY, MANY MONKEYS</span><h2 id="mmm-pause-title">The first desk.</h2><p>A quiet room, a stubborn machine,<br>and the beginnings of a literary empire.</p><ol><li>Copy Shakespeare, one careful keystroke at a time.</li><li>Too fast? The typebars collide. Retry the missed letter.</li><li>Earn better mechanisms. Finish both sonnets.</li></ol><button id="mmm-resume">Enter the workshop</button><small>This POC keeps progress for this visit.<br>Reloading starts a new visit. Achievements persist.</small></div></section>`;
 const canvas=document.querySelector<HTMLCanvasElement>('#world')!,world=createWorld(canvas),state=createState(WORKS),input=createInput(root),achievements=createAchievements(root);
 let mode:Mode='paused',previous:Mode='explore',began=false,last=performance.now();
 const send=(command:Command)=>{if(mode!=='desk')return;dispatch(state,command,WORKS);achievements.observe(state);};
 const desk=createDesk(root,WORKS,send),byId=(id:string)=>root.querySelector<HTMLElement>('#'+id)!;
 function setMode(next:Mode){mode=next;input.setMode(next);world.setMode(next);last=performance.now();root.dataset.mode=next;byId('mmm-pause-panel').hidden=next!=='paused';byId('mmm-explore-hint').hidden=next!=='explore';byId('mmm-leave').hidden=next!=='desk';byId('mmm-pause').hidden=next==='paused';if(next!=='explore'&&document.pointerLockElement)document.exitPointerLock();if(next!=='paused'&&document.activeElement instanceof HTMLElement)document.activeElement.blur();}
 function pause(){if(mode==='paused')return;previous=mode;byId('mmm-pause-title').textContent='A moment of quiet.';byId('mmm-resume').textContent='Resume the workshop';setMode('paused');}
 function sit(){if(mode==='explore'&&world.canInteract())setMode('desk');}
 byId('mmm-resume').onclick=()=>{began=true;setMode(previous);};byId('mmm-pause').onclick=pause;byId('mmm-sit').onclick=sit;byId('mmm-leave').onclick=()=>setMode('explore');
 window.addEventListener('blur',()=>{if(began)pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('resize',()=>world.resize());setMode('paused');
 function frame(now:number){
  const dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;const controls=input.sample();
  if(mode!=='paused'){advance(state,dt);if(controls.leave){if(mode==='desk')setMode('explore');else pause();}else if(controls.interact)sit();else if(mode==='desk')for(const command of controls.commands)send(command);}
  world.update(mode==='paused'?0:dt,controls,mode,state);desk.render(state,mode);byId('mmm-cash').textContent='$'+(state.cents/100).toFixed(2);
  const sitButton=byId('mmm-sit') as HTMLButtonElement;sitButton.disabled=!world.canInteract();sitButton.textContent=world.canInteract()?'Sit at the writing desk':'Move closer to the desk';
  const p=state.progress[state.workId];root.dataset.work=state.workId;root.dataset.line=String(p.line);root.dataset.buffer=p.buffer;root.dataset.cents=String(state.cents);root.dataset.arms=String(state.armsLevel);root.dataset.return=String(state.automaticReturn);root.dataset.complete=String(p.complete);requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
}
start().catch(error=>{console.error(error);document.querySelector('#ui')!.textContent='The workshop could not open. Please reload in a WebGL-capable browser.';});


