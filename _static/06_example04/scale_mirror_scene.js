/**
 * ScaleAboutOriginScene.js, By Wayne Brown, Fall 2017
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
window.ScaleMirrorScene = function (id, download, vshaders_dictionary,
                                fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let my_canvas = null;

  let gl = null;
  let program = null;
  let textx, texty, textz, cubex, cubey, cubez, cube_center;
  let textx_gpu, texty_gpu, textz_gpu, cubex_gpu, cubey_gpu,
      cubez_gpu, cube_center_gpu;

  let x_axis_gpu, y_axis_gpu, z_axis_gpu;
  let x_axis, y_axis, z_axis;
  //let x_axis_color, y_axis_color, z_axis_color = null;

  let matrix = new window.GlMatrix4x4();
  let translate = matrix.create();
  let transform = matrix.create();
  let finalTransform = matrix.create();
  let projection;
  let camera = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();
  let scale_matrix = matrix.create();
  let scale_axes = matrix.create();

  // Various locations for the cubes model to be rendered.
  let locations = [[ 2.5,  2.5,  2.5],
                   [-2.5,  0.0,  0.0],
                   [ 0.0,  0.0, -2.5] ];

  // Public variables that will possibly be used or changed by event handlers.
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.x_scale = 1.0;
  self.y_scale = 1.0;
  self.z_scale = 1.0;
  self.x_neg = 1.0;
  self.y_neg = 1.0;
  self.z_neg = 1.0;
  self.animate_active = false;
  self.out = download.out;

  //-----------------------------------------------------------------------
  function _renderCubes(transform) {
    textx.render(transform);
    texty.render(transform);
    textz.render(transform);
    cubex.render(transform);
    cubey.render(transform);
    cubez.render(transform);
    cube_center.render(transform);
  };

  //-----------------------------------------------------------------------
  self.render = function () {

    // Build individual transforms
    matrix.setIdentity(transform);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);
    matrix.scale(scale_matrix, self.x_scale*self.x_neg,
                               self.y_scale*self.y_neg,
                               self.z_scale*self.z_neg);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, camera, rotate_x_matrix, rotate_y_matrix);

    // Render the cubes model in various locations
    for (let j = 0; j < locations.length; j += 1) {
      matrix.translate(translate, locations[j][0], locations[j][1], locations[j][2]);
      matrix.multiplySeries(finalTransform, transform, scale_matrix, translate);
      _renderCubes(finalTransform);
    }

    // Render the global axes
    matrix.multiplySeries(transform, transform, scale_axes);
    x_axis.render(transform);
    y_axis.render(transform);
    z_axis.render(transform);
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    textx.delete(gl);
    texty.delete(gl);
    textz.delete(gl);
    cubex.delete(gl);
    cubey.delete(gl);
    cubez.delete(gl);
    cube_center.delete(gl);
    x_axis.delete(gl);
    y_axis.delete(gl);
    z_axis.delete(gl);

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

  projection = matrix.createPerspective(45.0, 1.0, 1.0, 100.0);
  matrix.lookAt(camera, 0, 0, 12, 0, 0, 0, 0, 1, 0);

  // Create Vertex Object Buffers for the cubes models and
  // pre-processing for rendering.
  textx_gpu = new ModelArraysGPU(gl, models.textx, self.out);
  textx = new RenderColorPerVertex(gl, program, textx_gpu, self.out);

  texty_gpu = new ModelArraysGPU(gl, models.texty, self.out);
  texty = new RenderColorPerVertex(gl, program, texty_gpu, self.out);

  textz_gpu = new ModelArraysGPU(gl, models.textz, self.out);
  textz = new RenderColorPerVertex(gl, program, textz_gpu, self.out);

  cubex_gpu = new ModelArraysGPU(gl, models.cubex, self.out);
  cubex = new RenderColorPerVertex(gl, program, cubex_gpu, self.out);

  cubey_gpu = new ModelArraysGPU(gl, models.cubey, self.out);
  cubey = new RenderColorPerVertex(gl, program, cubey_gpu, self.out);

  cubez_gpu = new ModelArraysGPU(gl, models.cubez, self.out);
  cubez = new RenderColorPerVertex(gl, program, cubez_gpu, self.out);

  cube_center_gpu = new ModelArraysGPU(gl, models.cube_center, self.out);
  cube_center = new RenderColorPerVertex(gl, program, cube_center_gpu, self.out);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Setup of models to render the global axes
  x_axis_gpu = new ModelArraysGPU(gl, models.x_axis, self.out);
  y_axis_gpu = new ModelArraysGPU(gl, models.y_axis, self.out);
  z_axis_gpu = new ModelArraysGPU(gl, models.z_axis, self.out);

  x_axis = new RenderColorPerVertex(gl, program, x_axis_gpu, self.out);
  y_axis = new RenderColorPerVertex(gl, program, y_axis_gpu, self.out);
  z_axis = new RenderColorPerVertex(gl, program, z_axis_gpu, self.out);

  // Set the scaling for the global axes.
  matrix.scale(scale_axes, 0.2, 0.2, 0.2);

  // Set up callbacks for user and timer events
  let events;
  events = new ScaleMirrorEvents(id, self);
  events.animate();
};

