/**
 * scissoring1_scene.js, By Wayne Brown, Fall 2017
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
 * @param id The id of the webglinteractive directive
 * @param download An instance of the SceneDownload class
 * @param vshaders_dictionary A dictionary of vertex shaders.
 * @param fshaders_dictionary A dictionary of fragment shaders.
 * @param models A dictionary of models.
 * @constructor
 */
window.Scissoring1Scene = function (id, download, vshaders_dictionary,
                                fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let my_canvas = null;

  let gl = null;
  let program = null;
  let uniform_program;
  let scene_models = null;
  let scene_models_gpu;
  let viewport_model = null;

  let matrix = new window.GlMatrix4x4();
  let transform = matrix.create();
  let top_projection;
  let front_projection;
  let perspective_projection;
  let side_projection;
  let top_camera = matrix.create();
  let front_camera = matrix.create();
  let side_camera = matrix.create();
  let perspective_camera = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();

  // Public variables that will possibly be used or changed by event handlers.
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.x_divide = 150;
  self.y_divide = 150;
  self.animate_active = true;
  self.show_viewports = true;
  self.out = download.out;

  //-----------------------------------------------------------------------
  self.render = function () {

    gl.clear(gl.COLOR_BUFFER_BIT);

    let left_width = self.x_divide;
    let right_width = my_canvas.width - self.x_divide;
    let bottom_height = self.y_divide;
    let top_height = my_canvas.height - self.y_divide;

    // projection parameters
    let left, right, bottom, top, world_width, world_height;

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Top view in upper-left of canvas
    gl.scissor(0, self.y_divide, left_width, top_height);
    gl.viewport(0, self.y_divide, left_width, top_height);

    world_width = (6/150) * left_width;
    right = world_width/2;
    left = -right;
    world_height = (6/150) * top_height;
    top = world_height/2;
    bottom = -top;
    top_projection = matrix.createOrthographic(left, right, bottom, top, 0, 30);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, top_projection, top_camera);

    // Draw each model
    for (let j = 0; j < scene_models.length; j += 1) {
      scene_models[j].render(transform);
    }

    if (self.show_viewports) {
      viewport_model.updateOrthographicViewport(left, right, bottom, top, 0);
      viewport_model.render(top_projection);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Front view in lower-left of canvas
    gl.scissor(0, 0, left_width, bottom_height);
    gl.viewport(0, 0, left_width, bottom_height);

    world_width = (6/150) * left_width;
    right = world_width/2;
    left = -right;
    world_height = (6/150) * bottom_height;
    top = world_height/2;
    bottom = -top;
    front_projection = matrix.createOrthographic(left, right, bottom, top, 0, 30);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, front_projection, front_camera);

    // Draw each model
    for (let j = 0; j < scene_models.length; j += 1) {
      scene_models[j].render(transform);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Perspective view in upper-right of canvas (rotates)
    gl.scissor(self.x_divide, self.y_divide, right_width, top_height);
    gl.viewport(self.x_divide, self.y_divide, right_width, top_height);

    let aspect = right_width / top_height;
    perspective_projection = matrix.createPerspective(45.0, aspect, 1.0, 30);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Build individual transforms
    matrix.setIdentity(transform);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, perspective_projection, perspective_camera, rotate_x_matrix, rotate_y_matrix);

    // Draw each model
    for (let j = 0; j < scene_models.length; j += 1) {
      scene_models[j].render(transform);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Side view in lower-right of canvas
    gl.scissor(self.x_divide, 0, right_width, bottom_height);
    gl.viewport(self.x_divide, 0, right_width, bottom_height);

    world_width = (6/150) * right_width;
    right = world_width/2;
    left = -right;
    world_height = (6/150) * bottom_height;
    top = world_height/2;
    bottom = -top;
    side_projection = matrix.createOrthographic(left, right, bottom, top, 0, 30);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, side_projection, side_camera);

    // Draw each model
    for (let j = 0; j < scene_models.length; j += 1) {
      scene_models[j].render(transform);
    }

    if (self.show_viewports) {
      viewport_model.updateOrthographicViewport(left, right, bottom, top, 0);
      viewport_model.render(side_projection);
    }
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    for (let j = 0; j < scene_models.length; j += 1) {
      scene_models[j].delete(gl);
    }
    scene_models = [];
    viewport_model.delete(gl);

    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  my_canvas = download.getCanvas(id + "_canvas");  // by convention
  if (my_canvas) {
    gl = download.getWebglContext(my_canvas);
  }
  if (!gl) {
    return;
  }

  // Set up the rendering program and set the state of webgl
  program = download.createProgram(gl, vshaders_dictionary["color_per_vertex"], fshaders_dictionary["color_per_vertex"]);
  uniform_program = download.createProgram(gl, vshaders_dictionary["uniform_color"], fshaders_dictionary["uniform_color"]);

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.SCISSOR_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  top_projection = matrix.createOrthographic(-3, 3, -3, 3, 0, 30);
  matrix.lookAt(top_camera, 0, 5, 0, 0, 0, 0, 0, 0, -1);

  front_projection = matrix.createOrthographic(-3, 3, -3, 3, 0, 30);
  matrix.lookAt(front_camera, 0, 0, 5, 0, 0, 0, 0, 1, 0);

  matrix.lookAt(side_camera, 5, 0, 0, 0, 0, 0, 0, 1, 0);

  matrix.lookAt(perspective_camera, 0, 0, 8, 0, 0, 0, 0, 1, 0);

  // Create Vertex Object Buffers for the models
  scene_models = new Array(models.number_models);
  for (let j = 0; j < models.number_models; j += 1) {
    scene_models_gpu = new ModelArraysGPU(gl, models[j], download.out);
    scene_models[j] = new RenderColorPerVertex(gl, program, scene_models_gpu, download.out);
  }

  viewport_model = new ViewportModel(gl, uniform_program, [0,0,0,1]);

  // Set up callbacks for user and timer events
  let events;
  events = new Scissoring1Events(id, self);
  events.animate();
};

