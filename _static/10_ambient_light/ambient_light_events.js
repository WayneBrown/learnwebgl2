/**
 * learn_webgl_events_01.js, By Wayne Brown, Fall 2015
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
 * @param scene - an instance of the rendering object
 * @constructor
 */
window.AmbientLightEvents = function (id, scene) {

  let self = this;

  let group_colors = false;

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Private letiables
  let out = scene.out;    // Debugging and output goes here.
  let canvas = scene.canvas;

  // Remember the current state of events
  let start_of_mouse_drag = null;
  let previous_time = Date.now();
  let animate_is_on = scene.animate_active;

  // Control the rate at which animations refresh
  let frame_rate = 30; // 33 milliseconds = 1/30 sec
  //let frame_rate = 0; // gives screen refresh rate (60 fps)

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
    let delta_x, delta_y, new_x, new_y;

    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = event.clientY - start_of_mouse_drag.clientY;
      //console.log("moved: " + delta_x + " " + delta_y);

      scene.angle_x += delta_y;
      scene.angle_y += delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  function _updateValuesDisplay() {
    $('#' + id + '_eye_text').html('<strong>eye ('
        + Number($('#' + id + '_eyeX').val()).toFixed(1) + ', '
        + Number($('#' + id + '_eyeY').val()).toFixed(1) + ', '
        + Number($('#' + id + '_eyeZ').val()).toFixed(1) + ')</strong>');
    $('#' + id + '_center_text').html('<strong>center ('
        + Number($('#' + id + '_cX').val()).toFixed(1) + ', '
        + Number($('#' + id + '_cY').val()).toFixed(1) + ', '
        + Number($('#' + id + '_cZ').val()).toFixed(1) + ')</strong>');
    $('#' + id + '_light_text').html('<strong>light position ('
        + Number($('#' + id + '_lightX').val()).toFixed(1) + ', '
        + Number($('#' + id + '_lightY').val()).toFixed(1) + ', '
        + Number($('#' + id + '_lightZ').val()).toFixed(1) + ')</strong>');
    $('#' + id + '_light_color_text').html('<strong>intensities ('
      + Number($('#' + id + '_red').val()).toFixed(2) + ', '
      + Number($('#' + id + '_green').val()).toFixed(2) + ', '
      + Number($('#' + id + '_blue').val()).toFixed(2) + ')</strong>');
  }

  //------------------------------------------------------------------------------
  self.reset = function (event) {
    let control = $(event.target);
    // Change the render values
    let zero = 0;
    let one = 1;
    let five = 5;
    scene.eyex = zero;
    scene.eyey = zero;
    scene.eyez = five;
    scene.centerx = zero;
    scene.centery = zero;
    scene.centerz = zero;
    scene.light_position[0] = 3;
    scene.light_position[1] = 0;
    scene.light_position[2] = 5;
    scene.light_color[0] = 1;
    scene.light_color[1] = 1;
    scene.light_color[2] = 1;

    // Change the sliders
    $('#' + id + "_eyeX").val(zero);
    $('#' + id + "_eyeY").val(zero);
    $('#' + id + "_eyeZ").val(five);

    $('#' + id + "_cX").val(zero);
    $('#' + id + "_cY").val(zero);
    $('#' + id + "_cZ").val(zero);

    $('#' + id + "_lightX").val(3);
    $('#' + id + "_lightY").val(3);
    $('#' + id + "_lightZ").val(3);

    $('#' + id + "_red").val(0.3);
    $('#' + id + "_green").val(0.3);
    $('#' + id + "_blue").val(0.3);

    // Changed displayed text
    _updateValuesDisplay();
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.eyeX = function (event) {
    scene.eyex = Number($('#' + id + "_eyeX").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.eyeY = function (event) {
    scene.eyey = Number($('#' + id + "_eyeY").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.eyeZ = function (event) {
    scene.eyez = Number($('#' + id + "_eyeZ").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.cX = function (event) {
    scene.centerx = Number($('#' + id + "_cX").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.cY = function (event) {
    scene.centery = Number($('#' + id + "_cY").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.cZ = function (event) {
    scene.centerz = Number($('#' + id + "_cZ").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.lightX = function (event) {
    scene.light_position[0] = Number($('#' + id + "_lightX").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.lightY = function (event) {
    scene.light_position[1] = Number($('#' + id + "_lightY").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.lightZ = function (event) {
    scene.light_position[2] = Number($('#' + id + "_lightZ").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.red = function (event) {
    scene.light_color[0] = Number($('#' + id + "_red").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.green = function (event) {
    scene.light_color[1] = Number($('#' + id + "_green").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.blue = function (event) {
    scene.light_color[2] = Number($('#' + id + "_blue").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.ambientRed = function (event) {
    scene.ambient_intensities[0] = Number($('#' + id + "_ambient_red").val());
    if (group_colors) {
      scene.ambient_intensities[1] = scene.ambient_intensities[0];
      scene.ambient_intensities[2] = scene.ambient_intensities[0];
      $('#' + id + "_ambient_green").val(scene.ambient_intensities[1]);
      $('#' + id + "_ambient_blue").val(scene.ambient_intensities[2]);
    }
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.ambientGreen = function (event) {
    scene.ambient_intensities[1] = Number($('#' + id + "_ambient_green").val());
    if (group_colors) {
      scene.ambient_intensities[0] = scene.ambient_intensities[1];
      scene.ambient_intensities[2] = scene.ambient_intensities[1];
      $('#' + id + "_ambient_red").val(scene.ambient_intensities[0]);
      $('#' + id + "_ambient_blue").val(scene.ambient_intensities[2]);
    }
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.ambientBlue = function (event) {
    scene.ambient_intensities[2] = Number($('#' + id + "_ambient_blue").val());
    if (group_colors) {
      scene.ambient_intensities[0] = scene.ambient_intensities[2];
      scene.ambient_intensities[1] = scene.ambient_intensities[2];
      $('#' + id + "_ambient_red").val(scene.ambient_intensities[0]);
      $('#' + id + "_ambient_green").val(scene.ambient_intensities[1]);
    }
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.groupColors = function (event) {
    group_colors = $(event.target).is(":checked");
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_reset').unbind('click', self.reset);
    $('#' + id + '_eyeX').unbind("input change", self.eyeX);
    $('#' + id + '_eyeY').unbind("input change", self.eyeY);
    $('#' + id + '_eyeZ').unbind("input change", self.eyeZ);
    $('#' + id + '_cX').unbind("input change", self.cX);
    $('#' + id + '_cY').unbind("input change", self.cY);
    $('#' + id + '_cZ').unbind("input change", self.cZ);
    $('#' + id + '_lightX').unbind("input change", self.lightX);
    $('#' + id + '_lightY').unbind("input change", self.lightY);
    $('#' + id + '_lightZ').unbind("input change", self.lightZ);
    $('#' + id + '_red').unbind("input change", self.red);
    $('#' + id + '_green').unbind("input change", self.green);
    $('#' + id + '_blue').unbind("input change", self.blue);
    $('#' + id + '_ambient_red').unbind("input change", self.ambientRed);
    $('#' + id + '_ambient_green').unbind("input change", self.ambientGreen);
    $('#' + id + '_ambient_blue').unbind("input change", self.ambientBlue);
    $('#' + id + '_group_colors').unbind('click', self.groupColors);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  $('#' + id + '_reset').on('click', self.reset);
  $('#' + id + '_eyeX').on("input change", self.eyeX);
  $('#' + id + '_eyeY').on("input change", self.eyeY);
  $('#' + id + '_eyeZ').on("input change", self.eyeZ);
  $('#' + id + '_cX').on("input change", self.cX);
  $('#' + id + '_cY').on("input change", self.cY);
  $('#' + id + '_cZ').on("input change", self.cZ);
  $('#' + id + '_lightX').on("input change", self.lightX);
  $('#' + id + '_lightY').on("input change", self.lightY);
  $('#' + id + '_lightZ').on("input change", self.lightZ);
  $('#' + id + '_red').on("input change", self.red);
  $('#' + id + '_green').on("input change", self.green);
  $('#' + id + '_blue').on("input change", self.blue);
  $('#' + id + '_ambient_red').on("input change", self.ambientRed);
  $('#' + id + '_ambient_green').on("input change", self.ambientGreen);
  $('#' + id + '_ambient_blue').on("input change", self.ambientBlue);
  $('#' + id + '_group_colors').on('click', self.groupColors);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
};



