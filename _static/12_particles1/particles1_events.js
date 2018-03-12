/**
 * particles1_events.js, By Wayne Brown, Fall 2017
 *
 * These event handlers can modify the characteristics of a scene.
 * These will be specific to a scene's models and the models' attributes.
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
 * Event handlers for a scene.
 * @param id - the webgldemo ID used to give HTML tags unique names
 * @param scene {Particles1Scene} an instance of the rendering object
 * @constructor
 */
window.Particles1Events = function (id, scene) {

  let self = this;

  let previous_time = Date.now();
  let frame_rate = 30;
  let time_between_frames = Math.round((1.0 / frame_rate) * 1000); // in milliseconds

  let total_frames = 0;
  let start_time = Date.now();
  let frames_per_second = 0;

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Remember the current state of events
  let start_of_mouse_drag = null;

  //-----------------------------------------------------------------------
  self.mouse_drag_started = function (event) {

    //console.log("started mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = event;
    event.preventDefault();
  };

  //-----------------------------------------------------------------------
  self.mouse_drag_ended = function (event) {

    //console.log("ended mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = null;

    event.preventDefault();
  };

  //-----------------------------------------------------------------------
  self.mouse_dragged = function (event) {
    let delta_x, delta_y, new_x, new_y;

    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = event.clientY - start_of_mouse_drag.clientY;

      scene.model_rotate_x += delta_y;
      scene.model_rotate_y += delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //-----------------------------------------------------------------------
  self.startAnimation = function (event) {
    scene.animate_active = true;
    total_frames = 0;
    start_time = Date.now();
    frames_per_second = 0;
    self.animate();
  };

  //-----------------------------------------------------------------------
  self.stepAnimation = function (event) {
    scene.animate_active = false;
    scene.particle_system.update();
    scene.render();
  };

  //-----------------------------------------------------------------------
  self.resetAnimation = function (event) {
    scene.animate_active = false;
    scene.particle_system.reset();
    scene.render();
  };

  //-----------------------------------------------------------------------
  self.numberParticles = function (event) {
    let control = $(event.target);
    let value = Number( control.val() );
    scene.particle_system.particle_limit = value;
    $('#' + id + '_number_text').text(value.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.animate = function () {

    let now, elapsed_time;

    if (scene.animate_active) {

      now = Date.now();
      elapsed_time = now - previous_time;

      if (elapsed_time >= time_between_frames) {
        scene.particle_system.update();
        scene.render();
        previous_time = now;

        total_frames++;
        elapsed_time = now - start_time;
        frames_per_second = total_frames / (elapsed_time / 1000.0);
        if ((total_frames % 30) === 0) {
          $('#' + id + '_fps').text(frames_per_second.toFixed(1));
        }
      }

      requestAnimationFrame(self.animate);
    }
  };

  //-----------------------------------------------------------------------
  self.minAdd = function (event) {
    let control = $(event.target);
    scene.particle_system.new_particles_range[0] = Number( control.val() );
  };

  //-----------------------------------------------------------------------
  self.maxAdd = function (event) {
    let control = $(event.target);
    scene.particle_system.new_particles_range[1] = Number( control.val() );
  };

  //-----------------------------------------------------------------------
  self.minSpeed = function (event) {
    let control = $(event.target);
    scene.particle_system.particle_speed_range[0] = Number( control.val() );
  };

  //-----------------------------------------------------------------------
  self.maxSpeed = function (event) {
    let control = $(event.target);
    scene.particle_system.particle_speed_range[1] = Number( control.val() );
  };

  //-----------------------------------------------------------------------
  self.minLifetime = function (event) {
    let control = $(event.target);
    scene.particle_system.particle_lifetime_range[0] = Number( control.val() );
  };

  //-----------------------------------------------------------------------
  self.maxLifetime = function (event) {
    let control = $(event.target);
    scene.particle_system.particle_lifetime_range[1] = Number( control.val() );
  };

  //-----------------------------------------------------------------------
  self.minSize = function (event) {
    let control = $(event.target);
    scene.particle_system.particle_size_range[0] = Number( control.val() );
  };

  //-----------------------------------------------------------------------
  self.maxSize = function (event) {
    let control = $(event.target);
    scene.particle_system.particle_size_range[1] = Number( control.val() );
  };

  //------------------------------------------------------------------------------
  self.sortMode = function (event) {
    scene.particle_system.sort_before_rendering = $(event.target).is(":checked");
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_number').unbind("input change", self.numberParticles);
    $('#' + id + '_animate').unbind("click", self.startAnimation);
    $('#' + id + '_step').unbind("click", self.stepAnimation);
    $('#' + id + '_reset').unbind("click", self.resetAnimation);
    $('#' + id + '_min_add').unbind("input change", self.minAdd);
    $('#' + id + '_max_add').unbind("input change", self.maxAdd);
    $('#' + id + '_min_speed').unbind("input change", self.minSpeed);
    $('#' + id + '_max_speed').unbind("input change", self.maxSpeed);
    $('#' + id + '_min_lifetime').unbind("input change", self.minLifetime);
    $('#' + id + '_max_lifetime').unbind("input change", self.maxLifetime);
    $('#' + id + '_min_size').unbind("input change", self.minSize);
    $('#' + id + '_max_size').unbind("input change", self.maxSize);
    $('#' + id + '_sort').unbind("click", self.sortMode);

    let cid = '#' + id + '_canvas';
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.
  $('#' + id + '_number').on("input change", self.numberParticles);
  $('#' + id + '_animate').on("click", self.startAnimation);
  $('#' + id + '_step').on("click", self.stepAnimation);
  $('#' + id + '_reset').on("click", self.resetAnimation);
  $('#' + id + '_min_add').on("input change", self.minAdd);
  $('#' + id + '_max_add').on("input change", self.maxAdd);
  $('#' + id + '_min_speed').on("input change", self.minSpeed);
  $('#' + id + '_max_speed').on("input change", self.maxSpeed);
  $('#' + id + '_min_lifetime').on("input change", self.minLifetime);
  $('#' + id + '_max_lifetime').on("input change", self.maxLifetime);
  $('#' + id + '_min_size').on("input change", self.minSize);
  $('#' + id + '_max_size').on("input change", self.maxSize);
  $('#' + id + '_sort').on("click", self.sortMode);

  let cid = '#' + id + '_canvas';
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
};



