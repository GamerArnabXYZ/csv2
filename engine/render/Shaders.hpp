#ifndef SHADERS_HPP
#define SHADERS_HPP

// Vertex shader: face-based lighting simulation via aFaceNormal
static const char* VS_SOURCE =
    "attribute vec3 aPos;"
    "attribute vec3 aColor;"
    "attribute float aLight;"      // per-vertex AO / face brightness
    "varying vec3 vColor;"
    "varying float vLight;"
    "uniform mat4 uVP;"
    "void main() {"
    "  gl_Position = uVP * vec4(aPos, 1.0);"
    "  vColor = aColor;"
    "  vLight = aLight;"
    "}";

static const char* FS_SOURCE =
    "precision mediump float;"
    "varying vec3 vColor;"
    "varying float vLight;"
    "void main() {"
    // Minecraft-style flat shading with per-face darkness
    "  vec3 lit = vColor * vLight;"
    "  gl_FragColor = vec4(lit, 1.0);"
    "}";

#endif
