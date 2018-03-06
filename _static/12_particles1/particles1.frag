// Fragment shader program
precision mediump int;
precision mediump float;

// The texture unit to use for the color lookup
uniform sampler2D u_Color_map_unit;
uniform sampler2D u_Bump_map_unit;

uniform mat3 u_Transform_color_tex_coords;

// The dimensions of the bump map image: (width, height)
uniform vec2 u_Image_size;

// Fragment data
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;

// Bump map data for the fragment shader to calculate a triangle's
// local coordinate system
varying vec3 v_U3d, v_V3d;

// Data coming from the vertex shader
varying vec2 v_Texture_coordinate;

// Lighting model
uniform vec3  u_Light_position;
uniform vec3  u_Light_color;
uniform vec3  u_Ambient_intensities;

// Model surfaces' shininess
uniform float u_Shininess;

//-------------------------------------------------------------------------
// Given texture coordinates, calculate the "finite difference"
// between neighboring pixels.
vec2 get_normal_offsets(vec2 texture_coordinates) {
  float pixel_delta_u = 1.0 / u_Image_size[0];
  float pixel_delta_v = 1.0 / u_Image_size[1];

  vec2 up    = vec2(0.0,  pixel_delta_v);
  vec2 down  = vec2(0.0, -pixel_delta_v);
  vec2 left  = vec2(-pixel_delta_u, 0.0);
  vec2 right = vec2( pixel_delta_u, 0.0);

  vec4 right_color = texture2D(u_Bump_map_unit, texture_coordinates + right);
  vec4 left_color  = texture2D(u_Bump_map_unit, texture_coordinates + left);
  vec4 up_color    = texture2D(u_Bump_map_unit, texture_coordinates + up);
  vec4 down_color  = texture2D(u_Bump_map_unit, texture_coordinates + down);

  return vec2(right_color[0] - left_color[0], up_color[0] - down_color[0]);
}

//-------------------------------------------------------------------------
// Given a normal vector and texture coordinates, "bump" the
// normal vector based on the offsets from the bump texture map.
vec3 bump_map_normal(vec3 normal, vec2 texture_coordinates) {
  vec2 offsets = get_normal_offsets(texture_coordinates);

  if (length(normal) == 0.0) {
    // If the normal vector has gone to zero length, recalculate it.
    normal = normalize(cross(v_U3d, v_V3d));
  }
  normal = normal + offsets[0] * v_U3d + offsets[1] * v_V3d;
  return normalize(normal);
}

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

  // Texture mapping to get fragment color.
  vec4 frag_color = texture2D(u_Color_map_unit, v_Texture_coordinate);

  // Transform the texture coordinates for the bump map calculations.
  vec2 bump_tex_coords = vec2(u_Transform_color_tex_coords * vec3(v_Texture_coordinate, 1.0));

  // Modify the fragment normal vector using the bump map image data.
  normal = bump_map_normal(normalize(v_Normal), bump_tex_coords);

  // Perform the lighting calculations.
  color = light_calculations(vec3(frag_color), normal, u_Light_position, u_Light_color);

  // Add in the ambient light
  color = color + u_Ambient_intensities * vec3(frag_color);

  gl_FragColor = vec4(color, 1.0);
}

