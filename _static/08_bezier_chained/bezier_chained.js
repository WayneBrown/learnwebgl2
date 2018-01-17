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
 * Store and manipulate a path defined by four control points.
 * @param control_points {Array} of four glPoint4 locations
 * @param start_frame {number} the frame to start the path animation
 * @param end_frame {number} the frame to end the path animation
 * @param color {Array} RGBA color for displaying the path
 * @constructor
 */
window.BezierPath = function (control_points,
                              start_frame, end_frame,
                              color) {
  // Constructor
  let self = this;

  // Local references to the control points
  let p0 = control_points[0];
  let p1 = control_points[1];
  let p2 = control_points[2];
  let p3 = control_points[3];

  // Objects needed for internal elements and calculations
  let P = new GlPoint4();
  let V = new GlVector3();

  // Scratch objects for calculations
  let p = P.create();  // an intermediate point along the path;

  // Vectors for calculating a speed vector
  let p0_p1 = V.create();
  let p1_p2 = V.create();
  let p2_p3 = V.create();

  // The path vectors are constant, so calculate them once.
  V.subtract(p0_p1, p1, p0);
  V.subtract(p1_p2, p2, p1);
  V.subtract(p2_p3, p3, p2);

  // Scratch vectors for calculating a speed vector.
  let p0_p1_scaled = V.create();
  let p1_p2_scaled = V.create();
  let p2_p3_scaled = V.create();
  let speed_vector = V.create();

  // Vectors for the object's local coordinate system
  let u = V.create();
  let v = V.create();
  let n = V.create();
  let up = V.create(0, 1, 0);

  // Global data
  self.start_frame = start_frame;
  self.end_frame = end_frame;
  self.control_points = control_points;

  // The number of divisions in "time" along the path.
  let number_deltas = end_frame - start_frame;

  /**----------------------------------------------------------------------
   * Calculate an intermediate point along a bezier path.
   * @param p {GlPoint4} the location along the path based on the frame number
   * @param frame {number} the frame to calculate the location along the path
   */
  self.intermediatePoint = function (p, frame) {

    let t, t0, t1, t2, t3;

    if (frame <= start_frame) {
      P.copy(p, p0);
    } else if (frame >= end_frame) {
      P.copy(p, p3);
    } else {
      t = (frame - start_frame) / number_deltas;

      // p = (1-t)^3 * p0 + 3*(1-t)^2*t* p1 + 3*(1-t)*t^2* p2 + t^3* p3;
      t0 = Math.pow(1 - t, 3);
      t1 = 3.0 * t * Math.pow(1 - t, 2);
      t2 = 3.0 * Math.pow(t, 2) * (1 - t);
      t3 = Math.pow(t, 3);

      p[0] = t0 * p0[0] + t1 * p1[0] + t2 * p2[0] + t3 * p3[0];
      p[1] = t0 * p0[1] + t1 * p1[1] + t2 * p2[1] + t3 * p3[1];
      p[2] = t0 * p0[2] + t1 * p1[2] + t2 * p2[2] + t3 * p3[2];
    }
  };

  /**----------------------------------------------------------------------
   * Calculate a local coordinate system based on the speed vector
   * and an arbitrary "up vector"
   * @param frame {number} the frame to calculate the location along the path
   */
  self.calculateCoordinateSystem = function (frame) {

    let t, t0, t1, t2;

    if (frame <= start_frame) {
      t = 0.0;
    } else if (frame >= end_frame) {
      t = 1.0;
    } else {
      t = (frame - start_frame) / number_deltas;
    }

    // Calculate the derivative, which gives the speed vector
    // speed_vector = 3*[(1-t)^2(p1-p0) + 2(1-t)(t)(p2-p1) + (t^2)(p3-p2)]
    t0 = 3 * (1 - t) * (1 - t);
    t1 = 3 * 2 * (1 - t) * t;
    t2 = 3 * t * t;

    V.scale(p0_p1_scaled, p0_p1, t0);
    V.scale(p1_p2_scaled, p1_p2, t1);
    V.scale(p2_p3_scaled, p2_p3, t2);

    V.add(speed_vector, p0_p1_scaled, p1_p2_scaled);
    V.add(speed_vector, speed_vector, p2_p3_scaled);

    // If the speed_vector is zero, we need to use one of the vectors
    // defined by the control points. The location on the path determines
    // the best choice.
    if (V.length(speed_vector) === 0) {
      if (t < 0.33) {                  // beginning of path
        if (V.length(p0_p1) !== 0) {
          V.copy(speed_vector, p0_p1);
        } else if (V.length(p1_p2) !== 0) {
          V.copy(speed_vector, p1_p2);
        } else {
          V.copy(speed_vector, p1_p2);
        }
      } else if (t < 0.66) {           // middle of path
        if (V.length(p1_p2) !== 0) {
          V.copy(speed_vector, p1_p2);
        } else if (V.length(p0_p1) !== 0) {
          V.copy(speed_vector, p0_p1);
        } else {
          V.copy(speed_vector, p2_p3);
        }
      } else { // t > 0.66             // end of path
        if (V.length(p2_p3) !== 0) {
          V.copy(speed_vector, p2_p3);
        } else if (V.length(p1_p2) !== 0) {
          V.copy(speed_vector, p1_p2);
        } else {
          V.copy(speed_vector, p0_p1);
        }
      }
    }

    V.copy(n, speed_vector);
    V.normalize(n);

    V.crossProduct(u, up, n);
    V.crossProduct(v, n, u);
  };

  /**----------------------------------------------------------------------
   * Calculate a transformation for the model along this path,
   * changing both the model's orientation and location.
   * @param m {Float32Array} the transform to fill in.
   * @param frame {number} which frame along the path.
   */
  self.transform = function (m, frame) {

    self.intermediatePoint(p, frame);       // results in p
    self.calculateCoordinateSystem(frame);  // results in u,v,n vectors

    m[0] = u[0]; m[4] = v[0]; m[8]  = n[0]; m[12] = p[0];
    m[1] = u[1]; m[5] = v[1]; m[9]  = n[1]; m[13] = p[1];
    m[2] = u[2]; m[6] = v[2]; m[10] = n[2]; m[14] = p[2];
    m[3] = 0;    m[7] = 0;    m[11] = 0;    m[15] = 1;
  };
};

