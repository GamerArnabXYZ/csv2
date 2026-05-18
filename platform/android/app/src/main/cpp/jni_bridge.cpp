#ifndef __EMSCRIPTEN__
#include <jni.h>
#include <android/log.h>
#endif

#include "engine/core/Engine.hpp"

// ─── Android ─────────────────────────────────────────────────────
#ifndef __EMSCRIPTEN__
static Engine* gEngine = nullptr;

extern "C" {

JNIEXPORT void JNICALL
Java_io_craftsprint_GameActivity_init(JNIEnv*, jobject, jint w, jint h) {
    if (!gEngine) gEngine = new Engine();
    gEngine->init(w, h);
}

JNIEXPORT void JNICALL
Java_io_craftsprint_GameActivity_step(JNIEnv*, jobject, jfloat dt) {
    if (gEngine) { gEngine->update(dt); gEngine->render(); }
}

JNIEXPORT void JNICALL
Java_io_craftsprint_GameActivity_handleSwipe(JNIEnv*, jobject, jfloat dx, jfloat dy) {
    if (gEngine) InputManager::instance().handleSwipe(dx, dy);
}

JNIEXPORT jint JNICALL
Java_io_craftsprint_GameActivity_getScore(JNIEnv*, jobject) {
    return gEngine ? gEngine->score : 0;
}

JNIEXPORT jint JNICALL
Java_io_craftsprint_GameActivity_getDistance(JNIEnv*, jobject) {
    return gEngine ? (jint)gEngine->getDistance() : 0;
}

JNIEXPORT void JNICALL
Java_io_craftsprint_GameActivity_setHighScore(JNIEnv*, jobject, jint s) {
    if (gEngine) gEngine->setHighScore(s);
}

JNIEXPORT jint JNICALL
Java_io_craftsprint_GameActivity_getHighScore(JNIEnv*, jobject) {
    return gEngine ? gEngine->highScore : 0;
}

JNIEXPORT jint JNICALL
Java_io_craftsprint_GameActivity_getComboBonus(JNIEnv*, jobject) {
    return gEngine ? gEngine->comboBonus : 1;
}

JNIEXPORT jboolean JNICALL
Java_io_craftsprint_GameActivity_isGameOver(JNIEnv*, jobject) {
    return gEngine ? (jboolean)gEngine->isGameOver : JNI_FALSE;
}

JNIEXPORT void JNICALL
Java_io_craftsprint_GameActivity_stopGame(JNIEnv*, jobject) {
    if (gEngine) gEngine->stopGame();
}

JNIEXPORT void JNICALL
Java_io_craftsprint_GameActivity_restartGame(JNIEnv*, jobject) {
    if (gEngine) gEngine->restartGame();
}

} // extern "C"
#endif // !__EMSCRIPTEN__

// ─── Web / Emscripten ────────────────────────────────────────────
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/html5.h>
#include <GLES2/gl2.h>

static Engine* emEngine     = nullptr;
static EMSCRIPTEN_WEBGL_CONTEXT_HANDLE webglCtx = 0;
static double  lastTime     = 0;
static int     lastScore    = -1;
static bool    lastGameOver = false;
static int     lastCombo    = 1;

static void main_loop() {
    double now = emscripten_get_now();
    float dt   = (float)((now - lastTime) / 1000.0);
    lastTime   = now;
    if (dt > 0.1f) dt = 1.0f / 60.0f;

    emEngine->update(dt);
    emEngine->render();

    bool changed = (emEngine->score     != lastScore)    ||
                   (emEngine->isGameOver != lastGameOver) ||
                   (emEngine->comboBonus != lastCombo);
    if (changed) {
        lastScore    = emEngine->score;
        lastGameOver = emEngine->isGameOver;
        lastCombo    = emEngine->comboBonus;
        EM_ASM_({
            if (typeof updateUI === 'function')
                updateUI($0, $1, $2, $3, $4);
        }, emEngine->score,
           (int)emEngine->isGameOver,
           emEngine->comboBonus,
           emEngine->highScore,
           (int)emEngine->getDistance());
    }
}

extern "C" {

EMSCRIPTEN_KEEPALIVE void stop_game()    { if (emEngine) emEngine->stopGame();    }
EMSCRIPTEN_KEEPALIVE void restart_game() { if (emEngine) emEngine->restartGame(); }
EMSCRIPTEN_KEEPALIVE int  get_distance() { return emEngine ? (int)emEngine->getDistance() : 0; }
EMSCRIPTEN_KEEPALIVE void set_high_score(int s) { if (emEngine) emEngine->setHighScore(s); }

EMSCRIPTEN_KEEPALIVE void start_game() {
    lastTime = emscripten_get_now();

    // FIX: EM_ASM string concatenation issue — comma wale JS vars ko C side se pass karo
    // Get dimensions on C side using EM_ASM_INT, then pass as params — NO comma vars in JS
    int sw = EM_ASM_INT({ return window.innerWidth;  });
    int sh = EM_ASM_INT({ return window.innerHeight; });

    // devicePixelRatio — cap at 1.5
    double dpr = EM_ASM_DOUBLE({ return Math.min(window.devicePixelRatio || 1.0, 1.5); });

    int pw = (int)(sw * dpr);
    int ph = (int)(sh * dpr);

    // Now safe single-expression EM_ASM calls — no comma operator, no multi-var JS
    EM_ASM_({ document.getElementById('canvas').style.position = 'fixed'; }, 0);
    EM_ASM_({ document.getElementById('canvas').style.top      = '0';     }, 0);
    EM_ASM_({ document.getElementById('canvas').style.left     = '0';     }, 0);
    EM_ASM_({ document.getElementById('canvas').style.display  = 'block'; }, 0);

    // Pass w/h/pw/ph from C as $0 $1 $2 $3
    EM_ASM_({
        var c = document.getElementById('canvas');
        c.style.width  = $0 + 'px';
        c.style.height = $1 + 'px';
        c.width        = $2;
        c.height       = $3;
    }, sw, sh, pw, ph);

    if (webglCtx <= 0) {
        EmscriptenWebGLContextAttributes attrs;
        emscripten_webgl_init_context_attributes(&attrs);
        attrs.majorVersion    = 1;
        attrs.minorVersion    = 0;
        attrs.alpha           = 0;
        attrs.depth           = 1;
        attrs.powerPreference = EM_WEBGL_POWER_PREFERENCE_HIGH_PERFORMANCE;
        webglCtx = emscripten_webgl_create_context("#canvas", &attrs);
    }
    emscripten_webgl_make_context_current(webglCtx);

    if (!emEngine) emEngine = new Engine();
    emEngine->init(pw, ph);

    static bool loopStarted = false;
    if (!loopStarted) {
        emscripten_set_main_loop(main_loop, 0, 1);
        loopStarted = true;
    }
}

EMSCRIPTEN_KEEPALIVE void handle_swipe(float dx, float dy) {
    InputManager::instance().handleSwipe(dx, dy);
}

} // extern "C"
#endif // __EMSCRIPTEN__
