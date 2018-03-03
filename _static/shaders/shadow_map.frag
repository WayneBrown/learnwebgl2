// Fragment shader program
precision mediump int;
precision mediump float;

uniform sampler2D u_Sampler;
varying vec2 v_TexCoords;

void main() {
  // Display the texture image's pixel color
  gl_FragColor = texture2D(u_Sampler, v_TexCoords);
}