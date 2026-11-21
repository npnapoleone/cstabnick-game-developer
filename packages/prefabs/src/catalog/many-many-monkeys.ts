import type { PrefabDef, Part } from '../types';

// Three staggered rows keep the keys legible while leaving room for the mechanism.
const keys: Part[] = [0, 1, 2].flatMap(row =>
  Array.from({ length: 7 }, (_, column): Part => ({
    s: 'cyl', d: [0.025, 0.025, 0.012],
    at: [-0.21 + column * 0.07 + (row % 2) * 0.015, 0.142 + row * 0.009, 0.235 - row * 0.066],
    c: 0xeee4c9, seg: 8,
  })),
);

export const MANY_MANY_MONKEYS: readonly PrefabDef[] = [{
  id: 'mmm-typewriter', name: 'Typewriter', category: 'furniture', uses: ['place'],
  tags: ['typewriter', 'typing', 'brass', 'keys'], emoji: [],
  tint: 0x173f35, trim: 0xc6a052,
  pivots: { 'arm-a': [-0.115, 0.15, -0.015], 'arm-b': [0.115, 0.15, -0.015], carriage: [0, 0.235, -0.16] },
  about: 'A green enamel typewriter with articulated strike arms and a sliding carriage.',
  examine: [
    'Cream keys sit in rows beneath a black roller and a pair of brass arms.',
    'Workshop saying: a quiet key has not finished its argument.',
    'Give the arms time to settle before striking the next key.',
    'It produces clean copy whenever the operator has something clean to say.',
    'One corner bears a small scratch where a line was returned with enthusiasm.',
  ],
  parts: [
    { s: 'box', d: [0.7, 0.08, 0.6], at: [0, 0.04, 0], c: 'tint' },
    { s: 'box', d: [0.66, 0.07, 0.53], at: [0, 0.105, -0.01], c: 'tint' },
    { s: 'box', d: [0.7, 0.012, 0.02], at: [0, 0.085, 0.291], c: 'trim' },
    { s: 'box', d: [0.02, 0.075, 0.5], at: [-0.32, 0.15, -0.02], c: 'trim', mirror: true },
    { s: 'box', d: [0.45, 0.012, 0.035], at: [0, 0.149, 0.275], c: 0xeee4c9 },
    ...keys,
    { s: 'cyl', d: [0.065, 0.065, 0.62], at: [0, 0.235, -0.16], rot: [0, 0, 90], c: 0x171b19, group: 'carriage', name: 'roller', seg: 10 },
    { s: 'box', d: [0.35, 0.18, 0.008], at: [0, 0.29, -0.205], rot: [-12, 0, 0], c: 0xede6cf, group: 'carriage', name: 'manuscript' },
    { s: 'cyl', d: [0.035, 0.035, 0.035], at: [-0.325, 0.235, -0.16], rot: [0, 0, 90], c: 'trim', group: 'carriage' },
    { s: 'cyl', d: [0.035, 0.035, 0.035], at: [0.325, 0.235, -0.16], rot: [0, 0, 90], c: 'trim', group: 'carriage' },
    { s: 'box', d: [0.025, 0.15, 0.025], at: [-0.115, 0.225, -0.015], c: 'trim', group: 'arm-a', name: 'arm-a-shaft' },
    { s: 'box', d: [0.055, 0.025, 0.035], at: [-0.115, 0.305, -0.015], c: 0x8e733b, group: 'arm-a', name: 'arm-a-head' },
    { s: 'box', d: [0.025, 0.15, 0.025], at: [0.115, 0.225, -0.015], c: 'trim', group: 'arm-b', name: 'arm-b-shaft' },
    { s: 'box', d: [0.055, 0.025, 0.035], at: [0.115, 0.305, -0.015], c: 0x8e733b, group: 'arm-b', name: 'arm-b-head' },
  ],
}];
