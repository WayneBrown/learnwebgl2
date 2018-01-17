// Fragment shader program
precision mediump int;
precision mediump float;

// Light model
uniform vec3 u_Light_position;

// Data coming from the vertex shader
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;

void main() {

  vec3 to_light;
  vec3 fragment_normal;
  float cos_angle;

  // Calculate a vector from the fragment location to the light source
  to_light = u_Light_position - v_Vertex;
  to_light = normalize( to_light );

  // The fragment's normal vector is being interpolated across the
  // geometric primitive which can make it un-normalized. So normalize it.
  fragment_normal = normalize( v_Normal);

  // Calculate the cosine of the angle between the vertex's normal
  // vector and the vector going to the light.
  cos_angle = dot(fragment_normal, to_light);
  cos_angle = clamp(cos_angle, 0.0, 1.0);

  // Scale the color of this fragment based on its angle to the light.
  // Don't scale the alpha value, which would change the transparency
  // of the fragment
  gl_FragColor = vec4(vec3(v_Color) * cos_angle, v_Color.a);
}
