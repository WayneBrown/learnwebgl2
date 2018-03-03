/**
 * shadows_scene.js, By Wayne Brown, Spring 2018
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
window.ShadowsScene = function (id, download, vshaders_dictionary,
                                    fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let my_canvas;
  self.canvas_size = { 'width' : 300, 'height' : 300};
  self.shadow_map_size = { 'width' : 256, 'height' : 256}; // power of 2

  let P3 = new GlPoint3();
  let V = new GlVector3();

  let gl = null;
  let program;
  let uniform_program;
  let ray_program;
  let render_models = {};
  let camera_projection;

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let base = matrix.create();

  let translate = matrix.create();
  matrix.translate(translate, -1, -2, -2.0);

  // Camera transform and parameters
  let camera_transform = matrix.create();
  self.angle_x = 0.0;
  self.angle_y = 0.0;

  // Camera and projection for the left canvas
  let backoff_camera = matrix.create();
  matrix.lookAt(backoff_camera, 0, 0, 8, 0, 0, 0, 0, 1, 0);
  let backoff_projection = matrix.createPerspective(45.0, 1.0, 1.0, 50.0);
  let center_point_translate = matrix.create();
  let center_point_scale = matrix.create();
  matrix.scale(center_point_scale, 0.1, 0.1, 0.1);

  let axes_scale = matrix.create();
  matrix.scale(axes_scale, 2, 2, 2);
  let rotate_x = matrix.create();
  let rotate_y = matrix.create();
  self.translate2 = matrix.create();
  matrix.translate(self.translate2, -4, 0, -4);
  self.model_angle_x = 0;
  self.model_angle_y = 0;
  let model_rotate_x = matrix.create();
  let model_rotate_y = matrix.create();
  let model_transform = matrix.create();

  // Camera and projection for the right canvas
  self.camera_data = { 'eye'    : P3.create(0,0,5),
                       'center' : P3.create(0,0,0),
                       'up'     : V.create(0,1,0) };
  self.projection_data = new ProjectionData();

  self.camera = matrix.create();
  self.projection = matrix.create();
  self.clipping_space = matrix.create();

  let cube_model_names = ["textz", "texty", "textx", "cubey", "cubex", "cubez", "cube_center"];
  let camera_model_names = ["Camera_lens", "Camera", "Camera_body", "u_axis", "v_axis", "n_axis"];
  let axes_model_names = ["xaxis", "yaxis", "zaxis"];

  let black = [0,0,0,1];

  let P4 = new GlPoint4();

  // Individual lights
  let light0 = {
    'position'   : P4.create(3, 0, 5, 1),
    'color'      : P4.create(1, 1, 1, 1),
    'in_camera_space' : P4.create(0, 0, 0, 1), // calculates at render time
    'is_on'      : true,
    'framebuffer': null,
    'camera_data': { 'eye': P3.create(0,0,0), 'center': P3.create(0,0,0), 'up': V.create(0,0,0) },
    'shadow_map' : null,  // {texture object}
    'camera'     : matrix.create(),
    'projection' : matrix.create(),
    'projection_data' : new ProjectionData(),
    'transform'  : matrix.create(),
    'render'     : null,
    'size'       : { 'width' : 300, 'height' : 300}
  };
  let light1 = {
    'position' : P4.create(-3, 0, 5, 1),
    'color'    : P4.create(1, 1, 1, 1),
    'in_camera_space' : P4.create(0, 0, 0, 1), // calculates at render time
    'is_on'      : false,
    'framebuffer': null,
    'shadow_map' : null,  // {texture object}
    'camera_data': { 'eye': P3.create(0,0,0), 'center': P3.create(0,0,0), 'up': V.create(0,0,0) },
    'camera'     : matrix.create(),
    'projection' : matrix.create(),
    'projection_data' : new ProjectionData(),
    'transform'  : matrix.create(),
    'render'     : null,
    'size'       : { 'width' : 300, 'height' : 300}
  };

  // Light model
  self.lights = {
    'number' : 2,
    '0'      : light0,
    '1'      : light1,
    'ambient': P4.create(0.3, 0.3, 0.3, 1),
    'c1'     : 0.1,  // attenuation constant
    'c2'     : 0.0   // attenuation constant
  };

  self.light_in_camera_space = P4.create();

  self.shininess = 30.0;

  // To render the light position
  let light_position_translate = matrix.create();
  let light_position_scale = matrix.create();
  matrix.scale(light_position_scale, 0.2, 0.2, 0.2);

  // To render the shadow map textures -- for debugging
  self.render_shadow_map = false;
  self.render_shadow_map_num = 0;

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

    camera_projection.updateVertices(self.camera_data, self.projection_data);
    camera_projection.render(base, black);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render axes
    matrix.multiplySeries(transform, base, axes_scale);

    // Draw each global axes
    for (let j = 0; j < axes_model_names.length; j += 1) {
      render_models[axes_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render model
    matrix.rotate(model_rotate_x, self.model_angle_x, 1, 0, 0);
    matrix.rotate(model_rotate_y, self.model_angle_y, 0, 1, 0);
    matrix.multiplySeries(model_transform, base, model_rotate_y, model_rotate_x);

    for (let j = 0; j < cube_model_names.length; j += 1) {
      render_models[cube_model_names[j]].render(model_transform);
    }

    matrix.multiplySeries(model_transform, base, self.translate2, model_rotate_y, model_rotate_x);
    for (let j = 0; j < cube_model_names.length; j += 1) {
      render_models[cube_model_names[j]].render(model_transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the "center point" of the virtual camera as a small sphere
    matrix.translate(center_point_translate, self.camera_data.center[0],
                                             self.camera_data.center[1],
                                             self.camera_data.center[2]);
    matrix.multiplySeries(transform, base, center_point_translate, center_point_scale);
    render_models['Sphere'].render(transform);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render virtual camera
    // Calculate the virtual camera transform
    self.projection_data.getTransform(self.projection);
    matrix.lookAt(self.camera, self.camera_data.eye[0],
                               self.camera_data.eye[1],
                               self.camera_data.eye[2],
                               self.camera_data.center[0],
                               self.camera_data.center[1],
                               self.camera_data.center[2],
                               self.camera_data.up[0],
                               self.camera_data.up[1],
                               self.camera_data.up[2]);
    matrix.copy(camera_transform, self.camera);
    matrix.transpose(camera_transform);
    //matrix.print("transposed", camera_transform);
    camera_transform[3] = 0;
    camera_transform[7] = 0;
    camera_transform[11] = 0;
    camera_transform[12] = self.camera_data.eye[0];
    camera_transform[13] = self.camera_data.eye[1];
    camera_transform[14] = self.camera_data.eye[2];

    matrix.multiplySeries(transform, base, camera_transform);

    // Draw the camera
    for (let j = 0; j < camera_model_names.length; j += 1) {
      render_models[camera_model_names[j]].render(transform);
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the location of the lights in the scene
    for (let j=0; j<self.lights.number; j += 1) {
      matrix.multiplyP4(self.lights[j].in_camera_space, self.camera,
                        self.lights[j].position);

      //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Render the position of the light source
      matrix.translate(light_position_translate, self.lights[j].position[0],
                                                 self.lights[j].position[1],
                                                 self.lights[j].position[2]);
      matrix.multiplySeries(transform, base, light_position_translate, light_position_scale);
      render_models['Sphere'].render(transform);

      P3.copy(self.lights[j].camera_data.eye, self.lights[j].position);
      P3.copy(self.lights[j].camera_data.center, self.camera_data.center);
      P3.copy(self.lights[j].camera_data.up, self.camera_data.up);

      if (self.lights[j].is_on) {
        self.lights[j].render.updateVertices(self.lights[j].camera_data, self.lights[j].projection_data);
        self.lights[j].render.render(base, black);
      }
    }


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

    gl.deleteShader(uniform_program.vShader);
    gl.deleteShader(uniform_program.fShader);
    gl.deleteProgram(uniform_program);

    // Delete each model's VOB
    model_names = Object.keys(render_models);
    for (let j = 0; j < model_names.length; j += 1) {
      render_models[model_names[j]].delete(gl);
    }

    events.removeAllEventHandlers();
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  my_canvas = download.getCanvas(id + "_canvas");  // by convention
  if (my_canvas) {
    gl = download.getWebglContext(my_canvas);
    self.canvas_size.width = my_canvas.width;
    self.canvas_size.height = my_canvas.height;
  }
  if (!gl) {
    return;
  }

  // Set up the rendering program and set the state of webgl
  program = download.createProgram(gl, vshaders_dictionary['color_per_vertex'], fshaders_dictionary['color_per_vertex']);
  uniform_program = download.createProgram(gl, vshaders_dictionary['uniform_color'], fshaders_dictionary['uniform_color']);

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

  camera_projection = new RenderProjection(gl, uniform_program, download.out);
  self.lights[0].render = new RenderProjection(gl, uniform_program, download.out);
  self.lights[1].render = new RenderProjection(gl, uniform_program, download.out);

  let scene2 = new ShadowsScene2(id, download, vshaders_dictionary,
                                        fshaders_dictionary, models, self);

  // Set up callbacks for user and timer events
  let events = new ShadowsEvents(id, self, scene2);
};

