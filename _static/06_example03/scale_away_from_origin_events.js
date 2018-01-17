/**
 * ScaleAboutOriginEvents.js, By Wayne Brown, Fall 2017
 *
 * These event handlers can modify the characteristics of a scene.
 * These will be specific to a scene's models and the models' attributes.
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
window.ScaleAwayFromOriginEvents = function (id, scene) {

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
  self.animation_status = function (event) {
    out.showInfo('animation_status event happened');
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
  self.resetScaleSliders = function (new_value) {

    let all_scales = $('#' + id + '_scale');
    all_scales.val(new_value);
    all_scales.prev().html(new_value.toFixed(2));

    let xscale = $('#' + id + '_x_scale');
    xscale.val(new_value);
    xscale.prev().html(new_value.toFixed(2));

    let yscale = $('#' + id + '_y_scale');
    yscale.val(new_value);
    yscale.prev().html(new_value.toFixed(2));

    let zscale = $('#' + id + '_z_scale');
    zscale.val(new_value);
    zscale.prev().html(new_value.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.reset = function (event) {
    let control = $(event.target);

    scene.angle_x = 0.0;
    scene.angle_y = 0.0;
    scene.x_scale = 1.0;
    scene.y_scale = 1.0;
    scene.z_scale = 1.0;
    scene.render();

    self.resetScaleSliders(1);
  };

  //------------------------------------------------------------------------------
  self.scale = function (event) {
    let control = $(event.target);

    let scale = Number(control.val());
    scene.x_scale = scale;
    scene.y_scale = scale;
    scene.z_scale = scale;
    scene.render();

    // Update the value of the slider
    self.resetScaleSliders(scale);
  };

  //------------------------------------------------------------------------------
  self.xScale = function (event) {
    let control = $(event.target);

    let scale = Number(control.val());
    scene.x_scale = scale;
    scene.render();

    // Update the value of the slider
    control.prev().html(scale.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.yScale = function (event) {
    let control = $(event.target);

    let scale = Number(control.val());
    scene.y_scale = scale;
    scene.render();

    // Update the value of the slider
    control.prev().html(scale.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.zScale = function (event) {
    let control = $(event.target);

    let scale = Number(control.val());
    scene.z_scale = scale;
    scene.render();

    // Update the value of the slider
    control.prev().html(scale.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.animate = function () {

    let now, elapsed_time;

    if (scene.animate_active) {

      now = Date.now();
      elapsed_time = now - previous_time;
      requestAnimationFrame(self.animate);

      if (elapsed_time >= frame_rate) {
        previous_time = now;

        scene.angle_x -= 0.5;
        scene.angle_y += 1;
        scene.render();
      }

    }
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_animate_status').unbind("click", self.animation_status);
    $('#' + id + '_reset').unbind("click", self.reset);
    $('#' + id + '_scale').unbind("click", self.scale);
    $('#' + id + '_x_scale').unbind("click", self.xScale);
    $('#' + id + '_y_scale').unbind("click", self.yScale);
    $('#' + id + '_z_scale').unbind("click", self.zScale);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_animate_status').on('click', self.animation_status);
  $('#' + id + '_reset').on('click', self.reset);
  $('#' + id + '_scale').on("input change", self.scale);
  $('#' + id + '_x_scale').on("input change", self.xScale);
  $('#' + id + '_y_scale').on("input change", self.yScale);
  $('#' + id + '_z_scale').on("input change", self.zScale);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );

};



