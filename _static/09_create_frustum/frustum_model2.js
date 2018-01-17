/**
 * frustum_model.js, By Wayne Brown, Fall 2017
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
 * Create an object that represents a path defined by an array of points.
 * @param gl {WebGLRenderingContext}
 * @param program {object}
 * @param color {Array} RGBA color
 * @constructor
 */
window.FrustumModel2 = function (gl, program, color) {

  let self = this;

  let buffer_id = null;
  let vertices = null;
  let outline_color = new Float32Array([color[0], color[1], color[2], color[3]]);

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

  /**----------------------------------------------------------------------
   * Copy new data into the specified GPU buffer object
   * @param buffer_id Number the buffer object ID
   * @param data Float32Array the array of data values
   * @private
   */
  function _updateBufferObject(buffer_id, data) {
    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  /**----------------------------------------------------------------------
   * Change the points that define the path
   */
  self.updateFrustum = function (left, right, bottom, top, near, far) {

    let xeye = (right + left)/2;
    let yeye = (top + bottom)/2;
    let zeye = 0;
    let zn = -near;
    let zf = -far;
    let t = far / near;
    let ytopfar = (1-t)*yeye + t*top;
    let ybotfar = (1-t)*yeye + t*bottom;
    let xleftfar = (1-t)*xeye + t*left;
    let xrightfar = (1-t)*xeye + t*right;

    //l 1 2 3 4 1
    //l 5 6 7 8 5
    //l 1 5
    //l 2 6
    //l 3 7
    //l 4 8
    vertices = new Float32Array(
      [ xrightfar, ytopfar, zf,   xrightfar, ybotfar, zf, // line 1-2
        xrightfar, ybotfar, zf,   xleftfar,  ybotfar, zf, // line 2-3
        xleftfar,  ybotfar, zf,   xleftfar,  ytopfar, zf, // line 3-4
        xleftfar,  ytopfar, zf,   xrightfar, ytopfar, zf, // line 4-1
        right,     top,     zn,   right,     bottom,  zn, // line 5-6
        right,     bottom,  zn,   left,      bottom,  zn, // line 6-7
        left,      bottom,  zn,   left,      top,     zn, // line 7-8
        left,      top,     zn,   right,     top,     zn, // line 8-5
        xrightfar, ytopfar, zf,   right,     top,     zn, // line 1-5
        xrightfar, ybotfar, zf,   right,     bottom,  zn, // line 2-6
        xleftfar,  ybotfar, zf,   left,      bottom,  zn, // line 3-7
        xleftfar,  ytopfar, zf,   left,      top,     zn  // line 4-8
      ]
      );
    if (buffer_id === null) {
      buffer_id = _createBufferObject(vertices);
    } else {
      _updateBufferObject(buffer_id, vertices);
    }
  };

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param transform Learn_webgl_matrix A 4x4 transformation matrix.
   */
  self.render = function (transform) {

    if (vertices !== null) {
      gl.useProgram(program);

      // Set the transform for all the faces, lines, and points
      gl.uniformMatrix4fv(program.u_Transform, false, transform);

      // Set the color of the ray
      gl.uniform4fv(program.u_Color, outline_color);

      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, vertices.length/3);
    }
  };

  program.u_Transform = gl.getUniformLocation(program, "u_Transform");
  program.u_Color = gl.getUniformLocation(program, 'u_Color');
  program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');
};
