/**
 * transform_texture_scene.js, By Wayne Brown, Fall 2017
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
window.TransformTextureScene = function (id, download, vshaders_dictionary,
                                fshaders_dictionary, models) {

  // Private variables
  let self = this; // Store a local reference to the new object.
  let my_canvas = null;

  let gl = null;
  let program = null;
  let plane;
  let model_gpu;

  let matrix = new GlMatrix4x4();
  let geometry_transform = matrix.create();
  let projection_matrix = matrix.createOrthographic(-1.5, 1.5, -1.5, 1.5, 0.0, 6.0);
  let camera_matrix = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();

  let matrix3x3 = new GlMatrix3x3();
  let texture_translate = matrix3x3.create();
  let texture_scale = matrix3x3.create();
  let texture_rotate = matrix3x3.create();
  let texture_transform = matrix3x3.create();

  // Public variables that will be changed by event handlers.
  self.canvas = null;
  self.angle_x = 30.0;
  self.angle_y = 20.0;
  self.animate_active = false;
  self.out = download.out;

  self.texture_tx = 0.0;
  self.texture_ty = 0.0;
  self.texture_sx = 1.0;
  self.texture_sy = 1.0;
  self.texture_angle = 0.0;

  //-----------------------------------------------------------------------
  // Public function to render the scene.
  self.render = function () {

    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

    // Build individual transforms
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(geometry_transform, projection_matrix, camera_matrix,
                          rotate_x_matrix, rotate_y_matrix);

    matrix3x3.translate(texture_translate, self.texture_tx, self.texture_ty);
    matrix3x3.scale(texture_scale, self.texture_sx, self.texture_sy);
    matrix3x3.rotate(texture_rotate, self.texture_angle);
    matrix3x3.multiplySeries(texture_transform, texture_translate, texture_scale, texture_rotate);

    // Draw each model
    plane.render(geometry_transform, texture_transform);
  };

  //-----------------------------------------------------------------------
  // Public function to delete and reclaim all rendering objects.
  self.delete = function () {
    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    plane.delete(gl);

    // Remove all event handlers
    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  my_canvas = download.getCanvas(id + "_canvas");
  if (my_canvas) {
    gl = download.getWebglContext(my_canvas);
  }
  if (!gl) {
    return;
  }

  // Set up the rendering program and set the state of webgl
  program = download.createProgram(gl, vshaders_dictionary["transform_texture"], fshaders_dictionary["transform_texture"]);
  gl.useProgram(program);

  // Enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  matrix.lookAt(camera_matrix, 0, 0, 3, 0, 0, 0, 0, 1, 0);

  // Create Vertex Object Buffers for the models
  model_gpu = new ModelArraysGPU(gl, models["textured_plane"], download.out);
  plane = new RenderTransformTexture(gl, program, model_gpu, download.out);

  // Set up callbacks for user and timer events
  let events;
  events = new TransformTextureEvents(id, self);
};
