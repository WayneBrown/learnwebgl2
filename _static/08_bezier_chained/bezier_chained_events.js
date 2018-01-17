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
window.BezierChainedEvents = function (id, scene) {

  // Private variables
  let self = this;
  let out = scene.out;

  let P = new GlPoint4();
  let p1 = P.create();
  let p2 = P.create();

  let V = new GlVector3();
  let p3_p0 = V.create();
  let p3_p0_scaled = V.create();
  let p0_p1 = V.create();
  let p1_p2 = V.create();
  let p2_p3 = V.create();
  let new_p1_p0 = P.create();
  let new_p3_p2 = P.create();

  // Remember the current state of events
  let start_of_mouse_drag = null;
  let previous_frame_time = Date.now();
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
  function _set_frame (frame) {
    let slider = $('#' + id + '_frame');

    slider.val(frame);
    slider.prev().html(frame.toFixed(0));
  }

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
  self.display_curve = function (event) {
    let name = $(event.target)[0].id;
    let number = parseInt(name[name.length-1]);
    scene.path_segment_visible[number] = ($(event.target).is(":checked"));
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.reset = function (event) {
    let control = $(event.target);

    scene.angle_x = 0.0;
    scene.angle_y = 0.0;
    scene.path.current_frame = 20;
    scene.path.start_frame = 30;
    scene.path.end_frame = 60;

    _set_start_frame(scene.path.start_frame);
    _set_end_frame(scene.path.end_frame);
    _set_scale_vector(0.1);

    self.resetSliders(scene.path.current_frame);

    scene.render();
  };

  //-----------------------------------------------------------------------
  /**
   * Animate an object for every location along the path between P1 and P2.
   */
  self.animate = function () {
    let now, elapsed_time;

    if (scene.current_frame <= 120) {

      now = Date.now();
      elapsed_time = now - previous_frame_time;

      if (elapsed_time >= scene.frame_rate) {

        scene.current_frame += 1;
        scene.render();
        _set_frame(scene.current_frame);

        // Remember when this scene was rendered.
        previous_frame_time = now;
      }

      window.requestAnimationFrame(self.animate);
    }
  };

  //------------------------------------------------------------------------------
  self.start_animate = function () {
    scene.current_frame = 0;
    self.animate();
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_animate').unbind("click", self.start_animate);
    $('#' + id + '_reset').unbind("click", self.reset);
    $('#' + id + '_frame').unbind("click", self.frame);
    $('#' + id + '_display_curve0').unbind("click", self.display_curve);
    $('#' + id + '_display_curve1').unbind("click", self.display_curve);
    $('#' + id + '_display_curve2').unbind("click", self.display_curve);
    $('#' + id + '_display_curve3').unbind("click", self.display_curve);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_animate').on('click', self.start_animate);
  $('#' + id + '_reset').on('click', self.reset);
  $('#' + id + '_frame').on("input change", self.frame);
  $('#' + id + '_display_curve0').on('click', self.display_curve);
  $('#' + id + '_display_curve1').on('click', self.display_curve);
  $('#' + id + '_display_curve2').on('click', self.display_curve);
  $('#' + id + '_display_curve3').on('click', self.display_curve);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
};



