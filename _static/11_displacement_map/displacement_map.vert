// Vertex Shader
precision mediump int;
precision mediump float;

// Scene transformation
uniform mat4 u_Clipping_transform; // Projection, camera, model transform

// The texture unit to use for the color lookup
uniform sampler2D u_Texture_unit;

// The maximum height for the displacement map.
uniform float u_Maximum_height;

// Original model data
attribute vec3 a_Vertex;
attribute vec3 a_Normal;
attribute vec2 a_Texture_coordinate;

// Data (to be interpolated) that is passed on to the fragment shader
varying vec2 v_Texture_coordinate;

void main() {

  // Get the displacement from the displacement image
  vec3 displacement_map_value = vec3(texture2D(u_Texture_unit, a_Texture_coordinate));
  float displacement_percentage = displacement_map_value[0];

  // Scale the normal vector using the displacement
  vec3 direction = a_Normal * (displacement_percentage * u_Maximum_height);

  // Move the position of the model's vertex
  vec3 new_vertex = a_Vertex + direction;

  // Pass the vertex's texture coordinate to the fragment shader.
  v_Texture_coordinate = a_Texture_coordinate;

  // Transform the location of the vertex for the graphics pipeline.
  gl_Position = u_Clipping_transform * vec4(new_vertex, 1.0);
}