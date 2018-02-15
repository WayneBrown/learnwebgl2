/**
 * render_uniform_color_lighting.js, By Wayne Brown, Spring 2018
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
 * @param out {ConsoleMessages} display messages to the web page
 * @constructor
 */
window.RenderUniformColorWithLighting = function (gl, program, model_buffers, out) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;

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
  program.u_Color               = gl.getUniformLocation(program, 'u_Color');

  program.a_Vertex  = gl.getAttribLocation(program, 'a_Vertex');
  program.a_Normal  = gl.getAttribLocation(program, 'a_Normal');

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

      // Activate the model's triangle vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's normal vector object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, normals.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Normal);

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
   * @param color {Float32Array} - RGBA color value.
   * @param wireframe {boolean} - it true, display in wireframe
   */
  self.render = function (clipping_space, camera_space, color, wireframe = false) {

    gl.useProgram(program);

    gl.uniformMatrix4fv(program.u_To_clipping_space, false, clipping_space);
    gl.uniformMatrix4fv(program.u_To_camera_space, false, camera_space);

    gl.uniform1f(program.u_Shininess, self.shininess);
    gl.uniform4fv(program.u_Color, color);

    _renderPoints();
    _renderLines();
    if (wireframe && model_buffers.wireframe !== null) {
      _renderWireframe();
    } else {
      _renderTriangles();
    }
  };

};
