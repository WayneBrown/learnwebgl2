/**
 * projection_data.js, By Wayne Brown, Spring 2018
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
 * Create data to define a projection, either perspective or orthogonal.
 * @constructor
 */
window.ProjectionData = function () {

  // Private variables
  let self = this;

  self.PERSPECTIVE_PROJECTION = 0;
  self.ORTHOGRAPHIC_PROJECTION = 1;

  self.type = self.PERSPECTIVE_PROJECTION;

  self.fovy = 45.0;
  self.aspect_ratio = 1.0;
  self.near = 1.0;
  self.far = 10.0;

  self.left = -2.0;
  self.right = 2.0;
  self.bottom = -2.0;
  self.top = 2.0;

  let matrix = new GlMatrix4x4();

  //-----------------------------------------------------------------------
  self.setPerspective = function () {
    self.type = self.PERSPECTIVE_PROJECTION;
  };

  //-----------------------------------------------------------------------
  self.setOrthographic = function () {
    self.type = self.ORTHOGRAPHIC_PROJECTION;
  };

  //-----------------------------------------------------------------------
  self.getTransform = function (transform) {
    if (self.type === self.PERSPECTIVE_PROJECTION) {
      matrix.perspective(transform, self.fovy, self.aspect_ratio, self.near, self.far);
    } else {
      matrix.orthographic(transform, self.left, self.right,
                                     self.bottom, self.top,
                                     self.near, self.far);
    }
  }
};
