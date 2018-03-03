/**
 * text_3d_scene.js, By Wayne Brown, Spring 2018
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
window.Text3dScene = function (id, download, vshaders_dictionary,
                                fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let my_canvas = null;

  let gl = null;
  let uniform_program;
  let characters;
  let alphabet;
  let model_gpu;

  let matrix = new window.GlMatrix4x4();
  let vec3 = new GlVector3(); // {GlVector3}

  let translate = matrix.create();
  let to_camera_space = matrix.create();
  let to_clipping_space = matrix.create();
  let projection;
  let camera = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();

  // Public variables that will possibly be used or changed by event handlers.
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.tx = 0.0;
  self.ty = 0.0;
  self.tz = 0.0;
  self.animate_active = false;
  self.out = download.out;

  self.my_string = "test";

  //-----------------------------------------------------------------------
  self.render = function () {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the location of the light source
    gl.useProgram(uniform_program);
    gl.uniform3fv(uniform_program.u_Light_position, [5.0, 5.0, 5.0]);
    gl.uniform3fv(uniform_program.u_Light_color, [1.0, 1.0, 1.0]);
    gl.uniform3fv(uniform_program.u_Ambient_intensities, [0.3, 0.3, 0.3]);

    // Build individual transforms
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);
    matrix.translate(translate, self.tx, self.ty, self.tz);

    // Render the cubes models
    matrix.multiplySeries(to_camera_space, camera, translate,
                          rotate_x_matrix, rotate_y_matrix);
    matrix.multiply(to_clipping_space, projection, to_camera_space);

    alphabet.render(self.my_string, to_clipping_space, to_camera_space, [1.0, 0.0, 0.0, 1.0]);
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(uniform_program.vShader);
    gl.deleteShader(uniform_program.fShader);
    gl.deleteProgram(uniform_program);

    // Delete each model's VOB
    for (let c=33; c <= 126; c += 1) {
      characters[c].delete(gl);
    }

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
  uniform_program = download.createProgram(gl, vshaders_dictionary["uniform_color_with_lighting"],
                                               fshaders_dictionary["uniform_color_with_lighting"]);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  projection = matrix.createPerspective(45.0, 1.0, 1.0, 100.0);
  matrix.lookAt(camera, 0, 0, 5, 0, 0, 0, 0, 1, 0);

  // Create Vertex Object Buffers for the cubes models and
  // pre-processing for rendering.
  characters = new Array(127);
  for (let c=33; c <= 126; c += 1) {
    model_gpu = new ModelArraysGPU(gl, models["c" + c], self.out);
    characters[c] = new RenderUniformColorWithLighting(gl, uniform_program, model_gpu, self.out);
  }

  alphabet = new Text3d(characters);

  // Set up callbacks for user and timer events
  let events;
  events = new Text3dEvents(id, self);
  //events.animate();
};

