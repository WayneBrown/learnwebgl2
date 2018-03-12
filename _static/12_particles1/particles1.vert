// Vertex Shader
precision mediump int;
precision mediump float;

uniform mat4      u_Transform; // Projection, camera, model transform
uniform sampler2D u_Texture_unit;

// Particles' data
attribute vec3  a_Vertex;
attribute float a_Size;
attribute vec2  a_Texture_coordinate;
attribute float a_Alpha;

// Data (to be interpolated) that is passed on to the fragment shader
varying float v_Point_size;
varying vec2  v_Texture_coordinates;
varying float v_Alpha;

//-------------------------------------------------------------------------
void main() {

  // Set the size of this point for the fragment shader.
  // The fragment shader does not have access to gl_PointSize.
  v_Point_size = a_Size;

  // Set the amount of transparency of this point.
  v_Alpha = a_Alpha;

  // Set the size of the point
  gl_PointSize = a_Size;

  // Pass the vertex's texture coordinate to the fragment shader.
  v_Texture_coordinates = a_Texture_coordinate;

  // Transform the location of the vertex for the graphics pipeline.
  gl_Position = u_Transform * vec4(a_Vertex, 1.0);
}