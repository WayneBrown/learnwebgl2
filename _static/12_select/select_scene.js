/**
 * select_render.js, By Wayne Brown, Spring 2018
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
window.SelectScene = function (id, download, vshaders_dictionary,
                               fshaders_dictionary, models) {

  // Private variables
  let self = this;
  let out = download.out;

  let gl = null;
  let select_program = null;
  let visible_program = null;
  let cube = null;
  let select_cube = null;
  let gpuModel;
  let number_cubes = 30;
  let all_cubes = new Array(number_cubes);

  let matrix = new GlMatrix4x4();
  let transform = matrix.create();
  let camera_model_transform = matrix.create();
  let projection = matrix.createPerspective(45.0, 1.0, 0.1, 100.0);
  let camera = matrix.create();
  let scale_matrix = matrix.create();
  let translate_matrix = matrix.create();
  let rotate_x_matrix = matrix.create();
  let rotate_y_matrix = matrix.create();

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

  let convert = null;
  let pixel = new window.Uint8Array(4); // A single RGBA value
  let selected_object_id = -1;
  let red = [1.0, 0.0, 0.0, 1.0];

  //-----------------------------------------------------------------------
  self.render = function (select_mode = false) {
    let size, position, color, x_radians, y_radians, scale;

    // Clear the entire canvas window background with the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rotate the models about the origin
    matrix.rotate(rotate_x_matrix, self.angle_x, 1.0, 0.0, 0.0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0.0, 1.0, 0.0);

    if (! select_mode) {
      //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Set the location of the light source
      gl.useProgram(visible_program);
      gl.uniform3f(visible_program.u_Light_position, self.light_position[0],
          self.light_position[1],
          self.light_position[2]);
      gl.uniform3fv(visible_program.u_Light_color, self.light_color);
      gl.uniform3fv(visible_program.u_Ambient_color, self.ambient_color);
      gl.uniform1f(visible_program.u_Shininess, self.shininess);
    }

    // Draw a set of spheres with different locations, sizes, and colors.
    for (let j = 0; j < number_cubes; j += 1) {
      size     = all_cubes[j].size;
      position = all_cubes[j].position;
      color    = all_cubes[j].color;

      matrix.scale(scale_matrix, size, size, size);
      matrix.translate(translate_matrix, position[0], position[1], position[2]);

      // Combine the transforms into a single transformation
      matrix.multiplySeries(camera_model_transform, camera,
                            rotate_x_matrix, rotate_y_matrix,
                            translate_matrix, scale_matrix);
      matrix.multiplySeries(transform, projection, camera_model_transform);

      if (select_mode) {
        // Render a single cube using its array index converted into a color.
        select_cube.render(transform, convert.createColor(j));
      } else {
        // Render a single cube. Make it red if it is the selected object.
        if (j === selected_object_id) { color = red; }
        cube.render(transform, camera_model_transform, color);
      }
    }
  };

  //-----------------------------------------------------------------------
  /**
   * Given the location of a mouse click, get the object that is rendered
   * at that location.
   * @param mouse_x Number The x-component of the mouse's location.
   * @param mouse_y Number The y-component of the mouse's location.
   */
  self.select = function (mouse_x, mouse_y) {

    // Render the scene to put each object's ID number into the color buffer.
    self.render(true);

    // Convert the canvas coordinate system into an image coordinate system.
    mouse_y = self.canvas.clientHeight - mouse_y;

    // Get the color value from the rendered color buffer.
    gl.readPixels(mouse_x, mouse_y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    // Convert the RGBA color array into a single integer
    selected_object_id = convert.getID(pixel[0], pixel[1], pixel[2], pixel[3]);

    // Debugging
    out.displayInfo("Pixel = " + pixel);
    out.displayInfo("ID = " + selected_object_id);

    // Now render the scene for the user's view.
    self.render(false);
  };

  //-----------------------------------------------------------------------
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(select_program.vShader);
    gl.deleteShader(select_program.fShader);
    gl.deleteProgram(select_program);

    gl.deleteShader(visible_program.vShader);
    gl.deleteShader(visible_program.fShader);
    gl.deleteProgram(visible_program);

    // Delete each model's VOB
    cube.delete(gl);
    select_cube.delete(gl);

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

  // Make the cursor be a pointer in the canvas window.
  $(self.canvas).css("cursor", "pointer");
  $('#' + id + '_animate').prop('checked', self.animate_active);

  // Set up the rendering programs
  select_program = download.createProgram(gl, vshaders_dictionary["uniform_color"],
                                              fshaders_dictionary["uniform_color"]);
  visible_program = download.createProgram(gl, vshaders_dictionary["uniform_color_with_lighting"],
                                               fshaders_dictionary["uniform_color_with_lighting"]);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  matrix.lookAt(camera, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Create Vertex Object Buffers for the models
  gpuModel = new ModelArraysGPU(gl, models["cube2"], out);
  select_cube = new RenderUniformColor(gl, select_program, gpuModel, download.out);
  cube = new RenderUniformColorWithLighting(gl, visible_program, gpuModel, download.out);

  // Create a set of random positions, colors, and sizes for a group of cubes.
  let position_x, position_y, position_z;
  for (let j = 0; j < number_cubes; j += 1) {
    position_x = Math.random() * 10 - 5.0;
    position_y = Math.random() * 10 - 5.0;
    position_z = Math.random() * 10 - 5.0;
    all_cubes[j] = { position: [position_x, position_y, position_z],
                     size: Math.random() + 0.2,
                     color: new Float32Array([0.0, Math.random(), Math.random(), 1.0])
                   };
  }

  // Set up callbacks for user and timer events
  let events;
  events = new SelectEvents(id, self);
  events.animate();

  // Create an object to convert between integer identifiers and colors.
  convert = new ColorToID(gl);
};