//=========================================================================

/**------------------------------------------------------------------------
 * A complex path represented by a series of Bezier paths.
 * @param {...BezierPath} one_or_more_paths - a series of paths, the order matters
 * @constructor
 */
window.BezierSeries = function (one_or_more_paths) {

  let self = this;

  let current_segment = 0;

  // Create an array and remember the segments that compose this BezierSeries
  self.segments = new Array(arguments.length);

  for (let j=0; j<arguments.length; j++) {
    self.segments[j] = arguments[j];
  }

  /**----------------------------------------------------------------------
   * Given a frame number, determine which path segment it is on.
   * @param frame
   * @returns {*}
   */
  self.activePath = function(frame) {

    // Test the current_segment because there is a good chance it has not changed.
    if (frame >= self.segments[current_segment].start_frame &&
        frame <= self.segments[current_segment].end_frame) {
      return self.segments[current_segment];
    }

    if (frame < self.segments[0].start_frame) {
      current_segment = 0;
    } else {
      current_segment = self.segments.length-1;
      for (let j=0; j<self.segments.length; j++) {
        if (frame >= self.segments[j].start_frame &&
            frame <= self.segments[j].end_frame) {
          current_segment = j;
          break;
        }
      }
    }

    return self.segments[current_segment];
  };

  /**----------------------------------------------------------------------
   * Create an appropriate transform for an object on a path based on which
   * frame to render.
   * @param transform {Float32Array} the transform to define.
   * @param frame {number} with frame is the animation on.
   */
  self.transform = function(transform, frame) {
    let path = self.activePath(frame);
    path.transform(transform, frame);
  };

};