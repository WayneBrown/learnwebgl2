/**
 * overlay_design_events.js, By Wayne Brown, Spring 2018
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
window.OverlayDesignEvents = function (id, scene) {

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
    let control, value, amount, scale;

    let color1 = "color 1 (" + Number($("#" + id + "_red0").val()).toFixed(2)
                      + ", " + Number($("#" + id + "_green0").val()).toFixed(2)
                      + ", " + Number($("#" + id + "_blue0").val()).toFixed(2) + ")";
    $("#" + id + "_color1_text").text(color1);

    let color2 = "color 2 (" + Number($("#" + id + "_red1").val()).toFixed(2)
                      + ", " + Number($("#" + id + "_green1").val()).toFixed(2)
                      + ", " + Number($("#" + id + "_blue1").val()).toFixed(2) + ")";
    $("#" + id + "_color2_text").text(color2);

    for (let j = 0; j<5; j++) {
      control = $("#" + id + "_amount" + j);
      value = Number(control.val()).toFixed(2);
      amount = "amount[" + j + "] = " + value;
      control.closest('td').prev('td').text(amount);

      control = $("#" + id + "_scale" + j);
      value = Number(control.val()).toFixed(2);
      scale = "scale[" + j + "] = " + value;
      control.closest('td').prev('td').text(scale);
    }
  }

  //------------------------------------------------------------------------------
  self.layerActive = function (event) {
    let text, state;
    let control = $(event.target);
    let name = control[0].id;
    let which = Number(name.charAt(name.length-1));

    scene.active_layer[which] = control.is(":checked");

    if  (scene.active_layer[which]) {
      text = "Layer active";
      state = "visible";
    } else {
      text = "Layer not used";
      state = "hidden";
    }
    control.closest('td').prev('td').text(text);

    $('#' + id + '_type0' + which).closest('td').css("visibility", state);
    $('#' + id + '_scale' + which).closest('td').css("visibility", state);
    $('#' + id + '_amount' + which).closest('td').css("visibility", state);
    $('#' + id + '_color0' + which).closest('td').css("visibility", state);

    scene.render();
  };

  //------------------------------------------------------------------------------
  self.type = function (event) {
    let text;
    let control = $(event.target);
    let id = control[0].id;
    let which = Number(id.charAt(id.length-1));
    let type = Number(id.charAt(id.length-2));

    scene.pattern_type[which] = type;

    scene.render();
  };

  //------------------------------------------------------------------------------
  self.color = function (event) {
    let control = $(event.target);
    let id = control[0].id;
    let name = id.substr(3);
    let which = Number(name.charAt(name.length-1));
    let index = Number(id.charAt(id.length-2));

    scene.color[which*3 + index] = Number(control.val());

    let components = control.closest('td').children();
    let red = components[0];
    let green = components[2];
    let blue = components[4];
    let text = "Color = (" + Number(red.value).toFixed(2) + ", "
                           + Number(green.value).toFixed(2) + ", "
                           + Number(blue.value).toFixed(2) + ")";

    control.closest('td').prev('td').text(text);

    scene.render();
  };

  //------------------------------------------------------------------------------
  self.amount = function (event) {
    let control = $(event.target);
    let id = control[0].id;
    let which = Number(id.charAt(id.length-1));

    scene.amount[which] = control.val();

    control.closest('td').prev('td').text("Amount = " + Number(control.val()).toFixed(2));
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.scale = function (event) {
    let control = $(event.target);
    let id = control[0].id;
    let which = Number(id.charAt(id.length-1));

    scene.scale[which] = control.val();

    control.closest('td').prev('td').text("Scale = " + Number(control.val()).toFixed(2));
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_pause').unbind("click", self.animation_status);
    for (let j=0; j<5; j++) {
      $('#' + id + '_layer' + j).unbind("click", self.layerActive);
      $('#' + id + '_type0' + j).unbind("click", self.type);
      $('#' + id + '_type1' + j).unbind("click", self.type);
      $('#' + id + '_type2' + j).unbind("click", self.type);
      $('#' + id + '_scale' + j).unbind("input change", self.scale);
      $('#' + id + '_amount' + j).unbind("input change", self.amount);
      $('#' + id + '_color0' + j).unbind("input change", self.color);
      $('#' + id + '_color1' + j).unbind("input change", self.color);
      $('#' + id + '_color2' + j).unbind("input change", self.color);
    }

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_pause').on('click', self.animation_status);
  for (let j=0; j<5; j++) {
    $('#' + id + '_layer' + j).on("click", self.layerActive);
    $('#' + id + '_type0' + j).on("click", self.type);
    $('#' + id + '_type1' + j).on("click", self.type);
    $('#' + id + '_type2' + j).on("click", self.type);
    $('#' + id + '_scale' + j).on("input change", self.scale);
    $('#' + id + '_amount' + j).on("input change", self.amount);
    $('#' + id + '_color0' + j).on("input change", self.color);
    $('#' + id + '_color1' + j).on("input change", self.color);
    $('#' + id + '_color2' + j).on("input change", self.color);
  }

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
};
