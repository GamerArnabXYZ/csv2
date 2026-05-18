#ifndef RENDERER_HPP
#define RENDERER_HPP

#ifdef __EMSCRIPTEN__
#include <GLES2/gl2.h>
#else
#include <GLES2/gl2.h>
#endif

#include <vector>
#include "../math/Math.hpp"

struct Vertex {
    float x, y, z;
    float r, g, b;
    float light;   // face brightness: top=1.0, sides=0.75, bottom=0.5
};

class Renderer {
public:
    Renderer();
    void init();
    void setViewport(int w, int h);
    void clear(const Vec3& color);
    void beginBatch();
    void addCubeToBatch(const Vec3& pos, const Vec3& scale, const Vec3& color);
    void endBatch(const Mat4& viewProj);

private:
    GLuint program, vbo, ebo;
    GLint  posAttrib, colorAttrib, lightAttrib, vpUniform;
    int    viewW, viewH;

    std::vector<Vertex>   batchVertices;
    std::vector<GLushort> batchIndices;
};
#endif
