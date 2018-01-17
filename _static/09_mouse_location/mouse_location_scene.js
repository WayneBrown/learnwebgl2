/**
 * create_frustum_scene.js, By Wayne Brown, Fall 2017
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
window.MouseLocationScene = function (id, download, vshaders_dictionary,
                                   fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let my_canvas;
  let out = download.out;

  let gl = null;
  let program = null;
  let uniform_program = null;
  let render_models;
  let model_gpu;
  let camera_models;
  let frustum_model;
  let sphere_model;
  let ray_model;

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let view_Rx = matrix.create();
  let view_Ry = matrix.create();
  self.translate = matrix.create();
  matrix.translate(self.translate, -2, -2, -4);
  let base = matrix.create();
  let axes_scale = matrix.create();
  matrix.scale(axes_scale, 3, 3, 3);
  let sphere_scale = matrix.create();
  matrix.scale(sphere_scale, 0.3, 0.3, 0.3);
  let sphere_translate = matrix.create();

  // self.camera is the camera for the scene
  self.camera = matrix.create();
  matrix.lookAt(self.camera, 0, 0, 5, 0, 0, 0, 0, 1, 0);

  // backaway_camera is the camera that sees the entire environment.
  let backaway_camera = matrix.create();
  let camera_distance = 10;
  self.perspective = null;

  let backaway_orth = matrix.createOrthographic(-12, 12, -12, 12, -40, 40);

  let view_volume_scale = matrix.create();
  let view_volume_translate = matrix.create();

  matrix.setIdentity(view_Rx);
  matrix.setIdentity(view_Ry);

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 20.0 * 0.017453292519943295;
  self.angle_y = 10.0 * 0.017453292519943295;
  self.left = -2.0;
  self.right = 2.0;
  self.bottom = -2.0;
  self.top = 2.0;
  self.near = 3.0;
  self.far = 10.0;
  self.change_canvas_size = false;
  self.mouse_x = -999.0;
  self.mouse_y = -999.0;

  let model_names = ["textz","texty","textx","cubey","cubex","cubez","cube_center"];
  let camera_model_names = ["u_axis", "v_axis", "n_axis"];

  //-----------------------------------------------------------------------
  self.render = function () {
    let ex, ey, ez, dist;

    gl.clear(gl.COLOR_BUFFER_BIT);

   // Calculate and set the camera for the entire rendering
    ex = Math.sin(self.angle_x) * camera_distance;
    ez = Math.cos(self.angle_x) * camera_distance;
    ey = Math.sin(self.angle_y) * camera_distance;
    dist = Math.sqrt(ex * ex + ey * ey + ez * ez);
    ex = (ex / dist) * camera_distance;
    ey = (ey / dist) * camera_distance;
    ez = (ez / dist) * camera_distance;
    matrix.lookAt(backaway_camera, ex, ey, ez, 0, 0, 0, 0, 1, 0);

    // Create the base transform which is built upon for all other transforms
    matrix.multiplySeries(base, backaway_orth, backaway_camera);

    // Draw an outline of the orthographic volume
    frustum_model.updateFrustum(self.left, self.right, self.bottom, self.top, self.near, self.far);
    frustum_model.render(base);

    // Create the base transform which is built upon for all other transforms
    matrix.multiplySeries(base, backaway_orth, backaway_camera, axes_scale);

    // Draw the camera at the origin.
    for (let j=0; j<camera_models.length; j +=1 ) {
      camera_models[j].render(base);
    }

    // Draw the location of the mouse in the viewing window
    matrix.translate(sphere_translate, self.mouse_x, self.mouse_y, -self.near);
    matrix.multiplySeries(base, backaway_orth, backaway_camera,
                             sphere_translate, sphere_scale);
    sphere_model.render(base);

    // Draw a ray through the frustum that represents the mouse location.
    matrix.multiplySeries(base, backaway_orth, backaway_camera);
    let t = -self.far / -self.near;
    ray_model.set(self.mouse_x, self.mouse_y, -self.near,
                  self.mouse_x * t, self.mouse_y * t, -self.far);
    ray_model.render(base);

    matrix.multiplySeries(base, backaway_orth, backaway_camera, self.camera);

    // Draw each model
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].render(base);
    }

    // Translate the position of the second rendering of the model
    matrix.multiplySeries(transform, base, self.translate);

    // Draw each model
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].render(transform);
    }

    self.perspective = matrix.createFrustum(self.left, self.right,
                                            self.bottom, self.top,
                                            self.near, self.far);

    // Render the right canvas to show what the scene looks like with
    // this orthographic projection.
    right_canvas.render();
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
    sphere_model.delete(gl);
    frustum_model.delete(gl);
    ray_model.delete(gl);

    // Remove all event handlers
    events.removeAllEventHandlers();
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
  uniform_program = download.createProgram(gl, vshaders_dictionary["uniform_color"], fshaders_dictionary["uniform_color"]);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  // Create Vertex Object Buffers for the models
  render_models = new Array(model_names.length);
  for (let j = 0; j < model_names.length; j += 1) {
    model_gpu = new ModelArraysGPU(gl, models[model_names[j]], out);
    render_models[j] = new RenderColorPerVertex(gl, program, model_gpu, out);
  }

  // model_gpu = new ModelArraysGPU(gl, models[ortho_model_name], out);
  // ortho_model = new RenderColorPerVertex(gl, program, model_gpu, out);

  camera_models = new Array(camera_model_names.length);
  for (let j = 0; j<camera_model_names.length; j += 1) {
    model_gpu = new ModelArraysGPU(gl, models[camera_model_names[j]], out);
    camera_models[j] = new RenderColorPerVertex(gl, program, model_gpu, out);
  }

  model_gpu = new ModelArraysGPU(gl, models['Sphere'], out);
  sphere_model = new RenderColorPerVertex(gl, program, model_gpu, out);

  frustum_model = new FrustumModel2(gl, uniform_program, [0.5,0.5,0.5,1]);

  ray_model = new RayModel(gl, uniform_program, 0, 0, 0, 0, 0, 0, [1.0,0.55,0.0,1.0]);  // orange

  let right_canvas = new FrustumScene(id, download, vshaders_dictionary,
                                          fshaders_dictionary, models, self);

  // Set up callbacks for user and timer events
  let events = new MouseLocationEvents(id, self);
};

