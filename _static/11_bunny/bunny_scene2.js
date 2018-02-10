/**
 * bunny_scene2.js, By Wayne Brown, Fall 2017
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
 * @param scene {DiffuseLightScene} the scene being rendered.
 * @constructor
 */
window.BunnyScene2 = function (id, download, vshaders_dictionary,
                                    fshaders_dictionary, models, scene) {

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
  let texture_translate = matrix3x3.create();
  let texture_scale = matrix3x3.create();
  let texture_rotate = matrix3x3.create();
  let color_texture_transform = matrix3x3.create();

  //-----------------------------------------------------------------------
  self.render = function () {

    // Clear the entire canvas window background with the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Set the location of the light source
    // Transform the light position by the camera
    gl.useProgram(program);
    gl.uniform3f(program.u_Light_position, scene.light_in_camera_space[0],
                                           scene.light_in_camera_space[1],
                                           scene.light_in_camera_space[2]);

    gl.uniform3f(program.u_Light_color, scene.light_color[0],
                                        scene.light_color[1],
                                        scene.light_color[2]);

    gl.uniform3f(program.u_Ambient_intensities, scene.ambient_intensities[0],
                                                scene.ambient_intensities[1],
                                                scene.ambient_intensities[2]);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Draw each model
    matrix.rotate(model_rotate_x, scene.model_rotate_x, 1,0,0);
    matrix.rotate(model_rotate_y, scene.model_rotate_y, 0,1,0);
    matrix.multiplySeries(model_clipping, scene.clipping_space, model_rotate_x, model_rotate_y);
    matrix.multiplySeries(model_camera, scene.camera, model_rotate_x, model_rotate_y);

    matrix3x3.translate(texture_translate, scene.texture_tx, scene.texture_ty);
    matrix3x3.scale(texture_scale, scene.texture_sx, scene.texture_sy);
    matrix3x3.rotate(texture_rotate, scene.texture_angle);
    matrix3x3.multiplySeries(color_texture_transform, texture_translate, texture_scale, texture_rotate);

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
  self.canvas = download.getCanvas(id + "_canvas_b");
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

  gl.clearColor(1, 1, 1, 1.0);

  // Create Vertex Object Buffers for the models
  model_gpu = new ModelArraysGPU(gl, models["bunny"], download.out);
  bunny = new RenderBunny(gl, program, model_gpu, models["bunny"], download.out);

  // Mouse drag to rotate events
  let events = new BunnyEvents2(id, scene);
};

