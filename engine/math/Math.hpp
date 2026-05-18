#ifndef MATH_HPP
#define MATH_HPP

#include <cmath>
#include <cstring>

struct Vec3 {
    float x, y, z;
    Vec3(float x=0, float y=0, float z=0) : x(x), y(y), z(z) {}
    Vec3 operator+(const Vec3& v) const { return Vec3(x+v.x, y+v.y, z+v.z); }
    Vec3 operator-(const Vec3& v) const { return Vec3(x-v.x, y-v.y, z-v.z); }
    Vec3 operator*(float s) const { return Vec3(x*s, y*s, z*s); }
};

struct Mat4 {
    float m[16];
    Mat4() { identity(); }

    void identity() {
        memset(m, 0, sizeof(m));
        m[0] = m[5] = m[10] = m[15] = 1.0f;
    }

    static Mat4 perspective(float fov, float aspect, float near, float far) {
        Mat4 res;
        float tanHalfFov = tanf(fov / 2.0f);
        res.m[0] = 1.0f / (aspect * tanHalfFov);
        res.m[5] = 1.0f / tanHalfFov;
        res.m[10] = -(far + near) / (far - near);
        res.m[11] = -1.0f;
        res.m[14] = -(2.0f * far * near) / (far - near);
        res.m[15] = 0.0f;
        return res;
    }

    static Mat4 translate(float x, float y, float z) {
        Mat4 res;
        res.m[12] = x; res.m[13] = y; res.m[14] = z;
        return res;
    }

    static Mat4 scale(float x, float y, float z) {
        Mat4 res;
        res.m[0] = x; res.m[5] = y; res.m[10] = z;
        return res;
    }

    void multiply(const Mat4& b) {
        float res[16];
        const float* a = m;
        const float* bb = b.m;

        for (int i = 0; i < 4; i++) { // Column
            for (int j = 0; j < 4; j++) { // Row
                res[i * 4 + j] = a[0 * 4 + j] * bb[i * 4 + 0] +
                                 a[1 * 4 + j] * bb[i * 4 + 1] +
                                 a[2 * 4 + j] * bb[i * 4 + 2] +
                                 a[3 * 4 + j] * bb[i * 4 + 3];
            }
        }
        memcpy(m, res, sizeof(res));
    }
};

#endif