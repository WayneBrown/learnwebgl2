/**
 * render_projection.js, By Wayne Brown, Spring 2018
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 C. Wayne Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

/**------------------------------------------------------------------------
 * A class to render models using a single color and the wireframe lines.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param program {WebGLProgram} a shader program
 * @param out {ConsoleMessages} display messages to the web page
 * @constructor
 */
window.RenderProjection = function (gl, program, out) {

  let self = this;

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // IMPORTANT: Assumes these shader programs:
  //            uniform_color.vert
  //            uniform_color.frag

  // Get the location of the shader program's uniforms and attributes
  program.u_Transform = gl.getUniformLocation(program, "u_Transform");
  program.u_Color     = gl.getUniformLocation(program, 'u_Color');

  program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');

  let gpu_buffer = null;

  // Scratch variables for calculating and displaying the clipping volume.
  let P4 = new GlPoint4();
  let V = new GlVector3();
  let eye = P4.create();
  let center = P4.create();
  let camera_line_of_sight = V.create();
  let camera_u = V.create();
  let camera_v = V.create();
  let camera_up = V.create();
  let forward = V.create();
  let to_right = V.create();
  let to_up = V.create();
  let to_left = V.create();
  let to_down = V.create();

  // The 8 points that define a perspective frustum
  let pts = [P4.create(), P4.create(), P4.create(), P4.create(),
             P4.create(), P4.create(), P4.create(), P4.create()];

  //-----------------------------------------------------------------------
  function _createBufferObject(data) {
    // Create a buffer object
    let buffer_id;

    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object for ' + model.name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

  //-----------------------------------------------------------------------
  self.updateVertices = function(camera, projection) {

    V.set(eye,       camera.eye[0],    camera.eye[1],    camera.eye[2]);
    V.set(center,    camera.center[0], camera.center[1], camera.center[2]);
    V.set(camera_up, camera.up[0],     camera.up[1],     camera.up[2]);
    V.subtract(camera_line_of_sight, center, eye);

    V.crossProduct(camera_u, camera_line_of_sight, camera_up);
    V.crossProduct(camera_v, camera_u, camera_line_of_sight);

    // Normalize the camera coordinates
    V.normalize(camera_line_of_sight);
    V.normalize(camera_u);
    V.normalize(camera_v);

    let half_fovy, xn, yn, xf, yf;

    if (projection.type === projection.PERSPECTIVE_PROJECTION) {
      // Calculate the distances to the corners
      half_fovy = (projection.fovy / 2) * 0.017453292519943295;
      yn = projection.near * Math.tan(half_fovy);
      xn = yn * projection.aspect_ratio;
      yf = projection.far * Math.tan(half_fovy);
      xf = yf * projection.aspect_ratio;

      V.scale(forward, camera_line_of_sight, projection.near);
      V.scale(to_right, camera_u, xn);
      V.scale(to_up, camera_v, yn);

      V.add(center, eye, forward);
      V.add(pts[0], center, to_right);
      V.add(pts[0], pts[0], to_up);
      V.add(pts[1], center, to_right);
      V.subtract(pts[1], pts[1], to_up);
      V.subtract(pts[2], center, to_right);
      V.subtract(pts[2], pts[2], to_up);
      V.subtract(pts[3], center, to_right);
      V.add(pts[3], pts[3], to_up);

      V.scale(forward, camera_line_of_sight, projection.far);
      V.scale(to_right, camera_u, xf);
      V.scale(to_up, camera_v, yf);

      V.add(center, eye, forward);
      V.add(pts[4], center, to_right);
      V.add(pts[4], pts[4], to_up);
      V.add(pts[5], center, to_right);
      V.subtract(pts[5], pts[5], to_up);
      V.subtract(pts[6], center, to_right);
      V.subtract(pts[6], pts[6], to_up);
      V.subtract(pts[7], center, to_right);
      V.add(pts[7], pts[7], to_up);

    } else {
      V.scale(forward, camera_line_of_sight, projection.near);
      V.scale(to_right, camera_u, projection.right);
      V.scale(to_left, camera_u, projection.left);
      V.scale(to_up, camera_v, projection.top);
      V.scale(to_down, camera_v, projection.bottom);

      V.add(center, eye, forward);
      V.add(pts[0], center, to_right);
      V.add(pts[0], pts[0], to_up);
      V.add(pts[1], center, to_right);
      V.add(pts[1], pts[1], to_down);
      V.add(pts[2], center, to_left);
      V.add(pts[2], pts[2], to_down);
      V.add(pts[3], center, to_left);
      V.add(pts[3], pts[3], to_up);

      V.scale(forward, camera_line_of_sight, projection.far - projection.near);

      V.add(pts[4], pts[0], forward);
      V.add(pts[5], pts[1], forward);
      V.add(pts[6], pts[2], forward);
      V.add(pts[7], pts[3], forward);
    }

    // l 1 2 3 4 1
    // l 5 6 7 8 5
    // l 1 5
    // l 2 6
    // l 3 7
    // l 4 8
    let vertices = new Float32Array(
      [ pts[0][0], pts[0][1], pts[0][2],    pts[1][0], pts[1][1], pts[1][2], // line 1-2
        pts[1][0], pts[1][1], pts[1][2],    pts[2][0], pts[2][1], pts[2][2], // line 2-3
        pts[2][0], pts[2][1], pts[2][2],    pts[3][0], pts[3][1], pts[3][2], // line 3-4
        pts[3][0], pts[3][1], pts[3][2],    pts[0][0], pts[0][1], pts[0][2], // line 4-1
        pts[4][0], pts[4][1], pts[4][2],    pts[5][0], pts[5][1], pts[5][2], // line 5-6
        pts[5][0], pts[5][1], pts[5][2],    pts[6][0], pts[6][1], pts[6][2], // line 6-7
        pts[6][0], pts[6][1], pts[6][2],    pts[7][0], pts[7][1], pts[7][2], // line 7-8
        pts[7][0], pts[7][1], pts[7][2],    pts[4][0], pts[4][1], pts[4][2], // line 8-5
        pts[0][0], pts[0][1], pts[0][2],    pts[4][0], pts[4][1], pts[4][2], // line 1-5
        pts[1][0], pts[1][1], pts[1][2],    pts[5][0], pts[5][1], pts[5][2], // line 2-6
        pts[2][0], pts[2][1], pts[2][2],    pts[6][0], pts[6][1], pts[6][2], // line 3-7
        pts[3][0], pts[3][1], pts[3][2],    pts[7][0], pts[7][1], pts[7][2]  // line 4-8
      ]
    );

    if (gpu_buffer === null) {
      gpu_buffer = _createBufferObject(vertices);
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, gpu_buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    }
  };

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param transform {Float32Array} - A 4x4 transformation matrix.
   * @param color {Float32Array} - RGBA color value.
   */
  self.render = function (transform, color) {

    gl.useProgram(program);

    gl.uniformMatrix4fv(program.u_Transform, false, transform);
    gl.uniform4fv(program.u_Color, color);

    // Activate the model's line vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu_buffer);
    gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Vertex);

    // Draw all of the lines
    gl.drawArrays(gl.LINES, 0, 24);
  };

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param gl {WebGLRenderingContext} - A 4x4 transformation matrix.
   */
  self.delete = function (gl) {
    gl.deleteBuffer(gpu_buffer);
  };

};
