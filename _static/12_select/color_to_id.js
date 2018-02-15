/**
 * color_to_id.js, By Wayne Brown, Spring 2018
 *
 * These event handlers can modify the characteristics of a scene.
 * These will be specific to a scene's models and the models' attributes.
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

/** =======================================================================
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
window.ColorToID = function (gl) {

  let self = this;

  let red_bits   = gl.getParameter(gl.RED_BITS);
  let green_bits = gl.getParameter(gl.GREEN_BITS);
  let blue_bits  = gl.getParameter(gl.BLUE_BITS);
  let alpha_bits = gl.getParameter(gl.ALPHA_BITS);
  let total_bits = red_bits + green_bits + blue_bits + alpha_bits;

  let red_max   = Math.pow(2,red_bits) - 1;
  let green_max = Math.pow(2,green_bits) - 1;
  let blue_max  = Math.pow(2,blue_bits) - 1;
  let alpha_max = Math.pow(2,alpha_bits) - 1;

  let red_shift   = green_bits + blue_bits + alpha_bits;
  let green_shift = blue_bits + alpha_bits;
  let blue_shift  = alpha_bits;

  let color = new Float32Array(4);

  /** ---------------------------------------------------------------------
   * Given an integer identifier, convert it to an RGBA color value.
   * @param id {number} an integer identifier
   * @returns {Float32Array} A array containing four floats.
   */
  self.createColor = function (id) {

    color[0] = ((id >> red_shift)   & red_max)   / red_max;
    color[1] = ((id >> green_shift) & green_max) / green_max;
    color[2] = ((id >> blue_shift)  & blue_max)  / blue_max;
    color[3] = ( id                 & alpha_max) / alpha_max;

    return color;
  };

  /** ---------------------------------------------------------------------
   * Given a RGBA color value from a color buffer, calculate and return
   * a single integer.
   * @param red   {number} component in the range [0,red_max  ]
   * @param green {number} component in the range [0,green_max]
   * @param blue  {number} component in the range [0,blue_max ]
   * @param alpha {number} component in the range [0,alpha_max]
   * @returns {number} An integer identifier.
   */
  self.getID = function (red, green, blue, alpha) {
    // Shift each component to its bit position in the final integer
    return ( (red   << red_shift)
      + (green << green_shift)
      + (blue  << blue_shift)
      + alpha );
  };

};

