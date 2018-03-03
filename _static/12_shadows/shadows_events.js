/**
 * shadow_events.js, By Wayne Brown, Spring 2018
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
 * @param scene {ShadowsScene} an instance of the rendering object
 * @param scene2 {ShadowsScene2}
 * @constructor
 */
window.ShadowsEvents = function (id, scene, scene2) {

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
    scene.camera_data.eye[0] = zero;
    scene.camera_data.eye[1] = zero;
    scene.camera_data.eye[2] = five;
    scene.camera_data.center[0] = zero;
    scene.camera_data.center[1] = zero;
    scene.camera_data.center[2] = zero;

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
    scene.camera_data.eye[0] = Number($('#' + id + "_eyeX").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.eyeY = function (event) {
    scene.camera_data.eye[1] = Number($('#' + id + "_eyeY").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.eyeZ = function (event) {
    scene.camera_data.eye[2] = Number($('#' + id + "_eyeZ").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.cX = function (event) {
    scene.camera_data.center[0] = Number($('#' + id + "_cX").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.cY = function (event) {
    scene.camera_data.center[1] = Number($('#' + id + "_cY").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.cZ = function (event) {
    scene.camera_data.center[2] = Number($('#' + id + "_cZ").val());
    scene.render();
    _updateValuesDisplay();
  };

  //------------------------------------------------------------------------------
  self.setActiveLight = function (control) {
    let id = control[0].id;
    active_light = Number(id.charAt(id.length-1));
  };

  //------------------------------------------------------------------------------
  self.lightOn = function (event) {
    self.setActiveLight($(event.target));
    scene.lights[active_light].is_on = $(event.target).is(":checked");
    scene.render();
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
  self.camProjection = function (event) {
    let control = $(event.target);
    let value = Number(control.val());
    let name = control[0].id;
    let which = name.substr(7);
    let update = control.closest('td').prev('td');

    switch (which) {
      case "fov": scene.projection_data.fovy = value;
                  $('#' + id + "_cam_fov_text").text(value.toFixed(0));
                  break;
      case "asp": scene.projection_data.aspect_ratio = value;
                  $('#' + id + "_cam_asp_text").text(value.toFixed(1));
                  break;
      case "nea": scene.projection_data.near = value;
                  $('#' + id + "_cam_nea_text").text(value.toFixed(1));
                  break;
      case "far": scene.projection_data.far = value;
                  $('#' + id + "_cam_far_text").text(value.toFixed(1));
                  break;
      case "left": scene.projection_data.left = value;
                   update.text(value.toFixed(1));
                   break;
      case "right": scene.projection_data.right = value;
                    update.text(value.toFixed(1));
                    break;
      case "bottom": scene.projection_data.bottom = value;
                     update.text(value.toFixed(1));
                     break;
      case "top": scene.projection_data.top = value;
                  update.text(value.toFixed(1));
                  break;
      case "near": scene.projection_data.near = value;
                   update.text(value.toFixed(1));
                   break;
      case "farr": scene.projection_data.far = value;
                   update.text(value.toFixed(1));
                   break;
    }
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.camProjType = function (event) {
    let control = $(event.target);
    let value = Number(control.val());

    let tab0 = $('#' + id + '_orthographic_table');
    let tab1 = $('#' + id + '_perspective_table');

    switch (value) {
      case 0: scene.projection_data.setOrthographic();
              tab0.show();
              tab1.hide();
              break;
      case 1: scene.projection_data.setPerspective();
              tab0.hide();
              tab1.show();
              break;
    }
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.camProjection0 = function (event) {
    let control = $(event.target);
    let value = Number(control.val());
    let name = control[0].id;
    let which = name.substr(7);
    let update = control.closest('td').prev('td');

    switch (which) {
      case "fov0": scene.lights[0].projection_data.fovy = value;
        $('#' + id + "_cam_fov_text0").text(value.toFixed(0));
        break;
      case "asp0": scene.lights[0].projection_data.aspect_ratio = value;
        $('#' + id + "_cam_asp_text0").text(value.toFixed(1));
        break;
      case "nea0": scene.lights[0].projection_data.near = value;
        $('#' + id + "_cam_nea_text0").text(value.toFixed(1));
        break;
      case "far0": scene.lights[0].projection_data.far = value;
        $('#' + id + "_cam_far_text0").text(value.toFixed(1));
        break;
      case "left0": scene.lights[0].projection_data.left = value;
        update.text(value.toFixed(1));
        break;
      case "right0": scene.lights[0].projection_data.right = value;
        update.text(value.toFixed(1));
        break;
      case "bottom0": scene.lights[0].projection_data.bottom = value;
        update.text(value.toFixed(1));
        break;
      case "top0": scene.lights[0].projection_data.top = value;
        update.text(value.toFixed(1));
        break;
      case "near0": scene.lights[0].projection_data.near = value;
        update.text(value.toFixed(1));
        break;
      case "farr0": scene.lights[0].projection_data.far = value;
        update.text(value.toFixed(1));
        break;
    }
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.camProjType0 = function (event) {
    let control = $(event.target);
    let value = Number(control.val());

    let tab0 = $('#' + id + '_orthographic_table0');
    let tab1 = $('#' + id + '_perspective_table0');

    switch (value) {
      case 0: scene.lights[0].projection_data.setOrthographic();
        tab0.show();
        tab1.hide();
        break;
      case 1: scene.lights[0].projection_data.setPerspective();
        tab0.hide();
        tab1.show();
        break;
    }
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.renderMaps = function (event) {
    scene.render_shadow_map = $(event.target).is(":checked");
    scene.render();
  };

  //------------------------------------------------------------------------------
  self.renderWhichMap = function (event) {
    let control = $(event.target);
    scene.render_shadow_map_num = Number(control.val());
    scene.render();
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

    $('#' + id + '_cam_fov').unbind("input change", self.camProjection);
    $('#' + id + '_cam_asp').unbind("input change", self.camProjection);
    $('#' + id + '_cam_nea').unbind("input change", self.camProjection);
    $('#' + id + '_cam_far').unbind("input change", self.camProjection);

    $('#' + id + '_cam_left').unbind("input change", self.camProjection);
    $('#' + id + '_cam_right').unbind("input change", self.camProjection);
    $('#' + id + '_cam_bottom').unbind("input change", self.camProjection);
    $('#' + id + '_cam_top').unbind("input change", self.camProjection);
    $('#' + id + '_cam_near').unbind("input change", self.camProjection);
    $('#' + id + '_cam_farr').unbind("input change", self.camProjection);

    $('#' + id + '_cam_orthographic').unbind("click", self.camProjType);
    $('#' + id + '_cam_perspective').unbind("click", self.camProjType);

    $('#' + id + '_light_on0').unbind('click', self.lightOn);
    $('#' + id + '_lightX0').unbind("input change", self.lightX);
    $('#' + id + '_lightY0').unbind("input change", self.lightY);
    $('#' + id + '_lightZ0').unbind("input change", self.lightZ);
    $('#' + id + '_red0').unbind("input change", self.red);
    $('#' + id + '_green0').unbind("input change", self.green);
    $('#' + id + '_blue0').unbind("input change", self.blue);

    $('#' + id + '_cam_fov0').unbind("input change", self.camProjection0);
    $('#' + id + '_cam_asp0').unbind("input change", self.camProjection0);
    $('#' + id + '_cam_nea0').unbind("input change", self.camProjection0);
    $('#' + id + '_cam_far0').unbind("input change", self.camProjection0);

    $('#' + id + '_cam_left0').unbind("input change", self.camProjection0);
    $('#' + id + '_cam_right0').unbind("input change", self.camProjection0);
    $('#' + id + '_cam_bottom0').unbind("input change", self.camProjection0);
    $('#' + id + '_cam_top0').unbind("input change", self.camProjection0);
    $('#' + id + '_cam_near0').unbind("input change", self.camProjection0);
    $('#' + id + '_cam_farr0').unbind("input change", self.camProjection0);

    $('#' + id + '_cam_orthographic0').unbind("click", self.camProjType0);
    $('#' + id + '_cam_perspective0').unbind("click", self.camProjType0);

    $('#' + id + '_light_on1').unbind('click', self.lightOn);
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

    $('#' + id + '_render_maps').unbind('click', self.renderMaps);
    $('#' + id + '_map0').unbind('click', self.renderWhichMap);
    $('#' + id + '_map1').unbind('click', self.renderWhichMap);

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

  $('#' + id + '_cam_fov').on("input change", self.camProjection);
  $('#' + id + '_cam_asp').on("input change", self.camProjection);
  $('#' + id + '_cam_nea').on("input change", self.camProjection);
  $('#' + id + '_cam_far').on("input change", self.camProjection);

  $('#' + id + '_cam_left').on("input change", self.camProjection);
  $('#' + id + '_cam_right').on("input change", self.camProjection);
  $('#' + id + '_cam_bottom').on("input change", self.camProjection);
  $('#' + id + '_cam_top').on("input change", self.camProjection);
  $('#' + id + '_cam_near').on("input change", self.camProjection);
  $('#' + id + '_cam_farr').on("input change", self.camProjection);

  $('#' + id + '_cam_orthographic').on("click", self.camProjType);
  $('#' + id + '_cam_perspective').on("click", self.camProjType);

  $('#' + id + '_light_on0').on('click', self.lightOn);
  $('#' + id + '_lightX0').on("input change", self.lightX);
  $('#' + id + '_lightY0').on("input change", self.lightY);
  $('#' + id + '_lightZ0').on("input change", self.lightZ);
  $('#' + id + '_red0').on("input change", self.red);
  $('#' + id + '_green0').on("input change", self.green);
  $('#' + id + '_blue0').on("input change", self.blue);

  $('#' + id + '_cam_fov0').on("input change", self.camProjection0);
  $('#' + id + '_cam_asp0').on("input change", self.camProjection0);
  $('#' + id + '_cam_nea0').on("input change", self.camProjection0);
  $('#' + id + '_cam_far0').on("input change", self.camProjection0);

  $('#' + id + '_cam_left0').on("input change", self.camProjection0);
  $('#' + id + '_cam_right0').on("input change", self.camProjection0);
  $('#' + id + '_cam_bottom0').on("input change", self.camProjection0);
  $('#' + id + '_cam_top0').on("input change", self.camProjection0);
  $('#' + id + '_cam_near0').on("input change", self.camProjection0);
  $('#' + id + '_cam_farr0').on("input change", self.camProjection0);

  $('#' + id + '_cam_orthographic0').on("click", self.camProjType0);
  $('#' + id + '_cam_perspective0').on("click", self.camProjType0);

  $('#' + id + '_light_on1').on('click', self.lightOn);
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

  $('#' + id + '_render_maps').on('click', self.renderMaps);
  $('#' + id + '_map0').on('click', self.renderWhichMap);
  $('#' + id + '_map1').on('click', self.renderWhichMap);

  // Add standard mouse events to the canvas
  let cid = '#' + id + "_canvas";
  $( cid ).mousedown( self.mouse_drag_started );
  $( cid ).mouseup( self.mouse_drag_ended );
  $( cid ).mousemove( self.mouse_dragged );
};



