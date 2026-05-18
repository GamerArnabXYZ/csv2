#include "Renderer.hpp"
#include "Shaders.hpp"

Renderer::Renderer() : program(0), viewW(0), viewH(0), vbo(0), ebo(0) {
    batchVertices.reserve(4096);
    batchIndices.reserve(6144);
}

void Renderer::init() {
    auto compile = [](GLenum type, const char* src) -> GLuint {
        GLuint s = glCreateShader(type);
        glShaderSource(s, 1, &src, nullptr);
        glCompileShader(s);
        return s;
    };
    GLuint vs = compile(GL_VERTEX_SHADER, VS_SOURCE);
    GLuint fs = compile(GL_FRAGMENT_SHADER, FS_SOURCE);
    program = glCreateProgram();
    glAttachShader(program, vs);
    glAttachShader(program, fs);
    glLinkProgram(program);
    glDeleteShader(vs);
    glDeleteShader(fs);

    posAttrib   = glGetAttribLocation(program,  "aPos");
    colorAttrib = glGetAttribLocation(program,  "aColor");
    lightAttrib = glGetAttribLocation(program,  "aLight");
    vpUniform   = glGetUniformLocation(program, "uVP");

    glGenBuffers(1, &vbo);
    glGenBuffers(1, &ebo);
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LESS);
}

void Renderer::setViewport(int w, int h) {
    viewW = w; viewH = h;
    glViewport(0, 0, w, h);
}

void Renderer::clear(const Vec3& color) {
    glClearColor(color.x, color.y, color.z, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

void Renderer::beginBatch() {
    batchVertices.clear();
    batchIndices.clear();
}

// Face brightness constants — Minecraft-style flat shading
static const float LIGHT_TOP    = 1.00f;
static const float LIGHT_SIDE_Z = 0.80f;
static const float LIGHT_SIDE_X = 0.65f;
static const float LIGHT_BOTTOM = 0.50f;

void Renderer::addCubeToBatch(const Vec3& pos, const Vec3& scale, const Vec3& color) {
    GLushort base = (GLushort)batchVertices.size();
    float r = color.x, g = color.y, b = color.z;

    float x1 = pos.x - scale.x*0.5f, x2 = pos.x + scale.x*0.5f;
    float y1 = pos.y - scale.y*0.5f, y2 = pos.y + scale.y*0.5f;
    float z1 = pos.z - scale.z*0.5f, z2 = pos.z + scale.z*0.5f;

    // 24 vertices (4 per face × 6 faces) with per-face lighting
    Vertex verts[24] = {
        // TOP (y2) — brightest
        {x1,y2,z1, r,g,b, LIGHT_TOP}, {x2,y2,z1, r,g,b, LIGHT_TOP},
        {x2,y2,z2, r,g,b, LIGHT_TOP}, {x1,y2,z2, r,g,b, LIGHT_TOP},
        // BOTTOM (y1)
        {x1,y1,z2, r,g,b, LIGHT_BOTTOM}, {x2,y1,z2, r,g,b, LIGHT_BOTTOM},
        {x2,y1,z1, r,g,b, LIGHT_BOTTOM}, {x1,y1,z1, r,g,b, LIGHT_BOTTOM},
        // FRONT (z2) — player-facing
        {x1,y1,z2, r,g,b, LIGHT_SIDE_Z}, {x2,y1,z2, r,g,b, LIGHT_SIDE_Z},
        {x2,y2,z2, r,g,b, LIGHT_SIDE_Z}, {x1,y2,z2, r,g,b, LIGHT_SIDE_Z},
        // BACK (z1)
        {x2,y1,z1, r,g,b, LIGHT_SIDE_Z*0.85f}, {x1,y1,z1, r,g,b, LIGHT_SIDE_Z*0.85f},
        {x1,y2,z1, r,g,b, LIGHT_SIDE_Z*0.85f}, {x2,y2,z1, r,g,b, LIGHT_SIDE_Z*0.85f},
        // RIGHT (x2)
        {x2,y1,z2, r,g,b, LIGHT_SIDE_X}, {x2,y1,z1, r,g,b, LIGHT_SIDE_X},
        {x2,y2,z1, r,g,b, LIGHT_SIDE_X}, {x2,y2,z2, r,g,b, LIGHT_SIDE_X},
        // LEFT (x1)
        {x1,y1,z1, r,g,b, LIGHT_SIDE_X*0.9f}, {x1,y1,z2, r,g,b, LIGHT_SIDE_X*0.9f},
        {x1,y2,z2, r,g,b, LIGHT_SIDE_X*0.9f}, {x1,y2,z1, r,g,b, LIGHT_SIDE_X*0.9f},
    };
    for (int i = 0; i < 24; i++) batchVertices.push_back(verts[i]);

    // 6 faces × 2 triangles × 3 indices
    for (int f = 0; f < 6; f++) {
        GLushort b0 = base + f*4;
        batchIndices.push_back(b0+0); batchIndices.push_back(b0+1); batchIndices.push_back(b0+2);
        batchIndices.push_back(b0+0); batchIndices.push_back(b0+2); batchIndices.push_back(b0+3);
    }
}

void Renderer::endBatch(const Mat4& viewProj) {
    if (batchVertices.empty()) return;

    glUseProgram(program);
    glUniformMatrix4fv(vpUniform, 1, GL_FALSE, viewProj.m);

    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER,
        batchVertices.size() * sizeof(Vertex),
        batchVertices.data(), GL_STREAM_DRAW);

    int stride = sizeof(Vertex);
    glVertexAttribPointer(posAttrib,   3, GL_FLOAT, GL_FALSE, stride, (void*)0);
    glEnableVertexAttribArray(posAttrib);
    glVertexAttribPointer(colorAttrib, 3, GL_FLOAT, GL_FALSE, stride, (void*)(3*sizeof(float)));
    glEnableVertexAttribArray(colorAttrib);
    glVertexAttribPointer(lightAttrib, 1, GL_FLOAT, GL_FALSE, stride, (void*)(6*sizeof(float)));
    glEnableVertexAttribArray(lightAttrib);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER,
        batchIndices.size() * sizeof(GLushort),
        batchIndices.data(), GL_STREAM_DRAW);

    glDrawElements(GL_TRIANGLES, (GLsizei)batchIndices.size(), GL_UNSIGNED_SHORT, 0);
}
