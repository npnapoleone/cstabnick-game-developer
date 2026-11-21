# Many, Many Monkeys — desk POC execution

## Epic 2 final issues

### 2A desk

~~~~text
Epic: 2
Depends on: completed epic 1 only; no same-epic dependencies
Environment: Working directory C:/Users/Owner/Documents/game-ideas/game1/experiments/lawn-gnome-panic. Windows PowerShell, use npm.cmd. Read prompts/worker.md and obey: own only named files, no dependencies or commits, no long-running server. Other workers edit disjoint files concurrently. Shared stubs must retain exported signatures; report other-file failures, do not fix them. No changes outside this checkout. Repo rules: game state separate from presentation, no other games edited.
Goal: refined manuscript/upgrade UI for first-person literary workshop.
Read first prompts/worker.md and game's src/{contracts.ts,config.ts,content.ts,desk.ts}.
Change ONLY game's src/desk.ts and src/desk.css.
Contract createDesk(parent:HTMLElement,works:readonly Work[],send:(command:Command)=>void):Desk with render(state,mode),dispose. Append .mmm-desk child to parent, NEVER restyle #ui. Parent owns HUD/cash/explore controls and Escape. Show only mode desk. DOM IDs mmm-manuscript, mmm-feedback, mmm-work-select (select), mmm-arm-buy, mmm-return-buy. Large readable typewritten target with actual entered glyphs, mistakes red, insertion underline, expected spaces blank; render safely with textContent. Current line /14, completed work state; never lose active select/button focus on render (build once/update fields). Work title/subtitle and work select; arm tier, cadence, prices, disabled if insufficient funds/maxed; auto return bought indicator. Show rejected letter explicit e.g. Collision: “h” was not printed. Retry it. Based on elapsed - rejectedAt <=1.4. Otherwise explain correct finished line awaiting Enter or mistake correction. Presentation doesn't grant rewards.
Visual: deep forest green workshop; cream manuscript with dark ink, brass accent; serif headings/monospace large text. Desktop panel on right top90 width min(500px,44vw), canvas physical typewriter remains visible left/bottom; UI sufficiently compact. Mobile <=600 panel top76 left12 right12 max-height44vh overflow auto; landscape phone panel right width44%, input keyboard left/bottom. All text min16 except labels14. Use pointer-events on own panel only. Buttons min44. Render only changed DOM text where possible.
Done when npm.cmd run typecheck -w games/many-many-monkeys. Parent performs browser visual/mobile checks.
Out of scope all other files. Physical arm animation belongs world worker.
~~~~

### 2B world

~~~~text
Epic: 2
Depends on: completed epic 1 only; no same-epic dependencies
Environment: Working directory C:/Users/Owner/Documents/game-ideas/game1/experiments/lawn-gnome-panic. Windows PowerShell, use npm.cmd. Read prompts/worker.md and obey: own only named files, no dependencies or commits, no long-running server. Other workers edit disjoint files concurrently. Shared stubs must retain exported signatures; report other-file failures, do not fix them. No changes outside this checkout. Repo rules: game state separate from presentation, no other games edited.
Goal: handsome first-person literary room and physical animated typewriter.
Read first prompts/worker.md; game's src/contracts.ts,config.ts,world.ts; packages/prefabs/README.md. Three version0.187.0 installed. Change ONLY game's src/world.ts and src/world.test.ts.
Contract createWorld(canvas:HTMLCanvasElement):World existing contracts; update(dt,input,mode,state), setMode, canInteract,resize,dispose. moveZ positive forward, look deltas pixels. CONFIG speed,jump,gravity,eyeHeight. Start near desk at (0,1.55,2.2), yaw0 facing -z. Room bounds x+-3.8 z[-4,3.8]. Desk table prefab at(0,0,-1), scale2 so tabletop y1.2; typewriter prefab id mmm-typewriter at(0,1.2,-1), scale1.6 front +z, overall native width0.7 depth0.6 height0.35. Two arm pivots arm-a/arm-b rotate x; carriage translates x. New prefab worker supplies it this epic; buildPrefab accepts ID string now; use getPrefab guard only until integrated. Table existing table, chair, lamp, rug, bookshelf, red-book. All props via buildPrefab; room floor/walls terrain/architecture may be simple meshes. Add warm lighting, window opening/luminous sky patch as architecture, deep green plaster/wood floor, bookshelves: readable warmly lit study, no gloomy fog. Architectural geometry disposed by owner, shared prefabs never dispose geometry/material. No visible player body => no one-off gnome.
Explore movement world-space yaw normalized axes, constant speed, clamp walls AND block table footprint (x+-1.3,z[-1.95,-.05]) and bookshelf footprints; grounded jump, no sprint. Desk mode camera fixed approx(-0.8,1.95,0.8) looking at(-0.15,1.35,-1), with typewriter readable in left half (desk UI right). Set camera.aspect resize, max pixelRatio1.5. setMode desk remembers standing pose; explore restores safe pose. paused freezes. canInteract checks horizontal distance to desk <2.5.
Animate from state.elapsed & mechanism only: accepted arm swings through visible arc during CONFIG cadence, alternate arms using accepted timestamp or ledger count; rejected arm swings into first then recoils visibly on rejection, brief amber light possible. No timers/state mutation/rewards. Carriage follows current buffer length, reset when line changes. Render canvas even paused.
Tests pure movement helper for speed normalization/bounds/table collision/jump pause (export helper if useful). No renderer instantiation in tests.
Done when npm.cmd run typecheck -w games/many-many-monkeys; npm.cmd test -w games/many-many-monkeys -- src/world.test.ts.
Out of scope all other files; no copied other-game code.
~~~~

