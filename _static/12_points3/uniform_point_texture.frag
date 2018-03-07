// Fragment shader program
precision mediump int;
precision mediump float;

// The texture unit to use for the color lookup
uniform sampler2D u_Texture_unit;

void main() {
  gl_FragColor = texture2D(u_Texture_unit, gl_PointCoord);
}
