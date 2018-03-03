/**
 * bunny_events.js, By Wayne Brown, Fall 2017
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
 * @param scene {BunnyScene} an instance of the rendering object
 * @constructor
 */
window.BunnyEvents = function (id, scene) {

  let self = this;

  //------------------------------------------------------------------------------
  // Constructor code for the class.

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
    let delta_x, delta_y, new_x, new_y;

    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = event.clientY - start_of_mouse_drag.clientY;

      scene.model_rotate_x += delta_y;
      scene.model_rotate_y += delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //-----------------------------------------------------------------------
  self.changeAlpha = function (event) {
    let value = Number( $(event.target).val() );
    scene.background_color[3] = value;
    $('#' + id + '_bk_text').text("[0.85, 0.60, 0.60, " + value.toFixed(2) + "]");
    scene.render();
  };

  /** ---------------------------------------------------------------------
   * Initiate full screen mode.
   * @param id {string} The ID of the element that will be made full screen.
   */
  self.startFullScreenMode = function (id) {

    // Get the element that will take up the entire screen
    let element = document.getElementById(id);

    // Make sure the element is allowed to go full screen.
    if (!element.fullscreenElement &&
      !element.mozFullScreenElement &&
      !element.webkitFullscreenElement &&
      !element.msFullscreenElement) {

      // Enter full screen mode
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      window.console.log("The element " + id + " can't go into full screen mode.");
    }
  };

  /** ---------------------------------------------------------------------
   * Reset the size of the affected elements after a fullscreen event.
   * @param new_width {Number} The new width for the HTML elements.
   * @param new_height {Number} The new height for the HTML elements.
   */
  self.updateCanvasSize = function (new_width, new_height) {

    // Change the CSS size of the main canvas window.
    $('#' + id + '_canvas').css('width', new_width).css('height', new_height);

    // Re-size the WebGL draw buffer.
    let canvas = document.getElementById(id + '_canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };

  //-----------------------------------------------------------------------
  self.onFullScreenChange = function (event) {
    if (document.fullscreenElement ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement) {
      // The document is in full screen mode.
      self.updateCanvasSize( screen.width, screen.height );
    } else {
      // The document is NOT in full screen mode.
      self.updateCanvasSize(300, 300);
    }
    scene.render();
  };

  //-----------------------------------------------------------------------
  self.enterFullScreen = function (event) {
    self.startFullScreenMode(id + '_canvas');
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    $('#' + id + '_bk_alpha').unbind("input change", self.changeAlpha);
    $('#' + id + '_fullscreen').unbind("click", self.enterFullScreen);

    try {
      let cid = '#graphics_under';
      $( cid ).unbind("mousedown", self.mouse_drag_started );
      $( cid ).unbind("mouseup",   self.mouse_drag_ended );
      $( cid ).unbind("mousemove", self.mouse_dragged );
    } catch(err) { }

    try {
      // These event bindings work if the canvas is on top.
      let cid = '#' + id + '_canvas';
      $( cid ).unbind("mousedown", self.mouse_drag_started );
      $( cid ).unbind("mouseup",   self.mouse_drag_ended );
      $( cid ).unbind("mousemove", self.mouse_dragged );
    } catch(err) { }

    $( '#' + id + '_canvas' ).unbind( 'fullscreenchange', self.onFullScreenChange )
                             .unbind( 'webkitfullscreenchange', self.onFullScreenChange )
                             .unbind( 'mozfullscreenchange', self.onFullScreenChange )
                             .unbind( 'MSFullscreenChange', self.onFullScreenChange );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.
  $('#' + id + '_bk_alpha').on("input change", self.changeAlpha);
  $('#' + id + '_fullscreen').on("click", self.enterFullScreen);

  // IMPORTANT: Only one of these event bindings is needed. They
  // are duplicated here so this event handler works for multiple examples.

  // These event bindings work if the canvas is under other elements.
  try {
    let cid = '#graphics_under';
    $( cid ).mousedown( self.mouse_drag_started );
    $( cid ).mouseup( self.mouse_drag_ended );
    $( cid ).mousemove( self.mouse_dragged );
  } catch(err) { }

  // These event bindings work if the canvas is on top.
  try {
    let cid = '#' + id + '_canvas';
    $( cid ).mousedown( self.mouse_drag_started );
    $( cid ).mouseup( self.mouse_drag_ended );
    $( cid ).mousemove( self.mouse_dragged );
  } catch(err) { }

  // Fullscreen mode change
  $( '#' + id + '_canvas' ).on( 'fullscreenchange', self.onFullScreenChange )
                           .on( 'webkitfullscreenchange', self.onFullScreenChange )
                           .on( 'mozfullscreenchange', self.onFullScreenChange )
                           .on( 'MSFullscreenChange', self.onFullScreenChange );
};



