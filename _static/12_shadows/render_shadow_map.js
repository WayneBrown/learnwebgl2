/**
 * render_shadow_map.js, By Wayne Brown, Spring 2018
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

//-------------------------------------------------------------------------
/**
 * Render a shadow map.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param program {WebGLProgram} a shader program
 * @param out {ConsoleMessages} display messages to the web page
 * @constructor
 */
window.RenderShadowMap = function (gl, program, out) {

// Uses the shader_display_texture.vert and shader_display_texture.frag
// shader programs.

  let self = this;

  // Variables to remember so the model can be rendered.
  let triangles_vertex_buffer_id = null;

  //-----------------------------------------------------------------------
  function _createBufferObject(data) {
    // Create a buffer object
    let buffer_id;

    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object');
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

  //-----------------------------------------------------------------------
  /**
   * Create the buffer objects needed and upload the data to the GPU
   * @private
   */
  function _buildBufferObjects() {
    // Define two triangles that cover the default clipping space.
    let vertices = new Float32Array([-1,+1, -1,-1, 1,-1, -1,+1, 1,-1, 1,1]);
    triangles_vertex_buffer_id = _createBufferObject(vertices);
  }

  //-----------------------------------------------------------------------
  /**
   * Get the location of the shader variables in the shader program.
   * @private
   */
  function _getLocationOfShaderVariables() {
    // Get the location of the shader variables
    program.u_Sampler     = gl.getUniformLocation(program, 'u_Sampler');
    program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');
  }

  //-----------------------------------------------------------------------
  // These one-time tasks set up the rendering of the models.
  _buildBufferObjects();
  _getLocationOfShaderVariables();

  //-----------------------------------------------------------------------
  /**
   * Delete the Buffer Objects associated with this model.
   */
  self.delete = function () {
    gl.deleteBuffer(triangles_vertex_buffer_id);
  };

  //-----------------------------------------------------------------------
  /**
   * Render the model.
   */
  self.render = function (texture_object) {

    gl.useProgram(program);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Activate the model's triangle vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

    // Bind the vertices VOB to the 'a_Vertex' shader variable
    gl.vertexAttribPointer(program.a_Vertex, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Vertex);

    // Makes the "texture unit" 0 be the active texture unit.
    gl.activeTexture(gl.TEXTURE0);

    // Make the texture_object be the active texture. This binds the
    // texture_object to "texture unit" 0.
    gl.bindTexture(gl.TEXTURE_2D, texture_object);

    // Tell the shader program to use "texture unit" 0
    gl.uniform1i(program.u_Sampler, 0);

    // Draw all of the triangles
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 2 triangles, 6 vertices
  };

};
