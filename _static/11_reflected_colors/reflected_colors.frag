// Fragment shader program
precision mediump int;
precision mediump float;

// Light model
uniform vec3  u_Light_position;
uniform vec3  u_Light_color;
uniform vec4  u_Ambient_intensities;

uniform vec4  u_Model_ambient;
uniform vec4  u_Model_diffuse;
uniform vec4  u_Model_specular;
uniform float u_Model_shininess;

// Data coming from the vertex shader
varying vec3 v_Vertex;
varying vec3 v_Normal;

void main() {

  vec4 ambient_color;
  vec4 specular_color;
  vec4 diffuse_color;
  vec3 to_light;
  vec3 fragment_normal;
  vec3 reflection;
  vec3 to_camera;
  float cos_angle;
  vec4 color;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // AMBIENT calculations
  ambient_color = u_Ambient_intensities * u_Model_ambient;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // General calculations needed for both specular and diffuse lighting

  // Calculate a vector from the fragment location to the light source
  to_light = u_Light_position - v_Vertex;
  to_light = normalize( to_light );

  // The fragment's normal vector is being interpolated across the
  // geometric primitive which can make it un-normalized. So normalize it.
  fragment_normal = normalize( v_Normal);

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // DIFFUSE  calculations

  // Calculate the cosine of the angle between the vertex's normal
  // vector and the vector going to the light.
  cos_angle = dot(fragment_normal, to_light);
  cos_angle = clamp(cos_angle, 0.0, 1.0);

  // Scale the color of this fragment based on its angle to the light.
  diffuse_color = u_Model_diffuse * vec4(u_Light_color, 1.0) * cos_angle;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // SPECULAR  calculations

  // Calculate the reflection vector
  reflection = 2.0 * dot(fragment_normal,to_light) * fragment_normal - to_light;
  reflection = normalize( reflection );

  // Calculate a vector from the fragment location to the camera.
  // The camera is at the origin, so just negate the fragment location
  to_camera = -1.0 * v_Vertex;
  to_camera = normalize( to_camera );

  // Calculate the cosine of the angle between the reflection vector
  // and the vector going to the camera.
  cos_angle = dot(reflection, to_camera);
  cos_angle = clamp(cos_angle, 0.0, 1.0);
  cos_angle = pow(cos_angle, u_Model_shininess);

  // If this fragment gets a specular reflection, use the light's color,
  // otherwise use the objects's color
  specular_color = vec4(u_Light_color, 1.0) * u_Model_specular * cos_angle;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // COMBINED light model
  color = ambient_color + diffuse_color + specular_color;
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = color;
}
