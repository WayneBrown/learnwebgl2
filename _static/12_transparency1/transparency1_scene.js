/**
 * transparency1_scene.js, By Wayne Brown, Spring 2018
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
window.Transparency1Scene = function (id, download, vshaders_dictionary,
                               fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let out = download.out;

  let gl = null;
  let visible_program = null;
  let cube = null;
  let gpuModel;

  let number_opaque_cubes = 10;
  let opaque_cubes = new Array(number_opaque_cubes);

  let number_transparent_cubes = 10;
  let transparent_cubes = new Array(number_transparent_cubes);

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let camera_model_transform = matrix.create();
  let projection = matrix.createPerspective(45.0, 1.0, 0.1, 100.0);
  let camera = matrix.create();
  let scale_matrix = matrix.create();
  let translate_matrix = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();
  let to_camera_space = matrix.create();
  let cube_rotate_x = matrix.create();
  let cube_rotate_y = matrix.create();

  // Public variables that will possibly be used or changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.animate_active = true;

  // Light model
  let P4 = new GlPoint4();
  let V = new GlVector3();
  self.light_position = P4.create(10, 10, 10, 1);
  self.light_color = V.create(1, 1, 1); // white light
  self.shininess = 30;
  self.ambient_color = V.create(0.2, 0.2, 0.2); // low level white light

  // Temporary variable for calculating the distance of models from the camera.
  let result = P4.create();

  /** ---------------------------------------------------------------------
   * Update the distance from each transparent cube to the camera.
   * NOTE: IMPORTANT!
   * Since rotation and scaling do not affect the center point,
   * these properties are not included in the transformations. If
   * a point other than the center point of a model is used, make
   * sure all necessary transformations are included.
   * @private
   */
  function _calculateDistanceFromCamera () {
    let position;

    for (let j = 0; j < number_transparent_cubes; j += 1) {
      position = transparent_cubes[j].position;

      // Create the needed transformation matrices.
      matrix.translate(translate_matrix, position[0], position[1], position[2]);

      // Create a single transformation that includes all model and camera transforms.
      matrix.multiplySeries(camera_model_transform, to_camera_space, translate_matrix);

      // Transform the center point of the cube into camera space.
      matrix.multiplyP4(result, camera_model_transform, position);

      // The z component represents the distance to the camera.
      transparent_cubes[j].z = result[2];  // z-component
    }
  }

  /** ---------------------------------------------------------------------
   * Update the distance from each transparent cube to the camera. This
   * uses the center of the cube for the distance, which causes problems
   * if two transparent cubes overlap in 3D space.
   * @private
   */
  function _sortTransparentModels () {

    // Update the distance of each model from the camera.
    _calculateDistanceFromCamera();

    // Do an insertion sort on the list of cube properties.
    let k, temp;

    for (let j = 0; j < number_transparent_cubes; j += 1) {
      temp = transparent_cubes[j];
      k = j - 1;
      while (k >= 0 && transparent_cubes[k].z > temp.z) {
        transparent_cubes[k + 1] = transparent_cubes[k];
        k -= 1;
      }
      transparent_cubes[k + 1] = temp;
    }

    // Debugging
    //for (let j = 0; j < number_transparent_cubes; j += 1) {
    //  console.log("cube[", j, "] = ", transparent_cubes[j].z);
    //}
  }

  //-----------------------------------------------------------------------
  function _renderOpaqueModels () {
    let size, position, color;

    // Draw a set of cubes with different locations, sizes, and colors.
    for (let j = 0; j < number_opaque_cubes; j += 1) {
      size     = opaque_cubes[j].size;
      position = opaque_cubes[j].position;
      color    = opaque_cubes[j].color;

      matrix.scale(scale_matrix, size, size, size);
      matrix.translate(translate_matrix, position[0], position[1], position[2]);
      matrix.rotate(cube_rotate_x, opaque_cubes[j].x_angle, 1.0, 0.0, 0.0);
      matrix.rotate(cube_rotate_y, opaque_cubes[j].y_angle, 0.0, 1.0, 0.0);

      // Combine the transforms into a single transformation
      matrix.multiplySeries(camera_model_transform, to_camera_space,
        translate_matrix, scale_matrix, cube_rotate_y, cube_rotate_x);
      matrix.multiplySeries(transform, projection, camera_model_transform);

      cube.render(transform, camera_model_transform, color, false);
    }
  }

  //-----------------------------------------------------------------------
  function _renderTransparentModels () {
    let size, position, color;

    // Draw a set of cubes with different locations, sizes, and colors.
    for (let j = 0; j < number_transparent_cubes; j += 1) {
      size     = transparent_cubes[j].size;
      position = transparent_cubes[j].position;
      color    = transparent_cubes[j].color;

      matrix.scale(scale_matrix, size, size, size);
      matrix.translate(translate_matrix, position[0], position[1], position[2]);
      matrix.rotate(cube_rotate_x, transparent_cubes[j].x_angle, 1.0, 0.0, 0.0);
      matrix.rotate(cube_rotate_y, transparent_cubes[j].y_angle, 0.0, 1.0, 0.0);

      // Combine the transforms into a single transformation
      matrix.multiplySeries(camera_model_transform, to_camera_space,
        translate_matrix, scale_matrix, cube_rotate_y, cube_rotate_x);
      matrix.multiplySeries(transform, projection, camera_model_transform);

      cube.render(transform, camera_model_transform, color, true);
    }
  }

  //-----------------------------------------------------------------------
  self.render = function () {

    // Set up common transformations for the entire scene.
    matrix.rotate(rotate_x_matrix, self.angle_x, 1.0, 0.0, 0.0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0.0, 1.0, 0.0);
    matrix.multiplySeries(to_camera_space, camera, rotate_x_matrix, rotate_y_matrix);

    // Clear the entire canvas window background with the clear color.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Disable blending and render the opaque models.
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    _renderOpaqueModels();

    // Enable blending to render the transparent models
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Disable updates to the depth buffer
    gl.depthMask(false);

    // Render the transparent models back to front
    _sortTransparentModels();
    _renderTransparentModels();
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(visible_program.vShader);
    gl.deleteShader(visible_program.fShader);
    gl.deleteProgram(visible_program);

    // Delete each model's VOB
    cube.delete(gl);

    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  /**----------------------------------------------------------------------
   * Create random positions, colors, rotations, and sizes for a group of cubes.
   * @param number {number} the number of cube properties to create.
   * @param list {array} the list to put the properties in.
   * @param transparent {boolean} are the cubes transparent?
   * @private
   */
  function _createRandomCubes(number, list, transparent = false) {
    let position_x, position_y, position_z, alpha;

    for (let j = 0; j < number; j += 1) {
      position_x = Math.random() * 10 - 5.0;
      position_y = Math.random() * 10 - 5.0;
      position_z = Math.random() * 10 - 5.0;

      if (transparent) { alpha = Math.random(); }
      else             { alpha = 1.0; }

      list[j] = { position: P4.create(position_x, position_y, position_z, 1.0),
                  size:     Math.random() + 0.2,
                  color:    new Float32Array([0.0, Math.random(), Math.random(), alpha]),
                  x_angle:  Math.random() * 180.0 - 90.0,
                  y_angle:  Math.random() * 360.0,
                  z:        0.0
                };
    }
  }

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

  self.animate_active = $('#' + id + '_animate').prop('checked');

  // Set up the rendering programs
  visible_program = download.createProgram(gl, vshaders_dictionary["uniform_color_with_lighting"],
                                               fshaders_dictionary["uniform_color_with_lighting"]);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  matrix.lookAt(camera, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Create Vertex Object Buffers for the models
  gpuModel = new ModelArraysGPU(gl, models["cube2"], out);
  cube = new RenderUniformTransparency(gl, visible_program, gpuModel, download.out);

  // Create a set of random positions, colors, and sizes for a group of cubes.
  _createRandomCubes(number_opaque_cubes, opaque_cubes, false);
  _createRandomCubes(number_transparent_cubes, transparent_cubes, true);

  // Set up callbacks for user and timer events
  let events;
  events = new Transparency1Events(id, self);
  if (self.animate_active) events.animate();

  //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // The light source is static, so set it once.
  gl.useProgram(visible_program);
  gl.uniform3f(visible_program.u_Light_position,
    self.light_position[0],
    self.light_position[1],
    self.light_position[2]);
  gl.uniform3fv(visible_program.u_Light_color, self.light_color);
  gl.uniform3fv(visible_program.u_Ambient_color, self.ambient_color);
  gl.uniform1f(visible_program.u_Shininess, self.shininess);
};

