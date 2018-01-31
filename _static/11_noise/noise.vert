// Vertex Shader
precision mediump int;
precision mediump float;

// Scene transformation
uniform mat4 u_Clipping_transform; // Projection, camera, model transform

// Manipulation of the texture coordinates
uniform vec2 u_Translate_texture;
uniform float u_Scale_texure;

// Original model data
attribute vec3 a_Vertex;
attribute vec2 a_Texture_coordinate;

// Data (to be interpolated) that is passed on to the fragment shader
varying vec2 v_Texture_coordinate;

void main() {

  // Pass the vertex's texture coordinate to the fragment shader,
  // but scale and translate them first.
  v_Texture_coordinate = (a_Texture_coordinate * u_Scale_texure) + u_Translate_texture;

  // Transform the location of the vertex for the graphics pipeline.
  gl_Position = u_Clipping_transform * vec4(a_Vertex, 1.0);
}
