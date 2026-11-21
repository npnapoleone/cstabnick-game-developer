import {describe,it,expect} from 'vitest';
import {movePlayer} from './world';
import type {FrameInput} from './contracts';
import {CONFIG} from './config';
const input:FrameInput={moveX:0,moveZ:0,lookX:0,lookY:0,jump:false,interact:false,leave:false,commands:[]};
const start={x:0,z:2.2,y:CONFIG.eyeHeight,velocity:0,yaw:0,pitch:0};
describe('player movement',()=>{
  it('normalizes diagonal speed and moves forward toward negative z',()=>{
    const p=movePlayer(start,{...input,moveX:1,moveZ:1},0.5,'explore');
    expect(Math.hypot(p.x-start.x,p.z-start.z)).toBeCloseTo(CONFIG.speed*0.5);
    expect(p.z).toBeLessThan(start.z);
  });
  it('clamps room and blocks the table and shelves even for large steps',()=>{
    expect(movePlayer(start,{...input,moveZ:1},5,'explore').z).toBeGreaterThanOrEqual(-0.05);
    expect(movePlayer(start,{...input,moveX:1},10,'explore').x).toBeLessThanOrEqual(3.8);
    expect(movePlayer({...start,x:3.3,z:0},{...input,moveZ:1},5,'explore').z).toBeGreaterThanOrEqual(-1.3);
  });
  it('jumps only from the ground and freezes in pause',()=>{
    const p=movePlayer(start,{...input,jump:true},0.1,'explore'); expect(p.y).toBeGreaterThan(start.y);
    const next=movePlayer(p,{...input,jump:true},0.1,'explore'); expect(next.velocity).toBeLessThan(p.velocity);
    expect(movePlayer(p,{...input,moveZ:1},1,'paused')).toEqual(p);
  });
});
