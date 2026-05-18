#ifndef WORLD_HPP
#define WORLD_HPP

#include <vector>
#include <cstdlib>
#include <algorithm>
#include "../math/Math.hpp"

// ── Biome types ──────────────────────────────────────────────────
enum class Biome { PLAINS, DESERT, NETHER, SNOWY };

struct GameObject {
    Vec3  pos, scale, color;
    bool  isObstacle;
    bool  active;
    bool  isCoin;
    float spinAngle = 0.0f;   // for emerald spin effect (visual only)

    GameObject(Vec3 p, Vec3 s, Vec3 c, bool obs, bool coin=false)
        : pos(p), scale(s), color(c), isObstacle(obs), active(true), isCoin(coin) {}
};

// Simple particle for collect/death FX (CPU side, rendered as tiny cubes)
struct Particle {
    Vec3  pos, vel, color;
    float life, maxLife;
    bool  active;
    Particle(Vec3 p, Vec3 v, Vec3 c, float l)
        : pos(p), vel(v), color(c), life(l), maxLife(l), active(true) {}
};

class World {
public:
    std::vector<GameObject> objects;
    std::vector<Particle>   particles;
    float lastSpawnZ = -20.0f;
    int   distanceTravelled = 0;   // for biome progression
    Biome currentBiome = Biome::PLAINS;

    static const int SPAWN_INTERVAL = 14;
    static const int CLEANUP_BEHIND = 25;

    // Biome ground/sky colors
    struct BiomeTheme {
        Vec3 ground1, ground2, fog;    // ground primary, secondary, sky tint modifier
    };

    static BiomeTheme getTheme(Biome b) {
        switch (b) {
            case Biome::DESERT: return {{0.93f,0.78f,0.35f},{0.85f,0.65f,0.20f},{0.1f,0.05f,0.0f}};
            case Biome::NETHER: return {{0.55f,0.10f,0.05f},{0.40f,0.07f,0.02f},{0.2f,0.0f, 0.0f}};
            case Biome::SNOWY:  return {{0.90f,0.95f,1.00f},{0.75f,0.82f,0.90f},{0.0f,0.05f,0.1f}};
            default:            return {{0.30f,0.60f,0.25f},{0.25f,0.50f,0.20f},{0.0f,0.0f, 0.0f}};
        }
    }

    World() {
        objects.reserve(256);
        particles.reserve(128);
        for (int i = 0; i < 4; i++) spawnRow(lastSpawnZ - i * SPAWN_INTERVAL);
        lastSpawnZ -= 4 * SPAWN_INTERVAL;
    }

    Biome biomeForDistance(int d) {
        if      (d > 2000) return Biome::NETHER;
        else if (d > 1000) return Biome::SNOWY;
        else if (d > 400)  return Biome::DESERT;
        return Biome::PLAINS;
    }

    void update(float playerZ, float dt) {
        // Biome progression
        distanceTravelled = (int)(-playerZ);
        currentBiome = biomeForDistance(distanceTravelled);

        // Spawn ahead
        while (playerZ < lastSpawnZ + SPAWN_INTERVAL) {
            lastSpawnZ -= SPAWN_INTERVAL;
            spawnRow(lastSpawnZ);
        }

        // Deactivate behind
        for (auto& obj : objects)
            if (obj.pos.z > playerZ + CLEANUP_BEHIND) obj.active = false;

        // Prune dead objects
        if (objects.size() > 300) {
            objects.erase(std::remove_if(objects.begin(), objects.end(),
                [](const GameObject& o){ return !o.active; }), objects.end());
        }

        // Update particles
        for (auto& p : particles) {
            if (!p.active) continue;
            p.pos.x += p.vel.x * dt;
            p.pos.y += p.vel.y * dt;
            p.pos.z += p.vel.z * dt;
            p.vel.y -= 12.0f * dt;  // gravity
            p.life  -= dt;
            if (p.life <= 0.0f) p.active = false;
        }
        if (particles.size() > 64) {
            particles.erase(std::remove_if(particles.begin(), particles.end(),
                [](const Particle& p){ return !p.active; }), particles.end());
        }
    }

    void spawnCollectParticles(Vec3 pos, Vec3 color) {
        for (int i = 0; i < 8; i++) {
            Vec3 vel = {
                ((rand()%200)-100)*0.04f,
                ((rand()%100))*0.06f + 1.0f,
                ((rand()%200)-100)*0.04f
            };
            particles.emplace_back(pos, vel, color, 0.6f + (rand()%40)*0.01f);
        }
    }

    void spawnDeathParticles(Vec3 pos) {
        for (int i = 0; i < 16; i++) {
            Vec3 vel = {
                ((rand()%200)-100)*0.08f,
                ((rand()%200))*0.06f,
                ((rand()%200)-100)*0.08f
            };
            Vec3 col = {0.9f, (rand()%3)*0.1f+0.1f, 0.0f};
            particles.emplace_back(pos, vel, col, 1.0f + (rand()%60)*0.01f);
        }
    }

    void spawnRow(float z) {
        static const float lanes[3] = {-2.0f, 0.0f, 2.0f};
        BiomeTheme theme = getTheme(currentBiome);

        // Difficulty scales with distance
        int diff = distanceTravelled / 200; // 0-10+
        bool doubleObstacle = (diff > 2) && (rand() % 4 == 0);
        bool gapRow         = (diff > 5) && (rand() % 6 == 0);

        if (gapRow) return; // empty row = forced dodge

        int obsLane  = rand() % 3;
        int obsLane2 = (obsLane + 1 + rand()%2) % 3;
        int coinLane;

        if (doubleObstacle) {
            // Only one lane is free (not obsLane and not obsLane2)
            coinLane = 3 - (obsLane + obsLane2);
        } else {
            coinLane = rand() % 3;
            while (coinLane == obsLane) coinLane = rand() % 3;
        }

        // Obstacle types: 0=short TNT, 1=tall cactus/fence, 2=wide low wall
        int obsType = rand() % 3;
        Vec3 obsScale;
        Vec3 obsColor;

        switch (obsType) {
            case 0: // TNT cube — red/white
                obsScale = {0.9f, 0.9f, 0.9f};
                obsColor = {0.85f, 0.15f, 0.10f};
                break;
            case 1: // Tall obstacle (cactus/fence post)
                obsScale = {0.55f, 2.2f, 0.55f};
                obsColor = currentBiome == Biome::DESERT ? Vec3{0.3f,0.6f,0.2f} : Vec3{0.4f,0.3f,0.15f};
                break;
            case 2: // Low wide wall — must jump
                obsScale = {1.5f, 0.6f, 0.6f};
                obsColor = {0.55f, 0.45f, 0.35f};  // stone
                break;
        }

        objects.emplace_back(
            Vec3(lanes[obsLane], obsScale.y*0.5f, z),
            obsScale, obsColor, true);

        if (doubleObstacle) {
            objects.emplace_back(
                Vec3(lanes[obsLane2], obsScale.y*0.5f, z),
                obsScale, obsColor, true);
        }

        // Collectible: emerald (green) or gold nugget (yellow)
        bool isEmerald = (rand() % 4 == 0);
        Vec3 coinColor = isEmerald ? Vec3{0.1f,0.9f,0.4f} : Vec3{1.0f,0.85f,0.1f};
        float coinH    = isEmerald ? 1.4f : 0.8f;  // emeralds float higher
        objects.emplace_back(
            Vec3(lanes[coinLane], coinH, z),
            Vec3{0.38f, 0.38f, 0.38f}, coinColor, false, true);
    }
};

#endif
