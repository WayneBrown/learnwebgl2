.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

.. role:: raw-html(raw)
  :format: html

12.9 - Stencils
:::::::::::::::

A WebGL *draw buffer* is composed of three buffers: 1) a *color buffer*,
2) a *depth buffer*, and 3) an optional *stencil buffer*. This lesson describes
how *stencil buffers* can be manipulated by the graphics pipeline and
demonstrates their use in two example WebGL programs.

This lesson is longer than most. Sorry! Understanding *stencil buffers* will
take some time and require attention to detail. Therefore, please take your
time and study carefully.

The Big Idea
------------

A *stencil buffer* provides fine-grain control over which pixels are processed
by the graphics pipeline after they have been processed by a *fragment shader*.
*Stencil buffer* functionality is hard-coded
into the graphics pipeline and is controlled by a programmer through
*stencil buffer* parameters. Understanding the parameter settings is non-trivial,
so they will be explained in the simplest possible terms and then details will
be added to provide the "total picture."

There are two fundamental ideas:

* Using a "stencil test" to determine if a fragment should be allowed to modify the *color buffer*.
* Setting the *stencil buffer* values to create a "stencil mask."

Before discussing these two issues, let's discuss the structure and nature
of a *stencil buffer*.

The *Stencil Buffer*
--------------------

A *stencil buffer* must be created when a WebGL context is created for a canvas.
It is a 2D array of unsigned bytes that must have the same dimensions as the
*draw buffer*'s *color buffer* and *depth buffer*. Here is an example
of creating a :code:`WebGLRenderingContext` that contains a *stencil buffer*:

.. Code-Block:: JavaScript

  canvas = document.getElementById(canvas_id);
  context = canvas.getContext('webgl', {"stencil" : true} );

A :code:`true` or :code:`false` value can be represented using a single bit.
Typically :code:`0` means :code:`false` and :code:`1` means :code:`true`.
Since a *stencil buffer* stores an unsigned byte for each pixel, it can
potentially represent eight different "stencils" at any given time. WebGL
allows a programmer to specify a "mask" that determines which bits are tested
when a stencil test is performed. When a value from a *stencil buffer*
is retrieved, a bit-wise :code:`AND` operation is always performed with a "mask"
before it is used. A "mask" is typically specified in hexadecimal notation
by starting the value with :code:`0x`. The following table shows the
eight masks that can be used to differentiate the eight bits in an unsigned byte:

+--------+----------+----------+----------+----------+----------+----------+----------+----------+
| binary | 00000001 | 00000010 | 00000100 | 00001000 | 00010000 | 00100000 | 01000000 | 10000000 |
+--------+----------+----------+----------+----------+----------+----------+----------+----------+
| mask   | 0x01     | 0x02     | 0x04     | 0x08     | 0x10     | 0x20     | 0x40     | 0x80     |
+--------+----------+----------+----------+----------+----------+----------+----------+----------+

If each *stencil buffer* value is treated as a single :code:`true/false`
value, the "mask" can be set to :code:`0xFF` (all ones). Other division
of the bits are possible. For example, two stencils could be created, where
the high order four bits (using a mask of :code:`0xF0`) represent one stencil
and the low order fours bits (using a mask of :code:`0x0F`) represents
the other stencil. You can conceptualize the *stencil buffer* as a single "mask",
as eight separate "masks", or any number in-between.

The Stencil Test
----------------

When the stencil test is enabled, pixels are allowed to modify
the *color buffer* and the *depth buffer* only if they pass
a "stencil test." The following pseudocode describes the internal logic
of the graphics pipeline and demonstrates that the stencil test happens before
the depth test (assuming that the "depth test" has been enabled by :code:`gl.enable(gl.DEPTH_TEST)`).

:raw-html:`<style> pre { font-size: 7.5pt; } </style>`

