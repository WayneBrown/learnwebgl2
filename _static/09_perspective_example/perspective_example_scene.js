/**
 * perspective_example_scene.js, By Wayne Brown, Fall 2017
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
 * @param vshaders_dictionary {object} A dictionary of vertex shaders.
 * @param fshaders_dictionary {object} A dictionary of fragment shaders.
 * @param models {object} A dictionary of models.
 * @constructor
 */
window.PerspectiveExampleScene = function (id, download, vshaders_dictionary,
                                   fshaders_dictionary, models) {

  // Private letiables
  let self = this;
  let my_canvas;
  let out = download.out;

  let gl = null;
  let program = null;
  let render_models, model_gpu;
  let events;

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let view_Rx = matrix.create();
  let view_Ry = matrix.create();
  let translate = matrix.create();
  let perspective = matrix.createPerspective(30.0, 1.0, 1.0, 100.0);
  let camera = matrix.create();

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 10.0;
  self.angle_y = 15.0;
  self.eye_z = 10.0;
  self.distance = -8.0;

  //-----------------------------------------------------------------------
  this.render = function () {

    // Build individual transforms
    matrix.lookAt(camera, 0, 0, self.eye_z, 0, 0, 0, 0, 1, 0);

    matrix.setIdentity(transform);
    matrix.rotate(view_Rx, self.angle_x, 1, 0, 0);
    matrix.rotate(view_Ry, self.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, perspective, camera, view_Rx, view_Ry);

    // Draw each model
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].render(transform);
    }

    // Combine the transforms into a single transformation
    matrix.translate(translate, 0, 0, self.distance);
    matrix.multiplySeries(transform, perspective, camera, view_Rx, view_Ry, translate);

    // Draw each model
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].render(transform);
    }
  };

  //-----------------------------------------------------------------------
  this.delete = function () {

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    for (let j = 0; j < models.number_models; j += 1) {
      render_models[j].delete(gl);
    }

    // Remove all event handlers
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
  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  // Create Vertex Object Buffers for the models
  render_models = new Array(models.number_models);
  for (let j = 0; j < models.number_models; j += 1) {
    model_gpu = new ModelArraysGPU(gl, models[j], out);
    render_models[j] = new RenderColorPerVertex(gl, program, model_gpu, out);
  }

  // Set up callbacks for user and timer events
  events = new PerspectiveExampleEvents(id, self);
};

