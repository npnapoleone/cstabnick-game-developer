import type { State, Work, Command, Progress } from './contracts';
import { CONFIG } from './config';

export function createState(works: readonly Work[]): State {
  return { schema: 1, elapsed: 0, workId: works[0].id,
    progress: Object.fromEntries(works.map(w => [w.id, { line: 0, buffer: '', complete: false }])),
    cents: 0, rewarded: {}, armsLevel: 0, automaticReturn: false,
    mechanism: { acceptedAt: -1, readyAt: 0, rejectedAt: -1, rejectedChar: null } };
}

export function advance(state: State, dt: number): void {
  if (Number.isFinite(dt) && dt > 0) state.elapsed += dt;
}

function reward(state: State, key: string, amount: number): void {
  if (!Object.hasOwn(state.rewarded, key)) {
    state.rewarded[key] = true;
    state.cents += amount;
  }
}

function finishLine(state: State, work: Work, progress: Progress): void {
  const line = work.lines[progress.line];
  if (!line || progress.complete || progress.buffer.toLowerCase() !== line.target.toLowerCase()) return;
  reward(state, `${work.id}:${line.id}:line`, CONFIG.lineCents);
  progress.buffer = '';
  if (progress.line === work.lines.length - 1) {
    progress.complete = true;
    reward(state, `${work.id}:work`, work.bonusCents);
  } else progress.line++;
}

export function dispatch(state: State, command: Command, works: readonly Work[]): void {
  if (command.kind === 'select') {
    if (works.some(w => w.id === command.workId) && state.progress[command.workId]) state.workId = command.workId;
    return;
  }
  const work = works.find(w => w.id === state.workId);
  const progress = state.progress[state.workId];
  if (!work || !progress) return;
  if (command.kind === 'buy') {
    if (command.upgrade === 'arms') {
      const price = CONFIG.armPrices[state.armsLevel];
      if (price !== undefined && state.cents >= price) { state.cents -= price; state.armsLevel++; }
    } else if (command.upgrade === 'return' && !state.automaticReturn && state.cents >= CONFIG.returnPrice) {
      state.cents -= CONFIG.returnPrice;
      state.automaticReturn = true;
      finishLine(state, work, progress);
    }
    return;
  }
  if (progress.complete) return;
  const line = work.lines[progress.line];
  if (!line) return;
  if (command.kind === 'backspace') { progress.buffer = progress.buffer.slice(0, -1); return; }
  if (command.kind === 'enter') { finishLine(state, work, progress); return; }
  if (command.kind !== 'strike' || typeof command.char !== 'string' || !/^[\x20-\x7e]$/.test(command.char) || progress.buffer.length >= 4096) return;
  if (state.elapsed < state.mechanism.readyAt) {
    state.mechanism.rejectedAt = state.elapsed;
    state.mechanism.rejectedChar = command.char;
    return;
  }
  state.mechanism.acceptedAt = state.elapsed;
  state.mechanism.readyAt = state.elapsed + CONFIG.cadence[state.armsLevel];
  progress.buffer += command.char;
  const buffer = progress.buffer.toLowerCase();
  const target = line.target.toLowerCase();
  if (target.startsWith(buffer) && buffer.length <= target.length) {
    reward(state, `${work.id}:${line.id}:char:${buffer.length - 1}`, CONFIG.characterCents);
  }
  if (state.automaticReturn) finishLine(state, work, progress);
}
