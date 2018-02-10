/**
 * render_bump_map.js, By Wayne Brown, Fall 2017
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

/**------------------------------------------------------------------------
 * A class to render models using a diffuse lighting model.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param program {WebGLProgram} a shader program
 * @param model_buffers {ModelArraysGPU} GPU object buffers that hold the model data
 * @param model_data {ModelArrays}
 * @param out {ConsoleMessages} display messages to the web page
 * @constructor
 */
window.RenderBumpMap = function (gl, program, model_buffers, model_data, out) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;

  let my_texture_object = null;

  // Buffers for the extra data need by each vertex to calculate a local
  // coordinate system.
  let p2_buffer = null;
  let p3_buffer = null;
  let uv2_buffer = null;
  let uv3_buffer = null;

  /**----------------------------------------------------------------------
   * Create a GPU buffer object and transfer data into the buffer.
   * @param data {Float32Array} the array of data to be put into the buffer object.
   * @param components_per_vertex {number}
   * @private
   */
  function _createBufferObject(data, components_per_vertex) {
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

    buffer_info = new ObjectBufferInfo();
    buffer_info.id = buffer_id;
    buffer_info.number_values = data.length;
    buffer_info.components_per_vertex = components_per_vertex;

    return buffer_info;
  }

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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

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
   * Render the individual points in the model.
   * @private
   */
  function _renderPoints() {
    if (model_buffers.points !== null && model_buffers.points.number > 0) {

      let vertices = model_buffers.points.vertices;
      let colors = model_buffers.points.colors;

      // Activate the model's vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's point color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, colors.id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Color);

      // Draw all of the lines
      gl.drawArrays(gl.POINTS, 0, vertices.number_values / 3);
    }
  }

  /**----------------------------------------------------------------------
   * Render the individual lines in the model.
   * @private
   */
  function _renderLines() {
    if (model_buffers.lines !== null && model_buffers.lines.number > 0) {

      let vertices = model_buffers.lines.vertices;
      let colors = model_buffers.lines.colors;

      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's line color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, colors.id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Color);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, vertices.number_values / 3);
    }
  }

  /**----------------------------------------------------------------------
   * Render the triangles in the model.
   * @private
   */
  function _renderTriangles() {
    if (model_buffers.triangles !== null && model_buffers.triangles.number > 0) {

      let vertices = model_buffers.triangles.vertices;
      let normals = model_buffers.triangles.smooth_normals;
      let colors = model_buffers.triangles.colors;
      let texture_coordinates = model_buffers.triangles.textures;

      // Activate the model's triangle vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's normal vector object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, normals.id);
      gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Normal);

      // Activate the model's triangle color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, colors.id);
      gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Color);

      // Activate the model's triangle color object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, texture_coordinates.id);
      gl.vertexAttribPointer(program.a_Texture_coordinate, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Texture_coordinate);

      // Make the "texture unit" 0 be the active texture unit.
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, my_texture_object);
      gl.uniform1i(program.u_Texture_unit, 0);

      // Activate the extra data used to calculate the local coordinate systems
      gl.bindBuffer(gl.ARRAY_BUFFER, p2_buffer.id);
      gl.vertexAttribPointer(program.a_P2, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_P2);

      gl.bindBuffer(gl.ARRAY_BUFFER, p3_buffer.id);
      gl.vertexAttribPointer(program.a_P3, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_P3);

      gl.bindBuffer(gl.ARRAY_BUFFER, uv2_buffer.id);
      gl.vertexAttribPointer(program.a_Uv2, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Uv2);

      gl.bindBuffer(gl.ARRAY_BUFFER, uv3_buffer.id);
      gl.vertexAttribPointer(program.a_Uv3, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Uv3);

      // Draw all of the triangles
      gl.drawArrays(gl.TRIANGLES, 0, vertices.number_values / 3);
    }
  }

  /**----------------------------------------------------------------------
   * Render the individual lines in the model.
   * @private
   */
  function _renderWireframe() {
    if (model_buffers.wireframe !== null && model_buffers.wireframe.vertices.id !== null) {

      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, model_buffers.wireframe.vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, model_buffers.wireframe.number);
    }
  }

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param clipping_space {Float32Array} - A 4x4 transformation matrix.
   * @param camera_space {Float32Array} - A 4x4 transformation matrix.
   * @param wireframe {boolean} - it true, display in wireframe
   */
  self.render = function (clipping_space, camera_space, wireframe = false) {

    gl.useProgram(program);

    gl.uniformMatrix4fv(program.u_To_clipping_space, false, clipping_space);
    gl.uniformMatrix4fv(program.u_To_camera_space, false, camera_space);

    gl.uniform1f(program.u_Shininess, self.shininess);

    _renderPoints();
    _renderLines();
    if (wireframe && model_buffers.wireframe !== null) {
      _renderWireframe();
    } else {
      _renderTriangles();
    }
  };

  //-----------------------------------------------------------------------
  // Create vertex and texture coordinate buffer objects for the shaper
  // programs to calculate a local coordinate system for each triangle.
  function _createBumpMapData(model_data) {
    let vertices = model_data.triangles.vertices;
    let texCoords = model_data.triangles.textures;
    let p2 = new Float32Array(vertices.length);
    let p3 = new Float32Array(vertices.length);
    let uv2 = new Float32Array(texCoords.length);
    let uv3 = new Float32Array(texCoords.length);

    for (let n=0, m=0; n < vertices.length; n+=9, m+=6) {
      // For the 1st vertex in the triangle
      p2[n]   = vertices[n+3];
      p2[n+1] = vertices[n+4];
      p2[n+2] = vertices[n+5];

      p3[n]   = vertices[n+6];
      p3[n+1] = vertices[n+7];
      p3[n+2] = vertices[n+8];

      uv2[m]   = texCoords[m+2];
      uv2[m+1] = texCoords[m+3];

      uv3[m]   = texCoords[m+4];
      uv3[m+1] = texCoords[m+5];

      // For the 2nd vertex in the triangle
      p2[n+3] = vertices[n+6];
      p2[n+4] = vertices[n+7];
      p2[n+5] = vertices[n+8];

      p3[n+3] = vertices[n];
      p3[n+4] = vertices[n+1];
      p3[n+5] = vertices[n+2];

      uv2[m+2] = texCoords[m+4];
      uv2[m+3] = texCoords[m+5];

      uv3[m+2] = texCoords[m];
      uv3[m+3] = texCoords[m+1];

      // For the 3rd vertex in the triangle
      p2[n+6] = vertices[n];
      p2[n+7] = vertices[n+1];
      p2[n+8] = vertices[n+2];

      p3[n+6] = vertices[n+3];
      p3[n+7] = vertices[n+4];
      p3[n+8] = vertices[n+5];

      uv2[m+4] = texCoords[m];
      uv2[m+5] = texCoords[m+1];

      uv3[m+4] = texCoords[m+2];
      uv3[m+5] = texCoords[m+3];
    }
    p2_buffer = _createBufferObject(p2, 3);
    p3_buffer = _createBufferObject(p3, 3);
    uv2_buffer = _createBufferObject(uv2, 2);
    uv3_buffer = _createBufferObject(uv3, 2);
  }

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // Set the specular shininess exponent
  self.shininess = 30.0; // default value
  if (model_buffers && model_buffers.triangles && model_buffers.triangles.material) {
    self.shininess = model_buffers.triangles.material.Ns; // specular exponent
  }

  // Get the location of the shader program's uniforms and attributes
  program.u_To_clipping_space   = gl.getUniformLocation(program, "u_To_clipping_space");
  program.u_To_camera_space     = gl.getUniformLocation(program, "u_To_camera_space");
  program.u_Light_position      = gl.getUniformLocation(program, "u_Light_position");
  program.u_Light_color         = gl.getUniformLocation(program, "u_Light_color");
  program.u_Shininess           = gl.getUniformLocation(program, "u_Shininess");
  program.u_Ambient_intensities = gl.getUniformLocation(program, "u_Ambient_intensities");
  program.u_Texture_unit        = gl.getUniformLocation(program, "u_Texture_unit");
  program.u_Image_size          = gl.getUniformLocation(program, "u_Image_size");

  program.u_Render_mode = gl.getUniformLocation(program, "u_Render_mode");

  program.a_Vertex             = gl.getAttribLocation(program, 'a_Vertex');
  program.a_Normal             = gl.getAttribLocation(program, 'a_Normal');
  program.a_Color              = gl.getAttribLocation(program, 'a_Color');
  program.a_Texture_coordinate = gl.getAttribLocation(program, 'a_Texture_coordinate');

  program.a_P2   = gl.getAttribLocation(program, 'a_P2');
  program.a_P3   = gl.getAttribLocation(program, 'a_P3');
  program.a_Uv2  = gl.getAttribLocation(program, 'a_Uv2');
  program.a_Uv3  = gl.getAttribLocation(program, 'a_Uv3');

  _createBumpMapData(model_data);

  let textureMap = model_buffers.triangles.material.bump_map;
  my_texture_object = _createTexture(textureMap);

  // Transfer the bump map image size to the shader program
  let texture_map_size = [textureMap.width, textureMap.height];
  gl.uniform2fv(program.u_Image_size, texture_map_size);
};
