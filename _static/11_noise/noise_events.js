/**
 * noise_events.js, By Wayne Brown, Spring 2018
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

/** -----------------------------------------------------------------------
 * Process the events of a WebGL program.
 *
 * @param id {string} The id of the webglinteractive directive
 * @param scene {object} An instance of the ObjectExampleScene class
 * @constructor
 */
window.NoiseEvents = function (id, scene) {

  // Private variables
  let self = this;        // Store a local reference to the new object.
  let out = scene.out;    // Debugging and output goes here.
  let canvas = scene.canvas;

  // Remember the current state of events
  let start_of_mouse_drag = null;
  let previous_time = Date.now();
  let animate_is_on = scene.animate_active;

  // Control the rate at which animations refresh
  let frame_rate = 33; // 33 milliseconds = 1/30 sec

  //-----------------------------------------------------------------------
  self.mouse_drag_started = function (event) {

    //out.displayInfo("started mouse drag event x,y = " +
    //                event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = event;
    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = false;
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_drag_ended = function (event) {

    //out.displayInfo("ended mouse drag event x,y = " +
    //                event.clientX + " " + event.clientY + "  " + event.which);
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

    //out.displayInfo("drag event x,y = " +
    //                event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = event.clientY - start_of_mouse_drag.clientY;
      //out.displayInfo("moved: " + delta_x + " " + delta_y);

      scene.angle_x += delta_y;
      scene.angle_y += delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  self.animation_status = function (event) {
    //out.displayInfo('animation_status event happened');
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
  self.animate = function () {

    let now, elapsed_time;

    if (scene.animate_active) {

      now = Date.now();
      elapsed_time = now - previous_time;

      if (elapsed_time >= frame_rate) {
        scene.angle_x -= 0.5;
        scene.angle_y += 1;
        scene.render();
        previous_time = now;
      }

      requestAnimationFrame(self.animate);
    }
  };

  //------------------------------------------------------------------------------
  function _updateDisplay() {
    let text, control, value, amount, scale;

    text = "translate " + Number($("#" + id + "_dx").val()).toFixed(2)
                     + ", " + Number($("#" + id + "_dy").val()).toFixed(2) + ")";
    $("#" + id + "_translate_text").text(text);

    scale = "scale " + Number($("#" + id + "_scale").val()).toFixed(2);

    $("#" + id + "_scale_text").text(scale);

    text = "Noise parameters: ";
    for (let j = 0; j<4; j++) {
      control = $("#" + id + "_param" + j);
      value = Number(control.val()).toFixed(1);
      text += value;
      if (j < 3) text += ", ";
    }
    $("#" + id + "_noise_params").text(text);
  }

  //------------------------------------------------------------------------------
  self.translate = function (event) {
    let control = $(event.target);
    let id = control[0].id;
    let axis = id.charAt(id.length-1);

    switch (axis) {
      case 'x' : scene.translate_texture[0] = control.val(); break;
      case 'y' : scene.translate_texture[1] = control.val(); break;

    }

    scene.render();
    console.log("rendered scene");
    _updateDisplay();
  };

  //------------------------------------------------------------------------------
  self.scale = function (event) {
    let control = $(event.target);
    scene.scale_texture = control.val();

    _updateDisplay();
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.params = function (event) {
    let control = $(event.target);
    let id = control[0].id;
    let index = Number(id.charAt(id.length-1));

    scene.p_param[index] = control.val();

    _updateDisplay();
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_pause').unbind("click", self.animation_status);
    $('#' + id + '_dx').unbind("input change", self.translate);
    $('#' + id + '_dy').unbind("input change", self.translate);
    $('#' + id + '_scale').unbind("input change", self.scale);
    $('#' + id + '_param0').unbind("input change", self.params);
    $('#' + id + '_param1').unbind("input change", self.params);
    $('#' + id + '_param2').unbind("input change", self.params);
    $('#' + id + '_param3').unbind("input change", self.params);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_pause').on('click', self.animation_status);
  $('#' + id + '_dx').on("input change", self.translate);
  $('#' + id + '_dy').on("input change", self.translate);
  $('#' + id + '_scale').on("input change", self.scale);
  $('#' + id + '_param0').on("input change", self.params);
  $('#' + id + '_param1').on("input change", self.params);
  $('#' + id + '_param2').on("input change", self.params);
  $('#' + id + '_param3').on("input change", self.params);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
};
