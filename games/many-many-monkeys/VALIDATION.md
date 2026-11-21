# Desk POC validation

Validated on Windows with Node/npm, Vitest, Vite and Microsoft Edge. No Unity compilation or Play Mode tests were run: the existing Unity and browser editions were not edited.

## Automated checks

- Game tests: 18 passed across typing/economy, saved-state codec, movement, input and achievements.
- Shared prefab library: 996 tests passed. Shared achievement package: 16 passed. Shared gnome package: 84 passed.
- Game TypeScript and production build passed. Static assets use relative URLs.
- Whole arcade `npm run site` passed: 32 built game/page workspaces; party-only workspace is skipped by design.
- `npm run lore` passed (197 entries). `git diff --check` passed.
- Headless Edge `tools/smoke.sh` passed with `mmm-root` and `mmm-hud`; no reported console errors.

The corpus simulation test completes both sonnets using the real state transitions, verifies unique character/line/work payouts, and buys all five arm tiers plus automatic return using only those earnings. This is why the finite POC uses lower later-tier prices than the longer Unity progression.

The codec roundtrip tests preserve incorrect and uppercase partial text, rewards, selected work, upgrades and active timing. Player autosave remains disabled; no old version's saves are read.

## Browser and visual checks

The parent inspected the working desktop scene and manuscript. The scripted walkthrough uses a fresh headless Edge context and actual keyboard/pointer controls, never direct game-state assignments. The full real-time walkthrough passed with zero strike retries: collision rejection/no replay, mistake correction, manual Enter, work switching, earned purchases, automatic return, sonnet completion and desktop/phone layout checks.

Desktop and emulated phone layouts were checked at 960x600, 390x844 and 844x390. Phone checks include touch character entry/Backspace, scrolling to keys and upgrade buttons, standing up, and available movement/jump/sit controls. Buttons are at least 44px. The final targeted viewport pass passed with zero retries after the landscape spacing adjustment; it also verifies pause rejects typing and preserves progress on resume.

Screenshots are generated in ignored `test/out/`; `thumbnail.jpg` is a tracked arcade-card preview. `demos/desk.json` records workshop entry, movement, sitting and typing; the six-second, 12 fps GIF is recorded in ignored `demos/out/`. Its ending frame was visually inspected and shows five accepted characters and five cents earned.

Run the browser walkthrough with the dev server running:

```sh
node games/many-many-monkeys/test/desk-browser.mjs
# Short targeted phone/layout pass:
VIEWPORT_ONLY=1 node games/many-many-monkeys/test/desk-browser.mjs
```

PowerShell uses `$env:VIEWPORT_ONLY='1'` instead of the inline shell assignment. `TEST_URL` overrides the server URL; `DEMO_BROWSER` overrides Edge's executable. The full walkthrough takes several minutes because it types a complete sonnet at real-time cadence and software rendering can be slow.

## Limits

Phone checks are browser emulation, not physical-device verification. No Safari/iOS hardware testing, controller support, multiplayer, management systems or long-term park balancing was performed. Vite reports a large bundle warning because the prototype uses Three.js and the shared procedural asset catalog; builds still pass. No progress migration or persistent player saving is provided in this POC.
