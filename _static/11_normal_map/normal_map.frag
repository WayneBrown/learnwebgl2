// Fragment shader program
precision mediump int;
precision mediump float;

uniform mat4 u_To_camera_space;   // Camera, model transform

// The texture unit to use for the color lookup
uniform sampler2D u_Texture_unit;

// The dimensions of the bump map image: (width, height)
uniform vec2 u_Image_size;

// Fragment data
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;

// A triangle's local coordinate system
varying mat3 v_Local_coordinate_system;

// Data coming from the vertex shader
varying vec2 v_Texture_coordinate;

// Lighting model
uniform vec3  u_Light_position;
uniform vec3  u_Light_color;
uniform vec3  u_Ambient_intensities;

// Model surfaces' shininess
uniform float u_Shininess;

// Rendering options
uniform float u_Render_mode;
const float RENDER_NORMAL_MAP = 1.0;
const float RENDER_COLORS   = 0.0;

//-------------------------------------------------------------------------
// Given a normal vector and a light,
// calculate the fragment's color using diffuse and specular lighting.
vec3 light_calculations(vec3 fragment_color,
                        vec3 fragment_normal,
                        vec3 light_position,
                        vec3 light_color) {

  vec3 specular_color;
  vec3 diffuse_color;
  vec3 to_light;
  vec3 reflection;
  vec3 to_camera;
  float cos_angle;
  float attenuation;
  vec3 color;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // General calculations needed for both specular and diffuse lighting

  // Calculate a vector from the fragment location to the light source
  to_light = light_position - v_Vertex;
  to_light = normalize( to_light );

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // DIFFUSE  calculations

  // Calculate the cosine of the angle between the vertex's normal
  // vector and the vector going to the light.
  cos_angle = dot(fragment_normal, to_light);
  cos_angle = clamp(cos_angle, 0.0, 1.0);

  // Scale the color of this fragment based on its angle to the light.
  diffuse_color = vec3(fragment_color) * light_color * cos_angle;

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
  specular_color = light_color * cos_angle;

  color = diffuse_color + specular_color;
  color = clamp(color, 0.0, 1.0);

  return color;
}

//-------------------------------------------------------------------------
void main() {

  vec3 color, normal;

  if (u_Render_mode == RENDER_NORMAL_MAP) {
    // Get the normal vector from the "normal map"
    normal = vec3(texture2D(u_Texture_unit, v_Texture_coordinate));

    // Transform the component values from [0.0,1.0] to [-1.0,+1.0]
    normal = normal * 2.0 - 1.0;

    // Transform the normal vector based on the triangle's local coordinate system
    normal = v_Local_coordinate_system * normal;

    // Transform the normal vector into camera space for the lighting calculations.
    normal = vec3(u_To_camera_space * vec4(normal, 0.0) );

    // Perform the lighting calculations.
    color = light_calculations(vec3(v_Color), normal, u_Light_position, u_Light_color);

    // Add in the ambient light
    color = color + u_Ambient_intensities * vec3(v_Color);

  } else { // u_Render_mode == RENDER_COLOR_MAP
    vec4 frag_color = texture2D(u_Texture_unit, v_Texture_coordinate);

    // Perform the lighting calculations.
    color = light_calculations(vec3(frag_color), v_Normal, u_Light_position, u_Light_color);

    // Add in the ambient light
    color = color + u_Ambient_intensities * vec3(frag_color);
  }

  gl_FragColor = vec4(color, 1.0);
}

