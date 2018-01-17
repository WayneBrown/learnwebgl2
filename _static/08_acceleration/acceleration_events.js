/**
 * AccelerationEvents.js, By Wayne Brown, Fall 2017
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

//-------------------------------------------------------------------------
/**
 * Event handlers for a scene.
 * @param id - the webgldemo ID used to give HTML tags unique names
 * @param scene - an instance of the rendering object
 * @constructor
 */
window.AccelerationEvents = function (id, scene) {

  // Private variables
  let self = this;
  let out = scene.out;

  // Remember the current state of events
  let start_of_mouse_drag = null;

  // Animation values
  let previous_time = 0;
  let frame_rate = 30;  // frames per second
  let milliseconds_between_frames = Math.round( (1 / frame_rate) * 1000 );

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
    let delta_x, delta_y;

    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = -(event.clientY - start_of_mouse_drag.clientY);
      //console.log("moved: " + delta_x + " " + delta_y);

      scene.angle_x -= delta_y;
      scene.angle_y += delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  self.resetSliders = function () {

    let frame = $('#' + id + '_frame');
    let one = 0.0;
    frame.val(one);
    frame.prev().html(one.toFixed(0));

    let frames = $('#' + id + '_frames');
    let thirty = 30;
    frames.val(thirty);
    frames.prev().html(thirty.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.updateValuesDisplay = function (new_value) {
    let frame = $('#' + id + '_frame');
    frame.val(new_value);
    frame.prev().html(new_value.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.updateAccelerationDisplay = function () {
    let slider = $('#' + id + '_acceleration');
    let value = scene.path.acceleration;
    slider.val(value);
    slider.prev().html(value.toFixed(0));

    slider = $('#' + id + '_deceleration');
    value = scene.path.deceleration;
    slider.val(value);
    slider.prev().html(value.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.reset = function (event) {
    let control = $(event.target);

    scene.angle_x = 0.0;
    scene.angle_y = 0.0;
    scene.current_frame = 20;
    scene.path.start_frame = 20;
    scene.path.end_frame = 80;
    scene.path.acceleration = 30;
    scene.path.deceleration = 30;

    self.resetSliders(scene.current_frame);
    self.updateAccelerationDisplay();

    scene.render();
  };

  //------------------------------------------------------------------------------
  self.frame = function (event) {
    let control = $(event.target);

    let frame = Number(control.val());
    scene.current_frame = frame;
    scene.render();

    // Update the value of the slider
    control.prev().html(frame.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.start_frame = function (event) {
    let control = $(event.target);

    let start = Number(control.val());
    scene.path.start_frame = start;
    scene.render();

    // Update the value of the slider
    control.prev().html(start.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.end_frame = function (event) {
    let control = $(event.target);

    let end = Number(control.val());
    scene.path.end_frame = end;
    scene.render();

    // Update the value of the slider
    control.prev().html(end.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.acceleration = function (event) {
    let control = $(event.target);

    let acceleration = Number(control.val());
    scene.path.acceleration = acceleration;

    // Update the value of the slider
    control.prev().html(acceleration.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.deceleration = function (event) {
    let control = $(event.target);

    let deceleration = Number(control.val());
    scene.path.deceleration = deceleration;

    // Update the value of the slider
    control.prev().html(deceleration.toFixed(0));
  };

  /**----------------------------------------------------------------------
   * Initialize an animation along this path.
   */
  self.startAnimation = function () {
    scene.current_frame = scene.path.start_frame;
    scene.path.calculateAnimation(scene);

    // Render the first frame
    scene.render();
    self.updateValuesDisplay(scene.current_frame);
    previous_time = Date.now();

    // Start the animation
    self.animate();
  };

  //-----------------------------------------------------------------------
  /**
   * Animate an object for every location along the path between P1 and P2.
   */
  self.animate = function () {
    let now, elapsed_time;

    if (scene.current_frame < scene.path.end_frame) {

      now = Date.now();
      elapsed_time = now - previous_time;

      if (elapsed_time >= milliseconds_between_frames) {
        scene.current_frame += 1;
        scene.render();
        self.updateValuesDisplay(scene.current_frame);

        // Remember when this scene was rendered.
        previous_time = now;
      }

      window.requestAnimationFrame(self.animate);
    }

  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_animate').unbind("click", self.startAnimation);
    $('#' + id + '_reset').unbind("click", self.reset);
    $('#' + id + '_frame').unbind("input change", self.frame);
    $('#' + id + '_start_frame').unbind("input change", self.start_frame);
    $('#' + id + '_end_frame').unbind("input change", self.end_frame);
    $('#' + id + '_acceleration').unbind("input change", self.acceleration);
    $('#' + id + '_deceleration').unbind("input change", self.deceleration);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_animate').on('click', self.startAnimation);
  $('#' + id + '_reset').on('click', self.reset);
  $('#' + id + '_frame').on("input change", self.frame);
  $('#' + id + '_start_frame').on("input change", self.start_frame);
  $('#' + id + '_end_frame').on("input change", self.end_frame);
  $('#' + id + '_acceleration').on("input change", self.acceleration);
  $('#' + id + '_deceleration').on("input change", self.deceleration);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );

};