### 2C prefab

~~~~text
Epic: 2
Depends on: completed epic 1 only; no same-epic dependencies
Environment: Working directory C:/Users/Owner/Documents/game-ideas/game1/experiments/lawn-gnome-panic. Windows PowerShell, use npm.cmd. Read prompts/worker.md and obey: own only named files, no dependencies or commits, no long-running server. Other workers edit disjoint files concurrently. Shared stubs must retain exported signatures; report other-file failures, do not fix them. No changes outside this checkout. Repo rules: game state separate from presentation, no other games edited.
Goal reusable mechanical typewriter prefab with visible moving arms.
Read prompts/worker.md, packages/prefabs/src/types.ts, packages/prefabs/src/catalog/furniture.ts, docs/roadmaps/prefab-library/_common.md (modeling rules; its old directory/ownership examples are superseded by this issue), packages/prefabs/src/catalog/index.ts.
Own ONLY packages/prefabs/src/catalog/many-many-monkeys.ts and catalog/index.ts.
Export MANY_MANY_MONKEYS: readonly PrefabDef[]; add import/spread to registry. id mmm-typewriter, category furniture, uses place, tags typewriter/typing/brass/keys, emoji empty. Native width0.7 depth0.6 height~0.35, front+z, lowesty0. Deep green enamel chassis brass trim, cream round keys, black carriage cylinder, pale manuscript sheet (visual only no resource), TWO clear articulated arms with named pivots arm-a/arm-b and parts group matching; their native position should extend upward from pivot so x rotation swings toward carriage. carriage pivot/group for moving carriage. <=40 parts; use rows of keys as compact bars if needed. No texture or external art. Five short examine lines follow dry voice, no named characters; apocrypha workshop permits knowing typewriters; don't rewrite core lore.
World will build at scale1.6, y1.2. Contract pivots arm-a/arm-b rotate x; carriage x translation. Ground center correct. Add named part supports as needed. Use numeric colors or verified palette. Preserve all other registry entries.
Done when npm.cmd test -w packages/prefabs; npm.cmd run typecheck -w packages/prefabs. Report baseline failures elsewhere without editing them.
Out of scope everything else, particularly games, shared build/types/tests.
~~~~



Codex adapter: current model plans and integrates; gpt-6.1-terra workers start with empty context. Original Claude instructions remain intact. Workers never commit. Three worker slots maximum. Scope: first desk only, two complete short sonnets, no management or player autosave. Online deferred because solo reward/save authority needs a separate design; party slice deferred because PadState lacks spelling input. All props use shared prefabs. First-person camera has no visible player body; profile initialization still supported.

| Epic | Issues | Gate |
|---|---:|---|
|0 foundation|planner|build and smoke|
|1 simulation/codec/input|3|tests, build, smoke|
|2 desk/world/prefabs|3|tests, build, smoke|
|3 achievements/browser|2|all affected tests, mobile/desktop, site build, PR|

Ports: planner 5215; browser worker 5216 if needed. No worker full builds or shared output. New contracts in games/many-many-monkeys/src/contracts.ts are frozen before dispatch. Full issue prompts follow; later issues are appended after rechecking the integrated foundation.

## 1A typing

