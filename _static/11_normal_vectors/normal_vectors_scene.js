/**
 * normal_vectors_scene.js, By Wayne Brown, Fall 2017
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
window.NormalVectorsScene = function (id, download, vshaders_dictionary,
                                    fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let canvas_id = download.canvas_id;
  let my_canvas = null;

  let gl = null;
  let uniform_color_program;
  let lighting_program;
  let render_models = {};
  let render_normals = {};

  let matrix = new GlMatrix4x4();

  self.active_model = "cube1";

  self.angle_x =  30.0;
  self.angle_y = -45.0;

  let rotate_x = matrix.create();
  let rotate_y = matrix.create();

  // The demo_camera is the camera we are using in the left window to
  // view everything -- including the scene_camera.
  self.model = matrix.create();
  self.camera = matrix.create();
  self.projection = matrix.createPerspective(30.0, 1.0, 0.5, 100.0);
  self.to_camera_space = matrix.create();
  self.to_clipping_space = matrix.create();

  let cube_model_names = ["textz", "texty", "textx", "cubey", "cubex", "cubez", "cube_center"];

  // Light model
  let P4 = new GlPoint4();
  self.light_position = P4.create(3,0,5,1);
  self.light_in_camera_space = P4.create();
  self.light_color = P4.create(1,1,1,1);
  self.ambient_intensities = P4.create(0.3, 0.3, 0.3, 1);

  self.display_normals = false;
  self.display_wireframe = false;

  //-----------------------------------------------------------------------
  self.render = function () {
    let dist;

    gl.useProgram(lighting_program);

    // Clear the entire canvas window background with the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calculate and set the camera for the entire rendering
    matrix.rotate(rotate_x, self.angle_x, 1,0,0);
    matrix.rotate(rotate_y, self.angle_y, 0,1,0);
    matrix.multiplySeries(self.model, rotate_x, rotate_y);

    // Create the scene transforms
    matrix.multiply(self.to_camera_space, self.camera, self.model);
    matrix.multiplySeries(self.to_clipping_space, self.projection, self.to_camera_space);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Calculate the position of the light in camera space.
    matrix.multiplyP4(self.light_in_camera_space, self.camera, self.light_position);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Set the location of the light source
    // Transform the light position by the camera
    gl.uniform3f(lighting_program.u_Light_position, self.light_in_camera_space[0],
                                                    self.light_in_camera_space[1],
                                                    self.light_in_camera_space[2]);

    gl.uniform3f(lighting_program.u_Light_color, self.light_color[0],
                                                 self.light_color[1],
                                                 self.light_color[2]);

    gl.uniform3f(lighting_program.u_Ambient_intensities, self.ambient_intensities[0],
                                                         self.ambient_intensities[1],
                                                         self.ambient_intensities[2]);

    render_models[self.active_model].render(self.to_clipping_space, self.to_camera_space, self.display_wireframe);

    if (self.display_normals) {
      render_normals[self.active_model].render(self.to_clipping_space);
    }
  };

  //-----------------------------------------------------------------------
  self.delete = function () {
    let j, model_names;

    // Clean up shader programs
    gl.deleteShader(uniform_color_program.vShader);
    gl.deleteShader(uniform_color_program.fShader);
    gl.deleteProgram(uniform_color_program);
    gl.deleteShader(lighting_program.vShader);
    gl.deleteShader(lighting_program.fShader);
    gl.deleteProgram(lighting_program);

    // Delete each model's VOB
    model_names = Object.keys(render_models);
    for (j = 0; j < model_names.length; j += 1) {
      render_models[model_names[j]].delete(gl);
    }

    // Remove all event handlers
    let id = '#' + canvas_id;
    $( id ).unbind( "mousedown", events.mouse_drag_started );
    $( id ).unbind( "mouseup", events.mouse_drag_ended );
    $( id ).unbind( "mousemove", events.mouse_dragged );
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
  uniform_color_program = download.createProgram(gl, vshaders_dictionary['uniform_color'], fshaders_dictionary['uniform_color']);
  lighting_program = download.createProgram(gl, vshaders_dictionary['lighting'], fshaders_dictionary['lighting']);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  matrix.lookAt(self.camera, 0, 0, 7, 0, 0, 0, 0, 1, 0);

  // Create Vertex Object Buffers for the models
  let name, gpu_buffers;
  for (let j = 0; j < models.number_models; j += 1) {
    name = models[j].name;
    gpu_buffers = new ModelArraysGPU(gl, models[name], download.out);
    render_models[name] = new RenderLighting(gl, lighting_program, gpu_buffers, download.out);
    render_normals[name] = new RenderNormals(gl, uniform_color_program, models[name], download.out, [1,0,0,1]);
  }

  // Set up callbacks for user and timer events
  let events = new NormalVectorsEvents(id, self);
};

