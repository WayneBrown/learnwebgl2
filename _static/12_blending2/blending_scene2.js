/**
 * blending_scene2.js, By Wayne Brown, Spring 2018
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
window.BlendingScene2 = function (id, download, vshaders_dictionary,
                               fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let out = download.out;

  let gl = null;
  let visible_program = null;
  let cube = null;
  let gpuModel;

  let number_cubes = 125;
  let cubes = new Array(number_cubes);

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
  self.src_factor = null;  // set to defaults after gl is defined.
  self.dst_factor = null;
  self.src_alpha = null;
  self.dst_alpha = null;
  self.constant_color = [0.0, 0.0, 0.0, 1.0];
  self.background_color = [0.98, 0.98, 0.98, 1.0];
  self.func = null;
  self.func_alpha = null;

  // Light model
  let P4 = new GlPoint4();
  let V = new GlVector3();
  self.light_position = P4.create(10, 10, 10, 1);
  self.light_color = V.create(1, 1, 1); // white light
  self.shininess = 30;
  self.ambient_color = V.create(0.2, 0.2, 0.2); // low level white light

  // Temporary variable for calculating the distance of models from the camera.
  let result = P4.create();

  //-----------------------------------------------------------------------
  self.render = function () {
    let size, position, color;

    gl.clearColor(self.background_color[0],
                  self.background_color[1],
                  self.background_color[2],
                  self.background_color[3]);

    // Clear the entire canvas window background with the clear color.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the blending factors
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(self.src_factor, self.dst_factor,
                         self.src_alpha,  self.dst_alpha);
    let error = gl.getError(); // gl.NO_ERROR (0)
    if (error) {
      switch (error) {
        case gl.INVALID_ENUM: console.log("Error: INVALID_ENUM");                  break;
        case gl.INVALID_VALUE: console.log("Error: INVALID_VALUE");                 break;
        case gl.INVALID_OPERATION: console.log("Error: INVALID_OPERATION");             break;
        case gl.INVALID_FRAMEBUFFER_OPERATION: console.log("Error: INVALID_FRAMEBUFFER_OPERATION"); break;
        case gl.OUT_OF_MEMORY: console.log("Error: OUT_OF_MEMORY");                 break;
        case gl.CONTEXT_LOST_WEBGL: console.log("Error: CONTEXT_LOST_WEBGL");            break;
      }
    }
    gl.blendColor(self.constant_color[0],
                  self.constant_color[1],
                  self.constant_color[2],
                  self.constant_color[3]);
    gl.blendEquationSeparate(self.func, self.func_alpha);

    // Set up common transformations for the entire scene.
    matrix.rotate(rotate_x_matrix, self.angle_x, 1.0, 0.0, 0.0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0.0, 1.0, 0.0);
    matrix.multiplySeries(to_camera_space, camera, rotate_x_matrix, rotate_y_matrix);

    // Draw a set of cubes with different locations, sizes, and colors.
    for (let j = 0; j < number_cubes; j += 1) {
      size     = cubes[j].size;
      position = cubes[j].position;
      color    = cubes[j].color;

      matrix.scale(scale_matrix, size, size, size);
      matrix.translate(translate_matrix, position[0], position[1], position[2]);
      matrix.rotate(cube_rotate_x, cubes[j].x_angle, 1.0, 0.0, 0.0);
      matrix.rotate(cube_rotate_y, cubes[j].y_angle, 0.0, 1.0, 0.0);

      // Combine the transforms into a single transformation
      matrix.multiplySeries(camera_model_transform, to_camera_space,
        translate_matrix, scale_matrix, cube_rotate_y, cube_rotate_x);
      matrix.multiplySeries(transform, projection, camera_model_transform);

      cube.render(transform, camera_model_transform, color, false);
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
  self.createCubes = function () {
    let dx, dy, dz, alpha;

    let j = 0;
    for (let x = 1.0; x >= 0.0; x -= 0.25) {
      for (let y = 1.0; y >= 0.0; y -= 0.25) {
        for (let z = 1.0; z >= 0.0; z -= 0.25) {
          if ( !Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z) ) {
            dx = x - 0.5;
            dy = y - 0.5;
            dz = z - 0.5;
            alpha = Math.sqrt(dx*dx + dy*dy + dz*dz) / (Math.sqrt(3.0)*0.5);
          } else {
            alpha = 1.0;
          }
          cubes[j++] = { position: P4.create(x*8 - 4, y*8 - 4, z*8 - 4, 1.0),
                         size:     0.65,
                         color:    new Float32Array([x, y, z, alpha]),
                         x_angle:  0,
                         y_angle:  0,
          };
        }
      }
    }
  };

  /**----------------------------------------------------------------------
   * Create random positions, colors, rotations, and sizes for a group of cubes.
   * @private
   */
  self.randomizeCubes = function () {
    for (let j = 0; j < number_cubes; j += 1) {
      cubes[j].position[0] = Math.random() * 10 - 5.0;
      cubes[j].position[1] = Math.random() * 10 - 5.0;
      cubes[j].position[2] = Math.random() * 10 - 5.0;

      cubes[j].size = Math.random() + 0.3;

      cubes[j].x_angle = Math.random() * 180.0 - 90.0;
      cubes[j].y_angle = Math.random() * 360.0;
    }
  };

  /**----------------------------------------------------------------------
   * Set the blending source percentage factor.
   * @param index {number} which factor
   * @param which {number} 0 source color factors,
   *                       1 destination color factors,
   *                       2 source alpha factor,
   *                       3 destination alpha factor
   */
  self.setBlendingFactor = function ( index, which ) {
    let new_value;

    switch (index) {
      case  0: new_value = gl.ZERO;                     break;
      case  1: new_value = gl.ONE;                      break;
      case  2: new_value = gl.SRC_COLOR;                break;
      case  3: new_value = gl.ONE_MINUS_SRC_COLOR;      break;
      case  4: new_value = gl.DST_COLOR;                break;
      case  5: new_value = gl.ONE_MINUS_DST_COLOR;      break;
      case  6: new_value = gl.SRC_ALPHA;                break;
      case  7: new_value = gl.ONE_MINUS_SRC_ALPHA;      break;
      case  8: new_value = gl.DST_ALPHA;                break;
      case  9: new_value = gl.ONE_MINUS_DST_ALPHA;      break;
      case 10: new_value = gl.CONSTANT_COLOR;           break;
      case 11: new_value = gl.ONE_MINUS_CONSTANT_COLOR; break;
      case 12: new_value = gl.CONSTANT_ALPHA;           break;
      case 13: new_value = gl.ONE_MINUS_CONSTANT_ALPHA; break;
      case 14: new_value = gl.SRC_ALPHA_SATURATE;       break;
      default:
        console.log("Invalid blending choice: ", index);
        new_value = gl.ONE;
    }

    switch (which) {
      case 0: self.src_factor = new_value; break;
      case 1: self.dst_factor = new_value; break;
      case 2: self.src_alpha  = new_value; break;
      case 3: self.dst_alpha  = new_value; break;
      default:
        console.log("Invalid which choice: ", which);
    }
  };

  /**----------------------------------------------------------------------
   * Set the blending destination percentage factor.
   * @param index {number} which factor
   * @param which {number} 0 color factors,
   *                       1 alpha factors,
   */
  self.setFunc = function ( index, which ) {
    let new_value;
    switch (index) {
      case  0: new_value = gl.FUNC_ADD;              break;
      case  1: new_value = gl.FUNC_SUBTRACT;         break;
      case  2: new_value = gl.FUNC_REVERSE_SUBTRACT; break;
      default:
        console.log("Invalid function index: ", index);
        new_value = gl.FUNC_ADD;
    }

    switch (which) {
      case 0: self.func       = new_value; break;
      case 1: self.func_alpha = new_value; break;
    }
  };

  // /**----------------------------------------------------------------------
  //  * Set the blending destination percentage factor.
  //  * @param name {string} description
  //  * @param factor {number} which factor
  //  */
  // self.verifyFactor = function ( name, factor ) {
  //   switch (factor) {
  //     case gl.ZERO:                     console.log(name, "ZERO");                     break;
  //     case gl.ONE:                      console.log(name, "ONE");                      break;
  //     case gl.SRC_COLOR:                console.log(name, "SRC_COLOR");                break;
  //     case gl.ONE_MINUS_SRC_COLOR:      console.log(name, "ONE_MINUS_SRC_COLOR");      break;
  //     case gl.DST_COLOR:                console.log(name, "DST_COLOR");                break;
  //     case gl.ONE_MINUS_DST_COLOR:      console.log(name, "ONE_MINUS_DST_COLOR");      break;
  //     case gl.SRC_ALPHA:                console.log(name, "SRC_ALPHA");                break;
  //     case gl.ONE_MINUS_SRC_ALPHA:      console.log(name, "ONE_MINUS_SRC_ALPHA");      break;
  //     case gl.DST_ALPHA:                console.log(name, "DST_ALPHA");                break;
  //     case gl.ONE_MINUS_DST_ALPHA:      console.log(name, "ONE_MINUS_DST_ALPHA");      break;
  //     case gl.CONSTANT_COLOR:           console.log(name, "CONSTANT_COLOR");           break;
  //     case gl.ONE_MINUS_CONSTANT_COLOR: console.log(name, "ONE_MINUS_CONSTANT_COLOR"); break;
  //     case gl.CONSTANT_ALPHA:           console.log(name, "CONSTANT_ALPHA");           break;
  //     case gl.ONE_MINUS_CONSTANT_ALPHA: console.log(name, "ONE_MINUS_CONSTANT_ALPHA"); break;
  //     case gl.SRC_ALPHA_SATURATE:       console.log(name, "SRC_ALPHA_SATURATE");       break;
  //     default:
  //       console.log("Invalid factor: ", name, factor);
  //   }
  // };
  //
  // /**----------------------------------------------------------------------
  //  * Set the blending destination percentage factor.
  //  * @param name {string} description
  //  * @param func {number} which func
  //  */
  // self.verifyFunc = function ( name, func ) {
  //   switch (func) {
  //     case gl.FUNC_ADD:              console.log(name, "FUNC_ADD");              break;
  //     case gl.FUNC_SUBTRACT:         console.log(name, "FUNC_SUBTRACT");         break;
  //     case gl.FUNC_REVERSE_SUBTRACT: console.log(name, "FUNC_REVERSE_SUBTRACT"); break;
  //     default:
  //       console.log("Invalid func: ", name, func);
  //   }
  // };

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

  matrix.lookAt(camera, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Create Vertex Object Buffers for the models
  gpuModel = new ModelArraysGPU(gl, models["cube2"], out);
  cube = new RenderUniformTransparency(gl, visible_program, gpuModel, download.out);

  // Create a set of random positions, colors, and sizes for a group of cubes.
  self.createCubes();

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

  // set the default blending factors;
  self.src_factor = gl.ONE;
  self.dst_factor = gl.ZERO;
  self.src_alpha = gl.ONE;
  self.dst_alpha = gl.ZERO;
  self.func = gl.FUNC_ADD;
  self.func_alpha = gl.FUNC_ADD;

  // Set up callbacks for user and timer events
  let events;
  events = new BlendingEvents2(id, self);
  if (self.animate_active) events.animate();
};

