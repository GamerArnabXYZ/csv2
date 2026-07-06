#include "Engine.hpp"
#include <cmath>
#include <cstdlib>
#include <ctime>

static const float PI = 3.14159265f;

static inline float lerp(float a, float b, float t) { return a + (b - a) * t; }
static inline Vec3 lerpV(Vec3 a, Vec3 b, float t) {
    return {lerp(a.x,b.x,t), lerp(a.y,b.y,t), lerp(a.z,b.z,t)};
}

void Engine::init(int width, int height) {
    std::srand((unsigned)std::time(nullptr));
    screenW = width; screenH = height;
    renderer.init();
    renderer.setViewport(width, height);
    float aspect = (height > 0) ? (float)width / (float)height : 1.0f;
    float fovDeg = (aspect < 1.0f) ? 72.0f : 62.0f;
    projection   = Mat4::perspective(fovDeg * PI / 180.0f, aspect, 0.1f, 250.0f);
    isStarted    = true;  // AUTO-START: Start moving as soon as initialized
}

void Engine::stopGame()    { isStarted = false; isGameOver = false; }

void Engine::restartGame() {
    player     = Player();
    world      = World();
    isGameOver = false;
    isStarted  = true;
    score      = 0;
    distAccum  = 0.0f;
    comboBonus = 0;
    shakeAmt   = 0.0f;
    biomeFlash = 0.0f;
    lastBiome  = Biome::PLAINS;
    timeOfDay  = 0.25f;
}

void Engine::handleInput(Action) {}

bool Engine::checkCollision(const Vec3& a, const Vec3& sa,
                             const Vec3& b, const Vec3& sb) {
    return (fabsf(a.x - b.x) * 2.0f < (sa.x + sb.x)) &&
           (fabsf(a.y - b.y) * 2.0f < (sa.y + sb.y)) &&
           (fabsf(a.z - b.z) * 2.0f < (sa.z + sb.z));
}

void Engine::update(float dt) {
    Action action = InputManager::instance().popAction();

    // Very slow day cycle — 1 full cycle in ~55s
    timeOfDay += dt * 0.018f;
    if (timeOfDay > 1.0f) timeOfDay = 0.0f;

    if (shakeAmt  > 0.0f) { shakeAmt  -= dt * 4.0f; if (shakeAmt  < 0.0f) shakeAmt  = 0.0f; }
    if (biomeFlash > 0.0f) { biomeFlash -= dt * 1.5f; if (biomeFlash < 0.0f) biomeFlash = 0.0f; }

    if (!isStarted) {
        if (action != Action::NONE && !isGameOver) isStarted = true;
        return;
    }
    if (isGameOver) {
        if (action != Action::NONE) restartGame();
        return;
    }

    float oldZ = player.pos.z;
    player.update(dt, action);
    world.update(player.pos.z, dt);

    // FIX: Use accumulator to prevent precision loss at high framerates
    float dStep = fabsf(player.pos.z - oldZ) * 5.0f;
    distAccum  += dStep;
    if (distAccum >= 1.0f) {
        int distI   = (int)distAccum;
        int mult    = 1 + player.combo / 5;
        score      += distI * mult;
        comboBonus  = mult;
        distAccum  -= (float)distI;
    }

    if (world.currentBiome != lastBiome) {
        biomeFlash = 1.0f;
        lastBiome  = world.currentBiome;
    }

    Vec3 pScale = {0.7f, player.isSliding ? 0.38f : 0.75f, 0.7f};
    Vec3 pPos   = player.pos;
    if (player.isSliding) pPos.y -= 0.2f;
    pPos.y += player.bobY;

    for (auto& obj : world.objects) {
        if (!obj.active) continue;
        if (checkCollision(pPos, pScale, obj.pos, obj.scale)) {
            if (obj.isObstacle) {
                if (player.iframes > 0.0f) continue;
                isGameOver = true;
                if (score > highScore) highScore = score;
                world.spawnDeathParticles(pPos);
                shakeAmt = 1.5f;
                return;
            } else {
                obj.active = false;
                bool isEmerald = (obj.color.y > 0.7f && obj.color.x < 0.5f);
                score += isEmerald ? 500 : 100;
                player.addCombo();
                world.spawnCollectParticles(obj.pos, obj.color);
            }
        }
    }
}

