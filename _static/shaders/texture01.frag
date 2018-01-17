// Fragment shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

varying vec4 v_vertex_color;
varying vec2 v_texture;

float grid_size = 0.2; // Percentage of whole

//-------------------------------------------------
// modify the color based on the texture coordinates
vec4 modify_color(vec2 tex_coords, vec4 color) {
  float s = tex_coords[0];
  float t = tex_coords[1];
  vec4 new_color;

  if ( mod((floor(s/grid_size) + floor(t/grid_size)),2.0) == 1.0) {
    // Use the normal face's color.
    new_color = color;
  } else {
    // Make the color darker
    new_color = vec4(vec3(color) * 0.8, 1.0);
  }
  return new_color;
}

//-------------------------------------------------
void main() {
  gl_FragColor = modify_color(v_texture, v_vertex_color);
}
