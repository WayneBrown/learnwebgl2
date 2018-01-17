/**
 * glmatrix3x3.js, By Wayne Brown, Fall 2017
 *
 * GlMatrix3x3 is a set of functions that perform standard operations
 * on 3x3 transformation matrices.
 *
 * The 3x3 matrices are stored in column-major order using an array of 32-bit
 * floating point numbers, which makes them similar to the GlMatrix4x4 ordering.
 *
 * The functions do not create new objects because in real-time graphics,
 * creating new objects slows things down.
 *
 * Function parameters are ordered in the same order an equivalent
 * assignment statements. For example, R = A*B, has parameters (R, A, B).
 * All matrix parameters use capital letters.
 *
 * The functions are defined inside an object to prevent pollution of
 * JavaScript's global address space. The functions contain no validation
 * of parameters, which makes them more efficient at run-time.
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 C. Wayne Brown
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

// Do not perform code-formatting on this code. It destroys the matrix formatting.
//@formatter:off

"use strict";

/**
 * @constructor Create an instance of the Learn_webgl_matrix3 class
 */
window.GlMatrix3x3 = function () {

  let self = this;

  /** -----------------------------------------------------------------
   * @return Float32Array returns an uninitialized matrix.
   */
  self.create = function () {
    return new Float32Array(9);
  };

  // Temporary matrices and vectors for calculations. They are reused to
  // prevent new objects from being constantly re-created and then garbage
  // collected.
  let T1, T2, v2, p3;

  T1 = self.create();
  T2 = self.create();
  v2 = new Float32Array(2);
  p3 = new Float32Array(3);

  /** -----------------------------------------------------------------
   * M = I (identity Matrix)
   */
  self.setIdentity = function (M) {
    M[0] = 1;  M[3] = 0;  M[6] = 0;
    M[1] = 0;  M[4] = 1;  M[7] = 0;
    M[2] = 0;  M[5] = 0;  M[8] = 1;
  };

  /** -----------------------------------------------------------------
   * To = From (an element-by-element copy)
   * @return To (a 16 element Float32Array)
   */
  self.copy = function (To, From) {
    for (let j = 0; j < 9; j += 1) {
      To[j] = From[j];
    }
    return To;
  };

  /** -----------------------------------------------------------------
   * R = A * B (Matrix Multiplication); NOTE: order matters!
   */
  self.multiply = function (R, A, B) {

    // A and B can't change during the operation.
    // If R is the same as A and/or B, Make copies of A and B
    // The comparison must use ==, not ===. We are comparing for identical
    // objects, not if two objects might have the same values.
    if (A == R) {
      A = self.copy(T1, A);
    }
    if (B == R) {
      B = self.copy(T2, B);
    }

    R[0] = A[0] * B[0]  + A[3] * B[1]  + A[6] * B[2];
    R[1] = A[1] * B[0]  + A[4] * B[1]  + A[7] * B[2];
    R[2] = A[2] * B[0]  + A[5] * B[1]  + A[8] * B[2];

    R[3] = A[0] * B[3]  + A[3] * B[4]  + A[6] * B[5];
    R[4] = A[1] * B[3]  + A[4] * B[4]  + A[7] * B[5];
    R[5] = A[2] * B[3]  + A[5] * B[4]  + A[8] * B[5];

    R[6] = A[0] * B[6]  + A[3] * B[7]  + A[6] * B[8];
    R[7] = A[1] * B[6]  + A[4] * B[7]  + A[7] * B[8];
    R[8] = A[2] * B[6]  + A[5] * B[7]  + A[8] * B[8];
  };

  /** -----------------------------------------------------------------
   * R = A * B * C * D ... (Matrix Multiplication); NOTE: order matters!
   */
  self.multiplySeries = function () {
    if (arguments.length >= 3) {
      self.multiply(arguments[0], arguments[1], arguments[2]);
      let j;
      for (j = 3; j < arguments.length; j += 1) {
        self.multiply(arguments[0], arguments[0], arguments[j]);
      }
    }
  };

  /** -----------------------------------------------------------------
   * r = M * v (M is a 3x3 matrix, v is a 2-component vector)
   */
  self.multiplyV2 = function (r, M, v) {

    // v can't change during the operation. If r and v are the same, make a copy of v
    if (r == v) {
      v2[0] = v[0];
      v2[1] = v[1];
      v = v2;
    }

    r[0] = M[0] * v[0] + M[3] * v[1];
    r[1] = M[1] * v[0] + M[4] * v[1];
  };

  /** -----------------------------------------------------------------
   * r = M * p (M is a 3x3 matrix, p is a 3-component point (x,y,1))
   */
  self.multiplyP3 = function (r, M, p) {

    // p can't change during the operation, so make a copy of p.
    if (r == p) {
      p3[0] = p[0];
      p3[1] = p[1];
      p3[2] = p[2];
      p = p3;
    }

    r[0] = M[0] * p[0] + M[3] * p[1] + M[6] * p[2];
    r[1] = M[1] * p[0] + M[4] * p[1] + M[7] * p[2];
    r[2] = M[2] * p[0] + M[5] * p[1] + M[8] * p[2];
  };

  /** -----------------------------------------------------------------
   * console.log(name, M)
   */
  self.print = function (name, M) {
    let fieldSize = 11;
    let numText;
    let rowText, number;
    window.console.log(name + ":");
    for (let row = 0; row < 3; row += 1) {
      rowText = "";
      for (let offset = 0; offset < 9; offset += 3) {
        number = Number(M[row + offset]);
        numText = number.toFixed(4);
        rowText += new Array(fieldSize - numText.length).join(" ") + numText;
      }
      window.console.log(rowText);
    }
  };

  /** -----------------------------------------------------------------
   * M = M' (transpose the matrix)
   */
  self.transpose = function (M) {
    let t;

    // The diagonal values don't move; 3 non-diagonal elements are swapped.
    t = M[1];  M[1] = M[3];  M[3] = t;
    t = M[2];  M[2] = M[6];  M[6] = t;
    t = M[5];  M[5] = M[7];  M[7] = t;
  };

  /** -----------------------------------------------------------------
   * Set the matrix for scaling.
   * @param M The matrix to set to a scaling matrix
   * @param sx The scale factor along the x-axis
   * @param sy The scale factor along the y-axis
   */
  self.scale = function (M, sx, sy) {
    M[0] = sx;  M[3] = 0;   M[6] = 0;
    M[1] = 0;   M[4] = sy;  M[7] = 0;
    M[2] = 0;   M[5] = 0;   M[8] = 1;
  };

  /** -----------------------------------------------------------------
   * Set the matrix for translation.
   * @param M The matrix to set to a translation matrix.
   * @param dx The X value of a translation.
   * @param dy The Y value of a translation.
   */
  self.translate = function (M, dx, dy) {
    M[0] = 1;  M[3] = 0;  M[6] = dx;
    M[1] = 0;  M[4] = 1;  M[7] = dy;
    M[2] = 0;  M[5] = 0;  M[8] = 1;
  };

  /** -----------------------------------------------------------------
   * Set the matrix to a rotation matrix. The axis of rotation axis is the Z axis.
   * @paraM angle The angle of rotation (in degrees)
   */
  self.rotate = function (M, angle) {
    let s, c;

    angle = self.toRadians(angle);

    s = Math.sin(angle);
    c = Math.cos(angle);

    M[0] = c;  M[3] = -s;  M[6] = 0;
    M[1] = s;  M[4] = c;   M[7] = 0;
    M[2] = 0;  M[5] = 0;   M[8] = 1;
  };

};

//@formatter:on

