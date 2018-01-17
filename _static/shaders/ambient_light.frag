// Fragment shader program
precision mediump int;
precision mediump float;

// Light model
uniform vec3 u_Ambient_intensities;

// Data coming from the vertex shader
varying vec4 v_Color;

void main() {

  vec3 color;

  // Component-wise product:
  color = u_Ambient_intensities * vec3(v_Color);

  // Ambient intensities do not affect the alpha value of the object's color.
  gl_FragColor = vec4(color, v_Color.a);
}
