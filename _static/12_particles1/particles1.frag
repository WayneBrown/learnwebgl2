// Fragment shader program
precision mediump int;
precision mediump float;

// The texture unit to use for the color lookup
uniform sampler2D u_Texture_unit;
uniform vec2      u_Texture_delta;  // delta_s, delta_t

varying float v_Point_size;
varying vec2  v_Texture_coordinates;
varying float v_Alpha;

vec2 center = vec2(0.5, 0.5);

void main() {
  // Render the point as a circle.
  if (distance(center, gl_PointCoord) > 0.5) {
    discard;
  } else {
    // How much does gl_PointCoord values change between pixels?
    float point_delta = 1.0 / (v_Point_size - 1.0);

    // Integer offset to adjacent pixels, based on gl_PointCoord.
    ivec2 offset = ivec2((gl_PointCoord - center) / point_delta);

    // Offset the texture coordinates to an adjacent pixel.
    vec2 coords = v_Texture_coordinates + (vec2(offset) * u_Texture_delta);

    // Look up the color from the texture map.
    vec4 color = texture2D(u_Texture_unit, coords);

    // Set the fragment's color, using the particle's alpha value.
    gl_FragColor = vec4(color.rgb, v_Alpha);
  }
}