+-----------------------------------------------------------+---------------------------------------------------------+
| No Stenciling                                             | With Stenciling                                         |
| :code:`gl.disable(gl.STENCIL_TEST)`                       | :code:`gl.enable(gl.STENCIL_TEST)`                      |
+===========================================================+=========================================================+
| .. Code-Block:: JavaScript                                | .. Code-Block:: JavaScript                              |
|                                                           |   :emphasize-lines: 6, 12                               |
|                                                           |                                                         |
|   void clearBuffers() {                                   |   void clearBuffers() {                                 |
|     for (x = 0; x < image_width; x++) {                   |     for (x = 0; x < image_width; x++) {                 |
|       for (y = 0; y < image_height; y++) {                |       for (y = 0; y < image_height; y++) {              |
|         depth_buffer[x][y] = maximum_z_value;             |         depth_buffer[x][y]   = maximum_z_value;         |
|         color_buffer[x][y] = background_color;            |         color_buffer[x][y]   = background_color;        |
|        }                                                  |         stencil_buffer[x][y] = stencil_value;           |
|     }                                                     |       }                                                 |
|   }                                                       |     }                                                   |
|                                                           |   }                                                     |
|   void renderPixel(x, y, z, color) {                      |                                                         |
|     if (z < depth_buffer[x][y]) {                         |   void renderPixel(x, y, z, color) {                    |
|       depth_buffer[x][y] = z;                             |     if (passes_stencil_test(x, y)) {                    |
|       color_buffer[x][y] = color;                         |       if (z < depth_buffer[x][y]) {                     |
|     }                                                     |         depth_buffer[x][y] = z;                         |
|   }                                                       |         color_buffer[x][y] = color;                     |
|                                                           |       }                                                 |
|                                                           |     }                                                   |
|                                                           |   }                                                     |
|                                                           |                                                         |
+-----------------------------------------------------------+---------------------------------------------------------+

The "stencil test" is a comparison between a "reference value" and the
current value stored in the *stencil buffer* at a pixel's :code:`(x,y)` location.
A programmer does not implement this logic, but rather specifies
the type of comparison, the reference value, and a mask using a call to
:code:`gl.stencilFunc( enum func, int ref, uint mask )`. The following
pseudocode demonstrates the functionality.

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 19-20

  // -------------------------------------------------------------
  // STENCIL TEST - does a pixel pass the stencil test?
  int stencil_func = ALWAYS;  // DEFAULT
  int reference    = 0;       // DEFAULT
  int bit_mask     = 0xFF;    // DEFAULT - all bits are ones

  // Sets the STENCIL TEST parameters:
  void gl.stencilFunc( enum func, int ref, uint mask ) {
    stencil_func = func;
    reference    = ref;
    bit_mask     = mask;
  }

  // Performs the STENCIL TEST:
  boolean passes_stencil_test(x, y) {
    condition = TRUE;
    if (STENCIL_TEST_IS_ENABLED) {

      stencil_value   = stencil_buffer[x][y] & bit_mask;  // bit-wise AND
      reference_value = reference            & bit_mask;  // bit-wise AND

      switch (stencil_func) {
        case NEVER:    condition = false;
        case ALWAYS:   condition = true;  // DEFAULT
        case LESS:     condition = (reference_value <  stencil_value);
        case LEQUAL:   condition = (reference_value <= stencil_value);
        case EQUAL:    condition = (reference_value == stencil_value);
        case GREATER:  condition = (reference_value >  stencil_value);
        case GEQUAL:   condition = (reference_value >= stencil_value);
        case NOTEQUAL: condition = (reference_value != stencil_value);
      }
    }
    return condition;
  }

For example, :code:`gl.stencilFunc( gl.EQUAL, 2, 0x02 )` would configure
the stencil test to be true for a pixel at :code:`(x,y)` if the value
at :code:`stencil_buffer[x][y]` has its low order 2nd bit set to 1.
Note that performing a bit-wise AND operation
using a mask of :code:`0x02` will produce either a value of :code:`2` or :code:`0`.

For another example, :code:`gl.stencilFunc( gl.GREATER, 15, 0xF0 )` would configure
the stencil test to be true for a pixel at :code:`(x,y)` if the value
at :code:`stencil_buffer[x][y]` has any of its four high order bits set to one.
Note that performing a bit-wise AND operation
using a mask of :code:`0xF0` will produce one of the following 16 values:
0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240.

As the above pseudocode indicates, the stencil test can be
configured to perform one of eight possible comparisons. In addition, it
makes sure that only certain bits are used in the comparison.

FRONT vs. BACK Faces
....................

By default, WebGL considers a triangle whose
vertices are ordered counter-clockwise as "front-facing" and triangles
whose vertices are ordered clockwise as "back-facing". The graphics
pipeline always passes a boolean input variable called
:code:`gl_FrontFacing` to a *fragment shader*.
If :code:`gl_FrontFacing` is :code:`true`, the pipeline should render
the "front" side of a triangle, otherwise the "back" side. (The
:code:`gl_FrontFacing` value can be used or ignored by a *fragment shader*.)

Note that OpenGL ES 2.0 allows stencil testing to be performed differently for
front and back facing triangles, but WebGL does not. Therefore calls to :code:`gl.stencilFuncSeparate()`
should not be used in WebGL.

Creating a Stencil
------------------

Each pixel in a *stencil buffer* is assigned a value by clearing the buffer
with a specific value and then rendering a scene.
As with the "stencil test," the work of defining a stencil is hard-coded
into the graphics pipeline. The programmer's responsibilities is
to assign appropriate parameters to the **stencil operation** parameters before
a rendering is performed.

