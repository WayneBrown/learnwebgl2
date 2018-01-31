/**
 * render_displacement_map.js, By Wayne Brown, Fall 2017
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
 * @param model_buffers {GpuModelArrays} GPU object buffers that hold the model data
 * @param out - an object that can display messages to the web page
 * @constructor
 */
window.RenderDisplacementMap = function (gl, program, model_buffers, out) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;

  let my_texture_object = null;

  /**----------------------------------------------------------------------
   * Create and initialize a texture object
   * @param my_image {Image} A JavaScript Image object that contains the
   *                         texture map image.
   * @returns {WebGLTexture} A "texture object"
   * @private
   */
  function _createTexture(my_image) {

    // Create a new "texture object".
    let texture_object = gl.createTexture();

    // Make the "texture object" be the active texture object. Only the
    // active object can be modified or used. This also declares that the
    // texture object will hold a texture of type gl.TEXTURE_2D. The type
    // of the texture, gl.TEXTURE_2D, can't be changed after this
    // initialization.
    gl.bindTexture(gl.TEXTURE_2D, texture_object);

    // Set parameters of the texture object.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // Tell gl to flip the orientation of the image on the Y axis. Most
    // images have their origin in the upper-left corner. WebGL expects
    // the origin of an image to be in the lower-left corner.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    // Store in the image in the GPU's texture object.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE,
      my_image);

    return texture_object;
  }

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param transform  {GlMatrix4x4} A 4x4 transformation matrix.
   * @param max_height {number}
   */
  self.render = function (transform, max_height) {

    gl.useProgram(program);

    // Set the transform for all the faces, lines, and points
    gl.uniformMatrix4fv(program.u_Clipping_transform, false, transform);

    // Set the maximum height of the heightmap
    gl.uniform1f(program.u_Maximum_height, max_height);

    // The shader program used by this render require a color and normal
    // vector for each vertex, which points and lines do not define.
    // Therefore this shader program can't render any points or lines in this model.

    if (model_buffers.triangles !== null && model_buffers.triangles.number > 0) {

      let vertices = model_buffers.triangles.vertices;
      let normals = model_buffers.triangles.smooth_normals;
      let texture_coordinates = model_buffers.triangles.textures;

      // Activate the model's triangle vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's triangle color object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, normals.id);

      // Bind the normal vectors VOB to the 'a_Normal' shader variable
      gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Normal);

      // Activate the model's triangle color object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, texture_coordinates.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Texture_coordinate, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Texture_coordinate);

      // Make the "texture unit" 0 be the active texture unit.
      gl.activeTexture(gl.TEXTURE0);

      // Make the texture_object be the active texture. This binds the
      // texture_object to "texture unit" 0.
      gl.bindTexture(gl.TEXTURE_2D, my_texture_object);

      // Tell the shader program to use "texture unit" 0
      gl.uniform1i(program.u_Sampler, 0);

      // Draw all of the triangles
      gl.drawArrays(gl.TRIANGLES, 0, model_buffers.triangles.number * 3);
    }
  };

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // Get the location of the shader program's uniforms and attributes
  program.u_Clipping_transform = gl.getUniformLocation(program, "u_Clipping_transform");
  program.u_Maximum_height     = gl.getUniformLocation(program, "u_Maximum_height");

  program.a_Vertex             = gl.getAttribLocation(program, 'a_Vertex');
  program.a_Normal             = gl.getAttribLocation(program, 'a_Normal');
  program.a_Texture_coordinate = gl.getAttribLocation(program, 'a_Texture_coordinate');

  my_texture_object = _createTexture(model_buffers.triangles.material.textureMap);
};
