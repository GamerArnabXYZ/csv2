#ifndef PLAYER_HPP
#define PLAYER_HPP

#include "../math/Math.hpp"
#include "../input/InputManager.hpp"

class Player {
public:
    Vec3  pos        = {0.0f, 0.5f, 0.0f};
    int   targetLane = 1;                        // 0=left, 1=center, 2=right
    float lanes[3]  = {-2.0f, 0.0f, 2.0f};

    float vy         = 0.0f;
    bool  isJumping  = false;
    bool  isSliding  = false;
    float slideTimer = 0.0f;

    // Visual lean for lane-switch feedback
    float leanAngle  = 0.0f;   // degrees, rendered via scale trick
    float tiltAngle  = 0.0f;   // forward/jump tilt

    // Speed ramp
    float speed       = 8.0f;
    static constexpr float MAX_SPEED = 28.0f;
    static constexpr float ACCEL     = 0.6f;

    // Combo / streak
    int   combo       = 0;
    float comboTimer  = 0.0f;
    static constexpr float COMBO_WINDOW = 3.0f;

    // Invincibility frames after near-miss
    float iframes     = 0.0f;

    // Running bob
    float bobPhase    = 0.0f;
    float bobY        = 0.0f;

    void update(float dt, Action action) {
        // Lane switch
        bool switched = false;
        if (action == Action::LEFT  && targetLane > 0) { targetLane--; switched = true; leanAngle = -15.0f; }
        if (action == Action::RIGHT && targetLane < 2) { targetLane++; switched = true; leanAngle =  15.0f; }
        if (!switched) leanAngle += (0.0f - leanAngle) * 10.0f * dt; // spring back

        float targetX = lanes[targetLane];
        pos.x += (targetX - pos.x) * 14.0f * dt;

        // Jump
        if (action == Action::JUMP && !isJumping && !isSliding) {
            vy = 8.5f;
            isJumping = true;
            tiltAngle = -12.0f; // lean forward on jump
        }
        if (isJumping) {
            pos.y += vy * dt;
            vy -= 22.0f * dt;
            tiltAngle += (0.0f - tiltAngle) * 5.0f * dt;
            if (pos.y <= 0.5f) {
                pos.y    = 0.5f;
                isJumping = false;
                vy        = 0.0f;
                tiltAngle = 0.0f;
            }
        }

        // Slide
        if (action == Action::SLIDE && !isSliding && !isJumping) {
            isSliding  = true;
            slideTimer = 0.75f;
        }
        if (isSliding) {
            slideTimer -= dt;
            if (slideTimer <= 0.0f) isSliding = false;
        }

        // Running head-bob (only when grounded)
        if (!isJumping && !isSliding) {
            bobPhase += speed * dt * 1.2f;
            bobY = sinf(bobPhase) * 0.06f;
        } else {
            bobY = 0.0f;
        }

        // Combo timer decay
        if (comboTimer > 0.0f) {
            comboTimer -= dt;
            if (comboTimer <= 0.0f) combo = 0;
        }

        // iFrames decay
        if (iframes > 0.0f) iframes -= dt;

        // Speed ramp
        speed += ACCEL * dt;
        if (speed > MAX_SPEED) speed = MAX_SPEED;
        pos.z -= speed * dt;
    }

    void addCombo() {
        combo++;
        comboTimer = COMBO_WINDOW;
    }
};

#endif
