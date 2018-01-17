// Fragment shader program
precision mediump int;
precision mediump float;

// Light model
struct light_info {
  vec3  position;
  vec3  color;
};

// An array of 2 lights
uniform light_info u_Lights[2];

// Ambient lighting
uniform vec3 u_Ambient_intensities;

// Attenuation constants for 1/(1 + c1*d + c2*d^2)
uniform float u_c1, u_c2;

// Model surfaces' shininess
uniform float u_Shininess;

// Data coming from the vertex shader
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;

//-------------------------------------------------------------------------
// Given a normal vector and a light,
// calculate the fragment's color using diffuse and specular lighting.
vec3 light_calculations(vec3 fragment_normal, light_info light) {

  vec3 specular_color;
  vec3 diffuse_color;
  vec3 to_light;
  float distance_from_light;
  vec3 reflection;
  vec3 to_camera;
  float cos_angle;
  float attenuation;
  vec3 color;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // General calculations needed for both specular and diffuse lighting

  // Calculate a vector from the fragment location to the light source
  to_light = light.position - v_Vertex;
  distance_from_light = length( to_light);
  to_light = normalize( to_light );

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // DIFFUSE  calculations

  // Calculate the cosine of the angle between the vertex's normal
  // vector and the vector going to the light.
  cos_angle = dot(fragment_normal, to_light);
  cos_angle = clamp(cos_angle, 0.0, 1.0);

  // Scale the color of this fragment based on its angle to the light.
  diffuse_color = vec3(v_Color) * light.color * cos_angle;

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
  cos_angle = pow(cos_angle, u_Shininess);

  // If this fragment gets a specular reflection, use the light's color,
  // otherwise use the objects's color
  specular_color = light.color * cos_angle;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // ATTENUATION  calculations

  attenuation = 1.0/
    (1.0 + u_c1*distance_from_light + u_c2*pow(distance_from_light,2.0));

  // Combine and attenuate the colors from this light source
  color = attenuation*(diffuse_color + specular_color);
  color = clamp(color, 0.0, 1.0);

  return color;
}

//-------------------------------------------------------------------------
void main() {

  vec3 ambient_color;
  vec3 fragment_normal;
  vec3 color_from_light_0;
  vec3 color_from_light_1;
  vec3 color;

  // AMBIENT calculations
  ambient_color = u_Ambient_intensities * vec3(v_Color);

  // The fragment's normal vector is being interpolated across the
  // geometric primitive which can make it un-normalized. So normalize it.
  fragment_normal = normalize( v_Normal);

  // Calculate the color reflected from the light sources.
  color_from_light_0 = light_calculations(fragment_normal, u_Lights[0]);
  color_from_light_1 = light_calculations(fragment_normal, u_Lights[1]);

  // Combine the colors
  color = ambient_color + color_from_light_0 + color_from_light_1;
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, v_Color.a);
}
