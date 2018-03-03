// Vertex Shader
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

// Scene transformations
uniform mat4 u_To_clipping_space; // Projection, camera, model transform
uniform mat4 u_To_camera_space;   // Camera, model transform

// An array of lights
const int NUMBER_LIGHTS = 2;
uniform light_info u_Lights[NUMBER_LIGHTS];

// Original model data
attribute vec3 a_Vertex;
attribute vec3 a_Color;
attribute vec3 a_Normal;

// Data (to be interpolated) that is passed on to the fragment shader
varying vec3 v_Vertex;
varying vec4 v_Color;
varying vec3 v_Normal;
varying vec4 v_Vertex_shadow_map[NUMBER_LIGHTS];

void main() {

  // Where is the vertex for each shadow-map?
  for (int j=0; j < NUMBER_LIGHTS; j += 1) {
    v_Vertex_shadow_map[j] = u_Lights[j].transform * vec4(a_Vertex, 1.0);
  }

  // Perform the model-camera transformations on the vertex and pass this
  // location to the fragment shader.
  v_Vertex = vec3( u_To_camera_space * vec4(a_Vertex, 1.0) );

  // Perform the model-camera transformations on the vertex's normal vector
  // and pass this normal vector to the fragment shader.
  v_Normal = vec3( u_To_camera_space * vec4(a_Normal, 0.0) );

  // Pass the vertex's color to the fragment shader.
  v_Color = vec4(a_Color, 1.0);

  // Transform the location of the vertex for the graphics pipeline.
  gl_Position = u_To_clipping_space * vec4(a_Vertex, 1.0);
}
