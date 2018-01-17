/**
 * simple_model.js, By Wayne Brown, Spring 2016
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
 * A simple triangle composed of 3 vertices.
 * @param vertices Array An array of 3 vertices.
 * @constructor
  */
window.Triangle = function (vertices, color) {
  var self = this;
  self.vertices = vertices;
  self.color = color;
};

/**------------------------------------------------------------------------
 * A simple model composed of an array of triangles.
 * @param name String The name of the model.
 * @constructor
 */
window.SimpleModel = function (name) {
  var self = this;
  self.name = name;
  self.triangles = [];
};

/**------------------------------------------------------------------------
 * Create a Simple_model of 4 triangles that forms a pyramid.
 * @return SimpleModel
 */
window.CreatePyramid = function () {
  var vertices, triangle1, triangle2, triangle3, triangle4;

  // Vertex data
  vertices = [  [ 0.0, -0.25, -0.50],
                [ 0.0,  0.25,  0.00],
                [ 0.5, -0.25,  0.25],
                [-0.5, -0.25,  0.25] ];

  var red    = new Float32Array([1, 0, 0, 1]);
  var green  = new Float32Array([0, 1, 0, 1]);
  var blue   = new Float32Array([0, 0, 1, 1]);
  var purple = new Float32Array([1, 0, 1, 1]);

  // Create 4 triangles
  triangle1 = new Triangle([vertices[2], vertices[1], vertices[3]], red);
  triangle2 = new Triangle([vertices[3], vertices[1], vertices[0]], green);
  triangle3 = new Triangle([vertices[0], vertices[1], vertices[2]], blue);
  triangle4 = new Triangle([vertices[0], vertices[2], vertices[3]], purple);

  // Create a model that is composed of 4 triangles
  var model = new SimpleModel("simple");
  model.triangles = [ triangle1, triangle2, triangle3, triangle4 ];

  return model;
};
