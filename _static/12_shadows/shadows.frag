// Shadow map fragment shader
precision mediump int;
precision mediump float;

// Light model
struct light_info {
  vec3  position;
  vec3  color;
  bool  is_on;
  mat4  transform;  // The matrix transform used to create the light's shadow map.
  sampler2D texture_unit;  // Which texture unit holds the shadow map.
};

const vec3 black = vec3(0.0, 0.0, 0.0);

// An array of 2 lights
const int NUMBER_LIGHTS = 2;
uniform light_info u_Lights[NUMBER_LIGHTS];

// Ambient lighting
uniform vec3 u_Ambient_intensities;

// Attenuation constants for 1/(1 + c1*d + c2*d^2)
uniform float u_c1, u_c2;

// Model surfaces' shininess
uniform float u_Shininess;

// A tolerance value when comparing z values for in (or out) of shadow.
uniform float u_Z_tolerance;

// Data coming from the vertex shader
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;
varying vec4 v_Vertex_shadow_map[NUMBER_LIGHTS];

//-------------------------------------------------------------------------
// Determine if this fragment is in a shadow based on a particular light source.
// Returns true or false.
bool in_shadow(vec4 vertex_relative_to_light, sampler2D shadow_map) {

  // Convert to "normalized device coordinates" using perspective division.
  vec3 ndc = vertex_relative_to_light.xyz / vertex_relative_to_light.w;

  // Convert from range [-1.0,+1.0] to [0.0, +1.0].
  vec3 percentages = ndc * 0.5 + 0.5;

  // Get the shadow map's color value.
  vec4 shadow_map_color = texture2D(shadow_map, percentages.xy);

  // The shadow_map contains only one depth value, but it was retrieved
  // as a vec4 that contains (d,0,0,1).
  float shadow_map_distance = shadow_map_color.r;

  // Is the z component of the vertex_relative_to_light greater than
  // the distance retrieved from the shadow map?
  // (Compensate for roundoff errors and lost precision.)
  return percentages.z > shadow_map_distance + u_Z_tolerance;
}

//-------------------------------------------------------------------------
// Given a normal vector and a light,
// calculate the fragment's color using diffuse and specular lighting.
vec3 light_calculations(vec3        fragment_normal,
                        light_info  light,
                        vec4        vertex_shadow_map) {

  vec3 specular_color;
  vec3 diffuse_color;
  vec3 to_light;
  float distance_from_light;
  vec3 reflection;
  vec3 to_camera;
  float cos_angle;
  float attenuation;
  vec3 color;

  if (in_shadow(vertex_shadow_map, light.texture_unit)) {
    return black; // no light reflection
  }

  if (!gl_FrontFacing) return black;

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
  if (cos_angle < 0.0) return black;

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

  vec3 color;
  vec3 fragment_normal;

  // AMBIENT calculations
  color = u_Ambient_intensities * vec3(v_Color);

  // The fragment's normal vector is being interpolated across the
  // geometric primitive which can make it un-normalized. So normalize it.
  fragment_normal = normalize( v_Normal);

  // Calculate the color reflected from the light sources.
  for (int j=0; j < NUMBER_LIGHTS; j += 1) {
    if (u_Lights[j].is_on) {
      color = color + light_calculations(fragment_normal, u_Lights[j],
                                         v_Vertex_shadow_map[j]);
    }
  }

  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, v_Color.a);
}
