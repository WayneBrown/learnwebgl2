/**
 * simple_model3.js, By Wayne Brown, Fall 2017
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
 * @param vertices {Array} An array of 2 arrays - first (x,y,z) location, then RGBA color.
 * @constructor
  */
window.Triangle3 = function (vertices) {
  let self = this;
  self.vertices = vertices;
};

/**------------------------------------------------------------------------
 * A simple model composed of an array of triangles.
 * @param name String The name of the model.
 * @constructor
 */
window.SimpleModel3 = function (name) {
  let self = this;
  self.name = name;
  self.triangles = [];
};

/**------------------------------------------------------------------------
 * Create a Simple_model of 4 triangles that forms a pyramid.
 * @return SimpleModel
 */
window.CreatePyramid3 = function () {
  let vertices, triangle1, triangle2, triangle3, triangle4;

  // Vertex data, a location (x,y,z) and a RGBA color for each
  vertices = [  [ [ 0.0, -0.25, -0.50], [1, 0, 0, 1] ],
                [ [ 0.0,  0.25,  0.00], [0, 1, 0, 1] ],
                [ [ 0.5, -0.25,  0.25], [0, 0, 1, 1] ],
                [ [-0.5, -0.25,  0.25], [1, 0, 1, 1] ]
             ];

  // Create 4 triangles
  triangle1 = new Triangle3([vertices[2], vertices[1], vertices[3]]);
  triangle2 = new Triangle3([vertices[3], vertices[1], vertices[0]]);
  triangle3 = new Triangle3([vertices[0], vertices[1], vertices[2]]);
  triangle4 = new Triangle3([vertices[0], vertices[2], vertices[3]]);

  // Create a model that is composed of 4 triangles
  let model = new SimpleModel3("simple");
  model.triangles = [ triangle1, triangle2, triangle3, triangle4 ];

  return model;
};
