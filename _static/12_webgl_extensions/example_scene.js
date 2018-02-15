/**
 * example_scene.js, By Wayne Brown, Fall 2017
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
window.ExampleScene = function (id, download, vshaders_dictionary,
                                fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let out = download.out;

  let gl = null;
  let program = null;
  let scene_models = null;
  let gpuModel;

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let projection_matrix = matrix.createOrthographic(-3, 3, -3, 3, -6, 6);
  let camera_matrix = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();
  let events;

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.animate_active = true;

  //-----------------------------------------------------------------------
  self.render = function () {

    // Build individual transforms
    matrix.setIdentity(transform);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection_matrix, camera_matrix,
      rotate_x_matrix, rotate_y_matrix);

    // Draw each model
    for (let j = 0; j < scene_models.length; j += 1) {
      scene_models[j].render(transform);
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

    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  // Display the version, vendor, and extensions for this WebGL browser implementation
  function _displayWebGLInfo() {
    $('#' + id + '_version').text(gl.getParameter(gl.VERSION));
    $('#' + id + '_vendor').text(gl.getParameter(gl.VENDOR));
    let extensions = gl.getSupportedExtensions();
    let extension_names = extensions.toString();
    $('#' + id + '_extensions').html(extension_names.replace(/,/gi, "<br>"));
  }
  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  self.canvas = download.getCanvas(id + "_canvas");
  if (self.canvas) {
    gl = download.getWebglContext(self.canvas);
  }
  if (!gl) {
    return;
  }

  // Set up the rendering program and set the state of webgl
  program = download.createProgram(gl, vshaders_dictionary["color_per_vertex"],
                                       fshaders_dictionary["color_per_vertex"]);

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);

  matrix.lookAt(camera_matrix, 0, 0, 4, 0, 0, 0, 0, 1, 0);

  // Create Vertex Object Buffers for the models
  let n = models.number_models;
  scene_models = new Array(n);
  for (let j = 0; j < n; j += 1) {
    gpuModel = new ModelArraysGPU(gl, models[j], out);
    scene_models[j] = new RenderColorPerVertex(gl, program, gpuModel, out);
  }

  // Set up callbacks for user and timer events
  events = new ExampleEvents(id, self);
  events.animate();

  _displayWebGLInfo();
};

