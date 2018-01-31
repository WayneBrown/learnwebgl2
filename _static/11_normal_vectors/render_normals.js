/**
 * render_normals.js, By Wayne Brown, Fall 2017
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
 * A class to render the normal vectors of a model.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param program {WebGLProgram} a shader program
 * @param model {ModelArrays} arrays that hold the model data
 * @param out {ConsoleMessages} display messages to the web page
 * @constructor
 */
window.RenderNormals = function (gl, program, model, out, color) {

  let self = this;

  let buffer_id = null;
  let number_normals = 0;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = function(gl) {
    gl.deleteBuffer(buffer_id);
  };

  /**----------------------------------------------------------------------
   * Create a GPU buffer object and transfer data into the buffer.
   * @param data {Float32Array} the array of data to be put into the buffer object.
   * @private
   */
  function _createBufferObject(data) {

    // Don't create a gpu buffer object if there is no data.
    if (data === null) return null;

    // Create a buffer object
    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object for ' + model.name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  /**----------------------------------------------------------------------
   * Render the normal vectors
   * @param clipping_space {Float32Array} - A 4x4 transformation matrix.
   */
  self.render = function(clipping_space) {

    if (number_normals > 0) {
      gl.useProgram(program);

      gl.uniformMatrix4fv(program.u_Transform, false, clipping_space);

      gl.uniform4fv(program.u_Color,  color);

      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, number_normals * 2);
    }
  };

  //-----------------------------------------------------------------------
  function _createNormalVectors() {
    let n, m, v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z;
    let n1x, n1y, n1z, n2x, n2y, n2z, n3x, n3y, n3z;
    let number_vertices, vertices, normals, number_triangles;
    let lines;

    if (model && model.triangles && model.triangles.vertices) {
      vertices = model.triangles.vertices;
      normals = model.triangles.smooth_normals;
      number_vertices = vertices.length / 3;
      number_triangles = number_vertices / 3;

      // Create a line for each normal vector. A line is composed
      // of two vertices (6 floats).
      lines = new Float32Array(number_vertices * 2 * 3);

      n = 0;
      for (let j = 0; j < vertices.length; j += 9) {
        // get the current triangle's normal vectors
        n1x = normals[j];
        n1y = normals[j+1];
        n1z = normals[j+2];

        n2x = normals[j+3];
        n2y = normals[j+4];
        n2z = normals[j+5];

        n3x = normals[j+6];
        n3y = normals[j+7];
        n3z = normals[j+8];

        // If the normal vectors are equal, render a single normal
        // vector in the center of the triangle.
        if (n1x === n2x && n1x === n3x &&
            n1y === n2y && n1y === n3y &&
            n1z === n2z && n1z === n3z) {

          // get the current triangle's vertices
          v1x = vertices[j];
          v1y = vertices[j+1];
          v1z = vertices[j+2];

          v2x = vertices[j+3];
          v2y = vertices[j+4];
          v2z = vertices[j+5];

          v3x = vertices[j+6];
          v3y = vertices[j+7];
          v3z = vertices[j+8];

          // Calculate the center of the triangle as the starting point.
          lines[n  ] = (v1x + v2x + v3x) / 3;
          lines[n+1] = (v1y + v2y + v3y) / 3;
          lines[n+2] = (v1z + v2z + v3z) / 3;

          lines[n+3] = lines[n  ] + n1x;
          lines[n+4] = lines[n+1] + n1y;
          lines[n+5] = lines[n+2] + n1z;
          n += 6;
          console.log("face normal ", n, j);
        } else {
          // The normal vectors are not equal, so render all 3 at their vertex.
          for (let offset = 0; offset<9; offset+=3) {
            m = j + offset;
            lines[n  ] = vertices[m];
            lines[n+1] = vertices[m+1];
            lines[n+2] = vertices[m+2];

            lines[n+3] = vertices[m  ] + normals[m];
            lines[n+4] = vertices[m+1] + normals[m+1];
            lines[n+5] = vertices[m+2] + normals[m+2];
            n += 6;
            console.log("vertex normal ", n, j);
          }
        }
      }
      _createBufferObject(lines);
      number_normals = n / 6;
      console.log("Number triangles = ", number_triangles, "   number normal vectors = ", number_normals);
    }
  }

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // Get the location of the shader program's uniforms and attributes
  program.u_Transform = gl.getUniformLocation(program, "u_Transform");
  program.u_Color     = gl.getUniformLocation(program, 'u_Color');

  program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');

  _createNormalVectors();
};
