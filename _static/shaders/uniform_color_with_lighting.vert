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

uniform vec4  u_Color;

// Original model data
attribute vec3 a_Vertex;
attribute vec3 a_Normal;

// Data (to be interpolated) that is passed on to the fragment shader
varying vec3 v_Vertex;
varying vec3 v_Normal;

void main() {

  // Perform the model-camera transformations on the vertex and pass this
  // location to the fragment shader.
  v_Vertex = vec3( u_To_camera_space * vec4(a_Vertex, 1.0) );

  // Perform the model-camera transformations on the vertex's normal vector
  // and pass this normal vector to the fragment shader.
  v_Normal = vec3( u_To_camera_space * vec4(a_Normal, 0.0) );

  // Transform the location of the vertex for the graphics pipeline.
  gl_Position = u_To_clipping_space * vec4(a_Vertex, 1.0);
}