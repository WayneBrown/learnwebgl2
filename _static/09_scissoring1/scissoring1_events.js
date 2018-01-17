/**
 * scissoring1_events.js, By Wayne Brown, Fall 2017
 *
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
window.Scissoring1Events = function (id, scene) {

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
  self.showViewports = function (event) {
    scene.show_viewports = $(event.target).is(":checked");
    if (!animate_is_on) scene.render();
  };

  //------------------------------------------------------------------------------
  self.reset = function (event) {

    scene.angle_x = 0.0;
    scene.angle_y = 0.0;
    scene.x_divide = 150;
    scene.y_divide = 150;
    scene.render();

    // Update the value of the sliders
    $('#' + id + "_x_divide").val(scene.x_divide);
    $('#' + id + "_x_divide_text").text(scene.x_divide.toFixed(0));
    $('#' + id + "_y_divide").val(scene.y_divide);
    $('#' + id + "_y_divide_text").text(scene.y_divide.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.xDivide = function (event) {
    let control = $(event.target);

    let x = Number(control.val());
    scene.x_divide = x;
    if (!animate_is_on) scene.render();

    $('#' + id + "_x_divide_text").text(x.toFixed(0));
  };

  //------------------------------------------------------------------------------
  self.yDivide = function (event) {
    let control = $(event.target);

    let y = Number(control.val());
    scene.y_divide = y;
    if (!animate_is_on) scene.render();

    $('#' + id + "_y_divide_text").text(y.toFixed(0));
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
    $('#' + id + '_show_viewports').unbind("click", self.showViewports);
    $('#' + id + '_reset').unbind("click", self.reset);
    $('#' + id + '_x_divide').unbind("input change", self.xDivide);
    $('#' + id + '_y_divide').unbind("input change", self.yDivide);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_animate_status').on('click', self.animation_status);
  $('#' + id + '_show_viewports').on('click', self.showViewports);
  $('#' + id + '_reset').on('click', self.reset);
  $('#' + id + '_x_divide').on("input change", self.xDivide);
  $('#' + id + '_y_divide').on("input change", self.yDivide);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );

};



