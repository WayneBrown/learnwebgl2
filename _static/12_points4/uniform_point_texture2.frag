// Fragment shader program
precision mediump int;
precision mediump float;

// The texture unit to use for the color lookup
uniform sampler2D u_Texture_unit;
uniform vec2      u_Texture_delta;  // delta_s, delta_t

varying vec2  texture_coordinates;
varying float point_size;

vec2 center = vec2(0.5, 0.5);

void main() {
  // How much does gl_PointCoord values change between pixels?
  float point_delta = 1.0 / (point_size - 1.0);

  // Integer offset to adjacent pixels, based on gl_PointCoord.
  ivec2 offset = ivec2((gl_PointCoord - center) / point_delta);

  // Offset the texture coordinates to an adjacent pixel.
  vec2 coords = texture_coordinates + (vec2(offset) * u_Texture_delta);

  // Look up the color from the texture map.
  gl_FragColor = texture2D(u_Texture_unit, coords);
}
