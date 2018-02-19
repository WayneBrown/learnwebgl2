/**
 * combine_models.js, By Wayne Brown, Spring 2018
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

/** -----------------------------------------------------------------------
 * Given two or more models {ModelArrays}, create one model that contains them all.
 * @param name {string} the "base" name for the model. The combined model will have
 *                      a name of "name_combined".
 * @param arguments triplets of {ModelArrays, transform, color}
 * @returns {ModelArrays}
 */
window.combineModels = function (name) {

  let combined_model = null;  // {ModelArrays}
  let number_points;
  let number_lines;
  let number_triangles;
  let number_wireframe;

  // Temporary variables
  let v      = new Float32Array(4);
  let v2     = new Float32Array(4);
  let norm   = new Float32Array(3);
  let norm2  = new Float32Array(3);
  let matrix = new GlMatrix4x4();

  let model, transform, color, n, start, finish;

  //-----------------------------------------------------------------------
  function _createArrays() {
    let new_points, new_lines, new_triangles, new_wireframe;

    if (number_points > 0) {
      new_points = new PointsData();

      new_points.vertices = new Float32Array(number_points * 3);
      new_points.last = 0; // The index of the last data value.

      combined_model.points = new_points;
    }

    if (number_lines > 0) {
      new_lines = new LinesData();

      new_lines.vertices = new Float32Array(number_lines * 6);
      new_lines.last = 0; // The index of the last data value.

      combined_model.lines = new_lines;
    }

    if (number_triangles > 0) {
      new_triangles = new TrianglesData();

      new_triangles.number = number_triangles;
      new_triangles.vertices       = new Float32Array(number_triangles * 9);
      new_triangles.smooth_normals = new Float32Array(number_triangles * 9);
      new_triangles.colors         = new Float32Array(number_triangles * 12); // RGBA
      new_triangles.last = 0; // The index of the last data value.

      combined_model.triangles = new_triangles;
    }

    if (number_wireframe > 0) {
      new_wireframe = new WireframeData();

      new_wireframe.vertices = new Float32Array(number_wireframe * 6);
      new_wireframe.last = 0; // The index of the last data value.

      combined_model.wireframe = new_wireframe;
    }
  }

  /**----------------------------------------------------------------------
   * Transfer data from a source model to a destination model
   * @param destination {Float32Array}
   * @param start {number} the first index in the destination
   * @param source {Float32Array}
   * @param transform {Float32Array} 4x4 matrix transform
   * @param points {boolean} if true, the data values are vertices, else vectors
   * @private
   */
  function _transferData(destination, start, source, transform, points) {
    let new_triangles, model, vertices, normals, k;

    if (points) {
      v[3] = 1.0;  // points
    } else {
      v[3] = 0.0;  // vectors
    }

    k = start;
    // For each "value", transform it and put the results into the destination.
    for (let j=0; j<source.length; j+= 3) {
      // Get the data from the array
      v[0] = source[j];
      v[1] = source[j+1];
      v[2] = source[j+2];

      // Transform the vertices and normal vector
      matrix.multiplyP4(v2, transform, v);

      // Put the values into the new array
      destination[k++] = v2[0];
      destination[k++] = v2[1];
      destination[k++] = v2[2];
    }

    return k;
  }

  /**----------------------------------------------------------------------
   * Duplicate a color value for each vertex
   * @param destination {Float32Array}
   * @param start {number} the first index in the destination
   * @param number_vertices {number}
   * @param color {Float32Array} RGBA color
   * @private
   */
  function _duplicateData(destination, start, number_vertices, color) {
    let k;

    k = start;
    for (let j=0; j<number_vertices; j++) {
      destination[k++] = color[0];
      destination[k++] = color[1];
      destination[k++] = color[2];
      destination[k++] = color[3];
    }

    return k;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  if (arguments.length > 3) {
    // Create a new ModelArrays object
    combined_model = new ModelArrays(name + "_combined");
    combined_model.rgba = true;

    // Start with no data.
    number_points = 0;
    number_lines = 0;
    number_triangles = 0;
    number_wireframe = 0;

    // Count the number of elements in the combined model.
    n = 1;
    for (let n = 1; n < arguments.length; n += 3) {
      model = arguments[n];

      if (model.points && model.points.vertices) {
        number_points += (model.points.vertices.length / 3);
      }
      if (model.lines && model.lines.vertices) {
        number_lines += (model.lines.vertices.length / 6);
      }
      if (model.triangles && model.triangles.vertices) {
        number_triangles += (model.triangles.vertices.length / 9);
      }
      if (model.wireframe && model.wireframe.vertices) {
        number_wireframe += (model.wireframe.vertices.length / 6);
      }
    }

    _createArrays();

    // Transfer the arrays
    let start_color = 0;
    let number_vertices = 0;
    for (let n = 1; n < arguments.length; n += 3) {
      model     = arguments[n];
      transform = arguments[n+1];
      color     = arguments[n+2];

      if (model.points && model.points.vertices) {
        combined_model.points.last
          = _transferData(combined_model.points.vertices, combined_model.points.last,
                          model.points.vertices, transform, true);
      }
      if (model.lines && model.lines.vertices) {
      }
      if (model.triangles && model.triangles.vertices) {
        number_vertices = model.triangles.vertices.length / 3;
        start = combined_model.triangles.last;
        finish = _transferData(combined_model.triangles.vertices,
                               start,
                               model.triangles.vertices,
                               transform, true);
        finish = _transferData(combined_model.triangles.smooth_normals,
                               start,
                               model.triangles.smooth_normals,
                               transform, false);
        start_color = _duplicateData(combined_model.triangles.colors, start_color,
                               number_vertices, color);

        combined_model.triangles.last = finish;
      }
      if (model.wireframe && model.wireframe.vertices) {
        combined_model.wireframe.last
          = _transferData(combined_model.wireframe.vertices,
                          combined_model.wireframe.last,
                          model.wireframe.vertices,
                          transform, true);
      }
    }
  }

  return combined_model;
};

