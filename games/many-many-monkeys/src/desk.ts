import type { Desk, Command, Work } from './contracts';
import { CONFIG } from './config';
import './desk.css';

export function createDesk(parent: HTMLElement, works: readonly Work[], send: (command: Command) => void): Desk {
  const panel = document.createElement('section');
  panel.className = 'mmm-desk';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Manuscript and upgrades');
  const heading = document.createElement('header');
  const eyebrow = document.createElement('p'); eyebrow.className = 'mmm-desk-eyebrow'; eyebrow.textContent = 'The literary workshop';
  const title = document.createElement('h2');
  const subtitle = document.createElement('p'); subtitle.className = 'mmm-desk-subtitle';
  heading.append(eyebrow, title, subtitle);
  const label = document.createElement('label'); label.className = 'mmm-desk-label'; label.htmlFor = 'mmm-work-select'; label.textContent = 'Current work';
  const select = document.createElement('select'); select.id = 'mmm-work-select';
  for (const work of works) { const option = document.createElement('option'); option.value = work.id; option.textContent = work.title; select.append(option); }
  select.addEventListener('change', () => { send({kind:'select', workId:select.value}); select.blur(); });
  const paper = document.createElement('div'); paper.className = 'mmm-desk-paper';
  const lineLabel = document.createElement('p'); lineLabel.className = 'mmm-desk-line-label';
  const manuscript = document.createElement('div'); manuscript.id = 'mmm-manuscript'; manuscript.setAttribute('aria-label', 'Current manuscript line');
  const feedback = document.createElement('p'); feedback.id = 'mmm-feedback'; feedback.setAttribute('aria-live', 'polite');
  paper.append(lineLabel, manuscript, feedback);
  const upgrades = document.createElement('div'); upgrades.className = 'mmm-desk-upgrades';
  const upgradeTitle = document.createElement('h3'); upgradeTitle.textContent = 'Workshop improvements';
  const armInfo = document.createElement('p'); armInfo.className = 'mmm-desk-upgrade-info';
  const arm = document.createElement('button'); arm.id = 'mmm-arm-buy'; arm.type = 'button'; arm.addEventListener('click', () => send({kind:'buy',upgrade:'arms'}));
  const returnInfo = document.createElement('p'); returnInfo.className = 'mmm-desk-upgrade-info';
  const returnButton = document.createElement('button'); returnButton.id = 'mmm-return-buy'; returnButton.type = 'button'; returnButton.addEventListener('click', () => send({kind:'buy',upgrade:'return'}));
  upgrades.append(upgradeTitle, armInfo, arm, returnInfo, returnButton);
  panel.append(heading, label, select, paper, upgrades); parent.append(panel);
  const setText = (element: HTMLElement, text: string) => { if (element.textContent !== text) element.textContent = text; };
  let lastManuscript = '';
  return {
    render(state, mode) {
      panel.hidden = mode !== 'desk';
      if (mode !== 'desk') return;
      const work = works.find(item => item.id === state.workId);
      const progress = state.progress[state.workId];
      if (!work || !progress) return;
      setText(title, work.title); setText(subtitle, work.subtitle);
      if (select.value !== work.id) select.value = work.id;
      setText(lineLabel, progress.complete ? `Completed · ${work.lines.length} / ${work.lines.length}` : `Line ${progress.line + 1} / ${work.lines.length}`);
      const line = work.lines[progress.line];
      const key = JSON.stringify([work.id, progress.line, progress.buffer, progress.complete]);
      if (key !== lastManuscript) {
        lastManuscript = key;
        manuscript.replaceChildren();
        if (progress.complete) manuscript.textContent = 'This work is complete.';
        else if (line) {
          const length = Math.max(line.display.length, progress.buffer.length);
          for (let i = 0; i < length; i++) {
            const span = document.createElement('span');
            const entered = i < progress.buffer.length;
            span.className = entered ? (progress.buffer[i].toLowerCase() === line.target[i]?.toLowerCase() ? 'mmm-glyph-entered' : 'mmm-glyph-mistake') : 'mmm-glyph-target';
            if (i === progress.buffer.length) span.classList.add('mmm-glyph-cursor');
            span.textContent = entered ? (progress.buffer[i] === ' ' && line.target[i] !== ' ' ? '·' : progress.buffer[i]) : line.display[i];
            manuscript.append(span);
          }
          if (progress.buffer.length >= length) { const cursor = document.createElement('span'); cursor.className = 'mmm-glyph-cursor'; cursor.textContent = '\u00a0'; manuscript.append(cursor); }
        }
      }
      const collision = state.mechanism.rejectedAt >= 0 && state.elapsed - state.mechanism.rejectedAt <= 1.4;
      let message = 'Type the line as shown.';
      if (collision) message = `Collision: “${state.mechanism.rejectedChar === ' ' ? 'space' : state.mechanism.rejectedChar}” was not printed. Retry it.`;
      else if (progress.complete) message = 'Choose another work to continue.';
      else if (line && progress.buffer.toLowerCase() === line.target.toLowerCase()) message = 'Line complete. Press Enter to return the carriage.';
      else if (line && !line.target.toLowerCase().startsWith(progress.buffer.toLowerCase())) message = 'There is a mistake. Use Backspace to correct it.';
      setText(feedback, message);
      setText(armInfo, `Arms · tier ${state.armsLevel} / ${CONFIG.armPrices.length} · ${CONFIG.cadence[state.armsLevel].toFixed(3)}s per strike`);
      const armPrice = CONFIG.armPrices[state.armsLevel];
      setText(arm, armPrice === undefined ? 'Arms fully upgraded' : `Upgrade arms · ${armPrice}¢`);
      arm.disabled = armPrice === undefined || state.cents < armPrice;
      setText(returnInfo, state.automaticReturn ? 'Automatic carriage return purchased' : 'Advance automatically after a correct line');
      setText(returnButton, state.automaticReturn ? 'Automatic return purchased' : `Buy automatic return · ${CONFIG.returnPrice}¢`);
      returnButton.disabled = state.automaticReturn || state.cents < CONFIG.returnPrice;
    },
    dispose() { panel.remove(); }
  };
}

