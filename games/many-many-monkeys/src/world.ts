import * as THREE from 'three';
import {buildPrefab, getPrefab} from '@lawn/prefabs';
import type {FrameInput, Mode, World} from './contracts';
import {CONFIG} from './config';

type Pose = {x:number; z:number; y:number; velocity:number; yaw:number; pitch:number};
const obstacles = [{x1:-1.3,x2:1.3,z1:-1.95,z2:-0.05}, {x1:-3.8,x2:-2.8,z1:-3.8,z2:-1.3}, {x1:2.8,x2:3.8,z1:-3.8,z2:-1.3}];
const blocked = (x:number,z:number) => obstacles.some(o => x>o.x1 && x<o.x2 && z>o.z1 && z<o.z2);
const clamp = THREE.MathUtils.clamp;
/** Pure player motion, also usable without a renderer. */
export function movePlayer(pose:Pose, input:FrameInput, dt:number, mode:Mode):Pose {
  if (mode !== 'explore' || !Number.isFinite(dt) || dt <= 0) return {...pose};
  const p = {...pose};
  p.yaw -= input.lookX * 0.002;
  p.pitch = clamp(p.pitch - input.lookY * 0.002, -1.4, 1.4);
  const length = Math.hypot(input.moveX,input.moveZ);
  const mx = length > 1 ? input.moveX / length : input.moveX;
  const mz = length > 1 ? input.moveZ / length : input.moveZ;
  const dx = (Math.cos(p.yaw)*mx - Math.sin(p.yaw)*mz) * CONFIG.speed * dt;
  const dz = (-Math.sin(p.yaw)*mx - Math.cos(p.yaw)*mz) * CONFIG.speed * dt;
  const steps = Math.max(1, Math.ceil(Math.hypot(dx,dz)/0.1));
  for (let i=0;i<steps;i++) {
    const x = clamp(p.x+dx/steps,-3.8,3.8); if (!blocked(x,p.z)) p.x=x;
    const z = clamp(p.z+dz/steps,-4,3.8); if (!blocked(p.x,z)) p.z=z;
  }
  if (input.jump && p.y <= CONFIG.eyeHeight) p.velocity=CONFIG.jump;
  p.y += p.velocity*dt - CONFIG.gravity*dt*dt/2;
  p.velocity -= CONFIG.gravity*dt;
  if (p.y <= CONFIG.eyeHeight) {p.y=CONFIG.eyeHeight; p.velocity=0;}
  return p;
}

export function createWorld(canvas:HTMLCanvasElement):World {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x273f35);
  const camera = new THREE.PerspectiveCamera(55,1,0.05,100);
  const owned: Array<THREE.BufferGeometry|THREE.Material> = [];
  function box(x:number,y:number,z:number,w:number,h:number,d:number,color:number) {
    const geometry = new THREE.BoxGeometry(w,h,d); const material = new THREE.MeshStandardMaterial({color,roughness:0.85});
    owned.push(geometry,material); const mesh = new THREE.Mesh(geometry,material); mesh.position.set(x,y,z); scene.add(mesh);
  }
  box(0,-0.08,0,8,0.16,8,0x69452f);
  for (let z=-3.8;z<4;z+=0.5) box(0,0.005,z,8,0.012,0.018,0x402c21);
  box(0,1.8,-4.1,8,3.6,0.2,0x284b3b); box(-4.1,1.8,0,0.2,3.6,8,0x284b3b); box(4.1,1.8,0,0.2,3.6,8,0x284b3b); box(0,1.8,4.1,8,3.6,0.2,0x284b3b);
  box(0,3.62,0,8,0.15,8,0xc9b895);
  // A luminous inset framed window on the back wall.
  box(0,2.15,-3.98,2.1,1.8,0.05,0xb8d3bb);
  box(0,2.15,-3.93,0.08,1.9,0.08,0x65432d); box(0,2.15,-3.92,2.2,0.08,0.08,0x65432d);
  box(0,1.18,-3.9,2.35,0.12,0.22,0x65432d);
  const add = (id:string,x:number,y:number,z:number,scale=1,rotation=0) => {
    if (!getPrefab(id)) return null;
    const obj = buildPrefab(id); obj.position.set(x,y,z); obj.scale.setScalar(scale); obj.rotation.y=rotation; scene.add(obj); return obj;
  };
  add('table',0,0,-1,2); add('chair',0,0,0.35,1.4,Math.PI);
  add('rug',0,0.025,0,2.5); add('lamp',0.85,1.2,-1.15,0.8);
  add('bookshelf',-3.45,0,-2.5,1.6,Math.PI/2); add('bookshelf',3.45,0,-2.5,1.6,-Math.PI/2);
  add('red-book',-0.8,1.22,-1.05,0.8);
  const machine = add('mmm-typewriter',0,1.2,-1,1.6);
  const armA = machine?.getObjectByName('arm-a'); const armB = machine?.getObjectByName('arm-b'); const carriage = machine?.getObjectByName('carriage');
  const carriageBase = carriage?.position.x ?? 0;
  scene.add(new THREE.HemisphereLight(0xffe9c9,0x405846,2));
  const light = new THREE.PointLight(0xffc780,45,9); light.position.set(0.8,2.7,-0.7); scene.add(light);
  const windowLight = new THREE.DirectionalLight(0xfff0d2,1.6); windowLight.position.set(0,3,-4); scene.add(windowLight);
  let pose:Pose = {x:0,z:2.2,y:CONFIG.eyeHeight,velocity:0,yaw:0,pitch:0};
  let currentMode:Mode = 'explore';
  let viewMode:Mode = 'explore';
  function resize() {const width=canvas.clientWidth || 1, height=canvas.clientHeight || 1; renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix();}
  resize();
  return {
    setMode(mode) {currentMode=mode;},
    canInteract() {return Math.hypot(pose.x,pose.z+1)<2.5;},
    resize,
    update(dt,input,mode,state) {
      currentMode=mode; pose=movePlayer(pose,input,dt,currentMode);
      if (mode !== 'paused') viewMode=mode;
      if (viewMode === 'desk') {camera.position.set(-0.8,1.95,0.8); camera.lookAt(0.4,1.35,-1);}
      else {camera.position.set(pose.x,pose.y,pose.z); camera.rotation.order='YXZ'; camera.rotation.set(pose.pitch,pose.yaw,0);}
      const elapsed=state.elapsed; const cadence=CONFIG.cadence[state.armsLevel] ?? CONFIG.cadence[0];
      const accepted = clamp(1-(elapsed-state.mechanism.acceptedAt)/cadence,0,1);
      const rejected = clamp(1-(elapsed-state.mechanism.rejectedAt)/0.22,0,1);
      const swing = Math.sin((1-accepted)*Math.PI)*0.8;
      const clash = Math.sin((1-rejected)*Math.PI)*0.8;
      const alternate = Object.keys(state.rewarded).length % 2 === 0;
      // Rejected typebars converge at their heads, then visibly recoil.
      if (armA) { armA.rotation.x = -(alternate ? swing : 0); armA.rotation.z = -clash * 1.1; }
      if (armB) { armB.rotation.x = -(alternate ? 0 : swing); armB.rotation.z = clash * 1.1; }
      if (carriage) carriage.position.x=carriageBase-Math.min(state.progress[state.workId]?.buffer.length ?? 0,60)*0.008;
      renderer.render(scene,camera);
    },
    dispose() {owned.forEach(item=>item.dispose()); renderer.dispose();}
  };
}

