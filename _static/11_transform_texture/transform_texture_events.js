/**
 * transform_texture_events.js, By Wayne Brown, Fall 2017
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
window.TransformTextureEvents = function (id, scene) {

  // Private variables
  let self = this;        // Store a local reference to the new object.
  let out = scene.out;    // Debugging and output goes here.
  let canvas = scene.canvas;

  // Remember the current state of events
  let start_of_mouse_drag = null;
  let previous_time = Date.now();

  let sync_scales = true;

  // Animate deltas to animate the texture;
  let dtx = 0.01;
  let dty = 0.015;
  let dsx = 1.002;
  let dangle = 0.2;

  // Control the rate at which animations refresh
  let frame_rate = 33; // 33 milliseconds = 1/30 sec

  //-----------------------------------------------------------------------
  self.mouse_drag_started = function (event) {

    //out.displayInfo("started mouse drag event x,y = " +
    //                event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = event;
    event.preventDefault();
  };

  //-----------------------------------------------------------------------
  self.mouse_drag_ended = function (event) {

    //out.displayInfo("ended mouse drag event x,y = " +
    //                event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = null;

    event.preventDefault();
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

      if (! scene.animate_active) scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //------------------------------------------------------------------------------
  self.animation_status = function (event) {
    scene.animate_active = $(event.target).is(":checked");

    if (scene.animate_active) self.animate();
  };

  //------------------------------------------------------------------------------
  self.animate = function () {

    let now, elapsed_time;

    if (scene.animate_active) {

      now = Date.now();
      elapsed_time = now - previous_time;

      if (elapsed_time >= frame_rate) {
        scene.texture_tx += dtx;
        scene.texture_ty += dty;
        scene.texture_sx *= dsx;
        scene.texture_sy *= dsx;
        scene.texture_angle += dangle;

        // Don't let the texture get inifinitely big
        if (scene.texture_sx > 2.0) dsx = 0.998;

        if (scene.texture_sx < 0.5) dsx = 1.002;

        scene.render();
        previous_time = now;
      }

      requestAnimationFrame(self.animate);
    }
  };

  //------------------------------------------------------------------------------
  self.translateX = function(event) {
    let control = $(event.target);

    scene.texture_tx = Number(control.val());

    $(control).closest('td').prev('td').text("tx = " + scene.texture_tx.toFixed(2));

    if (! scene.animate_active) scene.render();
  };

  //------------------------------------------------------------------------------
  self.translateY = function(event) {
    let control = $(event.target);

    scene.texture_ty = Number(control.val());

    $(control).closest('td').prev('td').text("tx = " + scene.texture_ty.toFixed(2));

    if (! scene.animate_active) scene.render();
  };

  //------------------------------------------------------------------------------
  self.scaleX = function(event) {
    let control = $(event.target);

    scene.texture_sx = Number(control.val());

    $(control).closest('td').prev('td').text("sx = " + scene.texture_sx.toFixed(2));

    if (sync_scales) {
      scene.texture_sy = scene.texture_sx;
      let sy = $('#' + id + '_sy');
      sy.val(scene.texture_sx);
      $(sy).closest('td').prev('td').text("sy = " + scene.texture_sy.toFixed(2));
    }

    if (! scene.animate_active) scene.render();
  };

  //------------------------------------------------------------------------------
  self.scaleY = function(event) {
    let control = $(event.target);

    scene.texture_sy = Number(control.val());

    $(control).closest('td').prev('td').text("sy = " + scene.texture_sy.toFixed(2));

    if (sync_scales) {
      scene.texture_sx = scene.texture_sy;
      let sx = $('#' + id + '_sx');
      sx.val(scene.texture_sx);
      $(sx).closest('td').prev('td').text("sx = " + scene.texture_sx.toFixed(2));
    }

    if (! scene.animate_active) scene.render();
  };

  //------------------------------------------------------------------------------
  self.rotate = function(event) {
    let control = $(event.target);

    scene.texture_angle = Number(control.val());

    $(control).closest('td').prev('td').text("angle = " + scene.texture_angle.toFixed(0));

    if (! scene.animate_active) scene.render();
  };

  //------------------------------------------------------------------------------
  self.syncScales = function(event) {
    sync_scales = $(event.target).is(":checked");
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_pause').unbind("click", self.animation_status);
    $('#' + id + '_tx').unbind("input change", self.translateX);
    $('#' + id + '_ty').unbind("input change", self.translateY);
    $('#' + id + '_sx').unbind("input change", self.scaleX);
    $('#' + id + '_sy').unbind("input change", self.scaleY);
    $('#' + id + '_rotate').unbind("input change", self.rotate);
    $('#' + id + '_sync_scales').unbind('click', self.syncScales);

    let cid = '#' + id + "_canvas";
    $( cid ).unbind("mousedown", self.mouse_drag_started );
    $( cid ).unbind("mouseup",   self.mouse_drag_ended );
    $( cid ).unbind("mousemove", self.mouse_dragged );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  // Add an onclick callback to each HTML control
  $('#' + id + '_pause').on('click', self.animation_status);
  $('#' + id + '_tx').on("input change", self.translateX);
  $('#' + id + '_ty').on("input change", self.translateY);
  $('#' + id + '_sx').on("input change", self.scaleX);
  $('#' + id + '_sy').on("input change", self.scaleY);
  $('#' + id + '_rotate').on("input change", self.rotate);
  $('#' + id + '_sync_scales').on('click', self.syncScales);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
};
