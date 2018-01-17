/**
 * diffuse_light_scene2.js, By Wayne Brown, Fall 2017
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
 * @param scene {MultipleLightsScene} the scene being rendered.
 * @constructor
 */
window.MultipleLightsScene2 = function (id, download, vshaders_dictionary,
                                    fshaders_dictionary, models, scene) {

  // Private variables
  let self = this;

  let gl = null;
  let program;
  let render_models = {};
  let model_gpu;
  let matrix = new GlMatrix4x4();
  let camera_transform = matrix.create();
  let clipping_space_transform = matrix.create();

  let cube_model_names = ["cubex", "textx", "cubey", "texty", "cubez", "textz", "cube_center"];

  //-----------------------------------------------------------------------
  self.render = function () {

    // Clear the entire canvas window background with the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Set the location of the light source
    // Transform the light position by the camera
    gl.useProgram(program);
    for (let j=0; j< scene.lights.number; j += 1) {
      gl.uniform3f(program.lights[j].position, scene.lights[j].in_camera_space[0],
                                               scene.lights[j].in_camera_space[1],
                                               scene.lights[j].in_camera_space[2]);

      gl.uniform3f(program.lights[j].color, scene.lights[j].color[0],
                                            scene.lights[j].color[1],
                                            scene.lights[j].color[2]);
    }

    gl.uniform3f(program.u_Ambient_intensities, scene.lights.ambient[0],
                                                scene.lights.ambient[1],
                                                scene.lights.ambient[2]);

    gl.uniform1f(program.u_c1, scene.lights.c1);
    gl.uniform1f(program.u_c2, scene.lights.c2);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Draw each model
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].render(scene.clipping_space, scene.camera);
    }

    // Draw a second copy further back
    matrix.multiply(camera_transform, scene.camera, scene.translate2);
    matrix.multiply(clipping_space_transform, scene.clipping_space, scene.translate2);
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].render(clipping_space_transform, camera_transform);
    }

  };

  //-----------------------------------------------------------------------
  self.delete = function () {
    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].delete(gl);
    }

    // Remove all event handlers
    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  self.setModelShininess = function (which_model, shininess) {
    render_models[which_model].shininess = shininess;
  };

  //-----------------------------------------------------------------------
  self.getModelShininess = function (which_model) {
    return render_models[which_model].shininess;
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
  program = download.createProgram(gl, vshaders_dictionary['multiple_lights'], fshaders_dictionary['multiple_lights']);

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(1, 1, 1, 1.0);

  // Create Vertex Object Buffers for the models
  render_models = new Array(cube_model_names.length);
  for (let j = 0; j < cube_model_names.length; j += 1) {
    model_gpu = new ModelArraysGPU(gl, models[cube_model_names[j]], download.out);
    render_models[j] = new RenderMultipleLights(gl, program, model_gpu, download.out, scene.lights.number);
  }

  // No events in this window.
};

