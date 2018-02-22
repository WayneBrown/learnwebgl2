/**
 * blending_events2.js, By Wayne Brown, Spring 2018
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

//-------------------------------------------------------------------------
function BlendingEvents2(id, scene) {

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Private variables
  let self = this;
  let canvas = scene.canvas;

  // Remember the current state of events
  let start_of_mouse_drag = null;
  let previous_time = Date.now();
  let animate_is_on = scene.animate_active;

  // Control the rate at which animations refresh
  let frame_rate = 30; // 33 milliseconds = 1/30 sec
  let time_between_frames = 1.0 / frame_rate;

  let src_factor_index = 1;
  let dst_factor_index = 0;
  let src_alpha_index = 1;
  let dst_alpha_index = 0;

  let color_func_index = 0;
  let alpha_func_index = 0;

  let change_which = 0;

  // Additional constructor code is at the end of the file.

  //-----------------------------------------------------------------------
  this.mouse_drag_started = function (event) {

    if (event.which === 1) { // left mouse button
      //console.log("started mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
      start_of_mouse_drag = event;
      event.preventDefault();

      if (animate_is_on) {
        scene.animate_active = false;
      }
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
  self.animate = function () {

    let now, elapsed_time;

    if (scene.animate_active) {

      now = Date.now();
      elapsed_time = now - previous_time;
      requestAnimationFrame(self.animate);

      if (elapsed_time >= time_between_frames) {
        previous_time = now;

        scene.angle_y += 1;
        scene.render();
      }

    }
  };

  //------------------------------------------------------------------------------
  self.animation_status = function(event) {
    animate_is_on = $(event.target).is(":checked");
    scene.animate_active = animate_is_on;

    if (animate_is_on) self.animate();
  };

  let enum_names = [
    "gl.ZERO",
    "gl.ONE",
    "gl.SRC_COLOR",
    "gl.ONE_MINUS_SRC_COLOR",
    "gl.DST_COLOR",
    "gl.ONE_MINUS_DST_COLOR",
    "gl.SRC_ALPHA",
    "gl.ONE_MINUS_SRC_ALPHA",
    "gl.DST_ALPHA",
    "gl.ONE_MINUS_DST_ALPHA",
    "gl.CONSTANT_COLOR",
    "gl.ONE_MINUS_CONSTANT_COLOR",
    "gl.CONSTANT_ALPHA",
    "gl.ONE_MINUS_CONSTANT_ALPHA",
    "gl.SRC_ALPHA_SATURATE"];

  let func_enum_names = [
    "gl.FUNC_ADD",
    "gl.FUNC_SUBTRACT",
    "gl.FUNC_REVERSE_SUBTRACT"
  ];

  //------------------------------------------------------------------------------
  function _updateCodeExample() {
    $('#' + id + '_code_example').html("<strong>gl.blendFuncSeparate("
      + enum_names[src_factor_index] + ", "
      + enum_names[dst_factor_index] + ",<br>"
      + enum_names[src_alpha_index] + ", "
      + enum_names[dst_alpha_index] + ");</strong>");
  }

  //------------------------------------------------------------------------------
  self.setFactor = function(event) {
    let id = $(event.target)[0].id;
    let type = id.slice(id.length-2, id.length-1);
    let index_str = id.slice(id.length-1);
    let index = parseInt(index_str, 16);
    let which_one;

    if (change_which === 0) { // change the color factors
      if (type === 's') {
        which_one = 0;
        src_factor_index = index;
      }
      else {
        which_one = 1;
        dst_factor_index = index;
      }
    } else { // change the alpha factors
      if (type === 's') {
        which_one = 2;
        src_alpha_index = index;
      } else {
        which_one = 3;
        dst_alpha_index = index;
      }
    }
    scene.setBlendingFactor( index, which_one );

    _updateCodeExample();

    if (! animate_is_on) scene.render();
  };

  //------------------------------------------------------------------------------
  self.constantColor = function(event) {
    scene.constant_color[0] = Number( $('#' + id + '_c0').val() );
    scene.constant_color[1] = Number( $('#' + id + '_c1').val() );
    scene.constant_color[2] = Number( $('#' + id + '_c2').val() );
    scene.constant_color[3] = Number( $('#' + id + '_c3').val() );

    if (! animate_is_on) scene.render();
  };

  //------------------------------------------------------------------------------
  self.background = function(event) {
    scene.background_color[0] = Number( $('#' + id + '_b0').val() );
    scene.background_color[1] = Number( $('#' + id + '_b1').val() );
    scene.background_color[2] = Number( $('#' + id + '_b2').val() );
    scene.background_color[3] = Number( $('#' + id + '_b3').val() );

    if (! animate_is_on) scene.render();
  };

  //------------------------------------------------------------------------------
  self.func = function(event) {
    let event_id = $(event.target)[0].id;
    let index_str = event_id.slice(event_id.length-1);
    let index = parseInt(index_str);

    scene.setFunc( index, change_which );

    switch (change_which) {
      case 0: color_func_index = index; break;
      case 1: alpha_func_index = index; break;
    }

    $('#' + id + '_func_title').html("<strong>gl.blendEquationSeparate("
      + func_enum_names[color_func_index] + ", "
      + func_enum_names[alpha_func_index] + ");</strong>");

    if (! animate_is_on) scene.render();
  };

  //------------------------------------------------------------------------------
  self.which = function(event) {
    let event_id = $(event.target)[0].id;
    let index_str = event_id.slice(3);

    if (index_str === "color") {
      change_which = 0;
      $('#' + id + '_factor_title1').text("Source COLOR blending");
      $('#' + id + '_factor_title2').text("Destination COLOR blending");
      $('#' + id + '_s' + parseInt(src_factor_index, 16)).prop("checked", true);
      $('#' + id + '_d' + parseInt(dst_factor_index, 16)).prop("checked", true);
      $('#' + id + '_f' + parseInt(color_func_index)).prop("checked", true);
    } else if (index_str === "alpha") {
      change_which = 1;
      $('#' + id + '_factor_title1').text("Source ALPHA blending");
      $('#' + id + '_factor_title2').text("Destination ALPHA blending");
      $('#' + id + '_s' + parseInt(src_alpha_index, 16)).prop("checked", true);
      $('#' + id + '_d' + parseInt(dst_alpha_index, 16)).prop("checked", true);
      $('#' + id + '_f' + parseInt(alpha_func_index)).prop("checked", true);
    }
  };

  //------------------------------------------------------------------------------
  self.randomizeCubes = function(event) {
    scene.randomizeCubes();

    if (! animate_is_on) scene.render();
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_animate').unbind('click', self.animation_status);
    $('#' + id + '_reset').unbind('click', self.randomizeCubes);
    $('#' + id + '_color').unbind('click', self.which);
    $('#' + id + '_alpha').unbind('click', self.which);

    for (let j=0; j<suffix.length; j++) {
      $('#' + id + '_s' + suffix[j]).unbind('click', self.setFactor);
      $('#' + id + '_d' + suffix[j]).unbind('click', self.setFactor);
    }

    for (let j=0; j<4; j++) {
      $('#' + id + '_c' + j).unbind('input change', self.constantColor);
      $('#' + id + '_b' + j).unbind('input change', self.background);
      $('#' + id + '_f' + j).unbind('click', self.func);
    }

    // Remove all mouse event handlers
    $(canvas).unbind( "mousedown", self.mouse_drag_started );
    $(canvas).unbind( "mouseup", self.mouse_drag_ended );
    $(canvas).unbind( "mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Additional constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_animate').on('click', self.animation_status);
  $('#' + id + '_reset').on('click', self.randomizeCubes);
  $('#' + id + '_color').on('click', self.which);
  $('#' + id + '_alpha').on('click', self.which);

  let suffix = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e' ];

  for (let j=0; j<suffix.length; j++) {
    $('#' + id + '_s' + suffix[j]).on('click', self.setFactor);
    $('#' + id + '_d' + suffix[j]).on('click', self.setFactor);
  }

  for (let j=0; j<4; j++) {
    $('#' + id + '_c' + j).on('input change', self.constantColor);
    $('#' + id + '_b' + j).on('input change', self.background);
    $('#' + id + '_f' + j).on('click', self.func);
  }

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
}



