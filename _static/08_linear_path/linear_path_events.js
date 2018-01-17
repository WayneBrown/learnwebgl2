/**
 * LinearPathEvents.js, By Wayne Brown, Fall 2017
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
 * Event handlers for a scene.
 * @param id - the webgldemo ID used to give HTML tags unique names
 * @param scene - an instance of the rendering object
 * @constructor
 */
window.LinearPathEvents = function (id, scene) {

  // Private variables
  let self = this;
  let out = scene.out;

  // Remember the current state of events
  let start_of_mouse_drag = null;
  let previous_time = Date.now();
  let animate_is_on = scene.animate_active;

  // Control the rate at which animations refresh
  let frame_rate = 30; // 33 milliseconds = 1/30 sec


  //-----------------------------------------------------------------------
  self.mouse_drag_started = function (event) {

    //console.log("started mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = event;
    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = false;
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_drag_ended = function (event) {

    //console.log("ended mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = null;

    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = true;
      self.animate();
    }
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

    let t = $('#' + id + '_t');
    let zero = 0.0;
    t.val(zero);
    t.prev().html(zero.toFixed(2));

    let frames = $('#' + id + '_frames');
    let thirty = 30;
    frames.val(thirty);
    frames.prev().html(thirty.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.updateValuesDisplay = function (new_value) {
    let t = $('#' + id + '_t');
    t.val(new_value);
    t.prev().html(new_value.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.reset = function (event) {
    let control = $(event.target);

    scene.angle_x = 0.0;
    scene.angle_y = 0.0;
    scene.path.t = 0.0;
    scene.path.number_frames = 30;
    scene.render();

    self.resetSliders(0);
  };

  //------------------------------------------------------------------------------
  self.t = function (event) {
    let control = $(event.target);

    let t = Number(control.val());
    scene.path.t = t;
    scene.render();

    // Update the value of the slider
    control.prev().html(t.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.frames = function (event) {
    let control = $(event.target);

    let frames = Number(control.val());
    scene.path.number_frames = frames;
    scene.render();

    // Update the value of the slider
    control.prev().html(frames.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.animate = function () {
    scene.path.startAnimation();
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_animate').unbind("click", self.animate);
    $('#' + id + '_reset').unbind("click", self.reset);
    $('#' + id + '_t').unbind("input change", self.t);
    $('#' + id + '_frames').unbind("input change", self.frames);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_animate').on('click', self.animate);
  $('#' + id + '_reset').on('click', self.reset);
  $('#' + id + '_t').on("input change", self.t);
  $('#' + id + '_frames').on("input change", self.frames);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );

};