Please study the following pseudocode which described the internal workings of the
graphics pipeline and shows when a *stencil operation*
is preformed and the data it uses. Please notice the following:

* To simplify the pseudocode, tests to determine if the :code:`gl.STENCIL_TEST`
  is enabled have been left out. However, stencil operations are only performed
  when the :code:`gl.STENCIL_TEST` has been enabled.

* The *stencil buffer* is updated once by each invocation of a *fragment shader*.
  *Stencil operation* parameters define a separate operation for fragments that
  failed the "stencil test," or that passed the "stencil test" but either
  passed or failed the "depth test."

* Updating the *stencil buffer* is performed after the *stencil test* and the
  *depth test* have been completed. This takes some contemplation! A *stencil
  buffer*\ 's value is used, and then updated to possibly a different value!
  In typical usage this rarely happens. The "stencil test" parameters and the
  "stencil operation" parameters are typically configured to perform one or the
  other, but not both at the same time.

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 13

  void renderPixel(x, y, z, color) {
    if (passes_stencil_test(x,y)) {
      if (z < z_buffer[x][y]) {
        depth_buffer[x][y] = z;
        color_buffer[x][y] = color;
        status = DEPTH_TEST_PASSED;
      } else {
        status = DEPTH_TEST_FAILED;
      }
    } else {
      status = STENCIL_TEST_FAILED;
    }
    update_stencil_buffer(x, y, status);
  }