~~~~text
Epic: 1
Depends on: none within epic
Environment: Working directory C:/Users/Owner/Documents/game-ideas/game1/experiments/lawn-gnome-panic. Windows PowerShell, use npm.cmd. Read prompts/worker.md and obey: own only named files, no dependencies or commits, no long-running server. Other workers edit disjoint files concurrently. Shared stubs must retain exported signatures; report other-file failures, do not fix them. No changes outside this checkout. Repo rules: game state separate from presentation, no other games edited.
Goal: replace typing simulation stub with precise mechanic and reward logic.
Read first: prompts/worker.md; games/many-many-monkeys/src/{contracts.ts,config.ts,content.ts,typing.ts}.
Change ONLY src/typing.ts and src/typing.test.ts within that game.
Contract: createState(works:readonly Work[]):State; advance(state:State,dt:number):void; dispatch(state:State,command:Command,works:readonly Work[]):void. Types already fixed in contracts.ts. Use CONFIG. Pure plain data, no DOM. State elapsed active seconds; first strike accepted immediately, subsequent strike before readyAt is REJECTED, sets rejectedAt/rejectedChar for visible feedback, never queued and never rewards. Accept mistakes into buffer but reward only newly attained correct prefix positions, case insensitive exact punctuation. Backspace removes last character; Enter requires whole target. Stable ledger keys format workId:lineId:char:index, workId:lineId:line, workId:work; character and line rewards CONFIG, complete work bonus Work.bonusCents. Backspacing/retyping or switching can never repay. Keep completion progress index last valid line, complete true. Select known ID preserves each work. Five arm upgrades debit prices once by level; return purchase once. Insufficient funds/no invalid command must mutate nothing. Auto return advances immediately after exact line, including if purchased while complete correct line awaits Enter. No offline catchup; finite positive dt only. Starting cents zero.
Done when: npm.cmd run typecheck -w games/many-many-monkeys; npm.cmd test -w games/many-many-monkeys -- src/typing.test.ts. Test collision at same time/boundary, no replay after advance, mistakes/retyping, switching, repeated words positions, line/work idempotence, all upgrades/insufficient funds, manual vs automatic return.
Out of scope: everything else.
~~~~

## 1B codec

~~~~text
Epic: 1
Depends on: none within epic
Environment: Working directory C:/Users/Owner/Documents/game-ideas/game1/experiments/lawn-gnome-panic. Windows PowerShell, use npm.cmd. Read prompts/worker.md and obey: own only named files, no dependencies or commits, no long-running server. Other workers edit disjoint files concurrently. Shared stubs must retain exported signatures; report other-file failures, do not fix them. No changes outside this checkout. Repo rules: game state separate from presentation, no other games edited.
Goal: isolated strict save codec, no enabled player saving.
Read first prompts/worker.md and games/many-many-monkeys/src/{contracts.ts,content.ts,config.ts,persistence.ts}.
Change ONLY game's src/persistence.ts and src/persistence.test.ts.
Contract encode(state:State):string; decode(raw:string,works:readonly Work[]):State|null. Return deep reconstructed validated data, null for invalid payload. Require schema 1, finite nonnegative elapsed and integer cents, known selected/work/progress IDs, valid line integer and completion/buffer consistency; arms 0..5 boolean return, safe ledger recognized key syntax workId:lineId:char:index / workId:lineId:line / workId:work and values true. Reject missing progress/unknown IDs; prototype pollution properties, malformed buffers and invalid mechanism values. Validate mechanism acceptedAt/rejectedAt >=-1 <=elapsed and readyAt >=0. Completion index remains last valid line with empty buffer. Codec never reads Date/localStorage; no offline advancement. Preserve valid transient timing in roundtrip. Use independent literal fixtures, no dependency on typing implementation while another worker writes it.
Done when npm.cmd run typecheck -w games/many-many-monkeys; npm.cmd test -w games/many-many-monkeys -- src/persistence.test.ts. Test roundtrip partial line/ledger/upgrades/selection and malformed fields/schema/content, no offline accrual.
Out of scope: all other files, main, enabling saving.
~~~~

## 1C input

