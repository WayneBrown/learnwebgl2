/**
 * learn_webgl_ray_model.js, By Wayne Brown, Spring 2016
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

//-------------------------------------------------------------------------
/**
 * Create an object that represents a "ray" that has a start and an end.
 * @param gl WebGLRenderingContext
 * @param program WebGLProgram
 * @param x1 Number
 * @param y1 Number
 * @param z1 Number
 * @param x2 Number
 * @param y2 Number
 * @param z2 Number
 * @param color Array(4)
 * @constructor
 */
function Create_ray_manually(gl, program, x1, y1, z1, x2, y2, z2, color) {

  var self = this;

  var buffer_id;
  var vertices = new Float32Array([x1, y1, z1,  x2, y2, z2]);
  var ray_color = new Float32Array([color[0], color[1], color[2], color[3]]);

  //-----------------------------------------------------------------------
  function _createBufferObject(data) {
    // Create a buffer object
    var buffer_id;

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
  /**
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

  //-----------------------------------------------------------------------
  /**
   * Get the location of the shader variables in the shader program.
   * This assumes shader01.vert and shader01.frag
   * @private
   */
  function _getShaderVariableLocations() {

    program.u_Transform = gl.getUniformLocation(program, "u_Transform");
    program.u_Color = gl.getUniformLocation(program, 'u_Color');
    program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');
  }

  buffer_id = _createBufferObject(vertices);
  _getShaderVariableLocations();

  //-----------------------------------------------------------------------
  /**
   * Change the starting and ending point of the ray.
   */
  self.set = function (x1, y1, z1, x2, y2, z2) {
    vertices[0] = x1;
    vertices[1] = y1;
    vertices[2] = z1;
    vertices[3] = x2;
    vertices[4] = y2;
    vertices[5] = z2;
    _updateBufferObject(buffer_id, vertices);
  };

  //-----------------------------------------------------------------------
  /**
   * Render the model under the specified transformation.
   * @param transform Learn_webgl_matrix A 4x4 transformation matrix.
   */
  self.render = function (transform) {

    gl.useProgram(program);

    // Set the transform for all the faces, lines, and points
    gl.uniformMatrix4fv(program.u_Transform, false, transform);

    // Set the color of the ray
    gl.uniform4fv(program.u_Color, ray_color);

    // Activate the model's line vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Bind the vertices VOB to the 'a_Vertex' shader variable
    //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
    gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Vertex);

    // Draw all of the lines
    gl.drawArrays(gl.LINES, 0, 2);
  };

}
