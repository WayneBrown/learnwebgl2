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
 * @param start_frame {number} the frame that starts the path animation
 * @param end_frame {number} the frame that ends the path animation
 * @param acceleration_frames {number} the number of frames to accelerate
 * @param deceleration_frames {number} the number of frames to decelerate
 * @constructor
 */
window.Path2 = function (control_points, start_frame, end_frame,
                         acceleration_frames, deceleration_frames) {

  // Constructor
  let self = this;

  let P = new GlPoint4();

  // The points that define the path
  self.control_points = control_points;
  let p1 = control_points[0];
  let p2 = control_points[1];

  self.start_frame = start_frame;
  self.end_frame = end_frame;
  self.acceleration = acceleration_frames;
  self.deceleration = deceleration_frames;

  let t_array = [];    // The values of the parametric parameter t

  /**----------------------------------------------------------------------
   * Calculate an intermediate point along a straight path between P1 and P2.
   * @param p {GlPoint4} the calculated location (the return value)
   * @param frame {number} which frame to calculate the intermediate point
   */
  self.intermediatePoint = function (p, frame) {

    let index, t;

    index = frame - self.start_frame;
    if (index < 0) {
      P.copy(p, p1);
    } else if (index >= t_array.length) {
      P.copy(p, p2);
    } else {
      t = t_array[index];

      p[0] = (1 - t) * p1[0] + t * p2[0];
      p[1] = (1 - t) * p1[1] + t * p2[1];
      p[2] = (1 - t) * p1[2] + t * p2[2];
    }
  };

  /**----------------------------------------------------------------------
   * Calculate the values of t needed for a path between P1 and P2 that
   * includes acceleration and deceleration.
   * @param scene {AccelerationScene} used to update the acceleration values
   * if they are adjusted because they are too large.
   */
  self.calculateAnimation = function (scene) {
    let number_frames, dt, j, k, n, sum, slope, constant;

    // Allocate an array for the parametric t values
    number_frames = self.end_frame - self.start_frame + 1;
    t_array = new Array(number_frames);

    // How many frames have constant speed?
    constant = (number_frames - 1) - self.acceleration - self.deceleration;

    if (constant < 0) {
      // There are too many acceleration or deceleration frames.
      while (constant < 0) {
        self.acceleration -= 1;
        self.deceleration -= 1;
        constant = (number_frames - 1) - self.acceleration - self.deceleration;
      }
      scene.events.updateAccelerationDisplay(scene.current_frame);
    }

    // Add up the acceleration step changes
    sum = 0;
    if (self.acceleration > 0) {
      slope = self.acceleration * 2;
      sum += (1.0 / slope) * Math.pow(self.acceleration, 2);
    }

    // Add in the frames with constant speed
    sum += constant;

    // Add up the deceleration step changes
    if (self.deceleration > 0) {
      slope = self.deceleration * 2;
      sum += (1.0 / slope) * Math.pow(self.deceleration, 2);
    }

    // Calculate the dt needed for the constant speed section
    dt = 1.0 / sum;

    t_array[0] = 0.0;
    n = 1;
    if (self.acceleration > 0) {
      // Fill in the acceleration deltas
      slope = self.acceleration * 2;
      for (j = 0, k = 1; j < self.acceleration; j += 1, k += 2, n += 1) {
        t_array[n] = t_array[n - 1] + (k / slope) * dt;
      }
    }

    // Fill in the constant speed deltas
    for (j = 0; j < constant; j += 1, n += 1) {
      t_array[n] = t_array[n - 1] + dt;
    }

    if (self.deceleration > 0) {
      // Fill in the deceleration deltas
      slope = self.deceleration * 2;
      for (j = 0, k = slope - 1; j < self.deceleration; j += 1, k -= 2, n += 1) {
        t_array[n] = t_array[n - 1] + (k / slope) * dt;
      }
    }
  };

};
