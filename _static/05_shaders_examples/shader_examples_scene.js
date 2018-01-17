/**
 * shader_examples_scene.js, By Wayne Brown, Fall 2017
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
window.ShadersExamplesScene = function (id, download, vshaders_dictionary,
                                fshaders_dictionary, models) {

  let self = this;

  // Private variables
  let out = download.out;

  let gl = null;
  let uniform_program;
  let color_program;
  let lighting_program;

  // GPU Models
  let gpu_cube, gpu_sphere, gpu_dragon;

  // Rendering Models
  let cube1, cube2;
  let sphere1, sphere2;
  let dragon1, dragon2;
  let uniform_color = new Float32Array([1.0, 0.0, 0.0, 1.0]);

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let transform2 = matrix.create();
  let camera = matrix.create();
  let projection;
  let projection_camera = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();
  let rotation_matrix = matrix.create();
  let translate_matrix = matrix.create();
  let events = null;

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.animate_active = false;
  self.draw_edges = false;
  self.wireframe = false;
  self.show_axes = true;

  //-----------------------------------------------------------------------
  self.render = function () {

    // Build individual transforms
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);
    matrix.multiplySeries(rotation_matrix, rotate_x_matrix, rotate_y_matrix);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection_camera, rotate_x_matrix, rotate_y_matrix);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the cube 4 times using various shader programs
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Render the Cube model as a wireframe
    matrix.translate(translate_matrix, -2, 1, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    cube1.render(transform, uniform_color, true);

    // Render the Cube model using a uniform color
    matrix.translate(translate_matrix, -0.625, 1, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    cube1.render(transform, uniform_color);

    // Render the Cube model using one normal vector per face (flat shading)
    matrix.translate(translate_matrix, 0.625, 1, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    matrix.multiplySeries(transform2, camera, translate_matrix, rotation_matrix);
    cube2.render(transform, transform2, false);

    // Render the Cube model using one normal vector per vertex (smooth shading)
    matrix.translate(translate_matrix, 2, 1, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    matrix.multiplySeries(transform2, camera, translate_matrix, rotation_matrix);
    cube2.render(transform, transform2, true);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the sphere 4 times using various shader programs
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Render the Sphere model as a wireframe
    matrix.translate(translate_matrix, -2, 0, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    sphere1.render(transform, uniform_color, true);

    // Render the Sphere model using a uniform color
    matrix.translate(translate_matrix, -0.625, 0, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    sphere1.render(transform, uniform_color);

    // Render the Sphere model using one normal vector per face (flat shading)
    matrix.translate(translate_matrix, 0.625, 0, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    matrix.multiplySeries(transform2, camera, translate_matrix, rotation_matrix);
    sphere2.render(transform, transform2, false);

    // Render the Sphere model using one normal vector per vertex (smooth shading)
    matrix.translate(translate_matrix, 2, 0, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    matrix.multiplySeries(transform2, camera, translate_matrix, rotation_matrix);
    sphere2.render(transform, transform2, true);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Render the dragon 4 times using various shader programs
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Render the Dragon model as a wireframe
    matrix.translate(translate_matrix, -2, -1.75, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    dragon1.render(transform, uniform_color, true);

    // Render the Dragon model using a uniform color
    matrix.translate(translate_matrix, -0.625, -1.75, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    dragon1.render(transform, uniform_color);

    // Render the Dragon model using one normal vector per face (flat shading)
    matrix.translate(translate_matrix, 0.625, -1.75, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    matrix.multiplySeries(transform2, camera, translate_matrix, rotation_matrix);
    dragon2.render(transform, transform2, false);

    // Render the Dragon model using one normal vector per vertex (smooth shading)
    matrix.translate(translate_matrix, 2, -1.75, 0);
    matrix.multiplySeries(transform, projection_camera, translate_matrix, rotation_matrix);
    matrix.multiplySeries(transform2, camera, translate_matrix, rotation_matrix);
    dragon2.render(transform, transform2, true);
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(uniform_program.vShader);
    gl.deleteShader(uniform_program.fShader);
    gl.deleteProgram(uniform_program);

    gl.deleteShader(color_program.vShader);
    gl.deleteShader(color_program.fShader);
    gl.deleteProgram(color_program);

    gl.deleteShader(lighting_program.vShader);
    gl.deleteShader(lighting_program.fShader);
    gl.deleteProgram(lighting_program);

    // Delete each model's VOB
    cube1.delete(gl);
    sphere1.delete(gl);
    dragon1.delete(gl);

    // Remove all event handlers
    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  self.canvas = download.getCanvas(id + "_canvas");
  if (self.canvas) {
    gl = download.getWebglContext(self.canvas);
  }
  if (!gl) {
    return;
  }

  // Initialize the state of the gl context.
  gl.enable(gl.DEPTH_TEST);

  // Compile and create shader programs.
  uniform_program = download.createProgram(gl, vshaders_dictionary["uniform_color"],
                                               fshaders_dictionary["uniform_color"]);
  color_program = download.createProgram(gl, vshaders_dictionary["color_per_vertex"],
                                             fshaders_dictionary["color_per_vertex"]);
  lighting_program = download.createProgram(gl, vshaders_dictionary["lighting_per_vertex"],
                                                fshaders_dictionary["lighting_per_vertex"]);

  // Initialize transformation matrices that do not change.
  projection = matrix.createOrthographic(-2.75,2.75, -2.75,2.75, -10,10);
  matrix.lookAt(camera, 0, 0, 4, 0, 0, 0, 0, 1, 0);
  matrix.multiplySeries(projection_camera, projection, camera);

  // Copy the model data to the GPU
  gpu_cube = new ModelArraysGPU(gl, models.Cube, out);
  gpu_sphere = new ModelArraysGPU(gl, models.Sphere, out);
  gpu_dragon = new ModelArraysGPU(gl, models.Dragon, out);

  // Setup rendering
  cube1 = new RenderUniformColor(gl, uniform_program, gpu_cube, out);
  cube2 = new RenderLightingPerVertex(gl, lighting_program, gpu_cube, out);
  sphere1 = new RenderUniformColor(gl, uniform_program, gpu_sphere, out);
  sphere2 = new RenderLightingPerVertex(gl, lighting_program, gpu_sphere, out);
  dragon1 = new RenderUniformColor(gl, uniform_program, gpu_dragon, out);
  dragon2 = new RenderLightingPerVertex(gl, lighting_program, gpu_dragon, out);

  // Set up callbacks for user and timer events
  events = new ShadersExamplesEvents(id, self);
  events.animate();
};

