// Vertex Shader
precision mediump int;
precision mediump float;

// Scene transformation
uniform mat4 u_Clipping_transform; // Projection, camera, model transform

// The texture unit to use for the color lookup
uniform sampler2D u_Texture_unit;

// The maximum height of the heightmap
uniform float u_Maximum_height;

// Original model data
attribute vec3 a_Vertex;
attribute vec2 a_Texture_coordinate;

// Data (to be interpolated) that is passed on to the fragment shader
varying vec2 v_Texture_coordinate;

void main() {

  // Get the height from the heightmap image
  vec3 heightmap_color = vec3(texture2D(u_Texture_unit, a_Texture_coordinate));
  float height = heightmap_color[0] * u_Maximum_height;

  // Set the new vertex
  vec3 new_vertex = vec3(a_Vertex[0], height, a_Vertex[2]);

  // Pass the vertex's texture coordinate to the fragment shader.
  v_Texture_coordinate = a_Texture_coordinate;

  // Transform the location of the vertex for the graphics pipeline.
  gl_Position = u_Clipping_transform * vec4(new_vertex, 1.0);
}