// FIX: Clouds anchored to playerZ grid — move with world, NOT independently
// Spacing = 120 units, so they cover sky without popping
void Engine::addCloudRow(float worldZ) {
    // Deterministic pseudo-random offset per row using hash of Z slot
    int slot = (int)(worldZ / 120.0f);
    float cx = ((slot * 7919 + 3571) % 11 - 5) * 1.2f; // -6 to +6
    float cy = 10.0f + (float)((slot * 2333) % 5) * 0.5f;
    Vec3 c1 = {1.0f, 1.0f, 1.0f};
    Vec3 c2 = {0.95f, 0.95f, 0.95f};
    renderer.addCubeToBatch({cx,        cy,        worldZ}, {4.0f, 1.4f, 2.5f}, c1);
    renderer.addCubeToBatch({cx + 2.2f, cy + 0.5f, worldZ}, {2.8f, 1.1f, 2.0f}, c2);
    renderer.addCubeToBatch({cx - 2.0f, cy + 0.3f, worldZ}, {2.2f, 1.0f, 1.8f}, c2);
}

void Engine::renderBiomeGround(float pz) {
    World::BiomeTheme theme = World::getTheme(world.currentBiome);
    World::BiomeTheme prev  = World::getTheme(lastBiome);
    float bf = (biomeFlash > 0.0f) ? biomeFlash : 0.0f;
    Vec3 g1  = lerpV(theme.ground1, prev.ground1, bf);
    Vec3 g2  = lerpV(theme.ground2, prev.ground2, bf);

    float baseZ = floorf(pz / 10.0f) * 10.0f;
    for (int i = -1; i < 10; i++) {
        float z = baseZ - (float)i * 10.0f + 10.0f;
        renderer.addCubeToBatch({0.0f, -0.5f, z}, {10.0f, 1.0f, 10.0f}, g1);
        renderer.addCubeToBatch({0.0f, -1.5f, z}, {10.0f, 1.0f, 10.0f}, g2);
    }

    Vec3 divCol = (world.currentBiome == Biome::NETHER)
                  ? Vec3{0.8f, 0.2f, 0.1f} : Vec3{0.85f, 0.85f, 0.85f};
    for (int i = -1; i < 10; i++) {
        float z = baseZ - (float)i * 10.0f + 10.0f;
        renderer.addCubeToBatch({-1.0f, 0.02f, z}, {0.1f, 0.03f, 10.0f}, divCol);
        renderer.addCubeToBatch({ 1.0f, 0.02f, z}, {0.1f, 0.03f, 10.0f}, divCol);
    }

    // Biome side decorations
    if (world.currentBiome == Biome::PLAINS) {
        for (int i = 0; i < 6; i++) {
            float dz = baseZ - i * 12.0f;
            renderer.addCubeToBatch({-5.5f, 0.3f, dz}, {0.25f, 0.6f, 0.25f}, {0.2f, 0.7f, 0.15f});
            renderer.addCubeToBatch({ 5.5f, 0.3f, dz}, {0.25f, 0.6f, 0.25f}, {0.2f, 0.7f, 0.15f});
        }
    } else if (world.currentBiome == Biome::DESERT) {
        for (int i = 0; i < 4; i++) {
            float dz = baseZ - i * 20.0f;
            renderer.addCubeToBatch({-5.2f, 1.0f, dz}, {0.5f, 2.0f, 0.5f}, {0.3f, 0.6f, 0.2f});
            renderer.addCubeToBatch({ 5.2f, 1.2f, dz}, {0.5f, 2.4f, 0.5f}, {0.3f, 0.6f, 0.2f});
        }
    } else if (world.currentBiome == Biome::NETHER) {
        for (int i = 0; i < 5; i++) {
            float dz = baseZ - i * 16.0f;
            renderer.addCubeToBatch({-5.5f, 1.5f, dz}, {0.8f, 3.0f, 0.8f}, {0.45f, 0.08f, 0.05f});
            renderer.addCubeToBatch({ 5.5f, 1.5f, dz}, {0.8f, 3.0f, 0.8f}, {0.45f, 0.08f, 0.05f});
            renderer.addCubeToBatch({ 0.0f,-0.48f, dz}, {10.0f, 0.05f, 2.0f}, {1.0f, 0.4f, 0.05f});
        }
    } else if (world.currentBiome == Biome::SNOWY) {
        for (int i = 0; i < 4; i++) {
            float dz = baseZ - i * 18.0f;
            // Left tree
            renderer.addCubeToBatch({-5.2f, 0.8f, dz}, {0.4f, 1.6f, 0.4f}, {0.45f, 0.28f, 0.12f});
            renderer.addCubeToBatch({-5.2f, 2.4f, dz}, {1.8f, 1.2f, 1.8f}, {0.25f, 0.45f, 0.22f});
            renderer.addCubeToBatch({-5.2f, 3.1f, dz}, {1.8f, 0.25f,1.8f}, {0.90f, 0.95f, 1.00f});
            // Right tree
            renderer.addCubeToBatch({ 5.2f, 0.8f, dz}, {0.4f, 1.6f, 0.4f}, {0.45f, 0.28f, 0.12f});
            renderer.addCubeToBatch({ 5.2f, 2.4f, dz}, {1.8f, 1.2f, 1.8f}, {0.25f, 0.45f, 0.22f});
            renderer.addCubeToBatch({ 5.2f, 3.1f, dz}, {1.8f, 0.25f,1.8f}, {0.90f, 0.95f, 1.00f});
        }
    }
}

