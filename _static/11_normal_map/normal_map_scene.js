/**
 * normal_map_scene.js, By Wayne Brown, Fall 2017
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
window.NormalMapScene = function (id, download, vshaders_dictionary,
                                    fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let canvas_id = download.canvas_id;
  let my_canvas = null;

  let gl = null;
  let program;
  let ray_program;
  let render_models = {};

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let base = matrix.create();

  let translate = matrix.create();
  matrix.translate(translate, -1, -2, -2.0);

  // Camera transform and parameters
  let camera_transform = matrix.create();
  let camera_distance = 30;
  let ex = 0;
  let ey = 0;
  let ez = 10;
  self.angle_x = 0.0;
  self.angle_y = 0.0;

  // The scene camera is the camera we are using to get a specific view of
  // the scene. It is used to render the right canvas window.
  let backoff_camera = matrix.create();
  matrix.lookAt(backoff_camera, 0, 0, 8, 0, 0, 0, 0, 1, 0);
  let backoff_projection = matrix.createPerspective(45.0, 1.0, 1.0, 30.0);
  let center_point_translate = matrix.create();
  let center_point_scale = matrix.create();
  matrix.scale(center_point_scale, 0.1, 0.1, 0.1);

  let axes_scale = matrix.create();
  matrix.scale(axes_scale, 2, 2, 2);
  let rotate_x = matrix.create();
  let rotate_y = matrix.create();

  // The demo_camera is the camera we are using in the left window to
  // view everything -- including the scene_camera.
  self.camera = matrix.create();
  self.projection = matrix.createPerspective(30.0, 1.0, 0.5, 100.0);
  self.clipping_space = matrix.create();

  let camera_model_names = ["Camera_lens", "Camera", "Camera_body", "u_axis", "v_axis", "n_axis"];
  let axes_model_names = ["xaxis", "yaxis", "zaxis"];

  // Public variables that will possibly be used or changed by event handlers.
  self.eyex = 0;
  self.eyey = 0;
  self.eyez = 5;

  self.centerx = 0;
  self.centery = 0;
  self.centerz = 0;

  self.upx = 0;
  self.upy = 1;
  self.upz = 0;

  self.model_rotate_x = 0.0;
  self.model_rotate_y = 0.0;
  let model_rotate_x = matrix.create();
  let model_rotate_y = matrix.create();
  let model_transform = matrix.create();

  // Light model
  let P4 = new GlPoint4();
  self.light_position = P4.create(3,0,5,1);
  self.light_in_camera_space = P4.create();
  self.light_color = P4.create(1,1,1,1);
  self.shininess = 92.0;
  self.ambient_intensities = P4.create(0.3, 0.3, 0.3, 1);

  // To render the light position
  let light_position_translate = matrix.create();
  let light_position_scale = matrix.create();
  matrix.scale(light_position_scale, 0.2, 0.2, 0.2);

  self.render_using_normal_map = true;

  //-----------------------------------------------------------------------
  self.render = function () {
    let dist;

    gl.useProgram(program);

    // Clear the entire canvas window background with the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calculate and set the camera for the entire rendering
    matrix.rotate(rotate_x, self.angle_x, 1,0,0);
    matrix.rotate(rotate_y, self.angle_y, 0,1,0);
    matrix.lookAt(backoff_camera, 0, 0, 20, 0, 0, 0, 0, 1, 0);

    matrix.multiplySeries(backoff_camera, backoff_camera, rotate_x, rotate_y);

    // Create the base transform which is built upon for all other transforms
    matrix.multiplySeries(base, backoff_projection, backoff_camera);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render axes
    matrix.multiplySeries(transform, base, axes_scale);

    // Draw each global axes
    for (let j = 0; j < axes_model_names.length; j += 1) {
      render_models[axes_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render model
    matrix.rotate(model_rotate_x, self.model_rotate_x, 1,0,0);
    matrix.rotate(model_rotate_y, self.model_rotate_y, 0,1,0);
    matrix.multiplySeries(model_transform, base, model_rotate_x, model_rotate_y);
    render_models["cube"].render(model_transform);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the "center point" of the virtual camera as a small sphere
    matrix.translate(center_point_translate, self.centerx, self.centery, self.centerz);
    matrix.multiplySeries(transform, base, center_point_translate, center_point_scale);
    render_models['Sphere'].render(transform);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render virtual camera
    // Calculate the virtual camera transform
    matrix.lookAt(self.camera, self.eyex, self.eyey, self.eyez,
                               self.centerx, self.centery, self.centerz,
                               self.upx, self.upy, self.upz);
    matrix.copy(camera_transform, self.camera);
    matrix.transpose(camera_transform);
    //matrix.print("transposed", camera_transform);
    camera_transform[3] = 0;
    camera_transform[7] = 0;
    camera_transform[11] = 0;
    camera_transform[12] = self.eyex;
    camera_transform[13] = self.eyey;
    camera_transform[14] = self.eyez;

    matrix.multiplySeries(transform, base, camera_transform);

    // Draw the camera
    for (let j = 0; j < camera_model_names.length; j += 1) {
      render_models[camera_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Calculate the position of the light in camera space.
    matrix.multiplyP4(self.light_in_camera_space, self.camera, self.light_position);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the position of the light source
    matrix.translate(light_position_translate, self.light_position[0],
                                               self.light_position[1],
                                               self.light_position[2]);
    matrix.multiplySeries(transform, base, light_position_translate, light_position_scale);
    render_models['Sphere'].render(transform);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the other window that shows what the camera sees.
    matrix.multiply(self.clipping_space, self.projection, self.camera);
    scene2.render();
  };

  //-----------------------------------------------------------------------
  self.delete = function () {
    let j, model_names;

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    // Delete each model's VOB
    model_names = Object.keys(render_models);
    for (j = 0; j < model_names.length; j += 1) {
      render_models[model_names[j]].delete(gl);
    }

    // Remove all event handlers
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
  program = download.createProgram(gl, vshaders_dictionary['color_per_vertex'], fshaders_dictionary['color_per_vertex']);

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  // Create Vertex Object Buffers for the models
  let name, gpu_buffers;
  for (let j = 0; j < models.number_models; j += 1) {
    name = models[j].name;
    gpu_buffers = new ModelArraysGPU(gl, models[name], download.out);
    render_models[name] = new RenderColorPerVertex(gl, program, gpu_buffers, download.out);
  }

  let scene2 = new NormalMapScene2(id, download, vshaders_dictionary,
                                        fshaders_dictionary, models, self);

  // Set up callbacks for user and timer events
  let events = new NormalMapEvents(id, self, scene2);
};

