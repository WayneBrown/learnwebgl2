/**
 * axes_camera.js, By Wayne Brown, Fall 2017
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
 * Store and manipulate a camera based on its location and its
 * local coordinate system.
 * @constructor
 */
window.AxesCamera = function () {

  // Constructor
  let self = this;

  // Objects needed for internal elements and calculations
  let matrix = new GlMatrix4x4();
  let V = new GlVector3();
  let P = new GlPoint4();

  // Camera definition at the default camera location and orientation.
  self.eye = P.create(0, 0, 0, 1);  // (x,y,z,w), origin
  self.u   = V.create(1, 0, 0);  // <dx,dy,dz>, +X axis
  self.v   = V.create(0, 1, 0);  // <dx,dy,dz>, +Y axis
  self.n   = V.create(0, 0, 1);  // <dx,dy,dz>, +Z axis

  // Create a matrix to hold the camera's matrix transform
  self.transform = matrix.create();

  // Scratch objects for calculations
  let u_scaled;
  u_scaled = V.create();  // a scaled u coordinate axis of camera
  let temp_transform;
  temp_transform = matrix.create();

  /**----------------------------------------------------------------------
   * Using the current values for eye, u, v, and n, set a new camera
   * transformation matrix.
   */
  self.updateTransform = function () {
    let tx = -V.dotProduct(self.u, self.eye);
    let ty = -V.dotProduct(self.v, self.eye);
    let tz = -V.dotProduct(self.n, self.eye);

    // Use an alias for self.transform to simplify the assignment statements
    let M = self.transform;

    // Set the camera matrix
    M[0] = self.u[0];  M[4] = self.u[1];  M[8]  = self.u[2];  M[12] = tx;
    M[1] = self.v[0];  M[5] = self.v[1];  M[9]  = self.v[2];  M[13] = ty;
    M[2] = self.n[0];  M[6] = self.n[1];  M[10] = self.n[2];  M[14] = tz;
    M[3] = 0;          M[7] = 0;          M[11] = 0;          M[15] = 1;
  };

  /**----------------------------------------------------------------------
   * Perform a "truck" operation on the camera
   * @param distance {number} the distance to move the camera
   */
  self.truck = function (distance) {
    // Scale the u axis to the desired distance to move
    V.scale(u_scaled, self.u, distance);

    // Add the direction vector to the eye position.
    P.addVector(self.eye, self.eye, u_scaled);

    // Set the camera transformation. Since the only change is in location,
    // change only the values in the 4th column.
    self.transform[12] = -V.dotProduct(self.u, self.eye);
    self.transform[13] = -V.dotProduct(self.v, self.eye);
    self.transform[14] = -V.dotProduct(self.n, self.eye);
  };

  /**----------------------------------------------------------------------
   * Rotate the orientation of the camera about the u axis.
   * @param angle {number} the angle of rotation
   */
  self.rotateAboutU = function (angle) {
    // Create a rotation matrix with the u axis as the pivot.
    matrix.rotate(temp_transform, angle, self.u[0], self.u[1], self.u[2]);

    // Perform the rotation
    matrix.multiplyV3(self.v, temp_transform, self.v);
    matrix.multiplyV3(self.n, temp_transform, self.n);

    self.updateTransform();
  };

  /**----------------------------------------------------------------------
   * Rotate the orientation of the camera about the v axis.
   * @param angle {number} the angle of rotation
   */
  self.rotateAboutV = function (angle) {
    // Create a rotation matrix with the v axis as the pivot.
    matrix.rotate(temp_transform, angle, self.v[0], self.v[1], self.v[2]);

    // Perform the rotation
    matrix.multiplyV3(self.u, temp_transform, self.u);
    matrix.multiplyV3(self.n, temp_transform, self.n);

    self.updateTransform();
  };

  /**----------------------------------------------------------------------
   * Rotate the orientation of the camera about the n axis.
   * @param angle {number} the angle of rotation
   */
  self.rotateAboutN = function (angle) {
    // Create a rotation matrix with the n axis as the pivot.
    matrix.rotate(temp_transform, angle, self.n[0], self.n[1], self.n[2]);

    // Perform the rotation
    matrix.multiplyV3(self.u, temp_transform, self.u);
    matrix.multiplyV3(self.v, temp_transform, self.v);

    self.updateTransform();
  };

  self.updateTransform();
};


