# CraftSprint.IO Project Mandates

## Environment Context
- **Hardware:** Mobile device, 3GB RAM. No heavy commands.
- **Language:** All AI responses in **Hinglish**.
- **Build:** GitHub Actions (Emscripten for Web, Gradle for Android).
-**Note:** Must Push to github and update gemini.md every response.

## Core Engineering Rules
1. **Batch Renderer:** All geometry goes through `Renderer::addCubeToBatch()`. Never add raw GL calls in Engine.cpp.
2. **Per-face lighting:** 24-vertex cubes (4 verts/face) with `aLight` attribute. TOP=1.0, SIDE_Z=0.80, SIDE_X=0.65, BOTTOM=0.5.
3. **World::update()** signature: `void update(float playerZ, float dt)` — dt needed for particles.
4. **Float suffix:** Always `0.5f`, `2.0f` etc. — no bare doubles.
5. **JNI signatures:** All match `io.craftsprint.GameActivity` exactly.
6. **WASM exports:** `_start_game`, `_handle_swipe`, `_stop_game`, `_restart_game`.

## Architecture
```
engine/
  core/    Engine.hpp/.cpp     — update/render loop, camera shake, biome flash
  game/    Player.hpp          — bob, lean, combo, iframes
           World.hpp           — biomes, particles, obstacle variety
  render/  Renderer.hpp/.cpp   — 24-vert per-face lighting batch renderer
           Shaders.hpp         — VS/FS with aLight attribute
  input/   InputManager.hpp    — singleton swipe queue
  math/    Math.hpp            — Vec3, Mat4

platform/
  web/     index.html, game.html, settings.html, about.html
           style.css           — Minecraft UI, panorama, HUD
           main.js             — WASM bridge, biome toast, combo HUD, best score
  android/ GameActivity.java   — GLSurfaceView, HUD, dist bar, death screen
           MainActivity.java   — panorama, animated splash pulse
           SettingsActivity.java, AboutActivity.java
           cpp/jni_bridge.cpp  — Android JNI + Emscripten WASM bridge

CMakeLists.txt
.github/workflows/web.yml, android.yml
```

## Changelog

### v3.2.0 (May 2026 — History Flattened)
- **Git:** History truncated to a single initial commit for a "Fresh Start". Code state matched to commit `ddde676`.
- **Renderer:** Added GLES2 texture mapping and UV support. uUseTexture toggle for hybrid rendering.
- **Models:** Infrastructure for GLB/GLTF loading via `ModelLoader`.
- **Textures:** `TextureManager` with 16x16 grid atlas mapping logic. `stb_image` integration.
- **Blocks Config:** `blocks.json` for data-driven block texture replacement.
- **Settings:** "Use Models" toggle implemented in Android (Java) and Web (JS) menus.
- **Gameplay:** Real-time ground texture swapping when "Use Models" is enabled.

### v3.1.1 (May 2026 — Integrity Check)
- **Checkup:** Full codebase audit completed. Verified `Renderer` 24-vertex lighting, `distAccum` precision logic, and `World::update(float playerZ, float dt)` signature.
- **Consistency:** Confirmed Android JNI and Web WASM bridges align with core engine updates.
- **Status:** All mandates met. Engine stable.

### v3.1.0 (May 2026 — Stability & Polish Pass)
- **Engine:** Added `distAccum` (float accumulator) to prevent score precision loss at high framerates.
- **Auto-Start:** Game now starts immediately upon initialization (no extra tap required after menu).
- **Persistence Sync:** Unified high-score handling between C++ engine and platform storage (Android SharedPreferences / Web LocalStorage).
- **UI Logic:** Biome transitions and distance bar now use raw distance instead of combo-multiplied score for 100% accuracy.
- **Android:** Fixed scrolling Panorama background using `BitmapShader` for seamless looping and low-memory efficiency.
- **Gameplay:** Fixed "coin-in-obstacle" glitch where collectibles could spawn inside TNT or cacti.
- **Build:** Fixed JNI signature mismatches and Gradle compilation errors.

### v3.0.0 (May 2026 — Major Feature Pass)

**Engine / C++ Core:**
- `Renderer`: Upgraded to 24-vertex per-face lighting (TOP/SIDE_Z/SIDE_X/BOTTOM brightness). One GL draw call per frame.
- `Engine`: Camera shake on death (`shakeAmt`). Head-bob camera. Biome transition flash. Player body+head two-cube rendering.
- `Player`: Head-bob (`bobPhase/bobY`), lane-switch lean (`leanAngle`), jump tilt (`tiltAngle`), combo system (`combo`, `comboTimer`), invincibility frames (`iframes`). Speed ramp to 28 u/s.
- `World`: 4 biomes — Plains, Desert, Nether, Snowy. Biome progression by distance. CPU particle system (`spawnCollectParticles`, `spawnDeathParticles`). 3 obstacle types (TNT cube, tall fence/cactus, low wall). Difficulty ramp (double obstacles, gap rows). Biome-specific decorations (grass tufts, cacti, nether pillars + lava strips, spruce trees with snow). Emeralds worth 500pts vs Gold 100pts. `World::update()` now takes `float dt` for particles.
- `Shaders`: `aLight` per-vertex brightness attribute added.
- `Engine.cpp`: Clouds (3-puff pixel cloud rows), Sun/Moon rendering, Nether ceiling. TNT cross-mark detail. Particle rendering with fade. Faded player on invincibility.

**Web:**
- HUD: Score, Combo display (×N COMBO), Biome indicator, distance progress bar.
- Biome toast popup on biome change.
- Keyboard support (WASD + Arrow keys).
- Best score persisted in `localStorage`. "🏆 New Best!" on death screen.
- Random death messages (6 variants).
- Settings: Graphics Quality slider + Reset Best Score button.
- `main.js`: `updateUI(score, isGameOver, combo, highScore)` — 4-param callback.

**Android:**
- `GameActivity`: Combo HUD, Biome text, animated distance bar, SharedPreferences best score, random death messages, dual Respawn/Title buttons.
- `MainActivity`: Panorama background, animated splash text (pulse via Handler), logo image.
- `SettingsActivity`: SeekBar sliders with SharedPreferences persistence, Reset Best Score.
- `AboutActivity`: Full info with YouTube link intent.

### v2.2.0 (May 2026 — Bug Fix Pass)
- WASM crash fix (`_stop_game`, `_restart_game` exports)
- `restartGame()` proper state reset
- `about.html` Minecraft theme fix
- Settings localStorage
- Android app icons (mdpi→xxxhdpi)

### v2.1.0 (May 2026 — Gemini CLI Pass)
- Multi-Screen Architecture, Minecraft UI, Day/Night cycle, Death screen, JNI crash fix

## Roadmap
1. High score leaderboard (Firebase / local)
2. Skin selection system (Dressing Room)
3. Night-only zombie obstacles
4. Jump trail particle effects
5. Wire Settings sensitivity into InputManager swipe threshold
6. Add double-jump powerup collectible

---
**Session Log: Monday, May 18, 2026**
- Status: Fresh Start Initiated.
- Action: Flattened git history into a single initial commit starting from ddde676 state.
- Note: GitHub force-pushed to align remote with truncated local history.
---

**Session Log: Monday, July 6, 2026**
- Status: Codebase analyzed successfully.
- Action: Performed full codebase audit of engine (core, game, render, input, math) and platform (android, web). Verified stability and architecture alignment.
- Note: Subagent quota limitations handled by running direct analysis.
---

