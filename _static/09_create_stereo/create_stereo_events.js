/**
 * create_frustum_events.js, By Wayne Brown, Fall 2017
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
window.CreateStereoEvents = function (id, scene) {

  // Private variables
  let self = this;

  // Remember the current state of events
  let start_of_mouse_drag = null;
  let matrix = new GlMatrix4x4();

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
    let delta_x, delta_y, x_limit, y_limit, new_x, new_y;

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
  /**
   * Modify the size of the right canvas to match the aspect ratio of the perspective.
   * @private
   */
  function _modifyCanvasSize() {
    let width, height;
    if (scene.change_canvas_size) {
      let aspect = (scene.left_eye[1] - scene.left_eye[0])
        / (scene.left_eye[3] - scene.left_eye[2]);
      if (aspect > 1) {
        width = Math.min(200, aspect * 150);
        height = width / aspect;
      } else {
        height = Math.min(200, 150 / aspect);
        width = height * aspect;
      }
    } else {
      width = height = 150;
    }

    let canvas = $('#' + id + "_canvas_b");
    canvas.width(width).height(height);    // changes drawing buffer
    canvas.css("width", width);            // changes size of canvas
    canvas.css("height", height);          // changes size of canvas

    canvas = $('#' + id + "_canvas_c");
    canvas.width(width).height(height);    // changes drawing buffer
    canvas.css("width", width);            // changes size of canvas
    canvas.css("height", height);          // changes size of canvas
  }

  //------------------------------------------------------------------------------
  self.reset = function (event) {
    scene.angle_x = 20.0 * 0.017453292519943295;
    scene.angle_y = 10.0 * 0.017453292519943295;
    self.distance_between_eyes = 0.4;
    scene.left_eye[0] = -2.2;
    scene.left_eye[1] = 1.8;
    scene.right_eye[0] = -1.8;
    scene.right_eye[1] = 2.2;
    scene.left_eye[2] = scene.right_eye[2] = -2.0;
    scene.left_eye[3] = scene.right_eye[3] = 2.0;
    scene.left_eye[4] = scene.right_eye[4] = 3.0;
    scene.left_eye[5] = scene.right_eye[5] = 10.0;

    $('#' + id + "_left").val(scene.left_eye[0]).parent().prev().children().text(scene.left_eye[0].toFixed(1));
    $('#' + id + "_right").val(scene.left_eye[1]).parent().prev().children().text(scene.left_eye[1].toFixed(1));
    $('#' + id + "_bottom").val(scene.left_eye[2]).parent().prev().children().text(scene.left_eye[2].toFixed(1));
    $('#' + id + "_top").val(scene.left_eye[3]).parent().prev().children().text(scene.left_eye[3].toFixed(1));
    $('#' + id + "_near").val(scene.left_eye[4]).parent().prev().children().text(scene.left_eye[4].toFixed(1));
    $('#' + id + "_far").val(scene.left_eye[5]).parent().prev().children().text(scene.left_eye[5].toFixed(1));

    self.updateFrustums();
    self.updateDistance();
    _modifyCanvasSize();
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.updateFrustums = function () {
    scene.left_frustum = matrix.createFrustum(scene.left_eye[0], scene.left_eye[1],
                                              scene.left_eye[2], scene.left_eye[3],
                                              scene.left_eye[4], scene.left_eye[5]);
    scene.right_frustum = matrix.createFrustum(scene.right_eye[0], scene.right_eye[1],
                                               scene.right_eye[2], scene.right_eye[3],
                                               scene.right_eye[4], scene.right_eye[5]);
  };

  //------------------------------------------------------------------------------
  self.changeCanvasSize = function (event) {
    let control = $(event.target);
    scene.change_canvas_size = control.is(":checked");
    _modifyCanvasSize();
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.updateDistance = function () {
    let control = $('#' + id + '_distance');
    control.val(scene.distance_between_eyes);
    $(control).parent().prev().children().text(scene.distance_between_eyes.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.distance = function (event) {
    let control = $(event.target);
    let distance = Number(control.val());
    let half = distance / 2;
    let x_width = scene.left_eye[1] - scene.left_eye[0];
    scene.left_eye[0] = -(half + x_width/2);
    scene.left_eye[1] = scene.left_eye[0] + x_width;
    scene.right_eye[0] = half - x_width/2;
    scene.right_eye[1] = scene.right_eye[0] + x_width;
    self.updateFrustums();
    _modifyCanvasSize();
    scene.render();
    $(control).parent().prev().children().text(distance.toFixed(2));
  };

  //------------------------------------------------------------------------------
  self.left = function (event) {
    let control = $(event.target);
    let left = Number(control.val());
    // Change the left side of the left frustum
    scene.left_eye[0] = left;
    let x_width = scene.left_eye[1] - scene.left_eye[0];
    let x_mid = (scene.left_eye[0] + scene.left_eye[1])/2;

    // Update the distance between the eyes
    scene.distance_between_eyes = Math.abs(x_mid) * 2;
    self.updateDistance();

    // Update the right frustum
    let x_mid2 = x_mid + scene.distance_between_eyes;
    scene.right_eye[0] = x_mid2 - x_width/2;
    scene.right_eye[1] = x_mid2 + x_width/2;

    self.updateFrustums();
    _modifyCanvasSize();
    scene.render();
    $(control).parent().prev().children().text(left.toFixed(1));
  };

  //------------------------------------------------------------------------------
  self.right = function (event) {
    let control = $(event.target);
    let right = Number(control.val());
    // Change the right side of the left frustum
    scene.left_eye[1] = right;
    let x_width = scene.left_eye[1] - scene.left_eye[0];
    let x_mid = (scene.left_eye[0] + scene.left_eye[1])/2;

    // Update the distance between the eyes
    scene.distance_between_eyes = Math.abs(x_mid) * 2;
    self.updateDistance();

    // Update the right frustum
    let x_mid2 = x_mid + scene.distance_between_eyes;
    scene.right_eye[0] = x_mid2 - x_width/2;
    scene.right_eye[1] = x_mid2 + x_width/2;

    self.updateFrustums();
    _modifyCanvasSize();
    scene.render();
    $(control).parent().prev().children().text(right.toFixed(1));
  };

  //------------------------------------------------------------------------------
  self.bottom = function (event) {
    let control = $(event.target);
    scene.left_eye[2] = scene.right_eye[2] = Number(control.val());
    self.updateFrustums();
    _modifyCanvasSize();
    scene.render();
    $(control).parent().prev().children().text(scene.left_eye[2].toFixed(1));
  };

  //------------------------------------------------------------------------------
  self.top = function (event) {
    let control = $(event.target);
    scene.left_eye[3] = scene.right_eye[3] = Number(control.val());
    self.updateFrustums();
    _modifyCanvasSize();
    scene.render();
    $(control).parent().prev().children().text(scene.left_eye[3].toFixed(1));
  };

  //------------------------------------------------------------------------------
  self.near = function (event) {
    let control = $(event.target);
    scene.left_eye[4] = scene.right_eye[4] = Number(control.val());
    self.updateFrustums();
    _modifyCanvasSize();
    scene.render();
    $(control).parent().prev().children().text(scene.right_eye[4].toFixed(1));
  };

  //------------------------------------------------------------------------------
  self.far = function (event) {
    let control = $(event.target);
    scene.left_eye[5] = scene.right_eye[5] = Number(control.val());
    self.updateFrustums();
    _modifyCanvasSize();
    scene.render();
    $(control).parent().prev().children().text(scene.right_eye[5].toFixed(1));
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_reset').unbind('click', self.reset);
    $('#' + id + '_change_canvas').unbind('click', self.changeCanvasSize);
    $('#' + id + '_distance').unbind("input change", self.distance);
    $('#' + id + '_left').unbind("input change", self.left);
    $('#' + id + '_right').unbind("input change", self.right);
    $('#' + id + '_bottom').unbind("input change", self.bottom);
    $('#' + id + '_top').unbind("input change", self.top);
    $('#' + id + '_near').unbind("input change", self.near);
    $('#' + id + '_far').unbind("input change", self.far);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  $('#' + id + '_reset').on('click', self.reset);
  $('#' + id + '_change_canvas').on('click', self.changeCanvasSize);
  $('#' + id + '_distance').on("input change", self.distance);
  $('#' + id + '_left').on("input change", self.left);
  $('#' + id + '_right').on("input change", self.right);
  $('#' + id + '_bottom').on("input change", self.bottom);
  $('#' + id + '_top').on("input change", self.top);
  $('#' + id + '_near').on("input change", self.near);
  $('#' + id + '_far').on("input change", self.far);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );

};



