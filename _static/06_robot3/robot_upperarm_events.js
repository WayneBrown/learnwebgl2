/**
 * robot_base_events.js, By Wayne Brown, Fall 2017
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
 * Event handlers for a scene.
 * @param id {string} the webgldemo ID used to give HTML tags unique names
 * @param scene {RobotForearmScene} an instance of the scene object
 * @constructor
 */
window.RobotUpperarmEvents = function (id, scene) {

  let self = this; // Store a local reference to the new object.

  // Private variables

  // Remember the current state of events
  let start_of_mouse_drag = null;
  let previous_time = Date.now();
  let animate_is_on = scene.animate_active;

  // Control the rate at which animations refresh
  let frame_rate = 33; // 33 milliseconds = 1/30 sec

  //-----------------------------------------------------------------------
  self.mouse_drag_started = function (event) {

    start_of_mouse_drag = event;
    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = false;
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_drag_ended = function (event) {

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

    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = -(event.clientY - start_of_mouse_drag.clientY);

      scene.base_y_angle += delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  self.animation_status = function (event) {
    if ($(event.target).is(":checked"))  {
      animate_is_on = true;
      scene.animate_active = true;
      self.animate();
    } else {
      animate_is_on = false;
      scene.animate_active = false;
    }
  };

  //------------------------------------------------------------------------------
  self.forearm = function (event) {
    let control = $(event.target);

    let value = Number(control.val());
    scene.forearm_angle = value;
    if (! animate_is_on) scene.render();

    // Update the value of the slider
    control.prev().prev().html(value.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.upperarm = function (event) {
    let control = $(event.target);

    let value = Number(control.val());
    scene.upperarm_angle = value;
    if (! animate_is_on) scene.render();

    // Update the value of the slider
    control.prev().prev().html(value.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.animate = function () {

    let now, elapsed_time;

    if (scene.animate_active) {

      now = Date.now();
      elapsed_time = now - previous_time;

      if (elapsed_time >= frame_rate) {
        scene.base_y_angle += 1;
        scene.render();
        previous_time = now;
      }

      requestAnimationFrame(self.animate);
    }
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_animate_status').unbind("click", self.animation_status);
    $('#' + id + '_forearm_angle').unbind("input change", self.forearm);
    $('#' + id + '_upperarm_angle').unbind("input change", self.upperarm);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_animate_status').on('click', self.animation_status);
  $('#' + id + '_forearm_angle').on("input change", self.forearm);
  $('#' + id + '_upperarm_angle').on("input change", self.upperarm);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );

};



