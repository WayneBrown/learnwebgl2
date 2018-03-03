/**
 * text_3d.js, By Wayne Brown, Spring 2018
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
 * Use models of individual characters to render a text string in 3D.
 * @param characters {Array} of models, one for each character
 * @constructor
 */
window.Text3d = function (characters) {

  let self = this;

  // Indexes into dimensions array for each character.
  const MIN_X  = 0;
  const MAX_X  = 1;
  const MIN_Y  = 2;
  const MAX_Y  = 3;
  const MIN_Z  = 4;
  const MAX_Z  = 5;
  const OFFSET_TO = 6;
  const SPACE_BETWEEN = 7;

  // Store data about each character model.
  let sizes = new Array(characters.length);

  // General spacing values:
  let space_width = 0;
  let character_height = 0;
  let baseline = 0;
  let line_height = 0;
  let line_spacing = 0;
  const line_spacing_factor = 1.08;

  // Transformations used for rendering the character models.
  let matrix = new GlMatrix4x4();
  let translate = matrix.create();
  let new_clipping_transform = matrix.create();
  let new_camera_transform = matrix.create();

  /**----------------------------------------------------------------------
   * Calculate dimensions and offsets for each individual character model.
   * @private
   */
  function _gatherCharacterInfo() {
    let limits, vertices, x, y, z, min_y, max_y, sum_width, number_characters;

    min_y = 10e10;
    max_y = -10e10;

    number_characters = 0;
    sum_width = 0;
    for (let j = 0; j < characters.length; j++) {
      if (characters[j]) {

        // Determine a bounding box for the character
        limits = new Array(8);
        limits[MIN_X] = 10e10;
        limits[MAX_X] = -10e10;
        limits[MIN_Y] = 10e10;
        limits[MAX_Y] = -10e10;
        limits[MIN_Z] = 10e10;
        limits[MAX_Z] = -10e10;

        vertices = characters[j].model_buffers.raw_data.triangles.vertices;
        for (let k = 0; k < vertices.length; k += 3) {
          x = vertices[k];
          y = vertices[k + 1];
          z = vertices[k + 2];
          if (x < limits[MIN_X]) {
            limits[MIN_X] = x;
          }
          if (x > limits[MAX_X]) {
            limits[MAX_X] = x;
          }
          if (y < limits[MIN_Y]) {
            limits[MIN_Y] = y;
          }
          if (y > limits[MAX_Y]) {
            limits[MAX_Y] = y;
          }
          if (z < limits[MIN_Z]) {
            limits[MIN_Z] = z;
          }
          if (z > limits[MAX_Z]) {
            limits[MAX_Z] = z;
          }
        }

        // Find height limits for all character.
        if (limits[MAX_Y] > max_y) { max_y = limits[MAX_Y]; }
        if (limits[MIN_Y] < min_y) { min_y = limits[MIN_Y]; }

        limits[OFFSET_TO] = limits[MIN_X];
        sum_width += (limits[MAX_X] - limits[MIN_X]);
        number_characters += 1;

        sizes[j] = limits;
      }
    }

    // Set the distance between each letter and the next letter.
    for (let j = 0; j < characters.length - 1; j++) {
      if (characters[j]) {
        sizes[j][SPACE_BETWEEN] = sizes[j+1][MIN_X] - sizes[j][MAX_X];
      }
    }

    // Set the SPACE_BETWEEN for the "~" character, use "^" spacing.
    sizes[characters.length - 1][SPACE_BETWEEN] = sizes[94][SPACE_BETWEEN];

    // Use the capital "A" to set the vertical dimensions.
    baseline = sizes[65][MIN_Y];
    character_height = sizes[65][MAX_Y] - sizes[65][MIN_Y];

    // Let the offset for a "space" be the average distance between characters.
    space_width = sum_width / number_characters;

    // Set the line spacing.
    line_height = max_y - min_y;
    line_spacing = line_height * line_spacing_factor;
  }

  /**----------------------------------------------------------------------
   * Render a string of characters using a model for each character.
   * @param my_string {string}
   * @param to_clipping_space {Float32Array} transformation to clipping space
   * @param to_camera_space {Float32Array} transformation to camera space
   * @param color {Float32Array} RGBA color
   */
  self.render = function (my_string, to_clipping_space, to_camera_space, color) {
    let c, x_offset, y_offset;

    x_offset = 0;
    y_offset = 0;
    for (let j=0; j<my_string.length; j++) {
      c = my_string.charCodeAt(j);

      if (c === 32) { // space
        x_offset += space_width;
      } else if (c === 10 || c === 13) { // new-line
        x_offset = 0;
        y_offset -= line_spacing;
      } else if (c > 32 && c <= 126 && characters[c]) {
        matrix.translate(translate,  x_offset - sizes[c][OFFSET_TO], y_offset, 0.0);

        matrix.multiply(new_clipping_transform, to_clipping_space, translate);
        matrix.multiply(new_camera_transform, to_camera_space, translate);

        characters[c].render(new_clipping_transform, new_camera_transform, color);

        x_offset += (sizes[c][MAX_X] - sizes[c][MIN_X]) + sizes[c][SPACE_BETWEEN];
      }
    }
  };

  // Constructor
  _gatherCharacterInfo();
};

