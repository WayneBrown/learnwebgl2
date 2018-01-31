// Fragment shader
// By: Dr. Wayne Brown, Spring 2018

precision mediump int;
precision mediump float;

// The scale factor for the checkerboard pattern.
uniform float u_Scale;

// The texture coordinates on a triangle
varying vec2 v_Texture_coordinate;

vec3 color1 = vec3(1.0, 0.0, 0.0);
vec3 color2 = vec3(0.0, 0.0, 0.0);

//-------------------------------------------------
// Calculate a checkerboard pattern based on the texture coordinates
vec4 checkerboard(vec2 tex_coords) {
  float s = tex_coords[0];
  float t = tex_coords[1];

  float sum     = floor(s * u_Scale) + floor(t * u_Scale);
  bool  isEven  = mod(sum,2.0) == 0.0;
  float percent = (isEven) ? 1.0 : 0.0;

  // Avoid if statements; use a calculation to get the desired color.
  vec3 color = color1 * percent + color2 * (1.0-percent);

  return vec4(color, 1.0);
}

//-------------------------------------------------
void main() {
  gl_FragColor = checkerboard(v_Texture_coordinate);
}
