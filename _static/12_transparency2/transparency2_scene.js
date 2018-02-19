/**
 * transparency2_scene.js, By Wayne Brown, Spring 2018
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
window.Transparency2Scene = function (id, download, vshaders_dictionary,
                               fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let out = download.out;

  // Render objects
  let LOW_RES_3_CUBES         = 0;
  let MED_RES_3_CUBES         = 1;
  let HIGH_RES_3_CUBES        = 2;
  let LOW_RES_COMBINED_CUBES  = 3;
  let MED_RES_COMBINED_CUBES  = 4;
  let HIGH_RES_COMBINED_CUBES = 5;

  // Rendering modes:
  let RENDER_TRANSPARENT = 0;
  let RENDER_SOLID       = 1;
  let RENDER_WIREFRAME   = 2;
  self.render_mode = RENDER_TRANSPARENT;

  let gl = null;
  let wireframe_program = null;
  let lighting_program = null;
  let uniform_color_program = null;

  let cube = null;
  let cube2_gpuModel;
  let cube6_gpuModel;
  let cube7_gpuModel;
  let cube2_gpuModel_combined;
  let cube6_gpuModel_combined;
  let cube7_gpuModel_combined;

  let number_cubes = 3;
  let cube_properties = new Array(number_cubes);

  let number_render_modes = 3;
  let low_res_cube  = new Array(number_render_modes);
  let med_res_cube  = new Array(number_render_modes);
  let high_res_cube = new Array(number_render_modes);
  let low_res_combined_cube  = new Array(number_render_modes);
  let med_res_combined_cube  = new Array(number_render_modes);
  let high_res_combined_cube = new Array(number_render_modes);

  let active_model = low_res_cube;
  let render_multiple_models = true;

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

  self.transparent = true;

  // Temporary variable for calculating the distance of models from the camera.
  let result = P4.create();
  let black = P4.create(0.0, 0.0, 0.0, 1.0);

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

    for (let j = 0; j < number_cubes; j += 1) {
      position = cube_properties[j].position;

      // Create the needed transformation matrices.
      matrix.translate(translate_matrix, position[0], position[1], position[2]);

      // Create a single transformation that includes all model and camera transforms.
      matrix.multiplySeries(camera_model_transform, to_camera_space, translate_matrix);

      // Transform the center point of the cube into camera space.
      matrix.multiplyP4(result, camera_model_transform, position);

      // The z component represents the distance to the camera.
      cube_properties[j].z = result[2];  // z-component
    }
  }

  /** ---------------------------------------------------------------------
   * Update the distance from each transparent cube to the camera. This
   * uses the center of the cube for the distance, which causes problems
   * if two transparent cubes overlap in 3D space.
   * @private
   */
  function _sortModels () {

    // Update the distance of each model from the camera.
    _calculateDistanceFromCamera();

    // Do an insertion sort on the list of cube properties.
    let k, temp;

    for (let j = 0; j < number_cubes; j += 1) {
      temp = cube_properties[j];
      k = j - 1;
      while (k >= 0 && cube_properties[k].z > temp.z) {
        cube_properties[k + 1] = cube_properties[k];
        k -= 1;
      }
      cube_properties[k + 1] = temp;
    }

    // Debugging
    //for (let j = 0; j < number_cubes; j += 1) {
    //  console.log("cube[", j, "] = ", cube_properties[j].z);
    //}
  }

  //
  /**----------------------------------------------------------------------
   * Render a single model.
   * @param transform {Float32Array} 4x4 matrix; to clipping space
   * @param camera_model_transform {Float32Array} 4x4 matrix; to camera space
   * @param color {Float32Array} RGBA color
   * @private
   */
  function _renderModel (transform, camera_model_transform, color = null) {
    if (self.render_mode === RENDER_WIREFRAME) {
      active_model[RENDER_WIREFRAME].render(transform, black);

    } else if (self.render_mode === RENDER_SOLID) {
      if (color === null) {
        active_model[RENDER_SOLID].render(transform, camera_model_transform);
      } else {
        active_model[RENDER_SOLID].render(transform, camera_model_transform, color);
      }

    } else { // self.render_mode === RENDER_TRANSPARENT
      if (color === null) {
        active_model[RENDER_TRANSPARENT].render(transform, camera_model_transform);
      } else {
        active_model[RENDER_TRANSPARENT].render(transform, camera_model_transform, color);
      }
    }
  }

  //-----------------------------------------------------------------------
  function _renderModels () {
    let size, position, color;

    if (render_multiple_models) {
      // Draw a collection of cubes with different locations, sizes, and colors.
      for (let j = 0; j < number_cubes; j += 1) {
        size     = cube_properties[j].size;
        position = cube_properties[j].position;
        if (self.render_mode === RENDER_SOLID) color = cube_properties[j].solid_color;
        else                                   color = cube_properties[j].color;

        matrix.scale(scale_matrix, size, size, size);
        matrix.translate(translate_matrix, position[0], position[1], position[2]);
        matrix.rotate(cube_rotate_x, cube_properties[j].x_angle, 1.0, 0.0, 0.0);
        matrix.rotate(cube_rotate_y, cube_properties[j].y_angle, 0.0, 1.0, 0.0);

        // Combine the transforms into a single transformation
        matrix.multiplySeries(camera_model_transform, to_camera_space,
          translate_matrix, scale_matrix, cube_rotate_y, cube_rotate_x);
        matrix.multiplySeries(transform, projection, camera_model_transform);

        _renderModel (transform, camera_model_transform, color);
      }
    } else {
      // Render the single model
      matrix.multiplySeries(transform, projection, to_camera_space);

      _renderModel (transform, to_camera_space);
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

    if (self.render_mode === RENDER_SOLID || self.render_mode === RENDER_WIREFRAME) {

      gl.disable(gl.BLEND);
      gl.depthMask(true);
      _renderModels();

    } else { // self.render_mode === RENDER_TRANSPARENT

      // Enable blending to render the transparent models
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Disable updates to the depth buffer
      gl.depthMask(false);

      // Render the transparent models back to front
      _sortModels();
      _renderModels();
    }

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
   * @private
   */
  function _createCubeProperties() {
    let green, blue;

    green = Math.random();
    blue = Math.random();
    cube_properties[0] = {
      position:    P4.create(-2.0, 0.0, 0.75, 1.0),
      size:        4.0,
      color:       new Float32Array([0.0, green, blue, 0.5]),
      solid_color: new Float32Array([0.0, green, blue, 1.0]),
      x_angle:     Math.random() * 180.0 - 90.0,
      y_angle:     Math.random() * 360.0,
      z:           0.0,
      matrix:      null
    };

    green = Math.random();
    blue = Math.random();
    cube_properties[1] = {
      position:    P4.create(2.5, 0.0, 1.5, 1.0),
      size:        3.0,
      color:       new Float32Array([0.0, green, blue, 0.5]),
      solid_color: new Float32Array([0.0, green, blue, 1.0]),
      x_angle:     Math.random() * 180.0 - 90.0,
      y_angle:     Math.random() * 360.0,
      z:           0.0,
      matrix:      null
    };

    green = Math.random();
    blue = Math.random();
    cube_properties[2] = {
      position:    P4.create(0.0, 0.0, -3.0, 1.0),
      size:        3.5,
      color:       new Float32Array([0.0, green, blue, 0.5]),
      solid_color: new Float32Array([0.0, green, blue, 1.0]),
      x_angle:     Math.random() * 180.0 - 90.0,
      y_angle:     Math.random() * 360.0,
      z:           0.0,
      matrix:      null
    };

    let size, position, transformation;

    // Draw a set of cubes with different locations, sizes, and colors.
    for (let j = 0; j < cube_properties.length; j += 1) {
      size     = cube_properties[j].size;
      position = cube_properties[j].position;

      matrix.scale(scale_matrix, size, size, size);
      matrix.translate(translate_matrix, position[0], position[1], position[2]);
      matrix.rotate(cube_rotate_x, cube_properties[j].x_angle, 1.0, 0.0, 0.0);
      matrix.rotate(cube_rotate_y, cube_properties[j].y_angle, 0.0, 1.0, 0.0);

      // Combine the transforms into a single transformation
      transformation = matrix.create();
      matrix.multiplySeries(transformation,
        translate_matrix, scale_matrix, cube_rotate_y, cube_rotate_x);

      cube_properties[j].matrix = transformation;
    }
  }

  /**----------------------------------------------------------------------
   * Set the active model.
   * @param model {Array} holds a render object for each render_model
   * @param gpuModel {ModelArraysGPU} the GPU buffer objects for a model
   * @param uniform_color {boolean} if true, there is only one color for the model
   */
  function _createRenders(model, gpuModel, uniform_color = true) {
    model[RENDER_WIREFRAME]   = new RenderWireframe(gl, wireframe_program, gpuModel, download.out);
    if (uniform_color) {
      model[RENDER_SOLID] = new RenderUniformColorWithLighting(gl, uniform_color_program, gpuModel, download.out);
      model[RENDER_TRANSPARENT] = new RenderUniformTransparency(gl, uniform_color_program, gpuModel, download.out);
    } else { // not uniform_color
      model[RENDER_SOLID] = new RenderLighting(gl, lighting_program, gpuModel, download.out);
      model[RENDER_TRANSPARENT] = new RenderTransparency(gl, lighting_program, gpuModel, download.out);
    }
  }

  /**----------------------------------------------------------------------
   * Set the active model.
   * @param number {string} which model to name active.
   */
  self.setActiveModel = function (number) {
    switch (number) {
      case LOW_RES_3_CUBES:  active_model = low_res_cube;  break;
      case MED_RES_3_CUBES:  active_model = med_res_cube;  break;
      case HIGH_RES_3_CUBES: active_model = high_res_cube; break;
      case LOW_RES_COMBINED_CUBES:  active_model = low_res_combined_cube;  break;
      case MED_RES_COMBINED_CUBES:  active_model = med_res_combined_cube;  break;
      case HIGH_RES_COMBINED_CUBES: active_model = high_res_combined_cube; break;
      default:
        active_model = low_res_cube;
    }

    render_multiple_models = (number <= HIGH_RES_3_CUBES);
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

  self.animate_active = $('#' + id + '_animate').prop('checked');

  // Set up the rendering programs
  wireframe_program = download.createProgram(gl, vshaders_dictionary["uniform_color"],
                                                 fshaders_dictionary["uniform_color"]);
  lighting_program = download.createProgram(gl, vshaders_dictionary["lighting_alpha"],
                                                fshaders_dictionary["lighting_alpha"]);
  uniform_color_program = download.createProgram(gl, vshaders_dictionary["uniform_color_with_lighting"],
                                                     fshaders_dictionary["uniform_color_with_lighting"]);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  matrix.lookAt(camera, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Create Vertex Object Buffers for the models
  cube2_gpuModel = new ModelArraysGPU(gl, models["cube2"], out);
  cube6_gpuModel = new ModelArraysGPU(gl, models["cube6"], out);
  cube7_gpuModel = new ModelArraysGPU(gl, models["cube7"], out);

  _createCubeProperties();

  _createRenders(low_res_cube, cube2_gpuModel);
  _createRenders(med_res_cube, cube6_gpuModel);
  _createRenders(high_res_cube, cube7_gpuModel);

  // Create a single model from the separate models.
  models["cube2_combined"] = combineModels("cube2",
    models["cube2"], cube_properties[0].matrix, cube_properties[0].color,
    models["cube2"], cube_properties[1].matrix, cube_properties[1].color,
    models["cube2"], cube_properties[2].matrix, cube_properties[2].color);
  models["cube6_combined"] = combineModels("cube6",
    models["cube6"], cube_properties[0].matrix, cube_properties[0].color,
    models["cube6"], cube_properties[1].matrix, cube_properties[1].color,
    models["cube6"], cube_properties[2].matrix, cube_properties[2].color);
  models["cube7_combined"] = combineModels("cube7",
    models["cube7"], cube_properties[0].matrix, cube_properties[0].color,
    models["cube7"], cube_properties[1].matrix, cube_properties[1].color,
    models["cube7"], cube_properties[2].matrix, cube_properties[2].color);

  // Store the new models to GPU buffer objects.
  cube2_gpuModel_combined = new ModelArraysGPU(gl, models["cube2_combined"], out);
  cube6_gpuModel_combined = new ModelArraysGPU(gl, models["cube6_combined"], out);
  cube7_gpuModel_combined = new ModelArraysGPU(gl, models["cube7_combined"], out);

  // Create renders for each combined model
  _createRenders(low_res_combined_cube,  cube2_gpuModel_combined, false);
  _createRenders(med_res_combined_cube,  cube6_gpuModel_combined, false);
  _createRenders(high_res_combined_cube, cube7_gpuModel_combined, false);

  // default cube
  self.setActiveModel(LOW_RES_3_CUBES);

  // Set up callbacks for user and timer events
  let events;
  events = new Transparency2Events(id, self);
  if (self.animate_active) events.animate();

  //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // The light source is static, so set it once.
  gl.useProgram(lighting_program);
  gl.uniform3f(lighting_program.u_Light_position,
    self.light_position[0],
    self.light_position[1],
    self.light_position[2]);
  gl.uniform3fv(lighting_program.u_Light_color, self.light_color);
  gl.uniform3fv(lighting_program.u_Ambient_color, self.ambient_color);
  gl.uniform1f(lighting_program.u_Shininess, self.shininess);

  //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // The light source is static, so set it once.
  gl.useProgram(uniform_color_program);
  gl.uniform3f(uniform_color_program.u_Light_position,
    self.light_position[0],
    self.light_position[1],
    self.light_position[2]);
  gl.uniform3fv(uniform_color_program.u_Light_color, self.light_color);
  gl.uniform3fv(uniform_color_program.u_Ambient_color, self.ambient_color);
  gl.uniform1f(uniform_color_program.u_Shininess, self.shininess);
};

