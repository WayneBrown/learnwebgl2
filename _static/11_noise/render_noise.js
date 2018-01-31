/**
 * render_checkerboard_design.js, By Wayne Brown, Fall 2017
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
 * @param scene {CheckerboardDesignScene}
 * @constructor
 */
window.RenderNoise = function (gl, program, model_buffers, out, scene) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;

  /**----------------------------------------------------------------------
   * Render the model under the specified transformation.
   * @param transform        {GlMatrix4x4} A 4x4 transformation matrix.
   */
  self.render = function (transform) {

    gl.useProgram(program);

    // Set the transform for all the faces, lines, and points
    gl.uniformMatrix4fv(program.u_Clipping_transform, false, transform);

    gl.uniform2fv(program.u_Translate_texture, scene.translate_texture);
    gl.uniform1f (program.u_Scale_texure, scene.scale_texture);
    gl.uniform4fv(program.pParam, scene.p_param);

    // The shader program used by this render require a color and normal
    // vector for each vertex, which points and lines do not define.
    // Therefore this shader program can't render any points or lines in this model.

    if (model_buffers.triangles !== null && model_buffers.triangles.number > 0) {

      let vertices = model_buffers.triangles.vertices;
      let texture_coordinates = model_buffers.triangles.textures;

      // Activate the model's triangle vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's triangle color object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, texture_coordinates.id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      gl.vertexAttribPointer(program.a_Texture_coordinate, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Texture_coordinate);

      // Draw all of the triangles
      gl.drawArrays(gl.TRIANGLES, 0, model_buffers.triangles.number * 3);
    }
  };

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // Get the location of the shader program's uniforms and attributes
  program.u_Clipping_transform = gl.getUniformLocation(program, "u_Clipping_transform");
  program.u_Translate_texture  = gl.getUniformLocation(program, "u_Translate_texture");
  program.u_Scale_texure       = gl.getUniformLocation(program, "u_Scale_texure");
  program.pParam               = gl.getUniformLocation(program, "pParam");

  program.a_Vertex             = gl.getAttribLocation(program, 'a_Vertex');
  program.a_Texture_coordinate = gl.getAttribLocation(program, 'a_Texture_coordinate');

};
