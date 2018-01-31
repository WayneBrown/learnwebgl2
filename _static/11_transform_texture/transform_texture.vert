// Vertex Shader
precision mediump int;
precision mediump float;

// Scene transformation
uniform mat4 u_Clipping_transform; // Projection, camera, model transform

// Texture transformation
uniform mat3 u_Texture_transform;

// Original model data
attribute vec3 a_Vertex;
attribute vec2 a_Texture_coordinate;

// Data (to be interpolated) that is passed on to the fragment shader
varying vec2 v_Texture_coordinate;

void main() {

  // Transform the texture coordinates
  vec3 new_texture_coordinates = u_Texture_transform * vec3(a_Texture_coordinate, 1.0);

  // Pass the texture coordinate to the fragment shader.
  v_Texture_coordinate = vec2(new_texture_coordinates);

  // Transform the location of the vertex for the graphics pipeline.
  gl_Position = u_Clipping_transform * vec4(a_Vertex, 1.0);
}
