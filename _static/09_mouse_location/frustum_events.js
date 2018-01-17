/**
 * frustum_events.js, By Wayne Brown, Fall 2017
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
window.FrustumEvents = function (id, scene) {

  // Private variables
  let self = this;

  //-----------------------------------------------------------------------
  self.mouse_moved = function (event) {

    //console.log("mouse moved x,y = " + event.offsetX + " " + event.offsetY + "  " + event.which);
    let coords = "(" + event.offsetX.toFixed(0) + ", " + event.offsetY.toFixed(0) + ")";
    $("#" + id + "_mouse_coordinates").text(coords);

    scene.mouse_x = (event.offsetX / 200) * (scene.right - scene.left) + scene.left;
    scene.mouse_y = scene.top - (event.offsetY / 200) * (scene.top - scene.bottom);
    coords = "(" + scene.mouse_x.toFixed(2) + ", " + scene.mouse_y.toFixed(2) + ", " + scene.near.toFixed(2) + ")";
    $("#" + id + "_world_coordinates").text(coords);

    coords = "ray = t*" + coords + "  t>=1";
    $("#" + id + "_world_ray").text(coords);

    scene.render();

    event.preventDefault();
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {

    let cid = '#' + id + "_canvas_b";
    $( cid ).unbind("mousemove", self.mouse_moved );
  };

  //------------------------------------------------------------------------------
  // Constructor code for the class.

  let canvas = document.getElementById(id + "_canvas_b");
  canvas.addEventListener("mousemove", self.mouse_moved);

};



