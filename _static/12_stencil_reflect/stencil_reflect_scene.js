/**
 * stencil_reflect_scene.js, By Wayne Brown, Spring 2018
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
window.StencilReflectScene = function (id, download, vshaders_dictionary,
                               fshaders_dictionary, models) {

  // Private variables
  let self = this;

  let canvas;
  let gl = null;
  let visible_program = null;

  let render_models;
  let model_gpu;
  let plane;
  let cube_model_names = ["cubex", "textx", "cubey", "texty", "cubez", "textz", "cube_center"];

  let matrix = new GlMatrix4x4();
  let to_clipping_space = matrix.create();
  let camera_model_transform = matrix.create();
  let projection;
  let camera = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();
  let scale = matrix.create();
  let translate = matrix.create();

  // Public variables that will possibly be used or changed by event handlers.
  self.angle_x = 30.0;
  self.angle_y = -45.0;
  self.animate_active = true;

  // Light model
  let P3 = new GlPoint3();
  let V = new GlVector3();
  let light = { "position" : P3.create(10, 10, 10),
                "color"    : V.create(1, 1, 1),        // white light
                "ambient"  : V.create(0.3, 0.3, 0.3) };
  let model_shininess = 30;
  let reflection_light =
              { "color"    : V.create(0.6, 0.6, 0.6),  // darker white light
                "ambient"  : V.create(0.05, 0.05, 0.05) };

  //-----------------------------------------------------------------------
  function _render_cubes(to_clipping_space, to_camera_space) {
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].render(to_clipping_space, to_camera_space);
    }
  }

  //-----------------------------------------------------------------------
  self.render = function () {

    // Clear the draw buffers.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Step 1: Render the main model.
    gl.disable(gl.STENCIL_TEST);
    gl.depthMask(true);

    matrix.rotate(rotate_x_matrix, self.angle_x, 1.0, 0.0, 0.0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0.0, 1.0, 0.0);
    matrix.multiplySeries(camera_model_transform, camera,
                          rotate_x_matrix, rotate_y_matrix);
    matrix.multiplySeries(to_clipping_space, projection, camera_model_transform);

    gl.uniform3fv(visible_program.u_Light_color, light.color);
    gl.uniform3fv(visible_program.u_Ambient_intensities, light.ambient);

    _render_cubes(to_clipping_space, camera_model_transform);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Step 2: Render the plane and set the stencil buffer to be 1 for every pixel.
    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.ALWAYS, // The STENCIL_TEST is always true.
                   1,         // Set the stencil_buffer to 1 when it is updated.
                   0xFF);     // All bits in the stencil_buffer are used for the STENCIL_TEST.
    gl.stencilOp(gl.KEEP,     // If the STENCIL_TEST failed, keep the stencil_buffer's current value
                 gl.KEEP,     // If the DEPTH_TEST failed, keep the stencil_buffer's current value
                 gl.REPLACE); // If the DEPTH_TEST passed, replace the stencil_buffer's current value
    gl.stencilMask(0xFF);     // Allow all bits of the stencil_buffer to be modified
    gl.depthMask(false);      // The depth-buffer can't be modified. (The DEPTH TEST is still performed.)

    plane.render(to_clipping_space, camera_model_transform);

    // Don't render the reflected model if the viewing angle is below the plane.
    if (self.angle_x >= 0.0) {
      //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Step 3: Render the reflection of the model.
      gl.stencilFunc(gl.EQUAL, // The STENCIL_TEST passes only if the stencil_buffer is equal to the reference value.
                     1,        // The reference value.
                     0xFF);    // All bits in the stencil_buffer are used for the STENCIL_TEST.
      gl.stencilMask(0x00);    // No bits in the stencil_buffer can be modified.
      gl.depthMask(true);      // The depth-buffer is modified.

      gl.uniform3fv(visible_program.u_Light_color, reflection_light.color);
      gl.uniform3fv(visible_program.u_Ambient_intensities, reflection_light.ambient);

      matrix.scale(scale, 1.0, -1.0, 1.0);         // Mirror about y axis.
      matrix.translate(translate, 0.0, -1.0, 0.0); // Translate to position below the plane.
      matrix.multiplySeries(camera_model_transform, camera,
                            rotate_x_matrix, rotate_y_matrix, translate, scale);
      matrix.multiplySeries(to_clipping_space, projection, camera_model_transform);

      _render_cubes(to_clipping_space, camera_model_transform);
    }
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(visible_program.vShader);
    gl.deleteShader(visible_program.fShader);
    gl.deleteProgram(visible_program);

    // Delete each model's VOB
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].delete(gl);
    }
    plane.delete(gl);

    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  canvas = download.getCanvas(id + "_canvas");
  if (canvas) {
    gl = download.getWebglContext(canvas, {"stencil" : true});
  }
  if (!gl) {
    return;
  }

  $('#' + id + '_animate').prop('checked', self.animate_active);

  // Set up the rendering programs
  visible_program = download.createProgram(gl, vshaders_dictionary["lighting"],
                                               fshaders_dictionary["lighting"]);
  gl.useProgram(visible_program);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  matrix.lookAt(camera, 0.0, 0.0, 6.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  projection = matrix.createPerspective(45.0, 1.0, 0.1, 100.0);

  // Create Vertex Object Buffers for the models
  render_models = new Array(cube_model_names.length);
  for (let j = 0; j < cube_model_names.length; j += 1) {
    model_gpu = new ModelArraysGPU(gl, models[cube_model_names[j]], download.out);
    render_models[j] = new RenderLighting(gl, visible_program, model_gpu, download.out);
  }

  model_gpu = new ModelArraysGPU(gl, models["plane"], download.out);
  plane = new RenderLighting(gl, visible_program, model_gpu, download.out);

  // Set up callbacks for user and timer events
  let events;
  events = new StencilReflectEvents(id, self);
  events.animate();

  //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Set the location of the light source, which does not change.
  gl.useProgram(visible_program);
  gl.uniform3fv(visible_program.u_Light_position, light.position);
  gl.uniform1f(visible_program.u_Shininess, model_shininess);
};

