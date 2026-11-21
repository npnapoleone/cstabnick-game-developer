import {describe, expect, it} from 'vitest';
import {deskKey, movementKey} from './input';
describe('input mappings',()=>{
 it('maps forward and right consistently',()=>{expect(movementKey('w')).toBe('forward'); expect(movementKey('ArrowUp')).toBe('forward'); expect(movementKey('D')).toBe('right'); expect(movementKey('ArrowDown')).toBe('back'); expect(movementKey('x')).toBeNull();});
 it('maps typewriter keys without accepting arbitrary text',()=>{expect(deskKey('A')).toEqual({kind:'strike',char:'A'}); expect(deskKey(' ')).toEqual({kind:'strike',char:' '}); expect(deskKey('?')).toEqual({kind:'strike',char:'?'}); expect(deskKey('Backspace')).toEqual({kind:'backspace'}); expect(deskKey('Enter')).toEqual({kind:'enter'}); expect(deskKey('Paste')).toBeNull(); expect(deskKey('1')).toEqual({kind:'strike',char:'1'});});
});

