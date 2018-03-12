/**
 * particles1_scene.js, By Wayne Brown, Fall 2017
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
 * @param images A dictionary of images.
 * @constructor
 */
window.Particles1Scene = function (id, download, vshaders_dictionary,
                              fshaders_dictionary, models, images) {

  // Private variables
  let self = this;

  let gl = null;
  let program;

  let matrix = new GlMatrix4x4();
  let model_camera = matrix.create();
  let model_clipping = matrix.create();
  let model_rotate_x = matrix.create();
  let model_rotate_y = matrix.create();

  let camera = matrix.create();
  let projection = matrix.create();

  // User mouse drags change these angles.
  self.model_rotate_x = 0.0;
  self.model_rotate_y = 0.0;
  self.particle_system = null;

  //-----------------------------------------------------------------------
  self.render = function () {

    // Clear the entire canvas window background with the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw each model
    matrix.rotate(model_rotate_x, self.model_rotate_x, 1,0,0);
    matrix.rotate(model_rotate_y, self.model_rotate_y, 0,1,0);
    matrix.multiplySeries(model_camera, camera, model_rotate_x, model_rotate_y);
    matrix.multiply(model_clipping, projection, model_camera);

    self.particle_system.render(model_clipping, model_camera);
  };

  //-----------------------------------------------------------------------
  self.delete = function () {
    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete the model's buffer objects
    self.particle_system.delete(gl);

    // Remove all event handlers
    events.removeAllEventHandlers();
  };

  //-----------------------------------------------------------------------
  // Constructor initialization
  self.canvas = download.getCanvas(id + "_canvas");
  if (self.canvas) {
    gl = download.getWebglContext(self.canvas);
  }
  if (!gl) {
    return;
  }

  // Set up the rendering program and set the state of webgl
  program = download.createProgram(gl, vshaders_dictionary['particles1'], fshaders_dictionary['particles1']);

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  matrix.lookAt(camera, 0, 0, 5, 0, 0, 0, 0, 1, 0);
  matrix.perspective(projection, 30.0, 1.0, 0.1, 100.0);

  // Create Vertex Object Buffers for the models
  self.particle_system = new ParticleSystem(5000, [0,0,0], gl, program,
                                            images["explosion_seamless"],
                                            download.out);

  // Mouse drag to rotate events
  let events = new Particles1Events(id, self);
};

