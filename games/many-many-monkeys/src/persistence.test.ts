import {describe, expect, it} from 'vitest';
import type {State, Work} from './contracts';
import {decode, encode} from './persistence';
import {advance, createState, dispatch} from './typing';

const works:readonly Work[] = [
  {id:'one', title:'One', subtitle:'', bonusCents:10, lines:[{id:'a', display:'Ab', target:'ab'}, {id:'b', display:'C', target:'c'}]},
  {id:'two', title:'Two', subtitle:'', bonusCents:20, lines:[{id:'c', display:'Hi', target:'hi'}]}
];
function fixture():State { return {schema:1, elapsed:12.5, workId:'two', progress:{one:{line:1,buffer:'c',complete:false},two:{line:0,buffer:'h',complete:false}}, cents:42, rewarded:{'one:a:char:0':true,'one:a:line':true,'two:work':true}, armsLevel:3, automaticReturn:true, mechanism:{acceptedAt:12.4,readyAt:12.6,rejectedAt:12.5,rejectedChar:'x'}}; }

describe('save codec', () => {
  it('reconstructs partial progress, rewards, upgrades, selection and timing without advancement', () => {
    const state = fixture();
    const decoded = decode(encode(state), works);
    expect(decoded).toEqual(state);
    expect(decoded).not.toBe(state);
    expect(decoded?.progress.one).not.toBe(state.progress.one);
  });
  it('accepts a completed work on its last line with an empty buffer', () => {
    const state = fixture(); state.progress.one = {line:1, buffer:'', complete:true};
    expect(decode(encode(state), works)).toEqual(state);
  });
  it('roundtrips mistakes and preserves paid character rewards through retyping', () => {
    const state = createState(works);
    dispatch(state, {kind:'strike', char:'A'}, works);
    advance(state, 1);
    dispatch(state, {kind:'strike', char:'x'}, works);
    expect(state.progress.one.buffer).toBe('Ax');
    const restored = decode(encode(state), works)!;
    expect(restored).toEqual(state);
    dispatch(restored, {kind:'backspace'}, works);
    dispatch(restored, {kind:'backspace'}, works);
    advance(restored, 1);
    dispatch(restored, {kind:'strike', char:'A'}, works);
    expect(restored.cents).toBe(state.cents);
  });
  it('roundtrips a work completed by the actual simulation', () => {
    const state = createState(works);
    for (const char of 'ab') { advance(state, 1); dispatch(state, {kind:'strike',char}, works); }
    dispatch(state, {kind:'enter'}, works);
    advance(state, 1); dispatch(state, {kind:'strike',char:'c'}, works);
    dispatch(state, {kind:'enter'}, works);
    expect(state.progress.one.complete).toBe(true);
    expect(decode(encode(state), works)).toEqual(state);
  });
  it('rejects malformed, inconsistent and unknown data', () => {
    const cases: Array<(s:any)=>void> = [
      s => {s.schema=2;}, s => {s.elapsed=-1;}, s => {s.cents=1.5;}, s => {s.workId='missing';},
      s => {delete s.progress.one;}, s => {s.progress.extra=s.progress.one;},
      s => {s.progress.one.line=2;}, s => {s.progress.one.buffer='bad\ntext';}, s => {s.progress.one.buffer='x'.repeat(4097);},
      s => {s.progress.one.complete=true;}, s => {s.progress.one={line:0,buffer:'',complete:true};},
      s => {s.armsLevel=6;}, s => {s.automaticReturn=1;},
      s => {s.mechanism.acceptedAt=13;}, s => {s.mechanism.rejectedAt=-2;},
      s => {s.mechanism.readyAt=-1;}, s => {s.mechanism.rejectedChar='xx';},
      s => {s.rewarded={'one:a:char:2':true};}, s => {s.rewarded={'one:a:char:01':true};},
      s => {s.rewarded={'one:unknown:line':true};}, s => {s.rewarded={'unknown:work':true};},
      s => {s.rewarded={'one:work':false};}
    ];
    for (const mutate of cases) { const state = fixture(); mutate(state); expect(decode(JSON.stringify(state),works)).toBeNull(); }
    expect(decode('{',works)).toBeNull();
    expect(decode(encode(fixture()).replace('"rewarded":{','"rewarded":{"__proto__":true,'),works)).toBeNull();
  });
});

