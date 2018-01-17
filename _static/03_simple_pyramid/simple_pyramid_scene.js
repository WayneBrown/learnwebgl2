/**
 * simple_pyramind_scene.js, By Wayne Brown, Fall 2017
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
 * Create a WebGL 3D scene, store its state, and render its models.
 *
 * @param id {string} The id of the webglinteractive directive
 * @param download {SceneDownload} An instance of the SceneDownload class
 * @param vshaders_dictionary {dict} A dictionary of vertex shaders.
 * @param fshaders_dictionary {dict} A dictionary of fragment shaders.
 * @param models {object} A dictionary (or array) of models.
 * @constructor
 */
window.SimplePyramidScene = function (id, download, vshaders_dictionary,
                                fshaders_dictionary, models) {

  let self = this;

  // Private variables
  let out = download.out;

  let gl = null;
  let program = null;

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let camera = matrix.create();
  let projection = null;
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();
  let scale_axes = matrix.create();
  let pyramid_model;
  let pyramid_color;
  let pyramid = null;
  let pyramid_gpu = null;
  let x_axis_gpu, y_axis_gpu, z_axis_gpu;
  let x_axis, y_axis, z_axis;
  let x_axis_color, y_axis_color, z_axis_color = null;
  let events = null;

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.animate_active = false;
  self.draw_edges = true;
  self.wireframe = false;
  self.show_axes = true;

  //-----------------------------------------------------------------------
  self.render = function () {

    // Build individual transforms
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, camera, rotate_x_matrix, rotate_y_matrix);

    // Render the model
    pyramid.render(transform, pyramid_color, self.draw_edges, self.wireframe);

    if (self.show_axes) {
      // Draw the axes
      matrix.multiplySeries(transform, transform, scale_axes);
      x_axis.render(transform, x_axis_color);
      y_axis.render(transform, y_axis_color);
      z_axis.render(transform, z_axis_color);
    }
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    pyramid.delete(gl);
    x_axis.delete(gl);
    y_axis.delete(gl);
    z_axis.delete(gl);

    // Remove all event handlers
    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  self.canvas = download.getCanvas(id + "_canvas");
  if (self.canvas) {
    gl = download.getWebglContext(self.canvas);
  }
  if (!gl) {
    return ;
  }

  // Initialize the state of the gl context
  gl.enable(gl.DEPTH_TEST);

  projection = matrix.createOrthographic(-1,1, -1,1, -8,8);
  matrix.lookAt(camera, 0, 0, 4, 0, 0, 0, 0, 1, 0);

  // Compile and link shader programs to create a complete rendering program.
  program = download.createProgram(gl, vshaders_dictionary["uniform_color"], fshaders_dictionary["uniform_color"]);

  gl.useProgram(program);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Create a simple model of a pyramid.
  pyramid_model = CreatePyramid();
  pyramid_color = new Float32Array([1.0, 0.0, 0.0, 1.0]);

  // Create GPU buffer objects for the model
  pyramid_gpu = new ModelToGpu(gl, pyramid_model, out);

  // Initialize the pyramid model rendering variables
  pyramid = new SimpleModelRender(gl, program, pyramid_gpu, out);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Setup of models to render the global axes
  x_axis_gpu = new ModelArraysGPU(gl, models.x_axis, out);
  y_axis_gpu = new ModelArraysGPU(gl, models.y_axis, out);
  z_axis_gpu = new ModelArraysGPU(gl, models.z_axis, out);

  x_axis = new RenderUniformColor(gl, program, x_axis_gpu, out);
  y_axis = new RenderUniformColor(gl, program, y_axis_gpu, out);
  z_axis = new RenderUniformColor(gl, program, z_axis_gpu, out);

  x_axis_color = new Float32Array([ 1, 0, 0, 1]);  // red
  y_axis_color = new Float32Array([ 0, 1, 0, 1]);  // green
  z_axis_color = new Float32Array([ 0, 0, 1, 1]);  // blue

  // Set the scaling for the global axes.
  matrix.scale(scale_axes, 0.1, 0.1, 0.1);

  // Set up callbacks for user and timer events
  events = new SimplePyramidEvents(id, self);
  events.animate();
};

