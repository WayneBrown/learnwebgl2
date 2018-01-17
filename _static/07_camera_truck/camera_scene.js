/**
 * camera_scene.js, By Wayne Brown, Fall 2017
 *
 * Given
 *   - a model definition as defined in learn_webgl_model_01.js, and
 *   - specific shader programs: vShader01.vert, fShader01.frag
 * Perform the following tasks:
 *   1) Build appropriate Vertex Object Buffers (VOB's)
 *   2) Create GPU VOB's for the data and copy the data into the buffers.
 *   3) Render the VOB's
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
 * @param scene_overview {CameraLookatScene}
 * @constructor
 */
window.CameraScene = function (id, download, vshaders_dictionary,
                               fshaders_dictionary, models, scene_overview) {

  // Private variables
  let self = this;
  let out = download.out;
  let my_canvas;

  let gl = null;
  let program;
  let render_models = {};

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let axes_scale = matrix.create();
  let camera = matrix.create();

  let projection = matrix.createPerspective(30.0, 1.0, 0.5, 100.0);

  let name;
  let gpu_buffers;
  let cube_model_names = ["textz", "texty", "textx", "cubey", "cubex", "cubez", "cube_center"];
  let axes_model_names = ["xaxis", "yaxis", "zaxis"];

  //-----------------------------------------------------------------------
  self.render = function () {

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Calculate the camera transformation matrix.
    matrix.copy(camera, scene_overview.scene_camera.transform);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, camera, axes_scale);

    // Draw each global axes
    for (let j = 0; j < axes_model_names.length; j += 1) {
      render_models[axes_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render model
    matrix.multiplySeries(transform, projection, camera);

    // Draw each model
    for (let j = 0; j < cube_model_names.length; j += 1) {
      render_models[cube_model_names[j]].render(transform);
    }
  };

  //-----------------------------------------------------------------------
  self.delete = function () {
    let model_names;

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    model_names = Object.keys(render_models);
    for (let j = 0; j < model_names.length; j += 1) {
      render_models[model_names[j]].delete(gl);
    }
  };

  //-----------------------------------------------------------------------
  // Initialization of second canvas rendering
  // Private variables
  // Get the rendering context for the canvas
  my_canvas = download.getCanvas(id + "_canvas_b");  // by convention
  if (my_canvas) {
    gl = download.getWebglContext(my_canvas);
  }
  if (!gl) {
    return;
  }

  // Set up the rendering program and set the state of webgl
  program = download.createProgram(gl, vshaders_dictionary["color_per_vertex"],
                                       fshaders_dictionary["color_per_vertex"]);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  matrix.scale(axes_scale, 2, 2, 2);

  // Create Vertex Object Buffers for the models
  for (let j = 0; j < models.number_models; j += 1) {
    name = models[j].name;
    gpu_buffers = new ModelArraysGPU(gl, models[name], out);
    render_models[name] = new RenderColorPerVertex(gl, program, gpu_buffers, out);
  }

};

