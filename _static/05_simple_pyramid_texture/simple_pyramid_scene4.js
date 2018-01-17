/**
 * simple_pyramid_scene4.js, By Wayne Brown, Fall 2017
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
 * @param download {object} An instance of the SceneDownload class
 * @param vshaders_dictionary {dict} A dictionary of vertex shaders.
 * @param fshaders_dictionary {dict} A dictionary of fragment shaders.
 * @param models {dict} A dictionary of models.
 * @constructor
 */
window.SimplePyramidScene4 = function (id, download, vshaders_dictionary,
                                fshaders_dictionary, models) {

  let self = this;

  // Private variables
  let canvas_id = download.canvas_id;
  let out = download.out;

  let gl = null; // {WebGLRenderingContext}
  let texture_program;
  let uniform_program;

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let camera = matrix.create();
  let projection;
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();
  let scale_axes = matrix.create();

  let pyramid_model;
  let pyramid = null;
  let pyramid_gpu;
  let x_axis_gpu, y_axis_gpu, z_axis_gpu;
  let x_axis, y_axis, z_axis;
  let x_axis_color, y_axis_color, z_axis_color;

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.animate_active = false;
  self.draw_edges = false;
  self.wireframe = false;
  self.show_axes = true;

  //-----------------------------------------------------------------------
  self.render = function () {

    // Build individual transforms
    matrix.setIdentity(transform);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, camera, rotate_x_matrix, rotate_y_matrix);

    // Render the model
    pyramid.render(transform, self.draw_edges, self.wireframe);

    if (self.show_axes) {
      matrix.multiplySeries(transform, transform, scale_axes);
      x_axis.render(transform, x_axis_color);
      y_axis.render(transform, y_axis_color);
      z_axis.render(transform, z_axis_color);
    }
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(texture_program.vShader);
    gl.deleteShader(texture_program.fShader);
    gl.deleteProgram(texture_program);

    gl.deleteShader(uniform_program.vShader);
    gl.deleteShader(uniform_program.fShader);
    gl.deleteProgram(uniform_program);

    // Delete each model's VOB
    pyramid.delete(gl);
    x_axis.delete(gl);
    y_axis.delete(gl);
    z_axis.delete(gl);

    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  self.canvas = download.getCanvas(canvas_id);
  if (self.canvas) {
    gl = download.getWebglContext(self.canvas);
  }
  if (!gl) {
    return;
  }

  // Set up the rendering program and set the state of webgl
  texture_program = download.createProgram(gl, vshaders_dictionary["texture01"], fshaders_dictionary["texture01"]);
  uniform_program = download.createProgram(gl, vshaders_dictionary["uniform_color"], fshaders_dictionary["uniform_color"]);

  projection = matrix.createOrthographic(-1,1, -1,1, -8,8);
  matrix.lookAt(camera, 0, 0, 4, 0, 0, 0, 0, 1, 0);

  gl.enable(gl.DEPTH_TEST);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Create a simple model of a pyramid.
  pyramid_model = CreatePyramid4();

  // Create GPU buffer objects for the model
  pyramid_gpu = new ModelToGpu4(gl, pyramid_model, out);

  // Initialize the pyramid model rendering variables
  pyramid = new SimpleModelRender4(gl, uniform_program, texture_program, pyramid_gpu, out);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Setup of models to render the global axes
  x_axis_gpu = new ModelArraysGPU(gl, models.x_axis, out);
  y_axis_gpu = new ModelArraysGPU(gl, models.y_axis, out);
  z_axis_gpu = new ModelArraysGPU(gl, models.z_axis, out);

  x_axis = new RenderUniformColor(gl, uniform_program, x_axis_gpu, out);
  y_axis = new RenderUniformColor(gl, uniform_program, y_axis_gpu, out);
  z_axis = new RenderUniformColor(gl, uniform_program, z_axis_gpu, out);

  x_axis_color = new Float32Array([ 1, 0, 0, 1]);  // red
  y_axis_color = new Float32Array([ 0, 1, 0, 1]);  // green
  z_axis_color = new Float32Array([ 0, 0, 1, 1]);  // blue

  // Set the scaling for the global axes.
  matrix.scale(scale_axes, 0.1, 0.1, 0.1);

  // Set up callbacks for user and timer events
  let events;
  events = new SimplePyramidEvents4(id, self);
};

