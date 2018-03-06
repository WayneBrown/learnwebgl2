// Fragment shader program
precision mediump int;
precision mediump float;

uniform vec4 u_Color;

vec2 center = vec2(0.5, 0.5);

void main() {
  if (distance(center, gl_PointCoord) > 0.5) {
    discard;
  }
  gl_FragColor = u_Color;
}
