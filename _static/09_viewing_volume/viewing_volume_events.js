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
 * @param scene {OrthoExampleScene} an instance of the scene object
 * @constructor
 */
window.ViewingVolumeEvents = function (id, scene) {

  // Private variables
  let self = this;
  let out = scene.out;

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
    let delta_x, delta_y;

    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = -(event.clientY - start_of_mouse_drag.clientY);

      scene.angle_x += delta_y;
      scene.angle_y -= delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  self.useProjection = function (event) {
    let control = $(event.target);
    scene.use_projection = control.is(":checked");
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_use_projection').unbind("click", self.useProjection);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
    $( cid ).unbind("mousewheel", self.zoom );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.
  $('#' + id + '_use_projection').bind("click", self.useProjection);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
};



