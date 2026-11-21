# Many, Many Monkeys — The First Desk

A fresh first-person desk POC: two Shakespeare sonnets and a stubborn mechanical typewriter. Walk, jump, sit, type carefully and buy faster typebars and automatic carriage return. No monkey workers or park management yet.

## Play
From the repository root, run `npm ci` once, then `npm run dev -w games/many-many-monkeys`. Open http://127.0.0.1:5215/. On Windows, launch this folder's Play.cmd. Keep its terminal open.

WASD/arrows move at one speed; drag to look; Space jumps; E sits near the desk. At the desk, type the text (case insensitive, exact punctuation), Backspace corrects, Enter completes a correct line, Esc stands up. Rapid second strikes visibly collide and must be retried; never queued. Keyboard shows touch keys. Touch movement, look, jump, sit and stand controls included.

Each newly correct character pays one cent, each line ten cents, and each sonnet $10, once per position/milestone. Five speed tiers cost $1.50/$2/$2.50/$3.50/$5; automatic return $2.50. POC prices fit the finite two-sonnet economy. Starting cadence five characters/second. Finish both sonnets.

Progress lives only for this visit: no player autosave, offline progression or reset button. An isolated save codec is tested for future use. Shared cosmetic achievements persist independently. Focus loss/hidden tabs pause the clock; resume explicitly.

## Integration
First-person camera has no visible player body; no custom gnome model is substituted. Shared profile initialization and achievements integrate the platform. All furniture/typewriter props use @lawn/prefabs; game-owned geometry is room architecture/lighting. Apocrypha setting: Shakespeare/cash/monkey premise does not rewrite core lore. Actual monkeys deferred.

Mobile controls included. Online deferred: multiplayer economy/save authority would overwhelm the interaction experiment. Party slice deferred: PadState has no arbitrary text input; button mashing loses spelling.

This workspace is fresh; it does not import or modify the separate Unity or browser editions.

## Verify
`npm test -w games/many-many-monkeys` checks collision timing, rewards, input, movement and isolated saves. `npm run build -w games/many-many-monkeys` typechecks and builds relative-path static files in dist. See VALIDATION.md for browser evidence and limits.

