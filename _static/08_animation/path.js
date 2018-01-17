/**
 * path.js, By Wayne Brown, Fall 2017
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
 * Store and manipulate a path between two points.
 * @param control_points {Array} of GlPoint4 locations
 * @param start_frame {number} which frame the animation starts on
 * @param end_frame {number} which frame the animation ends on
 * @constructor
 */
window.Path = function (control_points, start_frame, end_frame) {

  // Constructor
  let self = this;

  // The points that define the path
  self.control_points = control_points;
  self.start_frame    = start_frame;
  self.end_frame      = end_frame;
  self.number_frames  = (self.end_frame - self.start_frame) + 1;

  /**----------------------------------------------------------------------
   * Calculate an intermediate point along a straight path between P1 and P2.
   * @param p {GlPoint4} the result of the intermediate point calculation
   * @param frame {number} which frame of an animation
   */
  self.intermediatePoint = function (p, frame) {

    let p1, p2, t;

    p1 = self.control_points[0];
    p2 = self.control_points[1];

    if (frame <= self.start_frame) {
      t = 0.0;
    } else if (frame >= self.end_frame) {
      t = 1.0;
    } else {
      t = (frame - self.start_frame) / (self.number_frames - 1);
    }

    p[0] = (1 - t) * p1[0] + t * p2[0];
    p[1] = (1 - t) * p1[1] + t * p2[1];
    p[2] = (1 - t) * p1[2] + t * p2[2];
  };

};
