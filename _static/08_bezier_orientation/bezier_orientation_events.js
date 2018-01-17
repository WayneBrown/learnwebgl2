/**
 * bezier_orientation_events.js, By Wayne Brown, Fall 2017
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
window.BezierOrientationEvents = function (id, scene) {

  // Private variables
  let self = this;
  let out = scene.out;

  let P = new GlPoint4();

  let V = new GlVector3();
  let p0_p1 = V.create();
  let p1_p2 = V.create();
  let p2_p3 = V.create();
  let new_p1_p0 = P.create();
  let new_p3_p2 = P.create();

  // Remember the current state of events
  let start_of_mouse_drag = null;

  // Track the frame rate
  let total_frames = 0;
  let start_time = 0;
  let total_time = 0;
  self.actual_frame_rate = 0;

  // Animation values
  let previous_frame_time = 0;
  self.frame_rate = 30;  // frames per second
  let milliseconds_between_frames = Math.round( (1 / self.frame_rate) * 1000 );

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
    let distance, time, speed, acceleration;

    speed = 0;
    acceleration = 0;
    if (scene.current_frame >= scene.path.start_frame &&
        scene.current_frame <= scene.path.end_frame) {
      let index = scene.current_frame - scene.path.start_frame;
      speed = scene.path.speeds[index];
      acceleration = scene.path.accelerations[index];
    }

    let speed_element = $('#' + id + '_speed');
    speed_element.html(speed.toFixed(2));

    let acceleration_element = $('#' + id + '_acceleration');
    acceleration_element.html(acceleration.toFixed(2));

    let frame = $('#' + id + '_frame');
    frame.val(new_value);
    frame.prev().html(new_value.toFixed(0));

    let frame_rate = $('#' + id + '_frame_rate');
    let frames_per_second = self.actual_frame_rate * 1000; // to milliseconds
    frame_rate.html(frames_per_second.toFixed(1));

  };

  //------------------------------------------------------------------------------
  self.frame = function (event) {
    let control = $(event.target);

    let frame = Number(control.val());
    scene.current_frame = frame;
    scene.render();

    // Update the value of the slider
    control.prev().html(frame.toFixed(0));

    self.updateValuesDisplay(frame);
  };

  //------------------------------------------------------------------------------
  function _set_start_frame (frame) {
    scene.path.start_frame = frame;

    // Update the value of the input box
    let box = $('#' + id + '_start_frame');
    box.val(frame);
    box.prev().html(frame.toFixed(0));
  }

  //------------------------------------------------------------------------------
  self.start_frame = function (event) {
    let control = $(event.target);
    _set_start_frame (Number(control.val()));
  };

  //------------------------------------------------------------------------------
  function _set_end_frame (frame) {
    scene.path.end_frame = frame;

    // Update the value of the input box
    let box = $('#' + id + '_end_frame');
    box.val(frame);
    box.prev().html(frame.toFixed(0));
  }

  //------------------------------------------------------------------------------
  self.end_frame = function (event) {
    let control = $(event.target);
    _set_end_frame (Number(control.val()));
  };

  //------------------------------------------------------------------------------
  function _pointString (p) {
    return "(" + p[0].toFixed(1) + ", "
               + p[1].toFixed(1) + ", "
               + p[2].toFixed(1) + ")";
  }

  //------------------------------------------------------------------------------
  function _vectorString (v) {
    return "&lt;" + v[0].toFixed(1) + ", "
                  + v[1].toFixed(1) + ", "
                  + v[2].toFixed(1) + "&gt;";
  }

  //------------------------------------------------------------------------------
  self.updatePointsDisplay = function (event) {

    V.subtract(p0_p1, scene.path.control_points[1], scene.path.control_points[0]);
    V.subtract(p1_p2, scene.path.control_points[2], scene.path.control_points[1]);
    V.subtract(p2_p3, scene.path.control_points[3], scene.path.control_points[2]);

    let gap = "&nbsp;&nbsp;&nbsp;&nbsp;";
    let text =
      "p0: " + _pointString(scene.path.control_points[0]) + gap + "&lt;p1-p0&gt;: " +  _vectorString(p0_p1) + "<br>" +
      "p1: " + _pointString(scene.path.control_points[1]) + gap + "&lt;p2-p1&gt;: " +  _vectorString(p1_p2) + "<br>" +
      "p2: " + _pointString(scene.path.control_points[2]) + gap + "&lt;p3-p2&gt;: " +  _vectorString(p2_p3) + "<br>" +
      "p3: " + _pointString(scene.path.control_points[3]) + "<br>";

    $('#' + id + '_control_points').html(text);
  };

  //------------------------------------------------------------------------------
  function _set_scale_vector (scale) {
    V.scale(new_p1_p0, scene.path.p1_p0, scale);
    V.add(scene.path.control_points[1], scene.path.control_points[0], new_p1_p0);

    V.scale(new_p3_p2, scene.path.p3_p2, -scale);
    V.add(scene.path.control_points[2], scene.path.control_points[3], new_p3_p2);

    // Update the path's curve
    scene.path.calculateActualSpeeds(self.frame_rate);
    scene.path_model.updatePath(scene.path.path_points);

    // Update the value of the slider
    let slider = $('#' + id + '_scale_vector');
    slider.val(scale);
    slider.prev().html(scale.toFixed(2));

    self.updatePointsDisplay();
  }

  //------------------------------------------------------------------------------
  self.scale_vector = function (event) {
    let control = $(event.target);

    _set_scale_vector(Number(control.val()));
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.display_curve = function (event) {
    scene.display_path = ($(event.target).is(":checked"));
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.reset = function (event) {
    let control = $(event.target);

    scene.angle_x = 0.0;
    scene.angle_y = 0.0;
    scene.current_frame = 0;
    scene.path.start_frame = 30;
    scene.path.end_frame = 60;

    _set_start_frame(scene.path.start_frame);
    _set_end_frame(scene.path.end_frame);
    _set_scale_vector(1.0);

    self.resetSliders(scene.current_frame);

    scene.render();
  };

  /**----------------------------------------------------------------------
   * Initialize an animation.
   */
  self.startAnimation = function () {
    scene.path.calculateActualSpeeds(self.frame_rate);

    total_time = 0;

    scene.current_frame = scene.path.start_frame;

    // Render the first frame
    start_time = previous_frame_time = Date.now();
    scene.render();
    total_frames = 1;
    scene.events.updateValuesDisplay(scene.current_frame);

    // Start the animation callbacks
    self.animate();
  };

  //-----------------------------------------------------------------------
  /**
   * Animate.
   */
  self.animate = function () {
    let now, elapsed_time;

    if (scene.current_frame < scene.path.end_frame) {

      now = Date.now();
      elapsed_time = now - previous_frame_time;

      if (elapsed_time >= milliseconds_between_frames) {

        scene.current_frame += 1;
        scene.render();

        total_time = Date.now() - start_time;
        total_frames += 1;
        self.actual_frame_rate = total_frames / total_time;

        scene.events.updateValuesDisplay(scene.current_frame);

        // Remember when this scene was rendered.
        previous_frame_time = now;
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
    $('#' + id + '_scale_vector').unbind("input change", self.scale_vector);
    $('#' + id + '_display_curve').unbind("input change", self.display_curve);

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
  $('#' + id + '_scale_vector').on("input change", self.scale_vector);
  $('#' + id + '_display_curve').on("input change", self.display_curve);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );

  self.updatePointsDisplay();
};



