// Vertex Shader
// By: Dr. Wayne Brown, Spring 2016

precision mediump int;
precision mediump float;

uniform   mat4 u_Transform;

attribute vec3 a_Vertex;
attribute vec4 a_Color;
attribute vec2 a_Texture;

varying vec4 v_vertex_color;
varying vec2 v_texture;

void main() {
  // Transform the location of the vertex
  gl_Position = u_Transform * vec4(a_Vertex, 1.0);

  // Pass on the color and texture coordinates for this vertex to the fragment shader
  v_vertex_color = a_Color;
  v_texture = a_Texture;
}