void Engine::render() {
    // Sky
    Vec3 daySky   = {0.40f, 0.65f, 0.90f};
    Vec3 nightSky = {0.04f, 0.04f, 0.12f};
    Vec3 sunsetS  = {0.80f, 0.38f, 0.15f};
    float blend   = (sinf(timeOfDay * 2.0f * PI) + 1.0f) * 0.5f;
    float sunsetT = fabsf(sinf(timeOfDay * PI));
    Vec3 sky = lerpV(lerpV(nightSky, daySky, blend), sunsetS, sunsetT * 0.35f);
    if (world.currentBiome == Biome::NETHER)
        sky = lerpV(sky, {0.25f, 0.05f, 0.02f}, 0.85f);

    renderer.clear(sky);
    if (!isStarted && !isGameOver) return;

    renderer.beginBatch();

    // Camera shake
    shakePhase += 0.4f; // dt-independent phase tick (~25Hz feel)
    float shakeX = sinf(shakePhase * 2.3f) * shakeAmt * 0.12f;
    float shakeY = cosf(shakePhase * 3.1f) * shakeAmt * 0.08f;

    // Sun/Moon
    if (world.currentBiome != Biome::NETHER) {
        float skyZ = player.pos.z - 100.0f;
        float sunY = 28.0f * (blend * 2.0f - 1.0f);
        if (blend > 0.5f) {
            renderer.addCubeToBatch({player.pos.x + 12.0f,  22.0f + sunY, skyZ},
                                    {7.0f, 7.0f, 0.1f}, {1.0f, 0.92f, 0.25f});
        } else {
            renderer.addCubeToBatch({player.pos.x + 12.0f, 22.0f - sunY, skyZ},
                                    {5.5f, 5.5f, 0.1f}, {0.88f, 0.90f, 1.00f});
        }
    } else {
        // Nether ceiling
        renderer.addCubeToBatch({player.pos.x, 18.0f, player.pos.z - 80.0f},
                                {40.0f, 4.0f, 60.0f}, {0.3f, 0.04f, 0.02f});
    }

    // FIX: Clouds — anchored to world Z grid, spacing 120 units, NOT time-based
    // They appear fixed in sky and player runs under them
    if (world.currentBiome == Biome::PLAINS || world.currentBiome == Biome::SNOWY) {
        float cloudBaseZ = floorf(player.pos.z / 120.0f) * 120.0f;
        for (int i = -1; i <= 3; i++) {
            addCloudRow(cloudBaseZ - (float)i * 120.0f);
        }
    }

    // Camera
    float camX = player.pos.x + shakeX;
    float camY = player.pos.y + 2.8f + shakeY + player.bobY;
    float camZ = player.pos.z + 7.0f;
    Mat4 view  = Mat4::translate(-camX, -camY, -camZ);
    Mat4 vp    = projection;
    vp.multiply(view);

    // Ground + decorations
    renderBiomeGround(player.pos.z);

    // Obstacles + collectibles
    for (auto& obj : world.objects) {
        if (!obj.active) continue;
        renderer.addCubeToBatch(obj.pos, obj.scale, obj.color);
        // TNT cross detail
        if (obj.isObstacle && obj.scale.y < 1.2f) {
            renderer.addCubeToBatch(obj.pos,
                {obj.scale.x * 0.15f, obj.scale.y * 1.01f, obj.scale.z * 0.85f},
                {1.0f, 1.0f, 1.0f});
            renderer.addCubeToBatch(obj.pos,
                {obj.scale.x * 0.85f, obj.scale.y * 1.01f, obj.scale.z * 0.15f},
                {1.0f, 1.0f, 1.0f});
        }
    }

    // Particles
    for (auto& p : world.particles) {
        if (!p.active) continue;
        float alpha  = p.life / p.maxLife;
        Vec3 fadedCol = {p.color.x * alpha, p.color.y * alpha, p.color.z * alpha};
        renderer.addCubeToBatch(p.pos, {0.18f, 0.18f, 0.18f}, fadedCol);
    }

    // Player model: Steve (2 cubes)
    bool invFlash = (player.iframes > 0.0f) && ((int)(player.iframes * 10) % 2 == 0);
    Vec3 skinCol  = invFlash ? Vec3{1.0f, 1.0f, 0.0f} : Vec3{0.9f, 0.7f, 0.5f};
    Vec3 shirtCol = invFlash ? Vec3{1.0f, 1.0f, 0.0f} : Vec3{0.2f, 0.3f, 0.8f};
    Vec3 pantCol  = invFlash ? Vec3{1.0f, 1.0f, 0.0f} : Vec3{0.2f, 0.2f, 0.4f};

    float yOff = player.isSliding ? -0.2f : 0.0f;
    Vec3 bodyPos = {player.pos.x, player.pos.y + player.bobY + 0.4f + yOff, player.pos.z};
    
    // Body (Shirt)
    renderer.addCubeToBatch(bodyPos, {0.6f, 0.8f, 0.3f}, shirtCol);
    // Legs (Pants)
    renderer.addCubeToBatch({bodyPos.x, bodyPos.y - 0.75f, bodyPos.z}, {0.6f, 0.7f, 0.3f}, pantCol);

    // Head (Skin)
    Vec3 headPos = {bodyPos.x, bodyPos.y + 0.75f, bodyPos.z};
    renderer.addCubeToBatch(headPos, {0.45f, 0.45f, 0.45f}, skinCol);

    // Death bg
    if (isGameOver) {
        float uiZ = player.pos.z + 5.5f;
        renderer.addCubeToBatch({player.pos.x, player.pos.y + 3.0f, uiZ - 0.5f},
                                {22.0f, 18.0f, 0.01f}, {0.25f, 0.0f, 0.0f});
    }

    renderer.endBatch(vp);
}
