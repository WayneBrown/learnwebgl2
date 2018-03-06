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
 * @param center Point3 The center location of the particle system.
 * @param model Create_particle_model GPU buffer objects for rendering
 * @param texture_map_file_name String
 * @param max_particles Number Maximum number of particles.
 * @constructor
 */
window.ParticleSystem = function (center, model,
                                  texture_map_file_name,
                                  max_particles) {
  let self = this;

  // Particles are defined by some data that is needed for rendering,
  // and other data needed to update the particles on each frame.
  // The rendering data must be copied to GPU buffer objects before
  // each render.

  // To eliminate if-statements in the shader programs, all
  // particles in the list of particles are rendered. Particles
  // that are not active have a position that is off-screen.

  // Rendering data for particles:
  let location            = new Float32Array(max_particles * 3);
  let size                = new Float32Array(max_particles);
  let texture_coordinates = new Float32Array(max_particles * 2);

  // Data needed to update and manage the particles:
  let direction = new Array(max_particles);
  let speed     = new Array(max_particles);
  let end_frame = new Array(max_particles);

  const INITIAL_LOCATION    = 0;
  const LOCATION            = 1;
  const DIRECTION           = 2;
  const SPEED               = 3;
  const START_FRAME         = 4;
  const LIFETIME            = 5;
  const TEXTURE_COORDINATES = 6;
  const SIZE                = 7;
  const NUMBER_PROPERTIES   = 8;

  // Indexes for min and max ranges.
  const MIN  = 0;
  const MAX  = 1;

  // General data about the particle system
  self.current_frame = 0;
  self.maximum_number_particles = 1000;
  self.number_particles = 0;
  self.new_particles_range = [5, 10];
  self.number_initial_particles = 10;

  // Particle system is an array of particles.
  let particles = new Array(self.maximum_number_particles);


  /**----------------------------------------------------------------------
   * Return a random float between min and max.
   * @param min {number} the smallest value in the random range
   * @param max {number} the largest value in the random range
   * @returns {number} a random float
   */
  function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**----------------------------------------------------------------------
   * Return a random float between min and max.
   * @param min {number} the smallest value in the random range
   * @param max {number} the largest value in the random range
   * @returns {number} a random float
   */
  function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**----------------------------------------------------------------------*/
  function _initializeParticle(particle) {

    particle[INITIAL_LOCATION] = location;
    particle[LOCATION] = location.slice();
    particle[DIRECTION] = [Math.random(), Math.random(), Math.random()];
    particle[SPEED] = 0.1;
    particle[START_FRAME] = self.current_frame;
    particle[LIFETIME] = 30;
    particle[TEXTURE_COORDINATES] = [Math.random(), Math.random()];
    particle[SIZE] = 4;
  }

  /**----------------------------------------------------------------------*/
  function _createParticle() {
    let particle = new Array(NUMBER_PROPERTIES);

    particle[INITIAL_LOCATION] = [0, 0, 0];
    particle[LOCATION] = [0, 0, 0];
    particle[DIRECTION] = [0.0, 0.0, 0.0];
    particle[SPEED] = 0.0;
    particle[START_FRAME] = 0;
    particle[LIFETIME] = 0;
    particle[TEXTURE_COORDINATES] = [0, 0];
    particle[SIZE] = 0;

    return particle;
  }

  /**----------------------------------------------------------------------*/
  function _updateParticle(particle) {
    for (j = 0; j < self.number_particles; j += 1) {
      particle = particles[j];

      // Move the location of the particle based on its direction and speed.
      vector3.scale(go_to, particle.direction, particle.speed);
      point3.addVector(particle.location, particle.location, go_to);

      // Move the location of the texture coordinates using the direction vector.
      particle.texture_coordinates[0] += particle.direction[0] * particle.speed * 0.03;
      particle.texture_coordinates[1] += particle.direction[1] * particle.speed * 0.03;

      // remove particles
      if (frame_counter > particle.start_frame + particle.lifetime) {
        particle.initialize();
      }
    }
  }

  /**----------------------------------------------------------------------*/
  function _create() {
    particles = new Array(self.maximum_number_particles);

    // Create all of the particles. (Minimize garbage collection!)
    for (let j=0; j<self.maximum_number_particles; j++) {
      particles[j] = _createParticle();
    }

    // Initialize the starting particles.
    for (let j=0; j<self.number_initial_particles; j++) {
      _initializeParticle(particles[j]);
    }
    self.number_particles = self.number_initial_particles;
  }

  /**----------------------------------------------------------------------*/
  self.update = function () {
    let temp;

    // Update the existing particles.
    for (let j=0; j<self.number_particles; j++) {
      _updateParticle(particles[j]);
    }

    // Remove any particles whose lifetime has expired.
    for (let j=0; j<self.number_particles; j++) {
      if (particles[j][LIFETIME] <= 0) {
        temp = particles[j];
        particles[j] = particles[self.number_particles-1];
        particles[self.number_particles-1] = temp;
        self.number_particles -= 1;
      }
    }

    // Add new particles.
    let n = randomInt(self.new_particles_range[MIN], self.new_particles_range[MAX]);
    if (self.number_particles + n > self.maximum_number_particles ) {
      n = self.maximum_number_particles - self.number_particles;
    }
    for (let j=0; j<n; j++) {
      _initializeParticle(particles[self.number_particles + j]);
    }
    self.number_particles += n;
  };

  /**----------------------------------------------------------------------*/
  self.render = function () {

  };

  particle.initial_location = point3.create(x, y, z);
  particle.location = point3.create(x, y, z);
  particle.direction = vector3.create();
  particle.speed = 0;
  particle.start_frame = 0;
  particle.lifetime = 0;

  particle.texture_coordinates = [0, 0];
  particle.size = 1.0;

  // Arrays to store the rendering properties of the particles.
  var vertices = new Float32Array(max_particles * 3); // 3 floats per point
  var texture_coordinates = new Float32Array(max_particles * 2);
  var sizes = new Float32Array(max_particles);

  // Track the rendered frames so that the lifetime of particles can be determined.
  var frame_counter = 0;

  // The number of particles in the system to be rendered.
  self.number_particles = max_particles;

  // Parameters to control the speed of the particles
  self.average_speed = 0.03;
  self.speed_variation = 0.3;

  // Parameters to control the lifetime of the particles
  self.average_lifetime = 150;
  self.lifetime_variation = 30;

  // Parameters to control control each particle's size
  self.average_size = 50;
  self.size_variation = 10;

  // Is each particle rendered as a square or a circle? Other shapes are possible.
  self.circular_points = false;

  // Scratch variables for calculations.
  var point3 = new window.Learn_webgl_point3();
  var vector3 = new window.Learn_webgl_vector3();
  var go_to = vector3.create();

  /**----------------------------------------------------------------------
   * Create a renadom number with a specified range.
   * @param min Number Minimum value of random number.
   * @param max Number Maximum value of random number.
   * @returns Number Random number in the range [min, max]
   * @private
   */
  function _random(min, max) {
    return (Math.random() * (max - min) + min);
  }

  /**----------------------------------------------------------------------
   *
   * @private
   */
  function _loadTextureMap() {
    var texture_map_image = new Image();
    texture_map_image.src = texture_map_file_name;
    texture_map_image.onload =
      function () {
        model.createTextureMap(texture_map_image);
      };
  }

  /**----------------------------------------------------------------------
   * Reset all of the properties of all the particles.
   */
  self.reset = function () {
    var j, k;

    frame_counter = 0;

    for (j = 0; j < max_particles; j += 1) {
      particles[j].initialize();
    }

    // Send the texture_coordinates to the GPU
    for (j = 0, k = 0; j < self.number_particles; j += 1, k += 2) {
      texture_coordinates[k]     = particles[j].texture_coordinates[0];
      texture_coordinates[k + 1] = particles[j].texture_coordinates[1];
    }

    model.updateBufferObject('texture_coordinates', texture_coordinates);

    // Send the sizes to the GPU
    for (j = 0; j < self.number_particles; j += 1) {
      sizes[j] = particles[j].size;
    }

    model.updateBufferObject('sizes', sizes);
  };

  /**----------------------------------------------------------------------
   * Update the properties of all the particles.
   */
  self.update = function () {
    var j, particle;

    for (j = 0; j < self.number_particles; j += 1) {
      particle = particles[j];

      // Move the location of the particle based on its direction and speed.
      vector3.scale(go_to, particle.direction, particle.speed);
      point3.addVector(particle.location, particle.location, go_to);

      // Move the location of the texture coordinates using the direction vector.
      particle.texture_coordinates[0] += particle.direction[0] * particle.speed * 0.03;
      particle.texture_coordinates[1] += particle.direction[1] * particle.speed * 0.03;

      // remove particles
      if (frame_counter > particle.start_frame + particle.lifetime) {
        particle.initialize();
      }
    }
  };

  /**----------------------------------------------------------------------
   * Render a particle system
   * @param transform Float32Array A 4x4 transformation matrix for rendering.
   */
  self.render = function (transform, animation_active) {
    var j, k, temp;

    // Perform an insertion sort on the particles, sorting them on their
    // location z values.
    for (j = 0; j < self.number_particles; j += 1) {
      temp = particles[j];
      k = j - 1;
      while (k >= 0 && particles[k].location[2] > temp.location[2]) {
        particles[k + 1] = particles[k];
        k -= 1;
      }
      particles[k + 1] = temp;
    }

    // Transfer the locations of the particles into an array of floats.
    for (j = 0, k = 0; j < self.number_particles; j += 1, k += 3) {
      vertices[k]     = particles[j].location[0];
      vertices[k + 1] = particles[j].location[1];
      vertices[k + 2] = particles[j].location[2];
    }

    // Copy the array of floats into the particle system's GPU object buffer
    model.updateBufferObject('points', vertices);

    // Send the texture_coordinates to the GPU
    for (j = 0, k = 0; j < self.number_particles; j += 1, k += 2) {
      texture_coordinates[k]     = particles[j].texture_coordinates[0];
      texture_coordinates[k + 1] = particles[j].texture_coordinates[1];
    }

    model.updateBufferObject('texture_coordinates', texture_coordinates);

    // Send the sizes to the GPU
    for (j = 0; j < self.number_particles; j += 1) {
      sizes[j] = particles[j].size;
    }

    model.updateBufferObject('sizes', sizes);

    // Render the GPU buffer object as "points"
    model.render(transform, self.number_particles);

    if (animation_active) {
      frame_counter += 1;
    }
  };

  //-----------------------------------------------------------------------
  // Constructor:
  // Create the particles in the system and set the individual properties
  // of all the particles.
  var j;

  // Create the particles.
  for (j = 0; j < self.number_particles; j += 1) {
    particles[j] = new _Particle(center[0], center[1], center[2]);
  }

  // Set the initial properties of each particle.
  self.reset();

  // Load the image to be used to render the particles.
  _loadTextureMap();
};

