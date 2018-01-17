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
 * @param scene {LinearPathScene}
 * @constructor
 */
window.Path = function (scene) {

  // Constructor
  let self = this;

  // Objects needed for internal elements and calculations
  let P = new GlPoint4();

  // The points that define the path
  self.points = new Array(2);
  self.points[0] = P.create(-5, 0, 0);
  self.points[1] = P.create( 5, 0, 0);

  self.t = 0.0;    // The current value of the parametric parameter t
  self.number_frames = 30;

  let dt = 1.0;   // The amount to change t on each new frame

  // Scratch objects for calculations
  let p = P.create();  // an intermediate point along the path;

  let previous_time = 0;
  let frame_rate = 30;  // frames per second
  let milliseconds_between_frames = Math.round( (1 / frame_rate) * 1000 );

  /**----------------------------------------------------------------------
   * Calculate an intermediate point along a straight path between P1 and P2.
   */
  self.intermediatePoint = function () {

    let p1 = self.points[0];
    let p2 = self.points[1];
    let t = self.t;

    p[0] = (1 - t) * p1[0] + t * p2[0];
    p[1] = (1 - t) * p1[1] + t * p2[1];
    p[2] = (1 - t) * p1[2] + t * p2[2];

    return p;
  };

  /**----------------------------------------------------------------------
   * Animate an object for every location along the path between P1 and P2.
   */
  self.animate = function () {
    let now, elapsed_time;

    if (self.t < 1.0) {

      now = Date.now();
      elapsed_time = now - previous_time;

      if (elapsed_time >= milliseconds_between_frames) {
        // Remember when this scene was rendered.
        previous_time = now;

        // Change the scene
        self.t += dt;
        if (self.t > 1.0) { self.t = 1.0; }

        // Update the screen
        scene.events.updateValuesDisplay(self.t);
        scene.render();
      }

      window.requestAnimationFrame(self.animate);
    }
  };

  /**----------------------------------------------------------------------
   * Initialize an animation along this path.
   */
  self.startAnimation = function () {
    self.t = 0.0;
    dt = 1.0 / (self.number_frames - 1.0);

    // Render the first frame
    previous_time = Date.now();
    scene.events.updateValuesDisplay(self.t);
    scene.render();

    self.animate();
  };

};
