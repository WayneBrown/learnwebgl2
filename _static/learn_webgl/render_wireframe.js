/**
 * render_wireframe.js, By Wayne Brown, Spring 2018
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
 * A class to render models using a single color and the wireframe lines.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param program {WebGLProgram} a shader program
 * @param model_buffers {ModelArraysGPU} GPU object buffers that hold the model data
 * @param out {ConsoleMessages} display messages to the web page
 * @constructor
 */
window.RenderWireframe = function (gl, program, model_buffers, out) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // IMPORTANT: Assumes these shader programs:
  //            uniform_color.vert
  //            uniform_color.frag

  // Get the location of the shader program's uniforms and attributes
  program.u_Transform = gl.getUniformLocation(program, "u_Transform");
  program.u_Color     = gl.getUniformLocation(program, 'u_Color');

  program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param transform {Float32Array} - A 4x4 transformation matrix.
   * @param color {Float32Array} - RGBA color value.
   */
  self.render = function (transform, color) {

    if (model_buffers.wireframe !== null && model_buffers.wireframe.vertices.id !== null) {
      gl.useProgram(program);

      gl.uniformMatrix4fv(program.u_Transform, false, transform);
      gl.uniform4fv(program.u_Color, color);

      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, model_buffers.wireframe.vertices.id);
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, model_buffers.wireframe.number);
    }
  };

};
