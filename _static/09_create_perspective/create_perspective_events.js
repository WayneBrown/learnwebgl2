/**
 * create_perspective_events.js, By Wayne Brown, Fall 2017
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
window.CreatePerspectiveEvents = function (id, scene) {

  // Private variables
  let self = this;

  // Remember the current state of events
  let start_of_mouse_drag = null;

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
      if (scene.aspect > 1) {
        width = Math.min(300, scene.aspect * 200);
        height = width / scene.aspect;
      } else {
        height = Math.min(300, 200 / scene.aspect);
        width = height * scene.aspect;
      }
    } else {
      width = height = 200;
    }

    let canvas = $('#' + id + "_canvas_b");
    canvas.width(width).height(height);    // changes drawing buffer
    canvas.css("width", width);            // changes size of canvas
    canvas.css("height", height);          // changes size of canvas
  }

  //------------------------------------------------------------------------------
  self.reset = function (event) {
    scene.angle_x = 20.0 * 0.017453292519943295;
    scene.angle_y = 10.0 * 0.017453292519943295;
    scene.fovy = 45.0;
    scene.aspect = 1.0;
    scene.near = 2.0;
    scene.far = 10.0;

    $('#' + id + "_fovy_text").text(scene.fovy.toFixed(1));
    $('#' + id + "_aspect_text").text(scene.aspect.toFixed(1));
    $('#' + id + "_near_text").text(scene.near.toFixed(1));
    $('#' + id + "_far_text").text(scene.far.toFixed(1));

    $('#' + id + "_fovy").val(scene.fovy);
    $('#' + id + "_aspect").val(scene.aspect);
    $('#' + id + "_near").val(scene.near);
    $('#' + id + "_far").val(scene.far);

    _modifyCanvasSize();
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.changeCanvasSize = function (event) {
    let control = $(event.target);
    scene.change_canvas_size = control.is(":checked");
    _modifyCanvasSize();
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.fovy = function (event) {
    let control = $(event.target);
    scene.fovy = Number(control.val());
    _modifyCanvasSize();
    scene.render();
    $('#' + id + "_fovy_text").text(scene.fovy.toFixed(0) + " degrees");
  };

  //------------------------------------------------------------------------------
  self.aspect = function (event) {
    let control = $(event.target);
    scene.aspect = Number(control.val());
    _modifyCanvasSize();
    scene.render();
    $('#' + id + "_aspect_text").text(scene.aspect.toFixed(1));
  };

  //------------------------------------------------------------------------------
  self.near = function (event) {
    let control = $(event.target);
    scene.near = Number(control.val());
    _modifyCanvasSize();
    scene.render();
    $('#' + id + "_near_text").text(scene.near.toFixed(1));
  };

  //------------------------------------------------------------------------------
  self.far = function (event) {
    let control = $(event.target);
    scene.far = Number(control.val());
    _modifyCanvasSize();
    scene.render();
    $('#' + id + "_far_text").text(scene.far.toFixed(1));
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_reset').unbind('click', self.reset);
    $('#' + id + '_change_canvas').unbind('click', self.changeCanvasSize);
    $('#' + id + '_fovy').unbind("input change", self.fovy);
    $('#' + id + '_aspect').unbind("input change", self.aspect);
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
  $('#' + id + '_fovy').on("input change", self.fovy);
  $('#' + id + '_aspect').on("input change", self.aspect);
  $('#' + id + '_near').on("input change", self.near);
  $('#' + id + '_far').on("input change", self.far);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );

};



