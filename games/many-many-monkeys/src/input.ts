import type {Command, FrameInput, Input, Mode} from './contracts';
// Vite loads this stylesheet; this workspace does not declare CSS modules.
// @ts-ignore
import './input.css';

export function movementKey(key:string): string | null {
  const k = key.toLowerCase();
  return ({w:'forward',arrowup:'forward',s:'back',arrowdown:'back',a:'left',arrowleft:'left',d:'right',arrowright:'right'} as Record<string,string>)[k] ?? null;
}
export function deskKey(key:string): Command | null {
  if (key === 'Backspace') return {kind:'backspace'};
  if (key === 'Enter') return {kind:'enter'};
  if (key.length === 1) return {kind:'strike',char:key};
  return null;
}

export function createInput(parent:HTMLElement):Input {
  const root = document.createElement('div'); root.className = 'mmm-input'; parent.appendChild(root);
  const explore = document.createElement('div'); explore.className = 'mmm-explore';
  const moves = document.createElement('div'); moves.className = 'mmm-moves';
  const look = document.createElement('div'); look.className = 'mmm-look'; look.textContent = 'Drag to look'; look.setAttribute('aria-label','Drag to look');
  const actions = document.createElement('div'); actions.className = 'mmm-actions';
  const desk = document.createElement('div'); desk.className = 'mmm-desk-input';
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.textContent = 'Keyboard'; toggle.setAttribute('aria-expanded','false');
  const keys = document.createElement('div'); keys.className = 'mmm-keys';
  root.append(explore,desk); explore.append(moves,look,actions); desk.append(toggle,keys);
  let mode:Mode = 'paused', keyboardOpen = window.matchMedia('(pointer: coarse)').matches, disposed = false;
  const held = new Set<string>(); const touchHeld = new Map<number,string>();
  let lookX = 0, lookY = 0, jump = false, interact = false, leave = false, commands:Command[] = [];
  let dragging: {id:number;x:number;y:number}|null = null;
  const clear = () => {held.clear(); touchHeld.clear(); lookX=0; lookY=0; jump=false; interact=false; leave=false; commands=[]; dragging=null;};
  const update = () => {root.dataset.mode=mode; root.classList.toggle('keyboard-open',keyboardOpen); toggle.setAttribute('aria-expanded',String(keyboardOpen));};
  const button = (label:string, text:string, container:HTMLElement) => {const b=document.createElement('button'); b.type='button'; b.textContent=text; b.setAttribute('aria-label',label); container.appendChild(b); return b;};
  for (const [name,text,label] of [['forward','↑','Move forward'],['left','←','Move left'],['back','↓','Move backward'],['right','→','Move right']]) {
    const b=button(label,text,moves); b.className=`mmm-${name}`;
    b.addEventListener('pointerdown',e=>{e.preventDefault(); b.setPointerCapture(e.pointerId); touchHeld.set(e.pointerId,name);});
    const end=(e:PointerEvent)=>touchHeld.delete(e.pointerId); b.addEventListener('pointerup',end); b.addEventListener('pointercancel',end); b.addEventListener('lostpointercapture',end);
  }
  button('Jump','Jump',actions).addEventListener('pointerdown',e=>{e.preventDefault(); jump=true;});
  button('Sit at desk','Sit',actions).addEventListener('pointerdown',e=>{e.preventDefault(); interact=true;});
  for (const char of 'abcdefghijklmnopqrstuvwxyz\',.:;?') {
    button(`Type ${char}`,char,keys).addEventListener('click',()=>commands.push({kind:'strike',char}));
  }
  button('Type space','Space',keys).addEventListener('click',()=>commands.push({kind:'strike',char:' '}));
  button('Backspace','⌫',keys).addEventListener('click',()=>commands.push({kind:'backspace'}));
  button('Enter line','Enter',keys).addEventListener('click',()=>commands.push({kind:'enter'}));
  toggle.addEventListener('click',()=>{keyboardOpen=!keyboardOpen; update();});
  const keydown=(e:KeyboardEvent)=>{
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || mode==='paused') return;
    if (e.key==='Escape') {e.preventDefault(); leave=true; return;}
    if (mode==='desk') {const command=deskKey(e.key); if(command){e.preventDefault(); commands.push(command);} return;}
    const target=e.target as HTMLElement | null;
    if (target?.closest('button,select,input,textarea,[contenteditable="true"]')) return;
    const movement=movementKey(e.key); if(movement){e.preventDefault(); held.add(e.key.toLowerCase()); return;}
    if(e.key===' '){e.preventDefault(); jump=true;} else if(e.key.toLowerCase()==='e'){e.preventDefault(); interact=true;}
  };
  const keyup=(e:KeyboardEvent)=>{held.delete(e.key.toLowerCase());};
  const blur=()=>clear();
  const visibility=()=>{if(document.hidden) clear();};
  const pointerdown=(e:PointerEvent)=>{if(mode!=='explore' || e.button!==0 || (e.target as Element).closest('.mmm-input button')) return; if(e.pointerType==='touch' && e.target!==look) return; dragging={id:e.pointerId,x:e.clientX,y:e.clientY};};
  const pointermove=(e:PointerEvent)=>{if(mode!=='explore') return; if(document.pointerLockElement){lookX+=e.movementX; lookY+=e.movementY;} else if(dragging?.id===e.pointerId){lookX+=e.clientX-dragging.x; lookY+=e.clientY-dragging.y; dragging.x=e.clientX; dragging.y=e.clientY;}};
  const pointerup=(e:PointerEvent)=>{if(dragging?.id===e.pointerId) dragging=null;};
  window.addEventListener('keydown',keydown); window.addEventListener('keyup',keyup); window.addEventListener('blur',blur); document.addEventListener('visibilitychange',visibility); window.addEventListener('pointerdown',pointerdown); window.addEventListener('pointermove',pointermove); window.addEventListener('pointerup',pointerup); window.addEventListener('pointercancel',pointerup);
  update();
  return {setMode(next){if(next!==mode){clear(); mode=next; update();}},sample(){const active=new Set([...Array.from(held,k=>movementKey(k)),...touchHeld.values()]); const frame:FrameInput={moveX:Number(active.has('right'))-Number(active.has('left')),moveZ:Number(active.has('forward'))-Number(active.has('back')),lookX,lookY,jump,interact,leave,commands}; lookX=lookY=0; jump=interact=leave=false; commands=[]; return frame;},dispose(){if(disposed)return; disposed=true; clear(); window.removeEventListener('keydown',keydown); window.removeEventListener('keyup',keyup); window.removeEventListener('blur',blur); document.removeEventListener('visibilitychange',visibility); window.removeEventListener('pointerdown',pointerdown); window.removeEventListener('pointermove',pointermove); window.removeEventListener('pointerup',pointerup); window.removeEventListener('pointercancel',pointerup); root.remove();}};
}

