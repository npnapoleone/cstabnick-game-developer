import type {State,Work} from './contracts';

export function encode(state:State):string { return JSON.stringify(state); }

const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
function record(value:unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).every(key => !forbidden.has(key));
}
function fields(value:Record<string, unknown>, keys:string[]):boolean {
  return Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function finite(value:unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }

export function decode(raw:string, works:readonly Work[]):State|null {
  try {
    const value:unknown = JSON.parse(raw);
    if (!record(value) || !fields(value, ['schema','elapsed','workId','progress','cents','rewarded','armsLevel','automaticReturn','mechanism']) ||
      value.schema !== 1 || !finite(value.elapsed) || value.elapsed < 0 ||
      !Number.isSafeInteger(value.cents) || (value.cents as number) < 0 ||
      !Number.isInteger(value.armsLevel) || (value.armsLevel as number) < 0 || (value.armsLevel as number) > 5 ||
      typeof value.automaticReturn !== 'boolean' || typeof value.workId !== 'string' ||
      !record(value.progress) || !record(value.rewarded) || !record(value.mechanism)) return null;
    const byId = new Map(works.map(work => [work.id, work]));
    if (!byId.has(value.workId) || Object.keys(value.progress).length !== works.length) return null;
    const progress:State['progress'] = {};
    for (const work of works) {
      const p = value.progress[work.id];
      if (!record(p) || !fields(p, ['line','buffer','complete']) || !Number.isInteger(p.line) ||
        (p.line as number) < 0 || (p.line as number) >= work.lines.length ||
        typeof p.buffer !== 'string' || typeof p.complete !== 'boolean') return null;
      const line = p.line as number;
      if (p.complete ? line !== work.lines.length - 1 || p.buffer !== '' : p.buffer.length > 4096 || !/^[\x20-\x7e]*$/.test(p.buffer)) return null;
      progress[work.id] = {line, buffer:p.buffer, complete:p.complete};
    }
    const rewarded:State['rewarded'] = {};
    for (const [key, flag] of Object.entries(value.rewarded)) {
      if (flag !== true) return null;
      const parts = key.split(':');
      const work = byId.get(parts[0]);
      if (!work) return null;
      if (parts.length === 2 && parts[1] === 'work') { rewarded[key] = true; continue; }
      const line = work.lines.find(item => item.id === parts[1]);
      if (!line) return null;
      if (parts.length === 3 && parts[2] === 'line') { rewarded[key] = true; continue; }
      if (parts.length !== 4 || parts[2] !== 'char' || !/^(0|[1-9]\d*)$/.test(parts[3]) ||
        !Number.isSafeInteger(Number(parts[3])) || Number(parts[3]) >= line.target.length) return null;
      rewarded[key] = true;
    }
    const m = value.mechanism;
    if (!fields(m, ['acceptedAt','readyAt','rejectedAt','rejectedChar']) ||
      !finite(m.acceptedAt) || m.acceptedAt < -1 || m.acceptedAt > value.elapsed ||
      !finite(m.rejectedAt) || m.rejectedAt < -1 || m.rejectedAt > value.elapsed ||
      !finite(m.readyAt) || m.readyAt < 0 ||
      !(m.rejectedChar === null || (typeof m.rejectedChar === 'string' && m.rejectedChar.length === 1))) return null;
    return {schema:1, elapsed:value.elapsed, workId:value.workId, progress, cents:value.cents as number,
      rewarded, armsLevel:value.armsLevel as number, automaticReturn:value.automaticReturn,
      mechanism:{acceptedAt:m.acceptedAt, readyAt:m.readyAt, rejectedAt:m.rejectedAt, rejectedChar:m.rejectedChar}};
  } catch { return null; }
}

