/**
 * heightmap_scene.js, By Wayne Brown, Fall 2017
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
window.HeightmapScene = function (id, download, vshaders_dictionary,
                                fshaders_dictionary, models) {

  // Private variables
  let self = this; // Store a local reference to the new object.
  let my_canvas = null;

  let gl = null;
  let program = null;
  let uniform_program = null;
  let plane0, plane1, plane2;
  let wireframe_plane0, wireframe_plane1, wireframe_plane2;
  let model_gpu;
  let black = [0,0,0,1];

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let projection_matrix = matrix.createPerspective(45.0, 1.0, 1.0, 20.0);
  let camera_matrix = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();

  // Public variables that will be changed by event handlers.
  self.canvas = null;
  self.angle_x = 20.0;
  self.angle_y = 30.0;
  self.animate_active = false;
  self.out = download.out;

  self.which_plane = 2;
  self.maximum_height = 1.0;
  self.wireframe_model = false;

  //-----------------------------------------------------------------------
  // Public function to render the scene.
  self.render = function () {

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Build individual transforms
    matrix.setIdentity(transform);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection_matrix, camera_matrix,
                          rotate_x_matrix, rotate_y_matrix);

    // Draw one model
    if (self.which_plane === 0) {
      plane0.render(transform, self.maximum_height);
    } else if (self.which_plane === 1) {
      plane1.render(transform, self.maximum_height);
    } else if (self.which_plane === 2) {
      plane2.render(transform, self.maximum_height);
    }

    if (self.wireframe_model) {
      if (self.which_plane === 0) {
        wireframe_plane0.render(transform, black, true);
      } else if (self.which_plane === 1) {
        wireframe_plane1.render(transform, black, true);
      } else if (self.which_plane === 2) {
        wireframe_plane2.render(transform, black, true);
      }
    }
  };

  //-----------------------------------------------------------------------
  // Public function to delete and reclaim all rendering objects.
  self.delete = function () {
    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    plane0.delete(gl);
    plane1.delete(gl);
    plane2.delete(gl);
    wireframe_plane0.delete(gl);
    wireframe_plane1.delete(gl);
    wireframe_plane2.delete(gl);

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
  program = download.createProgram(gl, vshaders_dictionary["heightmap"], fshaders_dictionary["heightmap"]);
  uniform_program = download.createProgram(gl, vshaders_dictionary["uniform_color"], fshaders_dictionary["uniform_color"]);

  // Enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.53, 0.81, 1.0, 1.0);  // light sky blue rgb(135,206,250)

  matrix.lookAt(camera_matrix, 0, 0, 5, 0, 0, 0, 0, 1, 0);

  // Create Vertex Object Buffers for the models
  model_gpu = new ModelArraysGPU(gl, models["plane0"], download.out);
  plane0 = new RenderHeightmap(gl, program, model_gpu, download.out);
  wireframe_plane0 = new RenderUniformColor(gl, uniform_program, model_gpu, download.out);

  model_gpu = new ModelArraysGPU(gl, models["plane1"], download.out);
  plane1 = new RenderHeightmap(gl, program, model_gpu, download.out);
  wireframe_plane1 = new RenderUniformColor(gl, uniform_program, model_gpu, download.out);

  model_gpu = new ModelArraysGPU(gl, models["plane2"], download.out);
  plane2 = new RenderHeightmap(gl, program, model_gpu, download.out);
  wireframe_plane2 = new RenderUniformColor(gl, uniform_program, model_gpu, download.out);

  // Set up callbacks for user and timer events
  let events;
  events = new HeightmapEvents(id, self);
};
