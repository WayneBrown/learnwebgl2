/**
 * render_reflected_colors.js, By Wayne Brown, Fall 2017
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
 * @param which_color_model {string} name of color model
 * @param out {ConsoleMessages} display messages to the web page
 * @constructor
 */
window.RenderReflectedColors = function (gl, program, model_buffers, which_color_model, out) {

  let self = this;

  // To delete this rendering context, call the model_buffers delete function.
  self.delete = model_buffers.delete;

  //-----------------------------------------------------------------------
  // One-time pre-processing tasks:

  // Create various color models
  self.color_models = {
    'Brass': [ [0.329412, 0.223529, 0.027451, 1.0], // ambient color
               [0.780392, 0.568627, 0.113725, 1.0], // diffuse color
               [0.992157, 0.941176, 0.807843, 1.0], // specular color
                27.8974                             // shininess
             ],
    'Bronze': [ [0.2125,   0.1275,   0.054,    1.0], // ambient color
                [0.714,    0.4284,   0.18144,  1.0], // diffuse color
                [0.393548, 0.271906, 0.166721, 1.0], // specular color
                 25.6                                // shininess
              ],
    'Gold': [ [0.24725,  0.1995,   0.0745,   1.0], // ambient color
              [0.75164,  0.60648,  0.22648,  1.0], // diffuse color
              [0.628281, 0.555802, 0.366065, 1.0], // specular color
               51.2                                // shininess
            ],
    'Jade': [ [0.135,    0.2225,   0.1575,   0.95], // ambient color
              [0.54,     0.89,     0.63,     0.95], // diffuse color
              [0.316228, 0.316228, 0.316228, 0.95], // specular color
               12.8                                 // shininess
            ],
    'Black_Plastic': [ [0.0,  0.0,  0.0,  1.0], // ambient color
                       [0.01, 0.01, 0.01, 1.0], // diffuse color
                       [0.50, 0.50, 0.50, 1.0], // specular color
                        32                      // shininess
                     ]
  };

  self.color_model = self.color_models[which_color_model];

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
  program.u_Ambient_intensities = gl.getUniformLocation(program, "u_Ambient_intensities");

  program.u_Model_ambient   = gl.getUniformLocation(program, "u_Model_ambient");
  program.u_Model_diffuse   = gl.getUniformLocation(program, "u_Model_diffuse");
  program.u_Model_specular  = gl.getUniformLocation(program, "u_Model_specular");
  program.u_Model_shininess = gl.getUniformLocation(program, "u_Model_shininess");

  program.a_Vertex  = gl.getAttribLocation(program, 'a_Vertex');
  program.a_Normal  = gl.getAttribLocation(program, 'a_Normal');
  program.a_Color   = gl.getAttribLocation(program, 'a_Color');

  /**----------------------------------------------------------------------
   * Render the individual points in the model.
   * @private
   */
  self.changeColorModel = function (which_color_model) {
    self.color_model = self.color_models[which_color_model];
  };

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
      let normals = model_buffers.triangles.flat_normals;

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
   * Render the model under the specified transformation.
   * @param clipping_space {Float32Array} - A 4x4 transformation matrix.
   * @param camera_space {Float32Array} - A 4x4 transformation matrix.
   */
  self.render = function (clipping_space, camera_space) {

    gl.useProgram(program);

    gl.uniformMatrix4fv(program.u_To_clipping_space, false, clipping_space);
    gl.uniformMatrix4fv(program.u_To_camera_space, false, camera_space);

    gl.uniform4fv(program.u_Model_ambient,  self.color_model[0]);
    gl.uniform4fv(program.u_Model_diffuse,  self.color_model[1]);
    gl.uniform4fv(program.u_Model_specular, self.color_model[2]);
    gl.uniform1f(program.u_Model_shininess, self.color_model[3]);

    _renderPoints();
    _renderLines();
    _renderTriangles();
  };

};
