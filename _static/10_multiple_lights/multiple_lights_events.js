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
 * @param scene {MultipleLightsScene} an instance of the rendering object
 * @param scene2 {MultipleLightsScene2}
 * @constructor
 */
window.MultipleLightsEvents = function (id, scene, scene2) {

  let self = this;

  let group_colors = false;
  let active_light = 0;
  let active_model = 0;
  let all_models = false;

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
    $('#' + id + '_eye_text').html('<strong>camera eye ('
        + Number($('#' + id + '_eyeX').val()).toFixed(1) + ', '
        + Number($('#' + id + '_eyeY').val()).toFixed(1) + ', '
        + Number($('#' + id + '_eyeZ').val()).toFixed(1) + ')</strong>');
    $('#' + id + '_center_text').html('<strong>camera center ('
        + Number($('#' + id + '_cX').val()).toFixed(1) + ', '
        + Number($('#' + id + '_cY').val()).toFixed(1) + ', '
        + Number($('#' + id + '_cZ').val()).toFixed(1) + ')</strong>');

    let n = active_light.toFixed(0);

    $('#' + id + '_light_text' + n).html('<strong>light' + n + ' position ('
        + Number($('#' + id + '_lightX' + n).val()).toFixed(1) + ', '
        + Number($('#' + id + '_lightY' + n).val()).toFixed(1) + ', '
        + Number($('#' + id + '_lightZ' + n).val()).toFixed(1) + ')</strong>');
    $('#' + id + '_light_color_text' + n).html('<strong>light' + n + ' color ('
      + Number($('#' + id + '_red' + n).val()).toFixed(2) + ', '
      + Number($('#' + id + '_green' + n).val()).toFixed(2) + ', '
      + Number($('#' + id + '_blue' + n).val()).toFixed(2) + ')</strong>');
    $('#' + id + '_ambient_text').html('<strong>ambient intensities<br>('
      + Number($('#' + id + '_ambient_red').val()).toFixed(2) + ', '
      + Number($('#' + id + '_ambient_green').val()).toFixed(2) + ', '
      + Number($('#' + id + '_ambient_blue').val()).toFixed(2) + ')</strong>');
    $('#' + id + '_attenuation_text').html('<strong>attenuation<br>1.0/(1.0 + '
      + Number($('#' + id + '_c1').val()).toFixed(2) + '*d + '
      + Number($('#' + id + '_c2').val()).toFixed(2) + '*d^2)</strong>');

    $('#' + id + '_shininess_text').html('<strong>shininess = '
      + Number($('#' + id + '_shininess').val()).toFixed(1) + '</strong>');
  }

  //------------------------------------------------------------------------------
  function _updateLightSliders() {
    $('#' + id + "_lightX0").val(scene.lights[0].position[0]);
    $('#' + id + "_lightY0").val(scene.lights[0].position[1]);
    $('#' + id + "_lightZ0").val(scene.lights[0].position[2]);

    $('#' + id + "_red0").val(  scene.lights[0].color[0]);
    $('#' + id + "_green0").val(scene.lights[0].color[1]);
    $('#' + id + "_blue0").val( scene.lights[0].color[2]);

    $('#' + id + "_lightX1").val(scene.lights[1].position[0]);
    $('#' + id + "_lightY1").val(scene.lights[1].position[1]);
    $('#' + id + "_lightZ1").val(scene.lights[1].position[2]);

    $('#' + id + "_red1").val(  scene.lights[1].color[0]);
    $('#' + id + "_green1").val(scene.lights[1].color[1]);
    $('#' + id + "_blue1").val( scene.lights[1].color[2]);
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

    scene.lights[0].position[0] = 3;
    scene.lights[0].position[1] = 0;
    scene.lights[0].position[2] = 5;
    scene.lights[0].color[0] = 1;
    scene.lights[0].color[1] = 1;
    scene.lights[0].color[2] = 1;

    scene.lights[1].position[0] = -3;
    scene.lights[1].position[1] = 0;
    scene.lights[1].position[2] = 5;
    scene.lights[1].color[0] = 1;
    scene.lights[1].color[1] = 1;
    scene.lights[1].color[2] = 1;

    scene.lights.c1 = 0.1;
    scene.lights.c2 = 0.0;

    // Change the sliders
    $('#' + id + "_eyeX").val(zero);
    $('#' + id + "_eyeY").val(zero);
    $('#' + id + "_eyeZ").val(five);

    $('#' + id + "_cX").val(zero);
    $('#' + id + "_cY").val(zero);
    $('#' + id + "_cZ").val(zero);

    _updateLightSliders();

    $('#' + id + "_shininess").val(30);

    $('#' + id + "_ambient_red").val(0.3);
    $('#' + id + "_ambient_green").val(0.3);
    $('#' + id + "_ambient_blue").val(0.3);

    $('#' + id + "_c1").val(0.1);
    $('#' + id + "_c2").val(0.0);

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
  self.setActiveLight = function (control) {
    let id = control[0].id;
    active_light = Number(id.charAt(id.length-1));
  };

  //------------------------------------------------------------------------------
  self.lightX = function (event) {
    self.setActiveLight($(event.target));
    scene.lights[active_light].position[0] = Number($('#' + id + "_lightX" + active_light).val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.lightY = function (event) {
    self.setActiveLight($(event.target));
    scene.lights[active_light].position[1] = Number($('#' + id + "_lightY" + active_light).val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.lightZ = function (event) {
    self.setActiveLight($(event.target));
    scene.lights[active_light].position[2] = Number($('#' + id + "_lightZ" + active_light).val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.red = function (event) {
    self.setActiveLight($(event.target));
    scene.lights[active_light].color[0] = Number($('#' + id + "_red" + active_light).val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.green = function (event) {
    self.setActiveLight($(event.target));
    scene.lights[active_light].color[1] = Number($('#' + id + "_green" + active_light).val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.blue = function (event) {
    self.setActiveLight($(event.target));
    scene.lights[active_light].color[2] = Number($('#' + id + "_blue" + active_light).val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.ambientRed = function (event) {
    scene.lights.ambient[0] = Number($('#' + id + "_ambient_red").val());
    if (group_colors) {
      scene.lights.ambient[1] = scene.lights.ambient[0];
      scene.lights.ambient[2] = scene.lights.ambient[0];
      $('#' + id + "_ambient_green").val(scene.lights.ambient[1]);
      $('#' + id + "_ambient_blue").val(scene.lights.ambient[2]);
    }
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.ambientGreen = function (event) {
    scene.lights.ambient[1] = Number($('#' + id + "_ambient_green").val());
    if (group_colors) {
      scene.lights.ambient[0] = scene.lights.ambient[1];
      scene.lights.ambient[2] = scene.lights.ambient[1];
      $('#' + id + "_ambient_red").val(scene.lights.ambient[0]);
      $('#' + id + "_ambient_blue").val(scene.lights.ambient[2]);
    }
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.ambientBlue = function (event) {
    scene.lights.ambient[2] = Number($('#' + id + "_ambient_blue").val());
    if (group_colors) {
      scene.lights.ambient[0] = scene.lights.ambient[2];
      scene.lights.ambient[1] = scene.lights.ambient[2];
      $('#' + id + "_ambient_red").val(scene.lights.ambient[0]);
      $('#' + id + "_ambient_green").val(scene.lights.ambient[1]);
    }
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.groupColors = function (event) {
    group_colors = $(event.target).is(":checked");
  };

  //------------------------------------------------------------------------------
  self.c1 = function (event) {
    scene.lights.c1 = Number($('#' + id + "_c1").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.c2 = function (event) {
    scene.lights.c2 = Number($('#' + id + "_c2").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.shininess = function (event) {
    let shininess = Number($('#' + id + "_shininess").val());
    scene2.setModelShininess(active_model, shininess);
    if (all_models) {
      for (let j=0; j<7; j++) {
        scene2.setModelShininess(j, shininess);
      }
    }
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.shininessModel = function (event) {
    let control = $(event.target);
    active_model = Number(control.val());
    let shininess = scene2.getModelShininess(active_model);
    $('#' + id + "_shininess").val(shininess);
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.allModels = function (event) {
    all_models = $(event.target).is(":checked");
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
    $('#' + id + '_lightX0').unbind("input change", self.lightX);
    $('#' + id + '_lightY0').unbind("input change", self.lightY);
    $('#' + id + '_lightZ0').unbind("input change", self.lightZ);
    $('#' + id + '_red0').unbind("input change", self.red);
    $('#' + id + '_green0').unbind("input change", self.green);
    $('#' + id + '_blue0').unbind("input change", self.blue);
    $('#' + id + '_lightX1').unbind("input change", self.lightX);
    $('#' + id + '_lightY1').unbind("input change", self.lightY);
    $('#' + id + '_lightZ1').unbind("input change", self.lightZ);
    $('#' + id + '_red1').unbind("input change", self.red);
    $('#' + id + '_green1').unbind("input change", self.green);
    $('#' + id + '_blue1').unbind("input change", self.blue);
    $('#' + id + '_shininess').unbind("input change", self.shininess);
    $('#' + id + '_ambient_red').unbind("input change", self.ambientRed);
    $('#' + id + '_ambient_green').unbind("input change", self.ambientGreen);
    $('#' + id + '_ambient_blue').unbind("input change", self.ambientBlue);
    $('#' + id + '_group_colors').unbind('click', self.groupColors);
    $('#' + id + '_c1').unbind("input change", self.c1);
    $('#' + id + '_c2').unbind("input change", self.c2);
    $('#' + id + '_shininess0').unbind('click', self.shininessModel);
    $('#' + id + '_shininess1').unbind('click', self.shininessModel);
    $('#' + id + '_shininess2').unbind('click', self.shininessModel);
    $('#' + id + '_shininess3').unbind('click', self.shininessModel);
    $('#' + id + '_shininess4').unbind('click', self.shininessModel);
    $('#' + id + '_shininess5').unbind('click', self.shininessModel);
    $('#' + id + '_shininess6').unbind('click', self.shininessModel);
    $('#' + id + '_all_models').unbind('click', self.allModels);

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
  $('#' + id + '_lightX0').on("input change", self.lightX);
  $('#' + id + '_lightY0').on("input change", self.lightY);
  $('#' + id + '_lightZ0').on("input change", self.lightZ);
  $('#' + id + '_red0').on("input change", self.red);
  $('#' + id + '_green0').on("input change", self.green);
  $('#' + id + '_blue0').on("input change", self.blue);
  $('#' + id + '_lightX1').on("input change", self.lightX);
  $('#' + id + '_lightY1').on("input change", self.lightY);
  $('#' + id + '_lightZ1').on("input change", self.lightZ);
  $('#' + id + '_red1').on("input change", self.red);
  $('#' + id + '_green1').on("input change", self.green);
  $('#' + id + '_blue1').on("input change", self.blue);
  $('#' + id + '_shininess').on("input change", self.shininess);
  $('#' + id + '_ambient_red').on("input change", self.ambientRed);
  $('#' + id + '_ambient_green').on("input change", self.ambientGreen);
  $('#' + id + '_ambient_blue').on("input change", self.ambientBlue);
  $('#' + id + '_group_colors').on('click', self.groupColors);
  $('#' + id + '_c1').on("input change", self.c1);
  $('#' + id + '_c2').on("input change", self.c2);
  $('#' + id + '_shininess0').on('click', self.shininessModel);
  $('#' + id + '_shininess1').on('click', self.shininessModel);
  $('#' + id + '_shininess2').on('click', self.shininessModel);
  $('#' + id + '_shininess3').on('click', self.shininessModel);
  $('#' + id + '_shininess4').on('click', self.shininessModel);
  $('#' + id + '_shininess5').on('click', self.shininessModel);
  $('#' + id + '_shininess6').on('click', self.shininessModel);
  $('#' + id + '_all_models').on('click', self.allModels);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
};



