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
window.ModelToGpu4 = function (gl, model, out) {

  let self = this;

  // Variables to remember so the model can be rendered.
  self.number_triangles = 0;
  self.number_vertices  = 0;
  self.triangles_vertex_buffer_id  = null;
  self.triangles_color_buffer_id   = null;
  self.triangles_texture_buffer_id = null;

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

  let nv, triangle, vertex_data, vertex, vertices, all_vertices;
  let nc, all_colors, color;
  let nt, all_textures, texture;

  // Create a 1D array that holds all of the  for the triangles
  if (model.triangles.length > 0) {
    self.number_triangles = model.triangles.length;
    self.number_vertices = self.number_triangles * 3;
    all_vertices = new Float32Array(self.number_vertices * 3);
    all_colors   = new Float32Array(self.number_vertices * 4);
    all_textures = new Float32Array(self.number_vertices * 2);

    nv = 0;
    nc = 0;
    nt = 0;
    for (let j = 0; j < model.triangles.length; j += 1) {
      triangle = model.triangles[j];
      vertices = triangle.vertices;

      for (let k = 0; k < 3; k += 1) {
        vertex_data = triangle.vertices[k];
        vertex = vertex_data[0];
        color = vertex_data[1];
        texture = vertex_data[2];

        // Store the vertices.
        for (let m = 0; m < 3; m += 1, nv += 1) {
          all_vertices[nv] = vertex[m];
        }

        // Store the colors.
        for (let m = 0; m < 4; m += 1, nc += 1) {
          all_colors[nc] = color[m];
        }

        // Store the textures.
        for (let m = 0; m < 2; m += 1, nt += 1) {
          all_textures[nt] = texture[m];
        }
      }
    }

    self.triangles_vertex_buffer_id  = _createBufferObject(gl, all_vertices);
    self.triangles_color_buffer_id   = _createBufferObject(gl, all_colors);
    self.triangles_texture_buffer_id = _createBufferObject(gl, all_textures);
  }

  // Release the temporary vertex array so the memory can be reclaimed.
  all_vertices = null;
  all_colors = null;
  all_textures = null;

};
