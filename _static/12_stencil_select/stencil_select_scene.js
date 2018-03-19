/**
 * stencil_select_render.js, By Wayne Brown, Spring 2018
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

//=========================================================================
// Notes:
// In theory the stencil buffer can be used for selection, and OpenGL
// allows the reading of the stencil_buffer using gl.readPixels.
//
// HOWEVER!!!!!
//   WebGL 1.0 does not allow gl.readPixels to read the stencil buffer, and
//   therefore it can't be used for selection!!!!!!!!!
//=========================================================================

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
window.StencilSelectScene = function (id, download, vshaders_dictionary,
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

  let frame_buffer = null;

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

  let pixel = new window.Uint8Array(1); // A single depth and stencil value
  let selected_object_id = -1;
  let red = [1.0, 0.0, 0.0, 1.0];

  /** ---------------------------------------------------------------------
   * Create a frame buffer for rendering into texture objects.
   * @param gl {WebGLRenderingContext}
   * @param width  {number} Rendering width in pixels.  (must be power of 2)
   * @param height {number} Rendering height in pixels. (must be power of 2)
   * @returns {WebGLFramebuffer} object
   */
  function _createFrameBufferObject(gl, width, height) {
    let frame_buffer, color_buffer, depth_buffer, stencil_buffer, depth_stencil_buffer, status;

    // Step 1: Create a frame buffer object
    frame_buffer = gl.createFramebuffer();

    // The framebuffer must have a texture for the color buffer and
    // a single renderbuffer for the depth and stencil data.
    // https://www.khronos.org/registry/webgl/specs/1.0/#5.14.12
    // Section 6.6
    // COLOR_ATTACHMENT0 = RGBA/UNSIGNED_BYTE texture +
    // DEPTH_STENCIL_ATTACHMENT = DEPTH_STENCIL renderbuffer

    color_buffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, color_buffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    depth_stencil_buffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth_stencil_buffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);

    // Step 3: Create and initialize a texture buffer to hold the depth values.
    // Note: the WEBGL_depth_texture extension is required for this to work
    //       and for the gl.DEPTH_COMPONENT texture format to be supported.
    // depth_buffer = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, depth_buffer);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0,
    //   gl.DEPTH_COMPONENT16, gl.UNSIGNED_INT, null);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Step 3b: Create and initialize a texture buffer to hold the stencil values.
    // depth_stencil_buffer = gl.createRenderbuffer();
    // gl.bindRenderbuffer(gl.RENDERBUFFER, depth_stencil_buffer);
    // gl.renderbufferStorage(gl.RENDERBUFFER, gl.UNSIGNED_INT_24_8_WEBGL, width, height);
    // depth_stencil_buffer = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, depth_stencil_buffer);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_STENCIL, width, height, 0,
    //   gl.DEPTH_STENCIL, depth_texture_extension.UNSIGNED_INT_24_8_WEBGL, null);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Step 4: Attach the color, depth, and stencil buffers to the frame buffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame_buffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                               gl.TEXTURE_2D, color_buffer, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT,
                               gl.RENDERBUFFER, depth_stencil_buffer);

    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
    //                         gl.TEXTURE_2D, color_buffer, 0);
    // // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
    // //                         gl.TEXTURE_2D, depth_buffer, 0);
    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT,
    //                         gl.TEXTURE_2D, depth_stencil_buffer, 0);
    // // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT,
    // //                            gl.RENDERBUFFER, depth_stencil_buffer);

    // Step 5: Verify that the frame buffer is valid.
    status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.log("The created frame buffer is invalid: " + status.toString());
      if (color_buffer) gl.deleteBuffer(color_buffer);
      if (depth_buffer) gl.deleteBuffer(depth_buffer);
      if (frame_buffer) gl.deleteBuffer(frame_buffer);
      frame_buffer = null;

      switch (status)  {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: console.log("INCOMPLETE_ATTACHMENT"); break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: console.log("MISSING_ATTACHMENT"); break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: console.log("DIMENSIONS"); break;
        case gl.FRAMEBUFFER_UNSUPPORTED: console.log("UNSUPPORTED"); break;
      }
    } else {
      // Put references to the buffers into the frame buffer object so they
      // can be referenced later.
      frame_buffer.color_buffer = color_buffer;
      frame_buffer.depth_stencil_buffer = depth_stencil_buffer;
      frame_buffer.width = width;
      frame_buffer.height = height;
    }

    // Unbind these objects, which makes the "draw buffer" the rendering target.
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return frame_buffer;
  }

  //-----------------------------------------------------------------------
  self.render = function () {
    let size, position, color, x_radians, y_radians, scale;

    // Clear the entire canvas window background with the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    // Rotate the models about the origin
    matrix.rotate(rotate_x_matrix, self.angle_x, 1.0, 0.0, 0.0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0.0, 1.0, 0.0);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Set the location of the light source
    gl.useProgram(visible_program);
    gl.uniform3f(visible_program.u_Light_position, self.light_position[0],
        self.light_position[1],
        self.light_position[2]);
    gl.uniform3fv(visible_program.u_Light_color, self.light_color);
    gl.uniform3fv(visible_program.u_Ambient_color, self.ambient_color);
    gl.uniform1f(visible_program.u_Shininess, self.shininess);

    // Draw a set of cubes with different locations, sizes, and colors.
    for (let j = 0; j < number_cubes; j += 1) {
      size     = all_cubes[j].size;
      position = all_cubes[j].position;
      color    = all_cubes[j].color;
      if (j === selected_object_id) { color = red; }

      matrix.scale(scale_matrix, size, size, size);
      matrix.translate(translate_matrix, position[0], position[1], position[2]);

      // Combine the transforms into a single transformation
      matrix.multiplySeries(camera_model_transform, camera,
                            rotate_x_matrix, rotate_y_matrix,
                            translate_matrix, scale_matrix);
      matrix.multiplySeries(transform, projection, camera_model_transform);

      // Render a single cube.
      //gl.stencilFunc(gl.ALWAYS, j, 0xFF );
      gl.stencilFuncSeparate( gl.FRONT, gl.ALWAYS, j, 0xFF );
      gl.stencilFuncSeparate( gl.BACK, gl.ALWAYS, j+1, 0x0F );

      cube.render(transform, camera_model_transform, color);
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

    //gl.bindFramebuffer(gl.FRAMEBUFFER, frame_buffer);

    // Render the scene to put each object's ID number into the color buffer.
    //self.render();

    // Convert the canvas coordinate system into an image coordinate system.
    mouse_y = self.canvas.clientHeight - mouse_y;

    gl.readPixels(mouse_x, mouse_y, 1, 1, gl.STENCIL_INDEX8, gl.UNSIGNED_BYTE, pixel);

    selected_object_id = pixel[0];

    // for (let x=0; x<300; x+=1) {
    //   for (let y=0; y < 300; y+=1) {
    //     gl.readPixels(x, y, 1, 1, gl.STENCIL_INDEX8, gl.UNSIGNED_BYTE, pixel);
    //     if (pixel[0] !== 0) {
    //       console.log(x,y,pixel[0]);
    //     }
    //   }
    // }

    // Debugging
    out.displayInfo("ID = " + selected_object_id);

    //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
    gl = download.getWebglContext(self.canvas, {"stencil" : true});
  }
  if (!gl) {
    return;
  }

  let depth_texture_extension = gl.getExtension('WEBGL_depth_texture');
  if (!depth_texture_extension) {
    console.log('This WebGL program requires the use of the ' +
      'WEBGL_depth_texture extension. This extension is not supported ' +
      'by your browser, so this WEBGL program is terminating.');
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
  gl.enable(gl.STENCIL_TEST);

  gl.clearColor(0.98, 0.98, 0.98, 1.0);

  matrix.lookAt(camera, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

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
  events = new StencilSelectEvents(id, self);
  events.animate();

  //frame_buffer = _createFrameBufferObject(gl, 512, 512);
};