Updating the *stencil buffer* is described by the following pseudocode. Please
study the pseudocode carefully. (Note that the :code:`gl.REPLACE` operation
uses the :code:`reference` value set by
:code:`gl.stencilFunc( func, reference, mask )`. In addition, the
:code:`mask` limits the bits that can be modified in the *stencil buffer's* value.

.. Code-Block:: JavaScript

  // -------------------------------------------------------------
  // STENCIL OPERATION - sets a pixel's value in a stencil buffer.
  int stencil_test_failed_func = KEEP;  // DEFAULT
  int depth_test_failed_func   = KEEP;  // DEFAULT
  int depth_test_passed_func   = KEEP;  // DEFAULT

  int MAX_VALUE = 255; // for an 8-bit stencil buffer
  int MIN_VALUE = 0;

  void gl.stencilOp( enum sfail, enum dpfail, enum dppass ) {
    stencil_test_failed_func = sfail;
    depth_test_failed_func   = dpfail;
    depth_test_passed_func   = dppass;
  }

  void update_stencil_buffer(x, y, status) {
    if (STENCIL_TEST_IS_ENABLED) {

      switch (status) {
        case DEPTH_TEST_PASSED:   stencil_func = depth_test_passed_func;
        case DEPTH_TEST_FAILED:   stencil_func = depth_test_failed_func;
        case STENCIL_TEST_FAILED: stencil_func = stencil_test_failed_func;
      }

      stencil_value   = stencil_buffer[x][y] & bit_mask;  // bit-wise AND
      reference_value = reference            & bit_mask;  // bit-wise AND

      switch (stencil_func) {
        case KEEP:      value = stencil_value;
        case ZERO:      value = 0;
        case REPLACE:   value = reference_value;
        case INCR:      value = stencil_value + 1;
                        if (value > MAX_VALUE) value = MAX_VALUE;
        case DECR:      value = stencil_value - 1;
                        if (value < MIN_VALUE) value = MIN_VALUE;
        case INVERT:    value = ~ stencil_value;
        case INCR_WRAP: value = stencil_value + 1;
                        if (value > MAX_VALUE) value = MIN_VALUE;
        case DECR_WRAP: value = stencil_value - 1;
                        if (value < MIN_VALUE) value = MAX_VALUE;
      }
      stencil_buffer[x][y] = (value & bit_mask) |
                             (stencil_buffer[x][y] & ~bit_mask);
    }
  }

FRONT vs. BACK Faces
....................

Stencil operations that change the values in a *stencil buffer* are
more complex than described above because they can be set to process
front-facing and back-facing triangles differently using the function
:code:`StencilOpSeparate( enum face, enum sfail, enum dpfail, enum dppass )`.
Passing :code:`gl.FRONT` for the :code:`face` parameter
sets the stencil operations for front-facing triangles, while passing :code:`gl.BACK`
sets the stencil operations for back-facing triangles. The following
pseudocode describes the full range of **stencil operations**. The variables
prefixed with :code:`back_` are for processing back-facing triangles.

.. Code-Block:: JavaScript

  // -------------------------------------------------------------
  // STENCIL OPERATION - sets a pixel's value in a stencil buffer.
  int stencil_test_failed_func = KEEP;       // DEFAULT
  int depth_test_failed_func   = KEEP;       // DEFAULT
  int depth_test_passed_func   = KEEP;       // DEFAULT

  int back_stencil_test_failed_func = KEEP;  // DEFAULT
  int back_depth_test_failed_func   = KEEP;  // DEFAULT
  int back_depth_test_passed_func   = KEEP;  // DEFAULT

  int MAX_VALUE = 255; // for an 8-bit stencil buffer
  int MIN_VALUE = 0;

  void gl.stencilOp( enum sfail, enum dpfail, enum dppass ) {
    stencil_test_failed_func = sfail;
    depth_test_failed_func   = dpfail;
    depth_test_passed_func   = dppass;
  }

  void gl.stencilOpSeparate( enum face, enum sfail, enum dpfail, enum dppass ) {
    if (face == gl.FRONT || face == gl.FRONT_AND_BACK) {
      stencil_test_failed_func = sfail;
      depth_test_failed_func   = dpfail;
      depth_test_passed_func   = dppass;
    }

    if (face == gl.BACK || face == gl.FRONT_AND_BACK) {
      back_stencil_test_failed_func = sfail;
      back_depth_test_failed_func   = dpfail;
      back_depth_test_passed_func   = dppass;
    }
  }

  void update_stencil_buffer(x, y, status, gl_FrontFacing) {
    if (STENCIL_TEST_IS_ENABLED) {

      if (gl_FrontFacing) {
        switch (status) {
          case DEPTH_TEST_PASSED:   stencil_func = depth_test_passed_func;
          case DEPTH_TEST_FAILED:   stencil_func = depth_test_failed_func;
          case STENCIL_TEST_FAILED: stencil_func = stencil_test_failed_func;
        }
      } else { // ! gl_FrontFacing --> back-facing
        switch (status) {
          case DEPTH_TEST_PASSED:   stencil_func = back_depth_test_passed_func;
          case DEPTH_TEST_FAILED:   stencil_func = back_depth_test_failed_func;
          case STENCIL_TEST_FAILED: stencil_func = back_stencil_test_failed_func;
        }
      }

      stencil_value   = stencil_buffer[x][y] & bit_mask;  // bit-wise AND
      reference_value = reference            & bit_mask;  // bit-wise AND

      switch (stencil_func) {
        case KEEP:      value = stencil_value;
        case ZERO:      value = 0;
        case REPLACE:   value = reference_value;
        case INCR:      value = stencil_value + 1;
                        if (value > MAX_VALUE) value = MAX_VALUE;
        case DECR:      value = stencil_value - 1;
                        if (value < MIN_VALUE) value = MIN_VALUE;
        case INVERT:    value = ~ stencil_value;
        case INCR_WRAP: value = stencil_value + 1;
                        if (value > MAX_VALUE) value = MIN_VALUE;
        case DECR_WRAP: value = stencil_value - 1;
                        if (value < MIN_VALUE) value = MAX_VALUE;
      }
      stencil_buffer[x][y] = (value & bit_mask) |
                             (stencil_buffer[x][y] & ~bit_mask);
    }
  }

.. admonition:: Caveat

  The OpenGL ES 2.0 and WebGL 1.0 specifications do not specify whether
  the :code:`INCR`, :code:`DECR`, :code:`INCR_WRAP`, and :code:`DECR_WRAP`
  functionality is based on a :code:`MIN_VALUE` and :code:`MAX_VALUE` of an
  8-bit unsigned integer, or limited by the minimum and maximum values based on
  the :code:`bit_mask`.

Multi-pass Rendering
--------------------

When using a *stencil buffer*, a rendering is typically performed by
a series of "rendering passes." The first rendering pass creates a desired *stencil buffer*
while follow-on renderings use the *stencil buffer* to control which
pixels in a *color buffer* are modified. WebGL provides fine-grain control
of the *draw buffers* to allow a scene to be "rendered" but only change
specific buffers. The :code:`gl.colorMask(bool red, bool green, bool blue, bool alpha)`
function determines whether individual components of a *color buffer* can be updated.
The :code:`gl.depthMask(bool flag)` function determines whether the *depth buffer*
can be modified. And the :code:`stencilMask(unit mask)` function determines which
bits in a *stencil buffer* value can be modified.

Our final pseudocode to describe the internal logic of the graphics pipeline
demonstrates this fine-grain control.

.. Code-Block:: JavaScript
  :linenos:

  boolean write_red   = TRUE;       // Default
  boolean write_green = TRUE;       // Default
  boolean write_blue  = TRUE;       // Default
  boolean write_alpha = TRUE;       // Default
  boolean write_depth = TRUE;       // Default
  unsigned_int stencil_mask = 0xFF; // Default

  void gl.colorMask(bool red, bool green, bool blue, bool alpha) {
    write_red   = red;
    write_green = green;
    write_blue  = blue;
    write_alpha = alpha;
  }

  void gl.depthMask(bool flag) {
    write_depth = flag;
  }

  void stencilMask(unit mask) {
    stencil_mask = mask;
  }

  void renderPixel(x, y, z, color) {
    if (passes_stencil_test(x,y)) {
      if (z < z_buffer[x][y]) {
        if (write_depth) depth_buffer[x][y] = z;
        if (write_red)   color_buffer[x][y].r = color.r;
        if (write_green) color_buffer[x][y].g = color.g;
        if (write_blue)  color_buffer[x][y].b = color.b;
        if (write_alpha) color_buffer[x][y].a = color.a;
        status = DEPTH_TEST_PASSED;
      } else {
        status = DEPTH_TEST_FAILED;
      }
    } else {
      status = STENCIL_TEST_FAILED;
    }
    update_stencil_buffer(x, y, status, stencil_mask);
  }

When a *stencil buffer* value is modified, which bits are changed is
controlled by the :code:`stencil_mask`. Pseudocode that simulates this
might look like:

.. Code-Block:: JavaScript
  :linenos:

  void update_stencil_buffer(x, y, status, gl_FrontFacing) {
    if (STENCIL_TEST_IS_ENABLED) {
      ...
      new_value = (value & bit_mask) | (stencil_buffer[x][y] & ~bit_mask);

      if (stencil_mask.bit[0] == 1) stencil_buffer[x][y].bit[0] = new_value.bit[0];
      if (stencil_mask.bit[1] == 1) stencil_buffer[x][y].bit[1] = new_value.bit[1];
      if (stencil_mask.bit[2] == 1) stencil_buffer[x][y].bit[2] = new_value.bit[2];
      if (stencil_mask.bit[3] == 1) stencil_buffer[x][y].bit[3] = new_value.bit[3];
      if (stencil_mask.bit[4] == 1) stencil_buffer[x][y].bit[4] = new_value.bit[4];
      if (stencil_mask.bit[5] == 1) stencil_buffer[x][y].bit[5] = new_value.bit[5];
      if (stencil_mask.bit[6] == 1) stencil_buffer[x][y].bit[6] = new_value.bit[6];
      if (stencil_mask.bit[7] == 1) stencil_buffer[x][y].bit[7] = new_value.bit[7];
    }
  }

Using a *Stencil Buffer*
------------------------

The following two WebGL programs provide examples of tasks
that use a stencil buffer.

Example 1 - Model Outline
.........................

The stencil buffer can be used to mark the pixels that surround a
model and then color those pixels to indicate that the model has
been selected by a user (or "marked" for some other reason).
The basic steps to render a border around a model are:

1. Enable the *stencil buffer*, disable changes to the *color buffer*,
   render the model scaled to a slightly
   larger size, and "mark" each pixel that is rendered in the *stencil buffer*.
2. Render the model at its normal size and "un-mark" each pixel that is
   rendered. (This leaves only the pixels surrounding the model as "marked.")
3. Render the model at its larger size and simply color each pixel that is
   "marked" in the *stencil buffer*.

Experiment with the following WebGL program and study the :code:`_renderSelected()`
function in the :code:`stencil_outline_scene.js` code file.

.. webglinteractive:: W1
  :htmlprogram: _static/12_stencil_outline/stencil_outline.html
  :editlist: _static/12_stencil_outline/stencil_outline_scene.js
  :hideoutput:

Note that the size of the border is in "world units". Given a different scene with
models of different sizes, the border size would need to be adjusted accordingly.

The following is a detailed description of the program and specifically the
:code:`_renderSelected()` function. The details are non-trivial and require studying.

.. |CreateStencilBuffer| replace:: A *stencil buffer* is created when the
  :code:`WebGLRenderingContext` is created for the canvas.

.. |CallRenderSelected| replace:: If a model has been selected by the user
  using a mouse right-click, the function :code:`_renderSelected()` is called
  to render a border around the model.

.. |StartStencilTest| replace:: :code:`gl.enable(gl.STENCIL_TEST)` enables
  the *stencil buffer* functionality.

.. |DisableColor| replace:: :code:`gl.colorMask(false, false, false, false)`
  disables changes to the *color buffer* so that the renderings that create the
  stencil do not change the visible image.

.. |DisableDepthChanges| replace:: :code:`gl.depthMask(false)`
  disables changes to the *depth buffer*. Why? A larger model will be rendered
  to mark pixels in the *stencil buffer* and then the original sized model
  will be rendered to "unmark" the pixels in the interior of the masked region.
  The larger model will have pixels closer to the camera and depth testing
  will prevent the original model from being rendered.
  In addition, changing the *depth buffer* so that other models can be rendered
  correctly is not needed because the entire scene has already been rendered.

.. |PassStencilTest| replace:: :code:`gl.stencilFunc(gl.ALWAYS, 1, 0xFF)`
  makes the "stencil test" always true, (:code:`gl.ALWAYS`), because this
  rendering pass is creating the stencil mask. The :code:`1` parameter is
  the "reference value" to set pixels in the *stencil buffer*. The :code:`0xFF`
  mask allows all bits in the *stencil buffer* values to be changed.

.. |ReplaceStencilPixels| replace:: :code:`gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)`
  sets a *stencil buffer* pixel every time the "depth test" is true. The
  pixels are set to :code:`1` because of the "reference value" parameter in the
  previous function call. For every pixel that is colored by
  the rendering, its associated *stencil buffer* value will be set to :code:`1`.

.. |AllowStencilBufferChanges| replace:: :code:`gl.stencilMask(0xFF)`
  allows the *stencil buffer* values to be changed. This is important
  because the first rendering pass is creating the mask in the *stencil buffer*.

.. |Render1| replace:: Render the model at a slightly larger scale than
  its original size.

.. |ClearInterior| replace:: In preparation for the 2nd model rendering,
  :code:`gl.stencilFunc(gl.EQUAL, 1, 0xFF)` makes the "stencil test" pass
  if the pixel's stencil value is equal to :code:`1`. This makes sure that
  all pixels from the previous rendering are processed.

.. |ClearInterior2| replace:: In preparation for the 2nd model rendering,
  :code:`gl.stencilOp(gl.KEEP, gl.DECR, gl.DECR)` decrements a *stencil
  buffer's* value whether the "depth test" passes or fails. This guarantees
  that all interior pixels are returned back to zero in the *stencil buffer*

.. |Render2| replace:: Render the model again, but this time at its
  normal scale.

.. |EnableColoring| replace:: In preparation for the 3rd rendering pass,
  :code:`gl.colorMask(true, true, true, true)` enables modifications to
  the *color buffer* to allow the border to be rendered.

.. |StencilTestOn| replace:: The stencil test is set to only process pixels
  if their associated *stencil buffer* value is equal to :code:`1`.
  (:code:`gl.stencilFunc(gl.EQUAL, 1, 0xFF)`)

.. |DontChangeStencilBuffer| replace:: This rendering pass should not
  modify the *stencil buffer*. Therefore clear the
  stencil mask, :code:`gl.stencilMask(0x00)`.

.. |Render3| replace:: On the 3rd and final rendering pass, render
  the model at its larger size and color every pixel that has a
  *stencil buffer* value of 1.

.. |Restore| replace:: Restore the graphic pipeline's state to normal
  rendering modes.

+----------+----------------------------------------------------+
| Lines    | Description                                        |
+==========+====================================================+
| 245      | |CreateStencilBuffer|                              |
+----------+----------------------------------------------------+
| 145      | |ClearBuffers|                                     |
+----------+----------------------------------------------------+
| 187-189  | |CallRenderSelected|                               |
+----------+----------------------------------------------------+
| 95       | |StartStencilTest|                                 |
+----------+----------------------------------------------------+
| 96       | |DisableColor|                                     |
+----------+----------------------------------------------------+
| 97       | |DisableDepthChanges|                              |
+----------+----------------------------------------------------+
| 98       | |PassStencilTest|                                  |
+----------+----------------------------------------------------+
| 99       | |ReplaceStencilPixels|                             |
+----------+----------------------------------------------------+
| 100      | |AllowStencilBufferChanges|                        |
+----------+----------------------------------------------------+
| 102-108  | |Render1|                                          |
+----------+----------------------------------------------------+
| 112      | |ClearInterior|                                    |
+----------+----------------------------------------------------+
| 113      | |ClearInterior2|                                   |
+----------+----------------------------------------------------+
| 115-120  | |Render2|                                          |
+----------+----------------------------------------------------+
| 124      | |EnableColoring|                                   |
+----------+----------------------------------------------------+
| 125      | |StencilTestOn|                                    |
+----------+----------------------------------------------------+
| 126      | |DontChangeStencilBuffer|                          |
+----------+----------------------------------------------------+
| 128-133  | |Render3|                                          |
+----------+----------------------------------------------------+
| 136-137  | |Restore|                                          |
+----------+----------------------------------------------------+

Now that you partially understand the program, experiment with it
to verify your understanding.

Example 2 - Restricted Rendering
................................

The following WebGL program simulates the reflection of a model in a
flat plane. This is accomplished by rendering a "mirror" of the model and
restricting the drawing to only those pixels that compose the flat plane.
Restricting the drawing to the flat plane, which can take on various shapes
based on the scene's camera location, is done using the stencil buffer.
The basic steps are:

1. Render a model.
2. Render a flat plane with the stencil test enabled. This remembers
   which pixels the flat plane covers.
3. Render the model mirrored about the flat plane, but with the stencil
   test enabled. This prevents the mirrored version from being rendered
   outside the plane's pixels.

Please experiment with the following WebGL program.

.. webglinteractive:: W2
  :htmlprogram: _static/12_stencil_reflect/stencil_reflect.html
  :editlist: _static/12_stencil_reflect/stencil_reflect_scene.js
  :hideoutput:

The following is a detailed, line-by-line description of the
:code:`stencil_reflect_scene.js` rendering function.
The details are non-trivial and require studying.


.. |ClearBuffers| replace:: Clear all three *draw buffers*, including the
  *stencil buffer*.

.. |NoStencilTest| replace:: The *stencil buffer* is not needed to render
  the model, so disable it.

.. |EnableWritingDepth| replace:: Writing to the *depth buffer* is turned
  on and off during the rendering. Make sure the *depth buffer* can be
  modified so that *hidden surface removal* is performed properly.

.. |RenderModel| replace:: Render the model normally.

.. |RenderPlane| replace:: Render the plane and "mark" every pixel that it
  colors by setting its associated value in the *stencil buffer*.

.. |EnableStencilBuffer| replace:: :code:`gl.enable(gl.STENCIL_TEST)` enables
  the "stencil test".

.. |SetStencilTestParameters| replace:: :code:`gl.stencilFunc(gl.ALWAYS, 1, 0xFF)`
  sets the "stencil test" parameters. :code:`gl.ALWAYS` makes the stencil
  test always true. This basically disables the "stencil test". Why? Because
  this rendering pass does **not** want to use the *stencil buffer* to control
  which pixels are rendered. It wants to set the pixels of the *stencil buffer*.
  The parameter :code:`1` is the value that will be placed in the *stencil buffer* when
  it is changed. Control of changing the *stencil buffer* is done by the parameters
  to :code:`gl.stencilOp` in line 117. The mask, :code:`0xFF`, allows all bits
  of each *stencil buffer* pixel value to be modified. For this example the
  mask could have been set to :code:`0x01` because only the low order bit is
  actually used.

.. |SetStencilUpdateParameters| replace:: :code:`gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)`
  sets the "stencil update" parameters. The first two :code:`gl.KEEP`
  parameters say "leave the *stencil buffer* alone when the "stencil test"
  fails or the "depth test" fails. The :code:`gl.REPLACE` parameter says
  to "replace the *stencil buffer* value using the 'reference value'" set
  in the :code:`gl.stencilFunc` call -- when the "depth test" passed and the
  *color buffer* is modified. (The "reference value" is used for
  both the "stencil test" and the "stencil updating" functionality, but
  it is only specified in the :code:`gl.stencilFunc` call.)

.. |AllowStencilChanges| replace:: :code:`gl.stencilMask(0xFF)`
  allows all bits of each *stencil buffer* value to be modified. Since
  this example only uses the lower order bit, :code:`0x01` would have
  worked as well. Why is this needed? When the :code:`gl.STENCIL_TEST`
  is enabled, both "stencil testing" and "stencil updating" is enabled.
  But some rendering passes only want to **set** the *stencil buffer*, while
  other rendering passes only want to **use** the *stencil buffer* for a
  "stencil test." When the stencil mask is set to :code:`0xFF`, the
  rendering pass can **set** the *stencil buffer* values. When the stencil mask
  is set to :code:`0x00`, the rendering pass **can't set** values in
  the *stencil buffer* and is therefore only "stencil testing."

.. |NoDepthModifications| replace:: :code:`gl.depthMask(false)`
  disables modifications to the *depth buffer* -- but the "depth test"
  still happens. Therefore, when the plane is rendered, it will only be
  rendered in pixels that are closer to the camera than the model that is
  already in the scene. This allows the plane to "wrap around" the model
  correctly using the "depth test". But it prevents the *depth buffer*
  values from being updated so that at a later time the "mirrored" model
  can be rendered over the plane's pixels.

.. |TestForReflection| replace:: For this specfic example, the reflection
  of the model should only be visible when the top of the plane is visible.
  Therefore, the "mirrored" model is only rendered when the top of the
  flat plane is visible. The angle of viewing rotation is an easy test.
  The direction of the normal vector for the plane could have also been used,
  but that test would require more calculations.

.. |EnableStencilTest| replace:: :code:`gl.stencilFunc(gl.EQUAL, 1, 0xFF)`
  changes the "stencil test" to be: "Is the stencil buffer value equal to 1?".
  This restricts rendering to only those pixels whose color was modified
  when the plane was rendered, since that is the rendering pass that
  set the values of the *stencil buffer*.

.. |NoStencilBufferModifications| replace:: :code:`gl.stencilMask(0x00)`
  disables modifications to the *stencil buffer*. The
  next rendering pass is going to use a "stencil test" but not modify
  the *stencil buffer*.

.. |UseHiddenSurfaceRemoval| replace:: :code:`gl.depthMask(true)`
  enables modifications to the *depth buffer*. The
  next rendering pass needs *hidden surface removal* and this allows
  the "mirrored" model to be rendered correctly.

.. |LightModel| replace:: When the "mirrored" model is rendered as a
  "reflection" the colors of the model should not be as bright as the
  original model. By lowering the lighting ambient intensities and by using
  a light color that has a lower intensity the reflected model appears
  darker. Modifying the light values could produce a wide range of
  "reflected" effects.

+----------+----------------------------------------------------+
| Lines    | Description                                        |
+==========+====================================================+
| 93       | |ClearBuffers|                                     |
+----------+----------------------------------------------------+
| 97       | |NoStencilTest|                                    |
+----------+----------------------------------------------------+
| 98       | |EnableWritingDepth|                               |
+----------+----------------------------------------------------+
| 100-109  | |RenderModel|                                      |
+----------+----------------------------------------------------+
| 113-123  | |RenderPlane|                                      |
+----------+----------------------------------------------------+
| 113      | |EnableStencilBuffer|                              |
+----------+----------------------------------------------------+
| 114-116  | |SetStencilTestParameters|                         |
+----------+----------------------------------------------------+
| 117-119  | |SetStencilUpdateParameters|                       |
+----------+----------------------------------------------------+
| 120      | |AllowStencilChanges|                              |
+----------+----------------------------------------------------+
| 121      | |NoDepthModifications|                             |
+----------+----------------------------------------------------+
| 126      | |TestForReflection|                                |
+----------+----------------------------------------------------+
| 129-131  | |EnableStencilTest|                                |
+----------+----------------------------------------------------+
| 132      | |NoStencilBufferModifications|                     |
+----------+----------------------------------------------------+
| 133      | |UseHiddenSurfaceRemoval|                          |
+----------+----------------------------------------------------+
| 135-136  | |LightModel|                                       |
+----------+----------------------------------------------------+

You could experiment with this WebGL program in many ways. Comment
out some of the settings, or change some of the settings and investigate
what happens. For example, comment out the if-statement that tests for viewing
above the plane in line 126. What happens?

Summary
-------

In summary, the *stencil buffer* can be used to control which pixels
have their color modified. Using the *stencil buffer* typically requires
multiple renderings. One rendering will set the stencil; another rendering
will update the *color buffer* based on the stencil.

To create a stencil, make the "stencil test" always true and enable writing
to the *stencil buffer*:

.. Code-Block:: JavaScript

  // Rendering pass to create a stencil.
  gl.stencilFunc(gl.ALWAYS, reference_value, mask);
  gl.stencilMask(0xFF);  // Stencil buffer can be changed

To use a stencil, set an appropriate "stencil test", disable writing
to the *stencil buffer*, and set the operation to perform based on
the status of the stencil and depth tests:

.. Code-Block:: JavaScript

  // Rendering pass to use a stencil.
  gl.stencilFunc(compare_func, reference_value, mask);
  gl.stencilMask(0x00);  // Stencil buffer can't be changed
  gl.stencilOp(stencil_failed_func, depth_test_failed_func, depth_test_passed_func);

The *stencil buffer* has many possible uses, as you will discover as you
investigate more advanced rendering techniques.

Glossary
--------

.. glossary::

  stencil
    An image or pattern that allows some areas of a surface to receive color
    while preventing other areas from receiving color. It is also referred to
    as a "stencil mask" because a facial "mask" covers parts of a face while
    allowing other parts to be visible.

  color buffer
    A 2D array of color values. Each color value is typically a RGBA color.

  depth buffer
    A 2D array of "distance from the camera" values. The dimensions of the array must be
    identical to the dimensions of its associated *color buffer*.

  stencil buffer
    A 2D array of "mask" values. The dimensions of the array must be
    identical to the dimensions of its associated *color buffer*.

  stencil test
    Logic that produces a true or false result. If true, a fragment is allowed
    further processing by the graphics pipeline. If false, the fragment is
    discarded from the graphics pipeline.

  stencil operation
    Logic that sets the value of a single pixel in a *stencil buffer*.

  bit-mask
    An integer number with specific bits set to one. Performing a bit-wise
    logical AND operation between a number, :code:`n`, and a bit-mask
    guarantees that all bits in :code:`n` where there is a :code:`0` in
    the bit-mask there is a :code:`0` in the result.

.. index:: stencil, stencil buffer, bit-mask
