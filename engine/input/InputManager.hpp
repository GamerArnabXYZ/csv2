#ifndef INPUT_MANAGER_HPP
#define INPUT_MANAGER_HPP

#include <cmath> // FIX: required for std::abs

enum class Action { NONE, LEFT, RIGHT, JUMP, SLIDE };

class InputManager {
public:
    static InputManager& instance() {
        static InputManager inst;
        return inst;
    }

    void pushAction(Action a) { currentAction = a; }
    Action popAction() {
        Action a = currentAction;
        currentAction = Action::NONE;
        return a;
    }

    void handleSwipe(float dx, float dy) {
        float adx = std::abs(dx);
        float ady = std::abs(dy);

        // FIX: Detect pure tap (very small movement) and map to JUMP/Restart
        if (adx < 20 && ady < 20) {
            pushAction(Action::JUMP);
            return;
        }

        if (adx > ady) {
            if (dx > 50) pushAction(Action::RIGHT);
            else if (dx < -50) pushAction(Action::LEFT);
        } else {
            if (dy > 50) pushAction(Action::JUMP);
            else if (dy < -50) pushAction(Action::SLIDE);
        }
    }

private:
    Action currentAction = Action::NONE;
    InputManager() {}
};

#endif