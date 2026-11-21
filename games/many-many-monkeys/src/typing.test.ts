import { describe, expect, it } from 'vitest';
import { CONFIG } from './config';
import type { Work } from './contracts';
import { advance, createState, dispatch } from './typing';
import { WORKS } from './content';

const works: Work[] = [
  { id: 'a', title: 'A', subtitle: '', bonusCents: 100, lines: [{id:'one',display:'aa',target:'aa'}, {id:'two',display:'b',target:'b'}] },
  { id: 'b', title: 'B', subtitle: '', bonusCents: 50, lines: [{id:'one',display:'x',target:'x'}] },
];
const strike = (s: ReturnType<typeof createState>, char: string) => dispatch(s, {kind:'strike',char}, works);
const enter = (s: ReturnType<typeof createState>) => dispatch(s, {kind:'enter'}, works);
const back = (s: ReturnType<typeof createState>) => dispatch(s, {kind:'backspace'}, works);
const ready = (s: ReturnType<typeof createState>) => advance(s, 1);

describe('typing', () => {
  it('the finite POC corpus funds every upgrade without duplicate rewards', () => {
    const s = createState(WORKS);
    let expected = 0;
    for (const work of WORKS) {
      dispatch(s, {kind:'select',workId:work.id}, WORKS);
      for (const line of work.lines) {
        for (const char of line.display) { advance(s, 1); dispatch(s,{kind:'strike',char},WORKS); }
        dispatch(s,{kind:'enter'},WORKS);
        expected += line.target.length * CONFIG.characterCents + CONFIG.lineCents;
      }
      expected += work.bonusCents;
      expect(s.progress[work.id].complete).toBe(true);
    }
    expect(s.cents).toBe(expected);
    for (const price of CONFIG.armPrices) dispatch(s,{kind:'buy',upgrade:'arms'},WORKS);
    dispatch(s,{kind:'buy',upgrade:'return'},WORKS);
    expect(s.armsLevel).toBe(5); expect(s.automaticReturn).toBe(true);
    expect(s.cents).toBe(expected - CONFIG.armPrices.reduce((a,b)=>a+b,0) - CONFIG.returnPrice);
    const paid=s.cents;
    dispatch(s,{kind:'enter'},WORKS); dispatch(s,{kind:'strike',char:'x'},WORKS);
    expect(s.cents).toBe(paid);
  });
  it('rejects early Enter, unsupported input, and preserves a valid buffer limit', () => {
    const s=createState(works); strike(s,'a'); enter(s); expect(s.progress.a.line).toBe(0);
    ready(s); strike(s,'\n'); strike(s,'é'); expect(s.progress.a.buffer).toBe('a');
    s.progress.a.buffer='x'.repeat(4096); strike(s,'x'); expect(s.progress.a.buffer.length).toBe(4096);
  });
  it('rejects collisions without replay and accepts at the boundary', () => {
    const s = createState(works); strike(s, 'a'); strike(s, 'a');
    expect(s.progress.a.buffer).toBe('a'); expect(s.mechanism.rejectedChar).toBe('a');
    advance(s, CONFIG.cadence[0]); expect(s.progress.a.buffer).toBe('a'); strike(s, 'A');
    expect(s.progress.a.buffer).toBe('aA'); expect(s.cents).toBe(2);
    advance(s, -1); advance(s, Infinity); expect(s.elapsed).toBe(CONFIG.cadence[0]);
  });
  it('rewards correct positions once through mistakes, retyping and switching', () => {
    const s = createState(works); strike(s, 'a'); ready(s); strike(s, 'x');
    expect(s.cents).toBe(1); back(s); ready(s); strike(s, 'a'); expect(s.cents).toBe(2);
    back(s); ready(s); strike(s, 'a'); expect(s.cents).toBe(2);
    dispatch(s, {kind:'select',workId:'b'}, works); dispatch(s, {kind:'select',workId:'a'}, works);
    expect(s.progress.a.buffer).toBe('aa'); enter(s); expect(s.cents).toBe(12);
    ready(s); strike(s, 'b'); enter(s); expect(s.cents).toBe(123);
    expect(s.progress.a).toEqual({line:1,buffer:'',complete:true}); enter(s); expect(s.cents).toBe(123);
  });
  it('buys each upgrade once and leaves insufficient or invalid commands untouched', () => {
    const s = createState(works); const initial = structuredClone(s);
    dispatch(s, {kind:'buy',upgrade:'arms'}, works); dispatch(s, {kind:'select',workId:'missing'}, works);
    expect(s).toEqual(initial);
    s.cents = 10000;
    for (const price of CONFIG.armPrices) { const before = s.cents; dispatch(s,{kind:'buy',upgrade:'arms'},works); expect(s.cents).toBe(before-price); }
    const before = s.cents; dispatch(s,{kind:'buy',upgrade:'arms'},works); expect(s.cents).toBe(before);
    dispatch(s,{kind:'buy',upgrade:'return'},works); dispatch(s,{kind:'buy',upgrade:'return'},works);
    expect(s.cents).toBe(before-CONFIG.returnPrice); expect(s.armsLevel).toBe(5);
  });
  it('requires enter manually and buying automatic return advances a waiting line', () => {
    const s = createState(works); strike(s,'a'); ready(s); strike(s,'a');
    expect(s.progress.a.line).toBe(0); s.cents += CONFIG.returnPrice;
    dispatch(s,{kind:'buy',upgrade:'return'},works); expect(s.progress.a.line).toBe(1);
    ready(s); strike(s,'b'); expect(s.progress.a.complete).toBe(true);
  });
});
