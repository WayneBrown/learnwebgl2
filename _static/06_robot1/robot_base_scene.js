/**
 * robot_base_scene.js, By Wayne Brown, Fall 2017
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

//-------------------------------------------------------------------------
/**
 * Initialize and render a scene.
 * @param id {string} The id of the webglinteractive directive
 * @param download {SceneDownload} An instance of the SceneDownload class
 * @param vshaders_dictionary {object} A dictionary of vertex shaders.
 * @param fshaders_dictionary {object} A dictionary of fragment shaders.
 * @param models {object} A dictionary of models.
 * @constructor
 */
window.RobotBaseScene = function (id, download, vshaders_dictionary,
                                  fshaders_dictionary, models) {

  // Private variables
  let self = this; // Store a local reference to the new object.

  let out = download.out;
  let events;
  let my_canvas;

  let gl = null;
  let program = null;
  let base_model;
  let base_gpu;

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let camera = matrix.create();
  let projection;
  let base_y_rotate = matrix.create();

  // Public variables that will be changed by event handlers or that
  // the event handlers need access to.
  self.base_y_angle = 0.0;
  self.animate_active = true;
  self.out = out;

  //-----------------------------------------------------------------------
  // Public function to render the scene.
  self.render = function () {

    // The base is being rotated by the animation callback so the rotation
    // about the y axis must be calculated on every frame.
    matrix.rotate(base_y_rotate, self.base_y_angle, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, camera, base_y_rotate);

    // Draw the models
    base_model.render(transform);
  };

  //-----------------------------------------------------------------------
  // Public function to delete and reclaim all rendering objects.
  self.delete = function () {
    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);
    program = null;

    // Delete each model's buffer objects
    base_model.delete();

    // Disable any animation
    self.animate_active = false;

    // Remove all event handlers
    events.removeAllEventHandlers();
    events = null;

    // Release the GL graphics context
    gl = null;
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

  // Enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);

  projection = matrix.createOrthographic(-8, 8, -8, 8, -8, 20);
  matrix.lookAt(camera, 0, 4, 8, 0, 0, 0, 0, 1, 0);

  // Set up the rendering shader program and make it the active shader program
  program = download.createProgram(gl, vshaders_dictionary["color_per_vertex"], fshaders_dictionary["color_per_vertex"]);
  gl.useProgram(program);

  // Create the Buffer Objects needed for this model and copy
  // the model data to the GPU.
  base_gpu = new ModelArraysGPU(gl, models.Base, out);
  base_model = new RenderColorPerVertex(gl, program, base_gpu, out);

  // Set up callbacks for the user and timer events
  events = new RobotBaseEvents(id, self);
  events.animate();
};

