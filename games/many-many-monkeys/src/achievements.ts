import { createAchievementTracker } from '@lawn/achievements';
import type { State } from './contracts';

export function createAchievements(ui: HTMLElement): { observe(state: State): void } {
  const tracker = createAchievementTracker({ ui });
  const attempted = new Set<string>();
  function unlock(id: string): void {
    if (attempted.has(id)) return;
    attempted.add(id);
    void tracker.unlock(id).catch(() => {});
  }
  return {
    observe(state) {
      if (Object.keys(state.rewarded).some((key) => key.endsWith(':line'))) unlock('mmm-first-line');
      if (state.armsLevel > 0 || state.automaticReturn) unlock('mmm-mechanic');
      if (Object.values(state.progress).some((progress) => progress.complete)) unlock('mmm-first-sonnet');
    },
  };
}

