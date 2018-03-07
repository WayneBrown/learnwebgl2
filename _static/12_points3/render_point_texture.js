/**
 * render_point_texture.js, By Wayne Brown, Spring 2018
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 C. Wayne Brown
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

/**------------------------------------------------------------------------
 * A class that can create buffer objects for a model, render the model,
 * and delete the model.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param program {object} compiled shader program
 * @param model_buffers {ModelArraysGPU} GPU object buffers that hold the model data
 * @param out - an object that can display messages to the web page
 * @param image - {Image} an image for texture mapping.
 * @constructor
 */
window.RenderPointTexture = function (gl, program, model_buffers, out, image) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;

  let my_texture_object = null;
  let texture_map_file_name = "../_images/explosion_seamless.png";

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param transform        {GlMatrix4x4} A 4x4 transformation matrix.
   */
  self.render = function (transform) {

    gl.useProgram(program);

    // Set the transform for all the faces, lines, and points
    gl.uniformMatrix4fv(program.u_Transform, false, transform);

    // The shader program used by this render require a color and normal
    // vector for each vertex, which points and lines do not define.
    // Therefore this shader program can't render any points or lines in this model.

    if (my_texture_object !== null &&
        model_buffers.points !== null &&
        model_buffers.points.number > 0) {

      let vertices = model_buffers.points.vertices;

      // Activate the model's triangle vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Make the "texture unit" 0 be the active texture unit.
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, my_texture_object);
      gl.uniform1i(program.u_Texture_unit, 0);

      // Draw all of the points
      gl.drawArrays(gl.POINTS, 0, vertices.number_values/3);
    }
  };

  /**----------------------------------------------------------------------
   * Create and initialize a texture object
   * @param my_image {Image} A JavaScript Image object that contains the
   *                         texture map image.
   * @private
   */
  function _createTextureMap(my_image) {

    // Create a new "texture object".
    let texture_object = gl.createTexture();

    // Make the "texture object" be the active texture object.
    gl.bindTexture(gl.TEXTURE_2D, texture_object);

    // Set parameters of the texture object.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Tell gl to flip the orientation of the image on the Y axis.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    // Store in the image in the GPU's texture object.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE,
                  my_image);

    my_texture_object = texture_object;
  }

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // Get the location of the shader program's uniforms and attributes
  program.u_Transform    = gl.getUniformLocation(program, "u_Transform");
  program.u_Size         = gl.getUniformLocation(program, "u_Size");
  program.u_Texture_unit = gl.getUniformLocation(program, "u_Texture_unit");

  program.a_Vertex       = gl.getAttribLocation(program, 'a_Vertex');

  _createTextureMap(image);
};
