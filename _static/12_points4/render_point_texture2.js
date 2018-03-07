/**
 * render_point_texture2.js, By Wayne Brown, Spring 2018
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
 * @param image {Image} the image for texture mapping
 * @constructor
 */
window.RenderPointTexture2 = function (gl, program, model_buffers, out, image) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;

  let my_texture_object = null;
  let texture_map_file_name = "_static/12_point3/explosion_seamless.png";
  let texture_delta = null;
  let texture_coordinates_buffer_id = null;

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param transform        {GlMatrix4x4} A 4x4 transformation matrix.
   */
  self.render = function (transform) {

    gl.useProgram(program);

    // Set the transform for all the faces, lines, and points
    gl.uniformMatrix4fv(program.u_Transform, false, transform);

    // Note: program.u_Texture_delta was copied to the shader when
    // the texture map image was created. Line 178.

    // The shader program used by this render require a color and normal
    // vector for each vertex, which points and lines do not define.
    // Therefore this shader program can't render any points or lines in this model.

    if (my_texture_object !== null &&
        model_buffers.points !== null &&
        model_buffers.points.number > 0) {

      let vertices = model_buffers.points.vertices;

      // Activate the model's points object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's points texture coordinates object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, texture_coordinates_buffer_id);
      gl.vertexAttribPointer(program.a_Texture_coordinate, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Texture_coordinate);

      // Make the "texture unit" 0 be the active texture unit.
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, my_texture_object);
      gl.uniform1i(program.u_Texture_unit, 0);

      // Draw all of the points
      gl.drawArrays(gl.POINTS, 0, vertices.number_values/3);
    }
  };

  /**----------------------------------------------------------------------
   * Create a GPU buffer object and transfer data into the buffer.
   * @param data {Float32Array} the array of data to be put into the buffer object.
   * @private
   */
  function _createBufferObject(data) {
    let buffer_id, buffer_info;

    // Don't create a gpu buffer object if there is no data.
    if (data === null) return null;

    // Create a buffer object
    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object for ' + model_arrays.name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

  /**----------------------------------------------------------------------
   * Create random texture coordinates for a set of points.
   * @private
   */
  function _assignTextureCoordinates () {
    let coords = new Float32Array(model_buffers.points.number * 2);

    for (let j=0; j<model_buffers.points.number*2; j += 2) {
      coords[j]   = Math.random();
      coords[j+1] = Math.random();
    }

    return _createBufferObject(coords);
  }

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
  program.u_Transform     = gl.getUniformLocation(program, "u_Transform");
  program.u_Size          = gl.getUniformLocation(program, "u_Size");
  program.u_Texture_unit  = gl.getUniformLocation(program, "u_Texture_unit");
  program.u_Texture_delta = gl.getUniformLocation(program, "u_Texture_delta");

  program.a_Vertex             = gl.getAttribLocation(program, 'a_Vertex');
  program.a_Texture_coordinate = gl.getAttribLocation(program, 'a_Texture_coordinate');

  texture_coordinates_buffer_id = _assignTextureCoordinates();

  _createTextureMap(image);
  texture_delta = [ (1.0 / (image.width - 1.0)),
                    (1.0 / (image.height - 1.0))];
  gl.uniform2fv(program.u_Texture_delta, texture_delta);

};
