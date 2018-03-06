/**
 * render_uniform_color.js, By Wayne Brown, Fall 2017
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
 * @param out - {ConsoleMessages} can display messages to the web page
 * @constructor
 */
window.RenderUniformColor = function (gl, program, model_buffers, out) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;
  self.model_buffers = model_buffers;

  /**----------------------------------------------------------------------
   * Render the individual points in the model.
   * @private
   */
  function _renderPoints() {
    if (model_buffers.points !== null && model_buffers.points.number > 0) {

      let vertices = model_buffers.points.vertices;

      // Activate the model's vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Draw all of the lines
      gl.drawArrays(gl.POINTS, 0, vertices.number_values/3);
    }
  }

  /**----------------------------------------------------------------------
   * Render the individual lines in the model.
   * @private
   */
  function _renderLines() {
    if (model_buffers.lines !== null && model_buffers.lines.number > 0) {

      let vertices = model_buffers.lines.vertices;

      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, vertices.number * 2);
    }
  }

  /**----------------------------------------------------------------------
   * Render the triangles in the model.
   * @private
   */
  function _renderTriangles() {
    if (model_buffers.triangles !== null && model_buffers.triangles.number > 0) {

      let vertices = model_buffers.triangles.vertices;

      // Activate the model's triangle vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Draw all of the triangles
      gl.drawArrays(gl.TRIANGLES, 0, model_buffers.triangles.number * 3);
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
   * @param transform {GlMatrix4x4} - A 4x4 transformation matrix.
   * @param color {Float32Array} an RGBA color value
   * @param wireframe {boolean} if true, render only the wireframe model
   */
  self.render = function (transform, color, wireframe = false) {

    gl.useProgram(program);

    // Set the transform for all the faces, lines, and points
    gl.uniformMatrix4fv(program.u_Transform, false, transform);
    gl.uniform4fv(program.u_Color, color);

    _renderPoints();
    _renderLines();
    if (wireframe && model_buffers.wireframe !== null) {
      _renderWireframe();
    } else {
      _renderTriangles();
    }
  };

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // Get the location of the shader program's uniforms and attributes
  program.u_Transform = gl.getUniformLocation(program, "u_Transform");
  program.u_Color     = gl.getUniformLocation(program, 'u_Color');

  program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');
};
