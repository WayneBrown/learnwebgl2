/**
 * model_to_gpu.js, By Wayne Brown, Fall 2017
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
 * Given a model description, create the buffer objects needed to render
 * the model. This is very closely tied to the shader implementations.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param model {SimpleModel} The model data.
 * @param out {ConsoleMessages} Can display messages to the web page.
 * @constructor
 */
window.ModelToGpu = function (gl, model, out) {

  let self = this;

  // Variables to remember so the model can be rendered.
  self.number_triangles = 0;
  self.triangles_vertex_buffer_id = null;

  self.triangle_colors = null;

  /**----------------------------------------------------------------------
   * Create a Buffer Object in the GPU's memory and upload data into it.
   * @param gl Object The WebGL state and API
   * @param data TypeArray An array of data values.
   * @returns Number a unique ID for the Buffer Object
   * @private
   */
  function _createBufferObject(gl, data) {
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

  // ----------------------------------------------------------------------
  // Convert the simple model into an Float32Array

  let nv, number_vertices, triangle, vertex, vertices3;

  // Create a 1D array that holds all of the  for the triangles
  if (model.triangles.length > 0) {
    self.number_triangles = model.triangles.length;
    number_vertices = self.number_triangles * 3;
    vertices3 = new Float32Array(number_vertices * 3);
    self.triangle_colors = new Array(self.number_triangles);

    nv = 0;
    for (let j = 0; j < model.triangles.length; j += 1) {
      triangle = model.triangles[j];

      for (let k = 0; k < 3; k += 1) {
        vertex = triangle.vertices[k];

        for (let m = 0; m < 3; m += 1, nv += 1) {
          vertices3[nv] = vertex[m];
        }
      }

      self.triangle_colors[j] = triangle.color;
    }

    // Copy the Float32Array of an object buffer on the GPU
    self.triangles_vertex_buffer_id = _createBufferObject(gl, vertices3);
  }
};
