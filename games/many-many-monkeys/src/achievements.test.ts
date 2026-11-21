import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { State } from './contracts';

const { unlock, createTracker } = vi.hoisted(() => ({
  unlock: vi.fn(),
  createTracker: vi.fn(),
}));
vi.mock('@lawn/achievements', () => ({ createAchievementTracker: createTracker }));
import { createAchievements } from './achievements';

function state(): State {
  return { schema: 1, elapsed: 0, workId: 'a', progress: {}, cents: 0, rewarded: {}, armsLevel: 0,
    automaticReturn: false, mechanism: { acceptedAt: 0, readyAt: 0, rejectedAt: 0, rejectedChar: null } };
}

describe('desk achievements', () => {
  beforeEach(() => {
    unlock.mockReset().mockResolvedValue(undefined);
    createTracker.mockReset().mockReturnValue({ unlock });
  });

  it('observes earned milestones once per visit, including restored progress', () => {
    const ui = {} as HTMLElement;
    const achievements = createAchievements(ui);
    expect(createTracker).toHaveBeenCalledWith({ ui });
    achievements.observe(state());
    expect(unlock).not.toHaveBeenCalled();
    const earned = state();
    earned.rewarded['a:line'] = true;
    earned.armsLevel = 1;
    earned.progress.a = { line: 14, buffer: '', complete: true };
    achievements.observe(earned);
    achievements.observe(earned);
    expect(unlock.mock.calls.map(([id]) => id)).toEqual(['mmm-first-line', 'mmm-mechanic', 'mmm-first-sonnet']);
  });

  it('recognizes automatic return and ignores unrelated ledger keys', async () => {
    unlock.mockRejectedValue(new Error('offline'));
    const achievements = createAchievements({} as HTMLElement);
    const earned = state();
    earned.rewarded['a:line:bonus'] = true;
    earned.automaticReturn = true;
    achievements.observe(earned);
    await Promise.resolve();
    achievements.observe(earned);
    expect(unlock.mock.calls.map(([id]) => id)).toEqual(['mmm-mechanic']);
  });
});
