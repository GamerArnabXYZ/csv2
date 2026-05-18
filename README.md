# CraftSprint.IO

A high-performance cross-platform endless runner game core written in C++ with Web (WASM) and Android support.

## Project Structure
- `/engine`: Platform-agnostic C++ game core.
- `/platform/web`: WebGL/Emscripten bridge and assets.
- `/platform/android`: NDK/JNI bridge and Android boilerplate.
- `/.github/workflows`: Automated build pipelines for WASM and APK.

## Controls
- **Web:** Swipe on screen.
- **Android:** Swipe on screen.
- **Logic:**
    - Swipe Left/Right: Change lane.
    - Swipe Up: Jump.
    - Swipe Down: Slide.

## Build Instructions (GitHub Actions Recommended)
Since this project targets multiple platforms, it is recommended to use the included GitHub Actions:
1. Push this project to a GitHub repository.
2. Go to the "Actions" tab.
3. Download the artifacts (WASM/APK) from the successful builds.

### Manual Web Build (Requires Emscripten)
```bash
mkdir build && cd build
emcmake cmake ..
emmake make
```

### Manual Android Build (Requires Android Studio/NDK)
Open the `/platform/android` folder in Android Studio and click "Build APK".

## Tech Stack
- C++11
- OpenGL ES 2.0 / WebGL 1.0
- Emscripten (WASM)
- Android NDK (JNI)
