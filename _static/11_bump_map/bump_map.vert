// Vertex Shader
precision mediump int;
precision mediump float;

// Scene transformations
uniform mat4 u_To_clipping_space; // Projection, camera, model transform
uniform mat4 u_To_camera_space;   // Camera, model transform

// Light model
uniform vec3  u_Light_position;
uniform vec3  u_Light_color;
uniform float u_Shininess;
uniform vec3  u_Ambient_intensities;

// The texture unit to use for the bump map
uniform sampler2D u_Texture_unit;

// Original model data
attribute vec3 a_Vertex;
attribute vec3 a_Color;
attribute vec3 a_Normal;
attribute vec2 a_Texture_coordinate;

// Bump map data to calculate a triangle's local coordinate system
attribute vec3 a_P2;
attribute vec3 a_P3;
attribute vec2 a_Uv2;
attribute vec2 a_Uv3;

// Data (to be interpolated) that is passed on to the fragment shader
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;

// Data (to be interpolated) that is passed on to the fragment shader
varying vec2 v_Texture_coordinate;

// The U, V texture coordinate axes in 3D space;
// That is, a local coordinate system for a triangle
varying vec3 v_U3d;
varying vec3 v_V3d;

//-------------------------------------------------------------------------
// Calculate the local coordinate system for this vertex's triangle
void calulate_triangle_coordinate_system(vec3 p1,  vec3 p2,  vec3 p3,
                                         vec2 uv1, vec2 uv2, vec2 uv3) {
  float u1 = uv1[0];
  float v1 = uv1[1];
  float u2 = uv2[0];
  float v2 = uv2[1];
  float u3 = uv3[0];
  float v3 = uv3[1];

  float divisor = (u3-u1)*(v2-v1) - (u2-u1)*(v3-v1);

  v_U3d = ((v2-v1)*(p3-p1) - (v3-v1)*(p2-p1)) /  divisor;
  v_V3d = ((u2-u1)*(p3-p1) - (u3-u1)*(p2-p1)) / -divisor;

  normalize(v_U3d);
  normalize(v_V3d);
}

//-------------------------------------------------------------------------
void main() {

  calulate_triangle_coordinate_system(a_Vertex, a_P2, a_P3,
                                      a_Texture_coordinate, a_Uv2, a_Uv3);

  // Put the vertex's location into camera space.
  v_Vertex = vec3( u_To_camera_space * vec4(a_Vertex, 1.0) );

  // Put the vertex's normal vector into camera space.
  v_Normal = vec3( u_To_camera_space * vec4(a_Normal, 0.0) );

  // Put triangle's local coordinate system into camera space
  v_U3d = vec3( u_To_camera_space * vec4(v_U3d, 0.0) );
  v_V3d = vec3( u_To_camera_space * vec4(v_V3d, 0.0) );

  // Pass the vertex's color to the fragment shader.
  v_Color = vec4(a_Color, 1.0);

  // Pass the vertex's texture coordinate to the fragment shader.
  v_Texture_coordinate = a_Texture_coordinate;

  // Transform the location of the vertex for the graphics pipeline.
  gl_Position = u_To_clipping_space * vec4(a_Vertex, 1.0);
}