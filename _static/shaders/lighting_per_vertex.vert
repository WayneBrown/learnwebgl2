// Vertex Shader
precision mediump int;
precision mediump float;

uniform mat4 u_Transform;
uniform mat4 u_Normal_matrix;

// The vector to the constant light source. This has to be in a left-handed
// coordinate system because it is not being multiplied by the transform.
vec3 u_To_light = normalize(vec3(1.0, 1.0, 1.0));

attribute vec3 a_Vertex;
attribute vec3 a_Color;
attribute vec3 a_Face_normal;

varying vec4 v_Color;

void main() {
  float cos_angle;
  vec3 transformed_face_normal;

  // Transform the location of the vertex
  gl_Position = u_Transform * vec4(a_Vertex, 1.0);

  // Transform the face's normal vector
  transformed_face_normal = vec3(u_Normal_matrix * vec4(a_Face_normal, 0.0));
  transformed_face_normal = normalize(transformed_face_normal);

  // Calculate the cosine of the angle between the triangle's face normal
  // vector and a vector going to the light.
  cos_angle = dot(transformed_face_normal, u_To_light);
  cos_angle = clamp(cos_angle, 0.0, 1.0);

  // Scale the color of the triangle based on its angle to the light.
  v_Color = vec4(a_Color * cos_angle, 1.0);
}