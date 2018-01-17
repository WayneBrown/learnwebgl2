/**
 * simple_model_render.js, By Wayne Brown, Fall 2017
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
 * Given a model description, create the buffer objects needed to render
 * the model. This is very closely tied to the shader implementations.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param uniform_program {object} Shader program using one color.
 * @param color_program {object} Shader program using a color attribute.
 * @param model {ModelToGpu} The model GPU object buffer info.
 * @param out {ConsoleMessages} Can display messages to the web page.
 */
window.SimpleModelRender2 = function (gl, uniform_program, color_program,
                                      model, out) {

  let self = this;

  let edge_color = new Float32Array( [0.0, 0.0, 0.0, 1.0]); // BLACK

  let number_renders = 0;
  let total_rending_time = 0;
  self.average_render_time = 0;

  /**----------------------------------------------------------------------
   * Delete the Buffer Objects associated with this model.
   * @param gl Object The WebGL state and API.
   */
  self.delete = function (gl) {
    if (model.number_triangles > 0) {
      gl.deleteBuffer(model.triangles_vertex_buffer_id);
      gl.deleteBuffer(model.triangles_color_buffer_id);
    }
  };

  /**----------------------------------------------------------------------
   * Render the model.
   * @param transform 4x4Matrix The transformation to apply to the model vertices.
   * @param draw_edges {boolean} If true, render the edges of the triangles.
   * @param wireframe {boolean} If true, render the edges of the triangles.
   */
  self.render = function (transform, draw_edges, wireframe) {

    let start_time, end_time;

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // 1. Render the triangles:

    if (! wireframe) {
      gl.useProgram(color_program);

      start_time = performance.now();

      // Set the transform for all the triangle vertices
      gl.uniformMatrix4fv(color_program.u_Transform_location, false, transform);

      // Activate and attach the model's vertex Buffer Object
      gl.bindBuffer(gl.ARRAY_BUFFER, model.triangles_vertex_buffer_id);
      gl.vertexAttribPointer(color_program.a_Vertex_location, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(color_program.a_Vertex_location);

      // Activate and attach the model's color Buffer Object
      gl.bindBuffer(gl.ARRAY_BUFFER, model.triangles_color_buffer_id);
      gl.vertexAttribPointer(color_program.a_Color_location, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(color_program.a_Color_location);

      // Draw all the triangles
      let number_vertices = model.number_triangles * 3;
      gl.drawArrays(gl.TRIANGLES, 0, number_vertices);

      end_time = performance.now();
      number_renders += 1;
      total_rending_time += end_time - start_time;
      self.average_render_time = total_rending_time / number_renders;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // 2. Render the edges around each triangle:

    if (wireframe || draw_edges) {
      gl.useProgram(uniform_program);

      // Set the transform for all the triangle vertices
      gl.uniformMatrix4fv(uniform_program.u_Transform_location, false, transform);

      // Set the color for all of the edges
      gl.uniform4fv(uniform_program.u_Color_location, edge_color);

      // Activate and attach the model's vertex Buffer Object
      gl.bindBuffer(gl.ARRAY_BUFFER, model.triangles_vertex_buffer_id);
      gl.vertexAttribPointer(uniform_program.a_Vertex_location, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(uniform_program.a_Vertex_location);

      // Draw a line_loop around each of the triangles
      for (let j = 0, start = 0; j < model.number_triangles; j += 1, start += 3) {
        gl.drawArrays(gl.LINE_LOOP, start, 3);
      }
    }

  };

  //-----------------------------------------------------------------------
  // Constructor: Get the location of the shader variables
  uniform_program.u_Transform_location = gl.getUniformLocation(uniform_program, 'u_Transform');
  uniform_program.u_Color_location     = gl.getUniformLocation(uniform_program, 'u_Color');

  uniform_program.a_Vertex_location    = gl.getAttribLocation(uniform_program, 'a_Vertex');

  // Get the location of the shader variables for the color_program
  color_program.u_Transform_location = gl.getUniformLocation(color_program, 'u_Transform');

  color_program.a_Vertex_location    = gl.getAttribLocation(color_program, 'a_Vertex');
  color_program.a_Color_location     = gl.getAttribLocation(color_program, 'a_Color');

};