~~~~text
Epic: 1
Depends on: none within epic
Environment: Working directory C:/Users/Owner/Documents/game-ideas/game1/experiments/lawn-gnome-panic. Windows PowerShell, use npm.cmd. Read prompts/worker.md and obey: own only named files, no dependencies or commits, no long-running server. Other workers edit disjoint files concurrently. Shared stubs must retain exported signatures; report other-file failures, do not fix them. No changes outside this checkout. Repo rules: game state separate from presentation, no other games edited.
Goal keyboard/touch first-person and typing controls.
Read first prompts/worker.md and game's src/contracts.ts, src/input.ts, index.html.
Change ONLY game's src/input.ts, src/input.css, src/input.test.ts.
Contract createInput(parent:HTMLElement):Input from contracts.ts. setMode explore/desk/paused; sample returns one FrameInput and drains transient commands/look/jump/interact/leave; dispose removes listeners. moveZ +1 means FORWARD, moveX +1 right, lookX/lookY raw pixel movement. Desktop WASD/arrow, mouse drag-look (pointer lock handled parent), Space jump, E interact, Escape leave; only desk printable chars->strike, Backspace/Enter; ignore repeats and modifiers except Shift, no paste bypass. Prevent global keyboard mapping when HTML button/select focused in explore; desk keyboard input must still work after selecting work, prevent Space/Enter double button activation. Input clear on mode/focus loss. Touch explore pad with 44px controls including move, look drag region, jump, sit; desk typewriter keyboard 26 letters plus apostrophe, comma, period, colon, semicolon, question mark, Space, Backspace, Enter. Parent gets .mmm-input child; NEVER style shared #ui. Responsive portrait/landscape; keys min44px so use wrap/grid and compact panel. CSS body not owned. Add accessible aria-labels using e.g. Type a, Type space, Backspace, Enter line; toggle Keyboard button to collapse keyboard on desktop. Touch default visible only appropriate pointer media. No fake DOM at import time. Tests for extracted pure key mapping helpers use Vitest node.
Done when npm.cmd run typecheck -w games/many-many-monkeys and npm.cmd test -w games/many-many-monkeys -- src/input.test.ts.
Out of scope main, desk, world, contracts and everything else. Parent does browser checks.
~~~~


## Epic 3 final issues and integration corrections

~~~~text
Epic: 3A achievements
Depends on: epic 2 complete
Environment: isolated fork checkout, Windows npm.cmd; concurrent browser worker; no commits/dependencies.
Goal: three shared platform achievements from real typing events.
Read first: prompts/worker.md, game contracts/achievements stub, packages/achievements/src/tracker.ts and catalog.ts.
Change: game src/achievements.ts, achievements.test.ts, shared achievements catalog.ts only.
Contract: createAchievements(ui:HTMLElement): {observe(state:State):void}; actual tracker takes {ui}, not the README's stale {game,ui}. Stable IDs mmm-first-line, mmm-mechanic, mmm-first-sonnet. Unlock once per visit for line ledger key, bought mechanism, completed work. Catch async store failures. Reuse existing compatible rewards.
Done when: game typecheck and focused tests, packages/achievements tests pass.
Out of scope: gameplay, UI, prefabs, main.
~~~~

~~~~text
Epic: 3B browser proof
Depends on: epic 2 complete
Environment: isolated checkout; installed puppeteer-core and Edge; parent server 127.0.0.1:5215; private browser context. No user profile. No commits/dependencies.
Goal: exercise the actual UI through manual line, corrected mistakes, collisions, purchases and automatic return; save desktop/phone evidence.
Read first: game's main.ts, input.ts, content.ts; demo tool; prompts/worker.md.
Change: game test/desk-browser.mjs and demos/desk.json only.
Contract: read-only #mmm-root dataset work,line,buffer,cents,arms,return,complete,mode; manipulate only keyboard/pointer controls, never assign game state. Screenshots test/out; no shared output or server. Accelerated animation clock allowed for test duration, disclose it.
Done when: node games/many-many-monkeys/test/desk-browser.mjs passes; viewport 390x844 and844x390 controls fit and touch keys >=44px; console clean. Demo uses actual start/move/sit/strike controls.
Out of scope: gameplay fixes; report failures to parent.
~~~~

### Integration decisions

- Two complete short sonnets fit the desk POC. Arm prices tuned to 150/200/250/350/500 cents so every tier plus return is reachable from the finite corpus. Cadences unchanged.
- Codec accepts incorrect/uppercase printable buffers, matching runtime. The first worker version incorrectly required a correct prefix; corrected with actual simulation roundtrip tests.
- The actual achievements tracker API differs from its README; use inspected source signature.
- Shared prefab arms converge visibly on rejection, and target-text contrast and keyboard placement were checked separately from typechecking.
- Windows sandbox blocked loopback and npm symlink operations. Installation/server/headless checks used approved execution outside the sandbox. CLI authentication is valid there; the initial invalid-token report was a sandbox networking symptom.
- Model substitution: gpt-6.1-terra for Haiku. Epics 1 and 3 use fresh workers; epic 2 reused each worker with a complete new bounded issue. File ownership remained disjoint. Parent alone integrates and commits.
