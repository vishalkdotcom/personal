# Creative Worlds for `vishalk.com` (`src/variants/`)

Five interactive, full-viewport worlds built on real engineering proofs, counterexamples, and shipped work across the workspace (`awesomeapps.org` excluded):

1. **`01 · Synth` (`/?v=synth`)** — **Modular Synth & CRT Oscilloscope Rack**: Live 60fps HTML5 Canvas dual-trace / Lissajous oscilloscope (`54.90` Question-First vs `54.31` Facility-First wave drift), interactive harmonic drive slider, optional WebAudio synthesizer tones, 8-facility step toggles, and a 10-case sequencer launchpad.
2. **`02 · Cosmos` (`/?v=cosmos`)** — **Constellation Force-Directed Observatory**: Deep-space interactive star map where visitors drag and orbit 12 engineering stars across 4 sectors (`Reporting & Score Parity`, `Velocity & Judgment`, `Live Storefronts`, `Enterprise ML`) with a live telescope readout.
3. **`03 · Arcade` (`/?v=arcade`)** — **1986 Boss-Rush Proof Cabinet**: Playable retro CRT boss-rush cabinet framing 4 real production engineering battles (`The Score Drift Hydra`, `The 84.5s Build Golem`, `The 350 KiB Editor Trojan`, `The PR #155 Six-Bug Gauntlet`) with HP bars, counter-moves, and an interactive 6-defect combo inspector.
4. **`04 · VK-OS` (`/?v=spatial`)** — **Spatial Workstation OS // 2026**: Multi-window desktop inspired by Windows Terminal + FancyZones + PowerShell 7.4 (`~/work-dossiers` visual explorer, interactive verification shell REPL, and open-source workstation cards).
5. **`05 · Poster` (`/?v=brutalist`)** — **Swiss Kinetic Brutalist Exhibition**: Monumental high-contrast architectural poster (`54.90 ≠ 54.31`, `2.08× FASTER`, `164 vs 350K`, `6 BLOCKERS`) with an interactive hover exhibition plate.

## How to Launch or Lock Any World as Default

- **Full-Viewport Standalone Mode**: Visit `/?v=synth`, `/?v=cosmos`, `/?v=arcade`, `/?v=spatial`, or `/?v=brutalist`, click any pill in the bottom-right **`5 Worlds`** dock, or press `Alt+1` through `Alt+5`.
- **Change the Default World**: Edit `DEFAULT_SITE_VARIANT` in `src/variants/variant-store.ts`.
- **Open Full-Viewport Mode by Default on `/`**: Change `createSignal(false)` on `fullOpen` in `src/variants/full-canvas-variants.tsx` to `createSignal(true)`.
