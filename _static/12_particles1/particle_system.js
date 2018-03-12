/**
 * partial_system.js, By Wayne Brown, Spring 2016
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
 * A particle system.
 * @param max_particles {Number} Number Maximum number of particles.
 * @param center {GlPoint3} The center location of the particle system.
 * @param gl {WebGLRenderingContext} WebGL context
 * @param program {object} compiled shader program
 * @param texture_map_image {img}
 * @param out {ConsoleMessages}
 * @constructor
 */
window.ParticleSystem = function (max_particles, center, gl, program,
                                  texture_map_image, out) {
  let self = this;

  // Particles are defined by some data that is needed for rendering,
  // and other data needed to update the particles on each frame.
  // The rendering data must be copied to GPU buffer objects before
  // each render.

  // Rendering data for particles:
  let location            = new Float32Array(max_particles * 3);
  let size                = new Float32Array(max_particles);
  let texture_coordinates = new Float32Array(max_particles * 2);
  let color_alpha         = new Float32Array(max_particles);

  // GPU buffers for the rendering data.
  let location_buffer_id = null;
  let size_buffer_id = null;
  let texture_coordinates_buffer_id = null;
  let my_texture_object = null;
  let color_alpha_buffer_id = null;
  let gpu_needs_updating = false;

  // Data to update and manage the particles:
  let direction = new Array(max_particles);
  let speed     = new Array(max_particles);
  let alive     = new Array(max_particles);
  let lifetime  = new Array(max_particles);

  // Indexes for min and max ranges.
  const MIN  = 0;
  const MAX  = 1;

  // General data about the particle system
  let number_particles = 0;
  let number_initial_particles = Math.round(max_particles * 0.2);

  // Ranges for generating new properties of particles.
  self.particle_limit = max_particles;
  self.new_particles_range = [Math.round(max_particles * 0.05),
                              Math.round(max_particles * 0.1)];
  self.particle_speed_range = [0.01, 0.1];
  self.particle_lifetime_range = [15, 30];
  self.particle_size_range = [4, 4];
  self.sort_before_rendering = true;

  // Scratch variables for calculations.
  let matrix = new GlMatrix4x4();
  let P4 = new GlPoint4();
  let V3 = new GlVector3();
  let go_to = V3.create();
  let v = P4.create();
  let v2 = P4.create();

  // For sorting particles:
  let sort_indexes = null;
  let sorted_location            = new Float32Array(max_particles * 3);
  let sorted_size                = new Float32Array(max_particles);
  let sorted_texture_coordinates = new Float32Array(max_particles * 2);
  let sorted_color_alpha         = new Float32Array(max_particles);

  /**----------------------------------------------------------------------
   * Compare to elements of the sort_indexes for quicksort algorithm
   * @param a {array} one element of the sort_indexes array, [index, distance]
   * @param b {array} one element of the sort_indexes array, [index, distance]
   * @returns {number} result of comparision of a and b
   * @private
   */
  function _compare(a, b) {
    if (a[1] < b[1]) {
      return -1;
    } else if (a[1] > b[1]) {
      return 1;
    }
    return 0; // a must be equal to b
  }

  /**----------------------------------------------------------------------
   * Initialize the sort_indexes array for sorting the particles.
   * This array is re-sorted before each render.
   * @private
   */
  function _initializeSorting() {
    if (sort_indexes === null) {
      sort_indexes = new Array(max_particles);
    }
    for (let j = 0; j < max_particles; j += 1) {
      sort_indexes[j] = [j, 0.0];  // [index to point, distance from camera]
    }
  }

  /**----------------------------------------------------------------------
   * Update the distance of each particle from the camera.
   * @param camera_space {Float32Array} The transformation to apply to the model vertices.
   */
  function _updateDistanceFromCamera (camera_space) {
    let k;

    for (let j = 0; j < number_particles; j += 1) {
      k = j * 3;
      v[0] = location[k];
      v[1] = location[k + 1];
      v[2] = location[k + 2];
      matrix.multiplyP4(v2, camera_space, v);

      // Remember this particle's distance from the camera
      sort_indexes[j][1] = v2[2];
    }
  }

  /**----------------------------------------------------------------------
   * Update the GPU object buffer that holds the model's vertices
   * @private
   */
  function _reorderData () {
    let n, k, index;

    for (let j = 0; j < number_particles; j += 1) {
      index = sort_indexes[j][0];

      n = j * 3;
      k = index * 3;
      sorted_location[n]   = location[k];
      sorted_location[n+1] = location[k+1];
      sorted_location[n+2] = location[k+2];

      sorted_size[j] = size[index];

      n = j * 2;
      k = index * 2;
      sorted_texture_coordinates[n]   = texture_coordinates[k];
      sorted_texture_coordinates[n+1] = texture_coordinates[k+1];

      sorted_color_alpha[j] = color_alpha[index];
    }
  }

  /**----------------------------------------------------------------------
   * Sort the points of a particle system, back to front, based on their distance
   * from the camera.
   * @param camera_space {Float32Array} The transformation to apply to the particles.
   */
  function _sortParticles (camera_space) {

    _initializeSorting();

    _updateDistanceFromCamera(camera_space);

    sort_indexes.sort(_compare);  // JavaScript quicksort

    _reorderData();

    // Copy the new data to the GPU.
    _updateBufferObject(location_buffer_id,            sorted_location);
    _updateBufferObject(size_buffer_id,                sorted_size);
    _updateBufferObject(texture_coordinates_buffer_id, sorted_texture_coordinates);
    _updateBufferObject(color_alpha_buffer_id,         sorted_color_alpha);
  }

  /**----------------------------------------------------------------------
   * Create a GPU buffer object and transfer data into the buffer.
   * @param data {Float32Array} the array of data to be put into the buffer object.
   * @private
   */
  function _createBufferObject(data) {
    let buffer_id;

    // Don't create a gpu buffer object if there is no data.
    if (data === null) return null;

    // Create a buffer object
    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create a buffer object');
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

    return buffer_id;
  }

  /**----------------------------------------------------------------------
   * Create a GPU buffer object and transfer data into the buffer.
   * @param buffer_id {object}
   * @param data {Float32Array} the array of data to be put into the buffer object.
   * @private
   */
  function _updateBufferObject(buffer_id, data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  }

  /**----------------------------------------------------------------------
   * Return a random float between min and max.
   * @param min {number} the smallest value in the random range
   * @param max {number} the largest value in the random range
   * @returns {number} a random float
   */
  function _randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**----------------------------------------------------------------------
   * Return a random float between min and max.
   * @param min {number} the smallest value in the random range
   * @param max {number} the largest value in the random range
   * @returns {number} a random float
   */
  function _randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**----------------------------------------------------------------------*/
  function _initializeParticle(index) {

    // Particle data stored in GPU:
    let j = index * 3;
    location[j++] = center[0];
    location[j++] = center[1];
    location[j  ] = center[2];

    size[index] = _randomInt(self.particle_size_range[MIN],
                             self.particle_size_range[MAX]);

    j = index * 2;
    texture_coordinates[j++] = Math.random();
    texture_coordinates[j  ] = Math.random();

    color_alpha[index] = 1.0;

    // Data used to update a particle:
    if (typeof direction[index] === 'undefined') {
      direction[index] = V3.create(_randomFloat(-1, 1),
                                   _randomFloat(-1, 1),
                                   _randomFloat(-1, 1));
    } else {
      direction[index][0] = _randomFloat(-1, 1);
      direction[index][1] = _randomFloat(-1, 1);
      direction[index][2] = _randomFloat(-1, 1);
    }
    V3.normalize(direction[index]);
    speed[index] = _randomFloat(self.particle_speed_range[MIN],
                                self.particle_speed_range[MAX]);
    lifetime[index] = _randomInt(self.particle_lifetime_range[MIN],
                                 self.particle_lifetime_range[MAX]);
    alive[index] = 0;
  }

  /**----------------------------------------------------------------------*/
  function _deleteParticle(delete_index) {
    let last = number_particles-1;

    // Copy the last particle in the system to the delete_index position.
    let k = delete_index * 3;
    let m = last * 3;
    location[k++] = location[m++];
    location[k++] = location[m++];
    location[k]   = location[m];

    size[delete_index] = size[last];

    k = delete_index * 2;
    m = last * 2;
    texture_coordinates[k++] = texture_coordinates[m++];
    texture_coordinates[k]   = texture_coordinates[m];

    color_alpha[delete_index] = color_alpha[last];

    direction[delete_index][0] = direction[last][0];
    direction[delete_index][1] = direction[last][1];
    direction[delete_index][2] = direction[last][2];
    speed[delete_index]     = speed[last];
    alive[delete_index]     = alive[last];
    lifetime[delete_index]  = lifetime[last];

    number_particles--;
  }

  /**----------------------------------------------------------------------*/
  function _updateParticle(index) {
    let k;

    // Move the location of the particle based on its direction and speed.
    V3.scale(go_to, direction[index], speed[index]);
    k = index * 3;
    location[k++] += go_to[0];
    location[k++] += go_to[1];
    location[k  ] += go_to[2];

    // Move the location of the texture coordinates using the direction vector.
    k = index * 2;
    texture_coordinates[k++] += direction[index][0] * speed[index] * 0.03;
    texture_coordinates[k]   += direction[index][1] * speed[index] * 0.03;

    // One less frame to be alive.
    alive[index] += 1;

    // The alpha value decreases to 0.0 as the particle dies.
    let percent_alive;
    if (lifetime[index] > 0) {
      percent_alive = alive[index] / lifetime[index];
    } else {
      percent_alive = 1.0;
    }
    color_alpha[index] = Math.cos(percent_alive * Math.PI*0.5);
  }

  /**----------------------------------------------------------------------*/
  function _create() {

    self.reset();

    // Create the rendering buffers.
    location_buffer_id            = _createBufferObject(location);
    size_buffer_id                = _createBufferObject(size);
    texture_coordinates_buffer_id = _createBufferObject(texture_coordinates);
    color_alpha_buffer_id         = _createBufferObject(color_alpha);
  }

  /**----------------------------------------------------------------------*/
  self.reset = function() {
    number_particles = number_initial_particles;
    for (let j=0; j<number_particles; j++) {
      _initializeParticle(j);
    }
    _updateGPU();
  };

  /**----------------------------------------------------------------------*/
  function _updateGPU () {
    if (gpu_needs_updating) {
      // Copy the new data to the GPU.
      _updateBufferObject(location_buffer_id, location);
      _updateBufferObject(size_buffer_id, size);
      _updateBufferObject(texture_coordinates_buffer_id, texture_coordinates);
      _updateBufferObject(color_alpha_buffer_id, color_alpha);
      gpu_needs_updating = false;
    }
  }

  /**----------------------------------------------------------------------*/
  self.update = function () {

    // Update the existing particles.
    for (let j=0; j<number_particles; j++) {
      _updateParticle(j);
    }

    // Remove any particles whose lifetime has expired.
    let k = 0;
    while (k < number_particles) {
      if (alive[k] >= lifetime[k]) {
        _deleteParticle(k);
      } else {
        k += 1;
      }
    }

    // Add new particles.
    let n = _randomInt(self.new_particles_range[MIN], self.new_particles_range[MAX]);
    if (number_particles + n > self.particle_limit ) {
      n = self.particle_limit - number_particles;
    }
    for (let j=0; j<n; j++) {
      _initializeParticle(number_particles + j);
    }
    number_particles += n;

    gpu_needs_updating = true;
  };

  /**----------------------------------------------------------------------
   * Create and initialize a texture object
   * @param my_image {img} A JavaScript Image object that contains the
   *                         texture map image.
   * @private
   */
  function _createTextureMap(my_image) {

    // Create a new "texture object".
    let texture_object = gl.createTexture();

    // Make the "texture object" be the active texture object.
    gl.bindTexture(gl.TEXTURE_2D, texture_object);

    // Set parameters of the texture object.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    // Tell gl to flip the orientation of the image on the Y axis.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    // Store in the image in the GPU's texture object.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE,
      my_image);

    return texture_object;
  }

  /**----------------------------------------------------------------------
   * Render a particle system
   * @param transform {Float32Array} A 4x4 transformation matrix for rendering.
   * @param camera_space {Float32Array} A 4x4 transformation matrix to camera space.
   */
  self.render = function (transform, camera_space) {

    if (number_particles > 0) {
      if (self.sort_before_rendering) {
        _sortParticles(camera_space);
      } else {
        _updateGPU ();
      }

      gl.uniformMatrix4fv(program.u_Transform, false, transform);

      // Bind the buffers to the shader variables
      gl.bindBuffer(gl.ARRAY_BUFFER, location_buffer_id);
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      gl.bindBuffer(gl.ARRAY_BUFFER, size_buffer_id);
      gl.vertexAttribPointer(program.a_Size, 1, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Size);

      gl.bindBuffer(gl.ARRAY_BUFFER, color_alpha_buffer_id);
      gl.vertexAttribPointer(program.a_Alpha, 1, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Alpha);

      gl.bindBuffer(gl.ARRAY_BUFFER, texture_coordinates_buffer_id);
      gl.vertexAttribPointer(program.a_Texture_coordinate, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Texture_coordinate);

      // Make the "texture unit" 0 be the active texture unit.
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, my_texture_object);
      gl.uniform1i(program.u_Texture_unit, 0);

      // Draw all of the particles
      gl.drawArrays(gl.POINTS, 0, number_particles);
    }
  };

  //-----------------------------------------------------------------------
  // Constructor:
  // Create and initialize the particles in the system.
  _create();

  // Get the location of the shader program's uniforms and attributes
  program.u_Transform     = gl.getUniformLocation(program, "u_Transform");
  program.u_Texture_unit  = gl.getUniformLocation(program, "u_Texture_unit");
  program.u_Texture_delta = gl.getUniformLocation(program, "u_Texture_delta");

  program.a_Vertex             = gl.getAttribLocation(program, 'a_Vertex');
  program.a_Texture_coordinate = gl.getAttribLocation(program, 'a_Texture_coordinate');
  program.a_Size               = gl.getAttribLocation(program, 'a_Size');
  program.a_Alpha              = gl.getAttribLocation(program, 'a_Alpha');

  // Create a texture map object for rendering the particles.
  my_texture_object = _createTextureMap(texture_map_image);
  let texture_delta = [ (1.0 / (texture_map_image.width - 1.0)),
                        (1.0 / (texture_map_image.height - 1.0))];
  gl.uniform2fv(program.u_Texture_delta, texture_delta);

};

