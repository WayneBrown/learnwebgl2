/**
 * camera_lookat_scene.js, By Wayne Brown, Fall 2017
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
 * @constructor
 */
window.CameraTruck2Scene = function (id, download, vshaders_dictionary,
                                      fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let out = download.out;
  let my_canvas;

  let gl = null;
  let program;
  let ray_program;
  let render_models = {};
  let up_ray;
  let ray_scale = 2;

  let P = new GlPoint3();
  let V = new GlVector3();

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let base = matrix.create();

  // Camera transform and parameters
  let camera_distance = 24;
  let ex = 0;
  let ey = 0;
  let ez = 10;
  self.angle_x = 0.0;
  self.angle_y = 0.0;

  // The scene camera is the camera we are using to get a specific view of
  // the scene. It is also used to render the right canvas window.
  self.scene_camera = new AxesCamera();
  P.set(self.scene_camera.eye, 0, 0, 5);

  let center_point_translate = matrix.create();
  let center_point_scale = matrix.create();
  matrix.scale(center_point_scale, 0.1, 0.1, 0.1);

  let axes_scale = matrix.create();
  matrix.scale(axes_scale, 2, 2, 2);

  // The "overview_camera" is the camera we are using in the left window to
  // view everything -- including the scene_camera.
  let overview_camera = matrix.create();
  let overview_camera_inverse = matrix.create();

  let projection = matrix.createPerspective(30.0, 1.0, 5.0, 100.0);

  let cube_model_names = ["textz", "texty", "textx", "cubey", "cubex", "cubez", "cube_center"];
  let camera_model_names = ["Camera_lens", "Camera", "Camera_body", "u_axis", "v_axis", "n_axis"];
  let axes_model_names = ["xaxis", "yaxis", "zaxis"];
  let gpu_buffers;

  let actual_rendering;  // Scene in secondary window.

  //-----------------------------------------------------------------------
  self.render = function () {
    let dist;

    // Calculate and set the overview_camera for the entire rendering
    ex = Math.sin(self.angle_x) * camera_distance;
    ez = Math.cos(self.angle_x) * camera_distance;
    ey = Math.sin(self.angle_y) * camera_distance;
    dist = Math.sqrt( ex*ex + ey*ey + ez*ez);
    ex = (ex / dist) * camera_distance;
    ey = (ey / dist) * camera_distance;
    ez = (ez / dist) * camera_distance;
    matrix.lookAt(overview_camera, ex, ey, ez, 0, 0, 0, 0, 1, 0);

    // Create the base transform which is built upon for all other transforms
    matrix.multiplySeries(base, projection, overview_camera);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render axes
    matrix.multiplySeries(transform, base, axes_scale);

    // Draw each global axes
    for (let j = 0; j < axes_model_names.length; j += 1) {
      render_models[axes_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render model
    matrix.copy(transform, base);

    // Draw each model
    for (let j = 0; j < cube_model_names.length; j += 1) {
      render_models[cube_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the up vector for the scene camera
    up_ray.set(self.scene_camera.eye[0], self.scene_camera.eye[1], self.scene_camera.eye[2],
               self.scene_camera.eye[0] + self.scene_camera.v[0]*ray_scale,
               self.scene_camera.eye[1] + self.scene_camera.v[1]*ray_scale,
               self.scene_camera.eye[2] + self.scene_camera.v[2]*ray_scale);
    up_ray.render(transform);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render scene camera model
    // Calculate the inverse of the scene camera to determine its location
    // in the scene
    self.scene_camera.updateTransform();
    matrix.copy(overview_camera_inverse, self.scene_camera.transform);

    matrix.transpose(overview_camera_inverse);
    overview_camera_inverse[3] = 0;
    overview_camera_inverse[7] = 0;
    overview_camera_inverse[11] = 0;
    overview_camera_inverse[12] = self.scene_camera.eye[0];
    overview_camera_inverse[13] = self.scene_camera.eye[1];
    overview_camera_inverse[14] = self.scene_camera.eye[2];

    matrix.multiplySeries(transform, base, overview_camera_inverse);

    // Draw the camera
    for (let j = 0; j < camera_model_names.length; j += 1) {
      render_models[camera_model_names[j]].render(transform);
    }

    // Render the other window that shows what the camera sees.
    actual_rendering.render();
  };

  //-----------------------------------------------------------------------
  self.delete = function () {
    let model_names;

    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);

    gl.deleteShader(ray_program.vShader);
    gl.deleteShader(ray_program.fShader);
    gl.deleteProgram(ray_program);

    // Delete each model's VOB
    model_names = Object.keys(render_models);
    for (let j = 0; j < model_names.length; j += 1) {
      render_models[model_names[j]].delete(gl);
    }
    up_ray.delete(gl);

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
  program = download.createProgram(gl, vshaders_dictionary["color_per_vertex"],
                                       fshaders_dictionary["color_per_vertex"]);
  ray_program = download.createProgram(gl, vshaders_dictionary["uniform_color"],
                                           fshaders_dictionary["uniform_color"]);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // Create Vertex Object Buffers for the models
  let name;
  for (let j = 0; j < models.number_models; j += 1) {
    name = models[j].name;
    gpu_buffers = new ModelArraysGPU(gl, models[name], out);
    render_models[name] = new RenderColorPerVertex(gl, program, gpu_buffers, out);
  }

  up_ray = new RayModel(gl, ray_program, 0, 0, 0, 1, 0, 0, [0,0,0,1]);

  // Set up callbacks for user and timer events
  let events;
  events = new CameraTruck2Events(id, self);

  // Create a scene for the secondary canvas window that displays what the
  // virtual camera "sees".
  actual_rendering = new CameraScene2(id, download, vshaders_dictionary,
                          fshaders_dictionary, models, self);
};

