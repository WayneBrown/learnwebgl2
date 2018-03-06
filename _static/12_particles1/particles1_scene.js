/**
 * bunny_scene.js, By Wayne Brown, Fall 2017
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
window.BunnyScene = function (id, download, vshaders_dictionary,
                              fshaders_dictionary, models) {

  // Private variables
  let self = this;

  let gl = null;
  let program;
  let bunny;
  let model_gpu;

  let matrix = new GlMatrix4x4();
  let model_camera = matrix.create();
  let model_clipping = matrix.create();
  let model_rotate_x = matrix.create();
  let model_rotate_y = matrix.create();

  let matrix3x3 = new GlMatrix3x3();
  let color_texture_transform = matrix3x3.create();
  matrix3x3.setIdentity(color_texture_transform);

  let camera = matrix.create();
  let projection = matrix.create();

  // Light model
  let P4 = new GlPoint4();
  let P3 = new GlPoint3();
  let light_position = P4.create(3,0,5,1);
  let light_in_camera_space = P4.create();
  let light_color = P3.create(1,1,1);
  let shininess = 92.0;
  let ambient_intensities = P3.create(0.3, 0.3, 0.3);

  // User mouse drags change these angles.
  self.model_rotate_x = 0.0;
  self.model_rotate_y = 0.0;
  self.background_color = [0.85, 0.60, 0.60, 0.0];

  //-----------------------------------------------------------------------
  self.render = function () {

    let aspect_ratio = self.canvas.width/self.canvas.height;
    matrix.perspective(projection, 30.0, aspect_ratio, 0.1, 100.0);

    gl.viewport(0, 0, self.canvas.width, self.canvas.height);

    gl.clearColor(self.background_color[0],
                  self.background_color[1],
                  self.background_color[2],
                  self.background_color[3]);

    // Clear the entire canvas window background with the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    matrix.multiplyP4(light_in_camera_space, camera, light_position);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Set the location of the light source
    // Transform the light position by the camera
    gl.useProgram(program);
    gl.uniform3f(program.u_Light_position, light_in_camera_space[0],
                                           light_in_camera_space[1],
                                           light_in_camera_space[2]);

    gl.uniform3fv(program.u_Light_color, light_color);
    gl.uniform3fv(program.u_Ambient_intensities, ambient_intensities);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Draw each model
    matrix.rotate(model_rotate_x, self.model_rotate_x, 1,0,0);
    matrix.rotate(model_rotate_y, self.model_rotate_y, 0,1,0);
    matrix.multiplySeries(model_camera, camera, model_rotate_x, model_rotate_y);
    matrix.multiply(model_clipping, projection, model_camera);

    bunny.render(model_clipping, model_camera, color_texture_transform);
  };

  //-----------------------------------------------------------------------
  self.delete = function () {
    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete the model's buffer objects
    bunny.delete(gl);

    // Remove all event handlers
    events.removeAllEventHandlers();
  };

  //-----------------------------------------------------------------------
  self.setModelShininess = function (shininess) {
    bunny.shininess = shininess;
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
  program = download.createProgram(gl, vshaders_dictionary['bunny'], fshaders_dictionary['bunny']);

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);

  matrix.lookAt(camera, 0, 0, 5, 0, 0.5, 0, 0, 1, 0);

  // Create Vertex Object Buffers for the models
  model_gpu = new ModelArraysGPU(gl, models["bunny"], download.out);
  bunny = new RenderBunny(gl, program, model_gpu, models["bunny"], download.out);

  // Mouse drag to rotate events
  let events = new BunnyEvents(id, self);
};

