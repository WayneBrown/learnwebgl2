/**
 * shadows_scene2.js, By Wayne Brown, Spring 2018
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
 * @param scene {ShadowsScene} the scene being rendered.
 * @constructor
 */
window.ShadowsScene2 = function (id, download, vshaders_dictionary,
                                    fshaders_dictionary, models, scene) {

  // Private variables
  let self = this;

  let canvas;
  let gl = null;
  let shadow_program;
  let uniform_program = null;
  let map_program;
  let render_map;
  let render_models = {};
  let shadow_models = {};
  let three_planes;
  let three_planes_shadows;
  let model_gpu;
  let matrix = new GlMatrix4x4();
  let model_rotate_x = matrix.create();
  let model_rotate_y = matrix.create();
  let to_clipping_space = matrix.create();
  let to_camera_space = matrix.create();

  // A transformation for each light source
  let shadow_map_transforms = [matrix.create(), matrix.create()];
  self.shadow_map_resolution = 512;
  self.z_tolerance = 0.00001;

  let cube_model_names = ["cubex", "textx", "cubey", "texty", "cubez", "textz", "cube_center"];

  /** ---------------------------------------------------------------------
   * Create a frame buffer for rendering into texture objects.
   * @param gl {WebGLRenderingContext}
   * @param width  {number} Rendering width in pixels.  (must be power of 2)
   * @param height {number} Rendering height in pixels. (must be power of 2)
   * @returns {WebGLFramebuffer} object
   */
  function _createFrameBufferObject(gl, width, height) {
    let frame_buffer, color_buffer, depth_buffer, status;

    // Step 1: Create a frame buffer object
    frame_buffer = gl.createFramebuffer();

    // Step 2: Create and initialize a texture buffer to hold the colors.
    color_buffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, color_buffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Step 3: Create and initialize a texture buffer to hold the depth values.
    // Note: the WEBGL_depth_texture extension is required for this to work
    //       and for the gl.DEPTH_COMPONENT texture format to be supported.
    depth_buffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depth_buffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0,
                  gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Step 4: Attach the color and depth buffers to the frame buffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame_buffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                            color_buffer, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D,
                            depth_buffer, 0);

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
      frame_buffer.depth_buffer = depth_buffer;
      frame_buffer.width = width;
      frame_buffer.height = height;
    }

    // Unbind these objects, which makes the "draw buffer" the rendering target.
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return frame_buffer;
  }

  /**----------------------------------------------------------------------
   * Update the shader program tolerance value for z depth comparisons.
   */
  self.updateTolerance = function() {
    gl.useProgram(shadow_program);
    gl.uniform1f(shadow_program.u_Z_tolerance, self.z_tolerance);
  };

  /**----------------------------------------------------------------------
   * Create the frame buffers needed to render the shadow maps.
   * @private
   */
  self.initializeShadowMaps = function() {
    let frame_buffer;
    for (let j = 0; j < scene.lights.number; j += 1) {
      // Since the resolution of the shadow maps can change for this demo,
      // delete any previously created framebuffer.
      if (scene.lights[j].framebuffer !== null) {
        gl.deleteTexture(scene.lights[j].framebuffer.color_buffer);
        gl.deleteTexture(scene.lights[j].framebuffer.depth_buffer);
        gl.deleteFramebuffer(scene.lights[j].framebuffer);
      }

      frame_buffer = _createFrameBufferObject(gl, self.shadow_map_resolution,
                                                  self.shadow_map_resolution);
      scene.lights[j].framebuffer = frame_buffer;
      scene.lights[j].shadow_map = frame_buffer.depth_buffer;
    }
  };

  /**----------------------------------------------------------------------
   * Set the camera and projection transforms for a light source rendering.
   * @param camera_data {object} camera description {eye, center, up }
   * @param light_source {object} definition of a light source.
   * @private
   */
  function _setLightCameraAndProjection(camera_data, light_source) {
    let light_camera = light_source.camera;

    matrix.lookAt(light_source.camera, light_source.position[0],
                                       light_source.position[1],
                                       light_source.position[2],
                                       camera_data.center[0],
                                       camera_data.center[1],
                                       camera_data.center[2],
                                       camera_data.up[0],
                                       camera_data.up[1],
                                       camera_data.up[2]);

    light_source.projection_data.getTransform(light_source.projection);

    matrix.multiply(light_source.transform, light_source.projection, light_source.camera);
  }

  /**----------------------------------------------------------------------
   * Render the models in the scene.
   * @param to_clipping_space {Float32Array} 4x4 projection transformation matrix.
   * @private
   */
  function _render_shadow_models (to_clipping_space) {
    if (scene.which_models === scene.PLANE_MODELS) {
      three_planes_shadows.render(to_clipping_space);

    } else if (scene.which_models === scene.CUBES_MODELS) {
      for (let j = 0; j < render_models.length; j += 1) {
        shadow_models[j].render(to_clipping_space);
      }
    }
  }

  /**----------------------------------------------------------------------
   * Render the scene to a shadow map.
   * @param framebuffer {WebGLFramebuffer} target framebuffer
   * @param transform {Float32Array} 4x4 projection and camera transformation matrix.
   * @private
   */
  function _render_to_shadow_map (framebuffer, transform) {

    gl.viewport(0.0, 0.0, framebuffer.width, framebuffer.height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Draw each model
    matrix.rotate(model_rotate_x, scene.model_angle_x, 1, 0, 0);
    matrix.rotate(model_rotate_y, scene.model_angle_y, 0, 1, 0);

    matrix.multiplySeries(to_clipping_space, transform, model_rotate_y, model_rotate_x);
    _render_shadow_models(to_clipping_space);

    // Draw a second copy further back
    matrix.multiplySeries(to_clipping_space, transform, scene.translate2, model_rotate_y, model_rotate_x);
    _render_shadow_models(to_clipping_space);
  }

  /**----------------------------------------------------------------------
   * Render the models in the scene.
   * @param to_clipping_space {Float32Array} 4x4 projection transformation matrix.
   * @param to_camera_space {Float32Array} 4x4 camera transformation matrix.
   * @param shadow_map_transforms {Array} of transformation matrices.
   * @private
   */
  function _render_models (to_clipping_space, to_camera_space, shadow_map_transforms) {
    if (scene.which_models === scene.PLANE_MODELS) {
      three_planes.render(to_clipping_space, to_camera_space, shadow_map_transforms);

    } else if (scene.which_models === scene.CUBES_MODELS) {
      for (let j = 0; j < render_models.length; j += 1) {
        render_models[j].render(to_clipping_space, to_camera_space, shadow_map_transforms);
      }
    }
  }

    /**----------------------------------------------------------------------
   * Render the scene
   * @param projection {Float32Array} 4x4 projection transformation matrix.
   * @param camera {Float32Array} 4x4 camera transformation matrix.
   * @private
   */
  function _render_scene (projection, camera) {

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Draw each model
    matrix.rotate(model_rotate_x, scene.model_angle_x, 1, 0, 0);
    matrix.rotate(model_rotate_y, scene.model_angle_y, 0, 1, 0);

    matrix.multiplySeries(to_camera_space, camera, model_rotate_y, model_rotate_x);
    matrix.multiply(to_clipping_space, projection, to_camera_space);

    // Copy the transforms to the shaders here because they are the same for
    // all of the models.
    for (let k=0; k<scene.lights.number; k++) {
      matrix.multiplySeries(shadow_map_transforms[k], scene.lights[k].transform, model_rotate_y, model_rotate_x);
      gl.uniformMatrix4fv(shadow_program.lights[k].transform, false, shadow_map_transforms[k]);
    }

    _render_models(to_clipping_space, to_camera_space, shadow_map_transforms);

    // Copy the transforms to the shaders here because they are the same for
    // all of the models.
    for (let k=0; k<scene.lights.number; k++) {
      matrix.multiplySeries(shadow_map_transforms[k], scene.lights[k].transform, scene.translate2, model_rotate_y, model_rotate_x);
      gl.uniformMatrix4fv(shadow_program.lights[k].transform, false, shadow_map_transforms[k]);
    }

    // Draw a second copy further back
    matrix.multiplySeries(to_camera_space, camera, scene.translate2, model_rotate_y, model_rotate_x);
    matrix.multiply(to_clipping_space, projection, to_camera_space);

    _render_models(to_clipping_space, to_camera_space, shadow_map_transforms);
  }

  //-----------------------------------------------------------------------
  function _updateLights () {

    // Set the location of the light source
    // Transform the light position by the camera
    gl.useProgram(shadow_program);
    for (let j = 0; j < scene.lights.number; j += 1) {
      gl.uniform3f(shadow_program.lights[j].position,
                   scene.lights[j].in_camera_space[0],
                   scene.lights[j].in_camera_space[1],
                   scene.lights[j].in_camera_space[2]);

      gl.uniform3f(shadow_program.lights[j].color,
                   scene.lights[j].color[0],
                   scene.lights[j].color[1],
                   scene.lights[j].color[2]);

      gl.uniform1i(shadow_program.lights[j].is_on, scene.lights[j].is_on);

      gl.activeTexture(gl.TEXTURE0 + j);
      gl.bindTexture(gl.TEXTURE_2D, scene.lights[j].shadow_map);
      gl.uniform1i(shadow_program.texture_units[j], j);
    }

    gl.uniform1f(shadow_program.u_Tolerance_constant, 0.001);

    gl.uniform3f(shadow_program.u_Ambient_intensities,
                 scene.lights.ambient[0],
                 scene.lights.ambient[1],
                 scene.lights.ambient[2]);

    gl.uniform1f(shadow_program.u_c1, scene.lights.c1);
    gl.uniform1f(shadow_program.u_c2, scene.lights.c2);
  }

  //-----------------------------------------------------------------------
  self.render = function () {
    let light;

    // Render the shadow maps.
    for (let j=0; j< scene.lights.number; j += 1) {
      light = scene.lights[j];

      // Set the target frame buffer.
      gl.bindFramebuffer(gl.FRAMEBUFFER, light.framebuffer);

      // Set camera and projection used to render the scene scene from the light source.
      _setLightCameraAndProjection(scene.camera_data, light);

      // Create a single transform for the shadow map rendering
      matrix.multiply(light.transform, light.projection, light.camera);

      // Render the scene
      _render_to_shadow_map(light.framebuffer, light.transform);
    }

    _updateLights();

    // Set the target frame buffer to the default draw buffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Special case for debugging - render a shadow map texture
    if (scene.render_shadow_map) {
      let k = scene.render_shadow_map_num;
      gl.viewport(0, 0, canvas.width, canvas.height);
      render_map.render(scene.lights[k].shadow_map);
      return;
    }

    // Render the scene with shadows (using the shadow maps).
    _render_scene(scene.projection, scene.camera, render_models);
  };

  //-----------------------------------------------------------------------
  self.delete = function () {
    // Clean up shader programs
    gl.deleteShader(shadow_program.vShader);
    gl.deleteShader(shadow_program.fShader);
    gl.deleteProgram(shadow_program);

    gl.deleteShader(uniform_program.vShader);
    gl.deleteShader(uniform_program.fShader);
    gl.deleteProgram(uniform_program);

    // Delete each model's VOB
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].delete(gl);
      shadow_models[j].delete(gl);
    }

    // Remove all event handlers
    events.removeAllEventHandlers();

    // Disable any animation
    self.animate_active = false;
  };

  //-----------------------------------------------------------------------
  self.setModelShininess = function (shininess) {
    three_planes.shininess = shininess;
    for (let j = 0; j < render_models.length; j += 1) {
      render_models[j].shininess = shininess;
    }
  };

  //-----------------------------------------------------------------------
  // Constructor initialization
  canvas = download.getCanvas(id + "_canvas_b");
  if (canvas) {
    gl = download.getWebglContext(canvas);
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

  // Set up the rendering program and set the state of webgl
  shadow_program = download.createProgram(gl, vshaders_dictionary['shadows'], fshaders_dictionary['shadows']);
  uniform_program = download.createProgram(gl, vshaders_dictionary['uniform_color'], fshaders_dictionary['uniform_color']);
  map_program = download.createProgram(gl, vshaders_dictionary['shadow_map'], fshaders_dictionary['shadow_map']);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(1, 1, 1, 1.0);

  // Create Vertex Object Buffers for the models
  render_models = new Array(cube_model_names.length);
  for (let j = 0; j < cube_model_names.length; j += 1) {
    model_gpu = new ModelArraysGPU(gl, models[cube_model_names[j]], download.out);
    render_models[j] = new RenderShadows(gl, shadow_program, model_gpu, download.out, scene.lights.number);
    shadow_models[j] = new RenderConstUniformColor(gl, uniform_program, model_gpu,
                             download.out, [1.0, 0.0, 0.0, 1.0]);
  }

  model_gpu = new ModelArraysGPU(gl, models["three_planes"], download.out);
  three_planes = new RenderShadows(gl, shadow_program, model_gpu, download.out, scene.lights.number);
  three_planes_shadows = new RenderConstUniformColor(gl, uniform_program, model_gpu,
                                 download.out, [1.0, 0.0, 0.0, 1.0]);

  self.initializeShadowMaps();
  render_map = new RenderShadowMap(gl, map_program, download.out);

  let events = new ShadowsEvents2(id, scene, self);

  self.updateTolerance();
};

