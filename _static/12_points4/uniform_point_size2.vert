// Vertex Shader
precision mediump int;
precision mediump float;

uniform mat4      u_Transform;
uniform float     u_Size;

attribute vec3 a_Vertex;
attribute vec2 a_Texture_coordinate;

varying vec2  texture_coordinates;
varying float point_size;

void main() {

  // Pass the point's texture coordinate to the fragment shader
  texture_coordinates = a_Texture_coordinate;

  // Pass the point's size to the fragment shader
  point_size = u_Size;

  // Set the size of a rendered point.
  gl_PointSize = u_Size;

  // Transform the location of the vertex.
  gl_Position = u_Transform * vec4(a_Vertex, 1.0);
}
