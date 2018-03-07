// Vertex Shader
precision mediump int;
precision mediump float;

uniform mat4 u_Transform;
uniform float u_Size;
uniform sampler2D u_Texture_unit;

attribute vec3 a_Vertex;

void main() {

  // Set the size of a rendered point.
  gl_PointSize = u_Size;

  // Transform the location of the vertex.
  gl_Position = u_Transform * vec4(a_Vertex, 1.0);
}
