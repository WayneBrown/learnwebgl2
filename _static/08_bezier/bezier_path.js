/**
 * bezier_path.js, By Wayne Brown, Fall 2017
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
 * Store and manipulate a path defined by 4 control points.
 * @param control_points {Array} of GlPoint4 locations
 * @param start_frame {number} the frame that starts the path animation
 * @param end_frame {number} the frame that ends the path animation
 * @constructor
 */
window.BezierPath = function (control_points, start_frame, end_frame) {

  // Constructor
  let self = this;

  // Objects needed for internal elements and calculations
  let P = new GlPoint4();

  // The points that define the path
  let p0 = control_points[0];
  let p1 = control_points[1];
  let p2 = control_points[2];
  let p3 = control_points[3];

  self.control_points = control_points;
  self.start_frame = start_frame;
  self.end_frame = end_frame;

  // Calculate speed and acceleration for display purposes
  let p1_temp = P.create();
  let p2_temp = P.create();
  self.speeds = null;
  self.accelerations = null;

  /**----------------------------------------------------------------------
   * Calculate an intermediate point along a straight path between P1 and P2.
   * @param p {GlPoint4} the result of the intermediate point calculation
   * @param frame {number} which frame of an animation
   */
  self.intermediatePoint = function (p, frame) {

    let number_deltas, t, t0, t1, t2, t3;

    if (frame <= self.start_frame) {
      P.copy(p, p0);
    } else if (frame >= self.end_frame) {
      P.copy(p, p3);
    } else {
      number_deltas = self.end_frame - self.start_frame;
      t = (frame - self.start_frame) / number_deltas;

      t0 = Math.pow(1-t, 3);
      t1 = 3.0 * t * Math.pow(1-t, 2);
      t2 = 3.0 * Math.pow(t, 2) * (1-t);
      t3 = Math.pow(t, 3);

      p[0] = t0 * p0[0] + t1 * p1[0] + t2 * p2[0] + t3 * p3[0];
      p[1] = t0 * p0[1] + t1 * p1[1] + t2 * p2[1] + t3 * p3[1];
      p[2] = t0 * p0[2] + t1 * p1[2] + t2 * p2[2] + t3 * p3[2];
    }
  };

  /**----------------------------------------------------------------------
   * Calculate the speed and acceleration along the path.
   * This is for display purposes only - it is not needed to animate the path.
   * @param frame_rate {number} the number of frames per second.
   */
  self.calculateActualSpeeds = function (frame_rate) {

    let which_frame = self.start_frame;
    let time_between_frames = 1.0 / frame_rate;

    // Calculate the speeds and accelerations for display purposes only
    let number_frames = self.end_frame - self.start_frame + 1;
    self.speeds        = new Array(number_frames);
    self.accelerations = new Array(number_frames);

    self.intermediatePoint(p1_temp, which_frame);
    self.speeds[0] = 0;

    for (let index = 1; index < number_frames; index++) {
      which_frame += 1;
      self.intermediatePoint(p2_temp, which_frame);
      self.speeds[index] = P.distanceBetween(p1_temp, p2_temp) / time_between_frames;
      P.copy(p1_temp, p2_temp);
    }

    self.accelerations[0] = 0;
    for (let index = 1; index < number_frames; index++) {
      self.accelerations[index] = (self.speeds[index] - self.speeds[index-1])
                                   / time_between_frames;
    }
  };

};
