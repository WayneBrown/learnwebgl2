/**
 * points3_scene.js, By Wayne Brown, Spring 2018
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
 * @param images {object} A dictionary of downloaded images.
 * @constructor
 */
window.Points3Scene = function (id, download, vshaders_dictionary,
                               fshaders_dictionary, models, images) {

  // Private variables
  let self = this;
  let out = download.out;

  let gl = null;
  let program = null;
  let cube_points = null;
  let gpuModel;

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let projection = matrix.createPerspective(45.0, 1.0, 0.1, 100.0);
  let camera = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();
  let translate_matrix = matrix.create();

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.translate_x = 0.0;
  self.animate_active = true;
  self.point_size = 30.0;

  //-----------------------------------------------------------------------
  self.render = function () {

    // Set up common transformations for the entire scene.
    matrix.rotate(rotate_x_matrix, self.angle_x, 1.0, 0.0, 0.0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0.0, 1.0, 0.0);
    matrix.translate(translate_matrix, self.translate_x, 0.0, 0.0);
    matrix.multiplySeries(transform, projection, camera, translate_matrix,
                          rotate_x_matrix, rotate_y_matrix);

    // Clear the entire canvas window background with the clear color.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the size of all the points.
    gl.uniform1f(program.u_Size, self.point_size);

    cube_points.render(transform, [1,0,0,1]);  // red
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    cube_points.delete(gl);

    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  self.canvas = download.getCanvas(id + "_canvas");
  if (self.canvas) {
    gl = download.getWebglContext(self.canvas);
    //gl = download.getWebglContext(self.canvas, {antialias : false} );
  }
  if (!gl) {
    return;
  }

  self.animate_active = $('#' + id + '_animate').prop('checked');

  // Set up the rendering programs
  program = download.createProgram(gl, vshaders_dictionary["uniform_point_size"],
                                       fshaders_dictionary["uniform_point_texture"]);
  program.u_Size = gl.getUniformLocation(program, 'u_Size');
  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  matrix.lookAt(camera, 0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Create Vertex Object Buffers for the models
  gpuModel = new ModelArraysGPU(gl, models["cube_points"], out);
  cube_points = new RenderPointTexture(gl, program, gpuModel, download.out, images["explosion_seamless"]);

  // Show the maximum size for a point on the current WebGL system
  let point_range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
  $("#" + id + "_point_range").text( point_range[0].toFixed(1) + " to " + point_range[1].toFixed(1));

  self.point_size = Number($('#' + id + '_size').val());

  // Set up callbacks for user and timer events
  let events;
  events = new Points3Events(id, self);
  if (self.animate_active) events.animate();
};

