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
 * @param id {string} the webgldemo ID used to give HTML tags unique names
 * @param scene {CameraTruckScene} an instance of the scene object
 * @constructor
 */
function CameraTruck2Events(id, scene) {

  let self = this;

  // Private variables

  // Remember the current state of events
  let start_of_mouse_drag = null;

  let u_angle = 0;
  let v_angle = 0;
  let n_angle = 0;

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
    let delta_x, delta_y, new_x, new_y;
    let x_limit, y_limit;

    // Limit the change in angle to -30 to + 30 degree;
    x_limit = 180 * 0.017453292519943295;
    y_limit =  60 *  0.017453292519943295;

    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = -(event.clientX - start_of_mouse_drag.clientX) * 0.01745;
      delta_y = (event.clientY - start_of_mouse_drag.clientY) * 0.01745;

      new_x = scene.angle_x + delta_x;
      new_y = scene.angle_y + delta_y;

      if (new_x >= -x_limit && new_x <= x_limit) {
        scene.angle_x = new_x;
      }
      if (new_y >= -y_limit && new_y <= y_limit) {
        scene.angle_y = new_y;
      }
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  self.truck_left = function (event) {
    scene.scene_camera.truck(-0.1);

    // Update the sliders
    $("#" + id + "_eyeX").val(scene.scene_camera.eye[0]);
    $("#" + id + "_eyeY").val(scene.scene_camera.eye[1]);
    $("#" + id + "_eyeZ").val(scene.scene_camera.eye[2]);

    _updateValuesDisplay();
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.truck_right = function (event) {
    scene.scene_camera.truck(0.1);

    // Update the sliders
    $("#" + id + "_eyeX").val(scene.scene_camera.eye[0]);
    $("#" + id + "_eyeY").val(scene.scene_camera.eye[1]);
    $("#" + id + "_eyeZ").val(scene.scene_camera.eye[2]);

    _updateValuesDisplay();
    scene.render();
  };

  //------------------------------------------------------------------------------
  function _updateValuesDisplay() {
    $('#' + id + '_eye_text').html('<strong>eye ('
        + Number($("#" + id + "_eyeX").val()).toFixed(1) + ', '
        + Number($("#" + id + "_eyeY").val()).toFixed(1) + ', '
        + Number($("#" + id + "_eyeZ").val()).toFixed(1) + ')</strong>');
    $('#' + id + '_vectors_text').html(
      '<strong>u &lt;' + scene.scene_camera.u[0].toFixed(2) + ', '
                       + scene.scene_camera.u[1].toFixed(2) + ', '
                       + scene.scene_camera.u[2].toFixed(2) + '&gt;<br>' +
      '<strong>v &lt;' + scene.scene_camera.v[0].toFixed(2) + ', '
                       + scene.scene_camera.v[1].toFixed(2) + ', '
                       + scene.scene_camera.v[2].toFixed(2) + '&gt;<br>' +
      '<strong>n &lt;' + scene.scene_camera.n[0].toFixed(2) + ', '
                       + scene.scene_camera.n[1].toFixed(2) + ', '
                       + scene.scene_camera.n[2].toFixed(2) + '&gt;</strong>');
  }

  //------------------------------------------------------------------------------
  self.reset = function (event) {
    // Change the render values
    let zero = 0;
    let one = 1;
    let five = 5;
    scene.scene_camera.eye[0] = zero;
    scene.scene_camera.eye[1] = zero;
    scene.scene_camera.eye[2] = five;
    scene.scene_camera.u[0] = one;
    scene.scene_camera.u[1] = zero;
    scene.scene_camera.u[2] = zero;
    scene.scene_camera.v[0] = zero;
    scene.scene_camera.v[1] = one;
    scene.scene_camera.v[2] = zero;
    scene.scene_camera.n[0] = zero;
    scene.scene_camera.n[1] = zero;
    scene.scene_camera.n[2] = one;
    scene.scene_camera.updateTransform();

    // Change the sliders
    $("#" + id + "_eyeX").val(zero);
    $("#" + id + "_eyeY").val(zero);
    $("#" + id + "_eyeZ").val(five);

    $("#" + id + "_u_angle").val(zero);
    $("#" + id + "_v_angle").val(zero);
    $("#" + id + "_n_angle").val(zero);

    u_angle = v_angle = n_angle = 0;

    // Changed displayed text
    _updateValuesDisplay();
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.eyeX = function (event) {
    let control = $(event.target);
    scene.scene_camera.eye[0] = Number(control.val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.eyeY = function (event) {
    let control = $(event.target);
    scene.scene_camera.eye[1] = Number(control.val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.eyeZ = function (event) {
    let control = $(event.target);
    scene.scene_camera.eye[2] = Number(control.val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.uAngle = function (event) {
    let control = $(event.target);
    let delta = Number(control.val()) - u_angle;
    scene.scene_camera.rotateAboutU(delta);
    scene.render();
    _updateValuesDisplay();

    u_angle = Number(control.val());
  };

  //------------------------------------------------------------------------------
  self.vAngle = function (event) {
    let control = $(event.target);
    let delta = Number(control.val()) - v_angle;
    scene.scene_camera.rotateAboutV(delta);
    scene.render();
    _updateValuesDisplay();

    v_angle = Number(control.val());
  };

  //------------------------------------------------------------------------------
  self.nAngle = function (event) {
    let control = $(event.target);
    let delta = Number(control.val()) - n_angle;
    scene.scene_camera.rotateAboutN(delta);
    scene.render();
    _updateValuesDisplay();

    n_angle = Number(control.val());
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_truck_left').unbind('click', self.truck_left);
    $('#' + id + '_truck_right').unbind('click', self.truck_right);
    $('#' + id + '_reset').unbind('click', self.reset);
    $('#' + id + '_eyeX').unbind("input change", self.eyeX);
    $('#' + id + '_eyeY').unbind("input change", self.eyeY);
    $('#' + id + '_eyeZ').unbind("input change", self.eyeZ);
    $('#' + id + '_u_angle').unbind("input change", self.uAngle);
    $('#' + id + '_v_angle').unbind("input change", self.vAngle);
    $('#' + id + '_n_angle').unbind("input change", self.nAngle);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_truck_left').on('click', self.truck_left);
  $('#' + id + '_truck_right').on('click', self.truck_right);
  $('#' + id + '_reset').on('click', self.reset);
  $('#' + id + '_eyeX').on("input change", self.eyeX);
  $('#' + id + '_eyeY').on("input change", self.eyeY);
  $('#' + id + '_eyeZ').on("input change", self.eyeZ);
  $('#' + id + '_u_angle').on("input change", self.uAngle);
  $('#' + id + '_v_angle').on("input change", self.vAngle);
  $('#' + id + '_n_angle').on("input change", self.nAngle);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );

}



