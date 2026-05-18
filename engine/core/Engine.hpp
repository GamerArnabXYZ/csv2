#ifndef ENGINE_HPP
#define ENGINE_HPP

#include "../render/Renderer.hpp"
#include "../game/Player.hpp"
#include "../game/World.hpp"

class Engine {
public:
    void init(int width, int height);
    void update(float dt);
    void render();
    void handleInput(Action a);
    void restartGame();
    void stopGame();

    float getDistance() const { return -player.pos.z; }
    void  setHighScore(int s) { highScore = s; }

    bool  isStarted  = false;
    bool  isGameOver = false;
    int   score      = 0;
    int   highScore  = 0;
    float timeOfDay  = 0.25f;  // start at morning
    int   comboBonus = 0;      // last combo multiplier for UI

private:
    Renderer renderer;
    Player   player;
    World    world;
    Mat4     projection;
    int      screenW = 0, screenH = 0;

    // Accumulator for distance to avoid precision loss in score
    float distAccum   = 0.0f;

    // Camera shake
    float shakeAmt    = 0.0f;
    float shakePhase  = 0.0f;

    // Transition flash on biome change
    Biome lastBiome   = Biome::PLAINS;
    float biomeFlash  = 0.0f;

    bool checkCollision(const Vec3& a, const Vec3& sa, const Vec3& b, const Vec3& sb);
    void addCloudRow(float baseZ);
    void renderBiomeGround(float playerZ);
};

#endif
