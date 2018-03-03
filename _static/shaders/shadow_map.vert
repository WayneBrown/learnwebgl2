// Vertex Shader
precision mediump int;
precision mediump float;

// The sampler used to get pixels out of the texture map
uniform sampler2D u_Sampler;

// Model data in NDC so no transformation is needed.
attribute vec2 a_Vertex;

varying vec2 v_TexCoords;

void main() {

  // The vertices of a quad that covers the entire window work well for
  // the appropriate texture coordinates.
  v_TexCoords = a_Vertex*0.5 + 0.5;

  // Use a 2D point to define 2 triangles that cover the entire window.
  gl_Position = vec4(a_Vertex, 0.0, 1.0);
}