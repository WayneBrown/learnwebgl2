// Fragment shader
// By: Dr. Wayne Brown, Spring 2018

precision mediump int;
precision mediump float;

const float PI = 3.141592653589793;
const int   n  = 5;    // number of overlays

// Parameters for each pattern layer
uniform int   u_Active[n];
uniform int   u_Pattern[n];
uniform float u_Scale[n];
uniform float u_Amount[n];
uniform vec3  u_Color[n];

varying vec2 v_Texture_coordinate;

// Types of patterns for each layer
const int GRADIENT_PATTERN     = 0;
const int CHECKERBOARD_PATTERN = 1;
const int SIMPLEX_PATTERN      = 2;

//=========================================================================
// OpenSimplex algorithm - a type of "Perlin Noise"
// Source: http://www.geeks3d.com/20110317/shader-library-simplex-noise-glsl-opengl/

#define NORMALIZE_GRADIENTS
#undef  USE_CIRCLE

float permute(float x0,vec3 p) {
  float x1 = mod(x0 * p.y, p.x);
  return floor(  mod( (x1 + p.z) *x0, p.x ));
}
vec2 permute(vec2 x0,vec3 p) {
  vec2 x1 = mod(x0 * p.y, p.x);
  return floor(  mod( (x1 + p.z) *x0, p.x ));
}
vec3 permute(vec3 x0,vec3 p) {
  vec3 x1 = mod(x0 * p.y, p.x);
  return floor(  mod( (x1 + p.z) *x0, p.x ));
}
vec4 permute(vec4 x0,vec3 p) {
  vec4 x1 = mod(x0 * p.y, p.x);
  return floor(  mod( (x1 + p.z) *x0, p.x ));
}

// uniform vec4 pParam;
// Example constant with a 289 element permutation
const vec4 pParam = vec4( 17.0*17.0, 34.0, 1.0, 7.0);

float taylorInvSqrt(float r)
{
  return ( 0.83666002653408 + 0.7*0.85373472095314 - 0.85373472095314 * r );
}

vec3 simplexNoise2(vec2 v, float scale, vec3 color)
{
  // Scale the texture coordinates
  v = v * scale;

  const vec2 C = vec2(0.211324865405187134, // (3.0-sqrt(3.0))/6.;
                      0.366025403784438597); // 0.5*(sqrt(3.0)-1.);
  const vec3 D = vec3( 0., 0.5, 2.0) * 3.14159265358979312;
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1  =  (x0.x > x0.y) ? vec2(1.,0.) : vec2(0.,1.) ;

   //  x0 = x0 - 0. + 0. * C
  vec2 x1 = x0 - i1 + 1. * C.xx ;
  vec2 x2 = x0 - 1. + 2. * C.xx ;

// Permutations
  i = mod(i, pParam.x);
  vec3 p = permute( permute(
             i.y + vec3(0., i1.y, 1. ), pParam.xyz)
           + i.x + vec3(0., i1.x, 1. ), pParam.xyz);

#ifndef USE_CIRCLE
// ( N points uniformly over a line, mapped onto a diamond.)
  vec3 x = fract(p / pParam.w) ;
  vec3 h = 0.5 - abs(x) ;

  vec3 sx = vec3(lessThan(x,D.xxx)) *2. -1.;
  vec3 sh = vec3(lessThan(h,D.xxx));

  vec3 a0 = x + sx*sh;
  vec2 p0 = vec2(a0.x,h.x);
  vec2 p1 = vec2(a0.y,h.y);
  vec2 p2 = vec2(a0.z,h.z);

#ifdef NORMALIZE_GRADIENTS
  p0 *= taylorInvSqrt(dot(p0,p0));
  p1 *= taylorInvSqrt(dot(p1,p1));
  p2 *= taylorInvSqrt(dot(p2,p2));
#endif

  vec3 g = 2.0 * vec3( dot(p0, x0), dot(p1, x1), dot(p2, x2) );
#else
// N points around a unit circle.
  vec3 phi = D.z * mod(p,pParam.w) /pParam.w ;
  vec4 a0 = sin(phi.xxyy+D.xyxy);
  vec2 a1 = sin(phi.zz  +D.xy);
  vec3 g = vec3( dot(a0.xy, x0), dot(a0.zw, x1), dot(a1.xy, x2) );
#endif
// mix
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.);
  m = m*m ;

  float percent = 1.66666* 70.*dot(m*m, g);
  percent = (percent + 1.0) * 0.5;

  return color * percent;
}
// End of OpenSimplex algorithm
//=========================================================================

//-------------------------------------------------
// Calculate a color based on the texture coordinates
vec3 gradient(vec2 tex_coords, float scale, vec3 color) {
  float s = tex_coords[0] * scale;
  float t = tex_coords[1] * scale;

  return color * (sin(s * 2.0*PI) * sin(t * 2.0*PI));
}

//-------------------------------------------------
// Calculate a checkerboard pattern based on the texture coordinates
vec3 checkerboard(vec2 tex_coords, float scale, vec3 color) {
  float s = tex_coords[0];
  float t = tex_coords[1];

  float sum     = floor(s * scale) + floor(t * scale);
  bool  isEven  = mod(sum,2.0) == 0.0;
  float percent = (isEven) ? 1.0 : 0.0;

  return percent * color;
}

//-------------------------------------------------
// Add all of the overlays
vec4 overlay(vec2 tex_coords) {

  vec3 color = vec3(0.0, 0.0, 0.0);

  for (int j=0; j<n; j++) {
    if (u_Active[j] == 1) {
      if (u_Pattern[j] == GRADIENT_PATTERN) {
        color = color + u_Amount[j] * gradient(tex_coords, u_Scale[j], u_Color[j]);
      } else if (u_Pattern[j] == CHECKERBOARD_PATTERN) {
        color = color + u_Amount[j] * checkerboard(tex_coords, u_Scale[j], u_Color[j]);
      } else if (u_Pattern[j] == SIMPLEX_PATTERN) {
        color = color + u_Amount[j] * simplexNoise2(v_Texture_coordinate, u_Scale[j], u_Color[j]);
      }
    }
  }

  return vec4(color, 1.0);
}

//-------------------------------------------------
void main() {
  gl_FragColor = overlay(v_Texture_coordinate);
}
