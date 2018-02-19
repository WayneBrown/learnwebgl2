/**
 * render_uniform_color_lighting.js, By Wayne Brown, Spring 2018
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
 * A class to render models using an ambient, diffuse, and specular lighting model.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param program {WebGLProgram} a shader program
 * @param model_buffers {ModelArraysGPU} GPU object buffers that hold the model data
 * @param out {ConsoleMessages} display messages to the web page
 * @constructor
 */
window.RenderTransparency = function (gl, program, model_buffers, out) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // IMPORTANT: Assumes these shader programs:
  //            lighting.vert
  //            lighting.frag

  // Set the specular shininess exponent
  self.shininess = 30.0; // default value
  if (model_buffers && model_buffers.triangles && model_buffers.triangles.material) {
    self.shininess = model_buffers.triangles.material.Ns; // specular exponent
  }

  // Get the location of the shader program's uniforms and attributes
  program.u_To_clipping_space   = gl.getUniformLocation(program, "u_To_clipping_space");
  program.u_To_camera_space     = gl.getUniformLocation(program, "u_To_camera_space");
  program.u_Light_position      = gl.getUniformLocation(program, "u_Light_position");
  program.u_Light_color         = gl.getUniformLocation(program, "u_Light_color");
  program.u_Shininess           = gl.getUniformLocation(program, "u_Shininess");
  program.u_Ambient_intensities = gl.getUniformLocation(program, "u_Ambient_intensities");

  program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');
  program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
  program.a_Color  = gl.getAttribLocation(program, 'a_Color');

  // For sorting the vertices of a triangle
  let matrix = new GlMatrix4x4();
  let P4 = new GlPoint4();
  let v = P4.create(0.0, 0.0, 0.0, 1.0);
  let v2 = P4.create();
  let sort_indexes = null;
  let reordered_vertices = null;
  let reordered_normals = null;
  let reordered_colors = null;

  /**----------------------------------------------------------------------
   * Compare two elements of the sort_indexes for a quicksort algorithm
   * @param a {array} one element of the sort_indexes array, [index, distance]
   * @param b {array} one element of the sort_indexes array, [index, distance]
   * @returns {number} result of comparision of a and b
   * @private
   */
  function _compare(a, b) {
    if (a[1] < b[1]) {
      return -1;
    } else if (a[1] > b[1]) {
      return 1;
    }
    return 0; // a must be equal to b
  }

  /**----------------------------------------------------------------------
   * Perform a Quicksort on the sort_indexes.
   * @private
   */
  function _quicksort(sort_indexes) {
    sort_indexes.sort(_compare);
  }

  /**----------------------------------------------------------------------
   * Initialize the sort_indexes array for sorting the model's triangles.
   * This array is re-sorted before each render of a transparent model.
   * @param number_triangles {number}
   * @private
   */
  function _initializeSorting(number_triangles) {
    sort_indexes = new Array(number_triangles);
    for (let j = 0; j < number_triangles; j += 1) {
      sort_indexes[j] = [j, 0.0];  // [index to triangle, distance from camera]
    }
    reordered_vertices = new Float32Array(number_triangles * 3 * 3);
    reordered_normals  = new Float32Array(number_triangles * 3 * 3);
    reordered_colors   = new Float32Array(number_triangles * 3 * 4);
  }

  /**----------------------------------------------------------------------
   * Update the distance of each triangle from the camera.
   * @param number_triangles {number}
   * @param camera_space {Float32Array} The transformation to apply to the model vertices.
   */
  function _updateDistanceFromCamera (number_triangles, camera_space) {
    let k, which_triangle, max_z, vertices;

    vertices = model_buffers.raw_data.triangles.vertices;
    for (let j = 0; j < number_triangles; j += 1) {

      which_triangle = sort_indexes[j][0];
      k = which_triangle * 3 * 3;
      max_z = 10e10;
      for (let n = 0; n < 3; n += 1, k += 3) {
        v[0] = vertices[k];
        v[1] = vertices[k + 1];
        v[2] = vertices[k + 2];
        matrix.multiplyP4(v2, camera_space, v);

        if (v2[2] < max_z) {
          max_z = v2[2];
        }
      }

      // Remember this triangle's distance from the camera
      sort_indexes[j][1] = max_z;
    }
  }

  /**----------------------------------------------------------------------
   * Sort the triangles of a model, back to front, based on their distance
   * from the camera.
   * @param number_triangles {number}
   */
  function _indexedInsertionSort (number_triangles) {
    let k, temp;

    for (let j = 0; j < number_triangles; j += 1) {
      temp = sort_indexes[j];
      k = j - 1;
      while (k >= 0 && sort_indexes[k][1] > temp[1]) {
        sort_indexes[k + 1] = sort_indexes[k];
        k -= 1;
      }
      sort_indexes[k + 1] = temp;
    }
  }

  /**----------------------------------------------------------------------
   * Update the GPU object buffer that holds the model's vertices
   * @param number_triangles {number}
   * @private
   */
  function _reorderVerticesInBufferObjects (number_triangles) {
    let m, k;

    // Reorder the vertices based on the sort_indexes.
    let vertices = model_buffers.raw_data.triangles.vertices;
    let normals  = model_buffers.raw_data.triangles.smooth_normals;
    let colors   = model_buffers.raw_data.triangles.colors;

    m = 0;
    for (let j = 0; j < number_triangles; j += 1) {
      k = sort_indexes[j][0] * 3 * 3;
      for (let n = 0; n < 9; n += 1) {
        reordered_vertices[m] = vertices[k + n];
        reordered_normals[m]  = normals[k + n];
        m++;
      }
    }

    m = 0;
    for (let j = 0; j < number_triangles; j += 1) {
      k = sort_indexes[j][0] * 3 * 4;
      for (let n = 0; n < 12; n += 1) {
        reordered_colors[m++] = colors[k + n];
      }
    }

    // Save the new vertices into its associated GPU buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model_buffers.triangles.vertices.id);
    gl.bufferData(gl.ARRAY_BUFFER, reordered_vertices, gl.DYNAMIC_DRAW);

    // Save the new normal vectors into its associated GPU buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model_buffers.triangles.smooth_normals.id);
    gl.bufferData(gl.ARRAY_BUFFER, reordered_normals, gl.DYNAMIC_DRAW);

    // Save the new colors into its associated GPU buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model_buffers.triangles.colors.id);
    gl.bufferData(gl.ARRAY_BUFFER, reordered_colors, gl.DYNAMIC_DRAW);
  }

  /**----------------------------------------------------------------------
   * Sort the triangles of a model, back to front, based on their distance
   * from the camera.
   * @param number_triangles {number}
   * @param camera_space {Float32Array} The transformation to apply to the model vertices.
   */
  function _sortTriangles (number_triangles, camera_space) {
    let first_sort = false;

    if (sort_indexes == null) {
      _initializeSorting(number_triangles);
      first_sort = true;
    }

    _updateDistanceFromCamera(number_triangles, camera_space);

    if (first_sort) {
      _quicksort(sort_indexes);
    } else {
      _indexedInsertionSort(number_triangles);
    }

    _reorderVerticesInBufferObjects(number_triangles);
  }

  /**----------------------------------------------------------------------
   * Render the individual points in the model.
   * @private
   */
  function _renderPoints() {
    if (model_buffers.points !== null && model_buffers.points.number > 0) {

      let vertices = model_buffers.points.vertices;
      let colors = model_buffers.points.colors;

      // Activate the model's vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Draw all of the lines
      gl.drawArrays(gl.POINTS, 0, vertices.number_values / 3);
    }
  }

  /**----------------------------------------------------------------------
   * Render the individual lines in the model.
   * @private
   */
  function _renderLines() {
    if (model_buffers.lines !== null && model_buffers.lines.number > 0) {

      let vertices = model_buffers.lines.vertices;
      let colors = model_buffers.lines.colors;

      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, vertices.number_values / 3);
    }
  }

  /**----------------------------------------------------------------------
   * Render the triangles in the model.
   * @private
   */
  function _renderTriangles() {

    let vertices = model_buffers.triangles.vertices;
    let normals = model_buffers.triangles.smooth_normals;
    let colors = model_buffers.triangles.colors;

    // Activate the model's triangle vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

    // Bind the vertices VOB to the 'a_Vertex' shader variable
    gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Vertex);

    // Activate the model's color object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, colors.id);
    gl.vertexAttribPointer(program.a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Color);

    // Activate the model's normal vector object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, normals.id);
    gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Normal);

    // Draw all of the triangles
    gl.drawArrays(gl.TRIANGLES, 0, vertices.number_values / 3);
  }

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param clipping_space {Float32Array} - A 4x4 transformation matrix.
   * @param camera_space {Float32Array} - A 4x4 transformation matrix.
   */
  self.render = function (clipping_space, camera_space) {

    gl.useProgram(program);

    gl.uniformMatrix4fv(program.u_To_clipping_space, false, clipping_space);
    gl.uniformMatrix4fv(program.u_To_camera_space, false, camera_space);

    gl.uniform1f(program.u_Shininess, self.shininess);

    _renderPoints();
    _renderLines();
    if (model_buffers.triangles !== null && model_buffers.triangles.number > 0) {
      _sortTriangles(model_buffers.triangles.number, camera_space);
      _renderTriangles();
    }
  };

};
