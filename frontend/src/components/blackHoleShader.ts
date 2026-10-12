// GLSL for <BlackHole />. Every pixel traces one light ray backwards from the
// camera past a Schwarzschild black hole (event horizon radius = 1). Light
// bending uses the usual photon-orbit approximation: an extra inverse-r^5 pull
// that reproduces the lensed "halo" of the far side of the disk, the ring
// under the shadow, and the thin photon ring hugging the event horizon.
//
// Output is premultiplied alpha: empty space is transparent so whatever is
// behind the canvas (the starfield) shows through, while the shadow itself is
// opaque black and hides it, as a real black hole would.

export const VERTEX_SHADER = /* glsl */ `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uTilt;    // camera elevation above the disk plane (radians)
uniform float uRoll;    // camera roll (radians)
uniform float uTanFov;  // tan of half the horizontal field of view

#define DIST 40.0
#define R_IN 3.0        // innermost stable orbit: the disk stops here
#define R_OUT 12.0
#define R_BOUND 15.0    // outside this sphere rays travel in straight lines
#define TAU 6.28318530718
#define STEPS 170
#define CELLS 24.0      // noise cells per revolution of the disk

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Value noise that wraps every period cells along x, so the angular axis of
// the disk has no seam where atan() jumps from +PI to -PI.
float wrapNoise(vec2 p, float period) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x0 = mod(i.x, period);
  float x1 = mod(i.x + 1.0, period);
  float a = hash12(vec2(x0, i.y));
  float b = hash12(vec2(x1, i.y));
  float c = hash12(vec2(x0, i.y + 1.0));
  float d = hash12(vec2(x1, i.y + 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Ember ramp: deep red -> orange -> pale gold, matching the site's reds.
vec3 ramp(float x) {
  vec3 c = mix(vec3(0.16, 0.015, 0.0), vec3(0.70, 0.10, 0.01), smoothstep(0.0, 0.32, x));
  c = mix(c, vec3(1.0, 0.36, 0.04), smoothstep(0.28, 0.72, x));
  c = mix(c, vec3(1.0, 0.66, 0.30), smoothstep(0.68, 1.12, x));
  c = mix(c, vec3(1.0, 0.90, 0.72), smoothstep(1.10, 1.65, x));
  return c;
}

vec4 disk(vec3 p, vec3 rayDir) {
  float r = length(p.xz);
  float t = (r - R_IN) / (R_OUT - R_IN);

  // Keplerian shear: inner rings lap the outer ones.
  float omega = 0.55 * pow(r / R_IN, -1.5);
  float ang = atan(p.z, p.x) - mod(uTime * omega, TAU);
  float u = ang / TAU * CELLS;

  // Stretched along the orbit, tight across it: thin streaky bands.
  float n = wrapNoise(vec2(u, r * 2.6), CELLS) * 0.50
          + wrapNoise(vec2(u * 2.0, r * 6.5), CELLS * 2.0) * 0.32
          + wrapNoise(vec2(u * 4.0, r * 15.0), CELLS * 4.0) * 0.18;
  float bands = smoothstep(0.22, 0.88, n);

  float inner = smoothstep(0.0, 0.06, t);
  float outer = 1.0 - smoothstep(0.5, 1.0, t);
  float profile = pow(R_IN / r, 0.85) * inner * outer;

  // A touch of relativistic beaming: the approaching side glows hotter.
  vec3 orbitDir = normalize(vec3(-p.z, 0.0, p.x));
  float beta = sqrt(0.5 / r);
  float doppler = 1.0 / (1.0 - beta * dot(orbitDir, -rayDir));
  float beaming = mix(1.0, doppler * doppler * doppler, 0.16);

  float intensity = 1.55 * profile * beaming * (0.22 + 1.2 * bands);
  float alpha = clamp(intensity * 1.35, 0.0, 1.0);
  return vec4(ramp(intensity), alpha);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.x);

  vec3 camPos = vec3(0.0, sin(uTilt), -cos(uTilt)) * DIST;
  vec3 fwd = normalize(-camPos);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  vec3 up = cross(fwd, right);
  float cr = cos(uRoll);
  float sr = sin(uRoll);
  vec3 rollRight = cr * right + sr * up;
  vec3 rollUp = -sr * right + cr * up;
  vec3 dir = normalize(fwd + (uv.x * rollRight + uv.y * rollUp) * uTanFov);

  // Jump straight to the bounding sphere; rays that miss it see empty space.
  float b = dot(camPos, dir);
  float c = dot(camPos, camPos) - R_BOUND * R_BOUND;
  float disc = b * b - c;
  if (disc < 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec3 pos = camPos + dir * (-b - sqrt(disc));
  vec3 vel = dir;
  vec3 hv = cross(pos, vel);
  float h2 = dot(hv, hv);

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  bool captured = false;

  for (int i = 0; i < STEPS; i++) {
    float r2 = dot(pos, pos);
    float r = sqrt(r2);
    float dt = max(0.04, 0.065 * r);

    vel += -1.5 * h2 * pos / (r2 * r2 * r) * dt;
    vec3 next = pos + vel * dt;

    // Crossed the disk plane during this step?
    if (pos.y * next.y < 0.0) {
      vec3 hit = mix(pos, next, pos.y / (pos.y - next.y));
      float hr = length(hit.xz);
      if (hr > R_IN && hr < R_OUT) {
        vec4 d = disk(hit, normalize(vel));
        col += (1.0 - alpha) * d.rgb * d.a;
        alpha += (1.0 - alpha) * d.a;
      }
    }

    pos = next;
    float nr2 = dot(pos, pos);
    if (nr2 < 1.0) {
      captured = true;
      break;
    }
    if (nr2 > R_BOUND * R_BOUND && dot(pos, vel) > 0.0) break;
    if (alpha > 0.995) break;
  }

  // The traced photon ring is thinner than a pixel and aliases into dots, so
  // paint a soft one at the critical impact parameter (3*sqrt(3)/2) instead.
  float ring = exp(-pow((sqrt(h2) - 2.598) / 0.05, 2.0));
  col += (1.0 - alpha) * vec3(1.0, 0.42, 0.1) * ring * 0.6;

  // Whatever fell through the horizon is the opaque shadow.
  if (captured) alpha = 1.0;

  gl_FragColor = vec4(col, alpha);
}
`;
