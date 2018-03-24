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

12.5 - Color Blending
:::::::::::::::::::::

The previous lesson explained how to implement transparency by
blending the color that is already in the "rendering target's" *color buffer*
with a new color value. This lesson explains all of the *color blending*
options available in the graphics pipeline.

Blending (All the details)
--------------------------

When *color blending* is enabled with this command,

.. Code-Block:: JavaScript

  gl.enable(gl.BLEND)

the *zbuffer* rendering algorithm looks like this,

.. Code-Block:: C
  :linenos:
  :emphasize-lines: 4

  void renderPixel(x, y, z, color) {
    if (z < z_buffer[x][y]) {
      z_buffer[x][y]     = z;
      color_buffer[x][y] = (color * percent1) + (color_buffer[x][y] * percent2);
    }
  }

where the values :code:`percent1` and :code:`percent2` are determined by a call to:

.. Code-Block:: JavaScript

  gl.blendFunc(where_to_get_percent1, where_to_get_percent2);
  // or
  gl.blendFunc(gl.SOURCE_FACTOR_ENUM, gl.DESTINATION_FACTOR_ENUM);

Remember that WebGL uses the term :code:`source` (or :code:`src`) to refer
to a surface that is being rendered, while it uses the term :code:`destination`
(or :code:`dst`) to refer to the *color buffer*.

The :code:`percent1` and :code:`percent2` values are not scalars; they are 4-component
vectors. When the percentage of a color is taken, each component of the color is
potentially scaled differently. If the *blending equation* above is explicitly written
out, it looks like the following equation because both the multiplication and the addition
are component-wise vector operations. (The "dot" notation is `swizzle notation`_.)

.. Code-Block:: C

  color_buffer[x][y] = vec4(color.r * percent1.r + color_buffer[x][y].r * percent2.r,
                            color.g * percent1.g + color_buffer[x][y].g * percent2.g,
                            color.b * percent1.b + color_buffer[x][y].b * percent2.b,
                            color.a * percent1.a + color_buffer[x][y].a * percent2.a);

The following table lists the options for the :code:`src` and :code:`dst` percentages.
Note that the percentages are not actual values. Rather, they are indicators of
where the percentage values are retrieved from (or how they are calculated). The
values in the table are specified using this notation:

.. Code-Block:: C

  color_buffer[x][y] --> (dst_red, dst_green, dst_blue, dst_alpha)
  color              --> (src_red, src_green, src_blue, src_alpha)

:raw-html:`<style> .table tbody>tr>td { font-size: 9pt; } </style>`

+-----------------------------+-------------------------------------------------------------+--------------------+
| WebGL ENUM constant         | (red, green, blue) % values                                 | Alpha %            |
+=============================+=============================================================+====================+
| gl.ZERO                     | (0.0, 0.0, 0.0)                                             | 0.0                |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.ONE                      | (1.0, 1.0, 1.0)                                             | 1.0                |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.SRC_COLOR                | (src_red, src_green, src_blue)                              | src_alpha          |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.ONE_MINUS_SRC_COLOR      | (1 - src_red, 1 - src_green, 1 - src_blue)                  | 1 - src_alpha      |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.DST_COLOR                | (dst_red, dst_green, dst_blue)                              | dst_alpha          |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.ONE_MINUS_DST_COLOR      | (1 - dst_red, 1- dst_green, 1- dst_blue)                    | 1 - dst_alpha      |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.SRC_ALPHA                | (src_alpha, src_alpha, src_alpha)                           | src_alpha          |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.ONE_MINUS_SRC_ALPHA      | (1 - src_alpha, 1- src_alpha, 1 - src_alpha)                | 1 - src_alpha      |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.DST_ALPHA                | (dst_alpha, dst_alpha, dst_alpha)                           | dst_alpha          |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.ONE_MINUS_DST_ALPHA      | (1 - dst_alpha, 1 - dst_alpha, 1 - dst_alpha)               | 1 - dst_alpha      |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.CONSTANT_COLOR           | (constant_red, constant_green, constant_blue)               | constant_alpha     |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.ONE_MINUS_CONSTANT_COLOR | (1 - constant_red, 1 - constant_green, 1 - constant_blue)   | 1 - constant_alpha |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.CONSTANT_ALPHA           | (constant_alpha, constant_alpha, constant_alpha)            | constant_alpha     |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.ONE_MINUS_CONSTANT_ALPHA | (1 - constant_alpha, 1 - constant_alpha, 1- constant_alpha) | 1 - constant_alpha |
+-----------------------------+-------------------------------------------------------------+--------------------+
| gl.SRC_ALPHA_SATURATE       | a = min(src_alpha, 1 - dst_alpha); (a,a,a)                  | 1.0                |
+-----------------------------+-------------------------------------------------------------+--------------------+

In the above table, for the percentages that use a constant color, :code:`constant_red`,
:code:`constant_green`, :code:`constant_blue`, and :code:`constant_alpha`, these values
are set using the :code:`gl.blendColor` function:

.. Code-Block:: JavaScript

  gl.blendColor(red, green, blue, alpha);

To complicate things further, the addition of the colors can be changed
to subtraction using the :code:`gl.blendEquation` function. The three options are:

.. Code-Block:: JavaScript

  gl.blendEquation(gl.FUNC_ADD);
  gl.blendEquation(gl.FUNC_SUBTRACT);
  gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);

which makes the pipeline's calculation be one of:

.. Code-Block:: C

  color_buffer[x][y] = (color * percent1) + (color_buffer[x][y] * percent2);
  color_buffer[x][y] = (color * percent1) - (color_buffer[x][y] * percent2);
  color_buffer[x][y] = (color_buffer[x][y] * percent2) - (color * percent1);

The following pseudocode attempts to clarify *color blending* by
showing how it might look in code format. (*Color blending* is
implemented inside the graphics pipeline and can't be modified.)

:raw-html:`<style> pre { font-size: 8pt; } </style>`

.. Code-Block:: C

  //-------------------------------------------------------------------------
  vec3 getColorFactor(mode, src_color, dst_color, constant_color) {
    switch (mode) {
      case gl.ZERO:                     factor = (0.0, 0.0, 0.0);
      case gl.ONE:                      factor = (1.0, 1.0, 1.0);
      case gl.SRC_COLOR:                factor = (    src_color.r,     src_color.g,     src_color.b);
      case gl.ONE_MINUS_SRC_COLOR:      factor = (1.0-src_color.r, 1.0-src_color.g, 1.0-src_color.b);
      case gl.DST_COLOR:                factor = (    dst_color.r,     dst_color.g,     dst_color.b);
      case gl.ONE_MINUS_DST_COLOR:      factor = (1.0-dst_color.r, 1.0-dst_color.g, 1.0-dst_color.b);
      case gl.SRC_ALPHA:                factor = (    src_color.a,     src_color.a,     src_color.a);
      case gl.ONE_MINUS_SRC_ALPHA:      factor = (1.0-src_color.a, 1.0-src_color.a, 1.0-src_color.a);
      case gl.DST_ALPHA:                factor = (    dst_color.a,     dst_color.a,     dst_color.a);
      case gl.ONE_MINUS_DST_ALPHA:      factor = (1.0-dst_color.a, 1.0-dst_color.a, 1.0-dst_color.a);
      case gl.CONSTANT_COLOR:           factor = (constant_red,    constant_green,  constant_blue);
      case gl.ONE_MINUS_CONSTANT_COLOR: factor = (1.0-constant_red,
                                                  1.0-constant_green,
                                                  1.0-constant_blue);
      case gl.CONSTANT_ALPHA:           factor = (constant_alpha,
                                                  constant_alpha,
                                                  constant_alpha);
      case gl.ONE_MINUS_CONSTANT_ALPHA: factor = (1.0-constant_alpha,
                                                  1.0-constant_alpha,
                                                  1.0-constant_alpha);
      case gl.SRC_ALPHA_SATURATE:       a = min(src_color.a, 1.0-dst_color.a);
                                        factor = (a,a,a);
    }
    return factor;
  }

  //-------------------------------------------------------------------------
  float getAlphaFactor(mode, src_color, dst_color, constant_color) {
    switch (mode) {
      case gl.ZERO:                     alpha_factor = 0.0;
      case gl.ONE                       alpha_factor = 1.0;
      case gl.SRC_COLOR                 alpha_factor =     src_color.a;
      case gl.ONE_MINUS_SRC_COLOR       alpha_factor = 1.0-src_color.a;
      case gl.DST_COLOR                 alpha_factor =     dst_color.a;
      case gl.ONE_MINUS_DST_COLOR       alpha_factor = 1.0-dst_color.a;
      case gl.SRC_ALPHA                 alpha_factor =     src_color.a;
      case gl.ONE_MINUS_SRC_ALPHA       alpha_factor = 1.0-src_color.a;
      case gl.DST_ALPHA                 alpha_factor =     dst_color.a;
      case gl.ONE_MINUS_DST_ALPHA       alpha_factor = 1.0-dst_color.a;
      case gl.CONSTANT_COLOR:           alpha_factor =     constant_alpha;
      case gl.ONE_MINUS_CONSTANT_COLOR: alpha_factor = 1.0-constant_alpha;
      case gl.CONSTANT_ALPHA:           alpha_factor =     constant_alpha;
      case gl.ONE_MINUS_CONSTANT_ALPHA: alpha_factor = 1.0-constant_alpha;
      case gl.SRC_ALPHA_SATURATE        alpha_factor = 1.0;
    }
    return alpha_factor;
  }

  //-------------------------------------------------------------------------
  vec4 percent1, percent2;

  void blendFunc( source_enum, destination_enum ) {
    percent1.rgb = getColorFactor(src_mode, src_color, dst_color, constant_color);
    percent1.a   = getAlphaFactor(src_mode, src_color, dst_color, constant_color);

    percent2.rgb = getColorFactor(dst_mode, src_color, dst_color, constant_color);
    percent2.a   = getAlphaFactor(dst_mode, src_color, dst_color, constant_color);
  }

  //-------------------------------------------------------------------------
  void renderPixel(x, y, z, color) {
    if (z < z_buffer[x][y]) {
      z_buffer[x][y] = z;

      if (color_blending_is_enabled) {
        dst_color = color_buffer[x][y];
        src_color = color;

        switch (blendEquation) {
          case gl.FUNC_ADD:              new_color = src_color * percent1 + dst_color * percent2;
          case gl.FUNC_SUBTRACT:         new_color = src_color * percent1 - dst_color * percent2;
          case gl.FUNC_REVERSE_SUBTRACT: new_color = dst_color * percent2 - src_color * percent1;
        }

        color_buffer[x][y] = new_color;

      } else { // color_blending_is_disabled
        color_buffer[x][y] = color;
      }
    }
  }

Experiments
-----------

Please experiment with the following WebGL program by selecting
various combinations of blending factors. Note that the background color
of a canvas impacts blending because the "destination" color is always
the background color when the first change is made to a pixel.

The program renders 125 cubes with variations of color from black to white. The
eight cubes at the corners have one or more color components fully saturated and
have an alpha value of 1.0. The "interior" cubes
have smaller and smaller alpha values, with the cubes in the center having the
least alpha values. You can randomize the position, size, and rotation of the cubes,
but their colors remain fixed.

This WebGL program performs no sorting. Therefore, accurate transparency is not
possible from most camera angles.

There are some suggestions below for interesting blending combinations. Most
blending combinations are not useful for general rendering but might be useful
for specific scene scenarios.

.. webgldemo:: W1
  :htmlprogram: _static/12_blending/blending.html

Please verify that you understand the following blending settings and their results:

* :code:`gl.blendFunc(gl.ONE, gl.ZERO)` :raw-html:`<br>`
  The destination is "zeroed out" and the *color buffer* is set to the
  color of the surface being rendered. This is the default behaviour
  of the *zbuffer algorithm* when *color blending* is disabled.
  :raw-html:`<br><br>`

* :code:`gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)` :raw-html:`<br>`
  This is the standard technique for transparency. The alpha value
  of a surface's color determines how much of the surface contributes to
  the color. (This WebGL program preforms no sorting. Therefore the
  transparency is correct in some areas of the scene and
  incorrect in other areas.)
  :raw-html:`<br><br>`

* :code:`gl.blendFunc(gl.CONSTANT_COLOR, gl.CONSTANT_COLOR)` :raw-html:`<br>`
  :code:`gl.blendColor(0.0, 0.0, 0.0, 1.0)` :raw-html:`<br>`
  **Using a white background**, :code:`(1.0, 1.0, 1.0, 1.0)`,
  this produces a *stencil* that contains a black
  pixel for every rendered surface.
  :raw-html:`<br><br>`

* :code:`gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.DST_ALPHA)` :raw-html:`<br>`
  **Using a black background**, :code:`(0.0, 0.0, 0.0, 1.0)`,
  and looking at the "back side" of the cubes, this gives an interesting
  "ghosting" appearance -- but only from a limited set of camera angles. The
  order the cubes are rendered greatly impacts the output image.

Separate Alpha Percentage
-------------------------

Controlling the :code:`alpha` component of the colors is a critical part of
*color blending* and in some situations the alpha component needs to be modified
differently than the red, green, and blue components. This is accomplished
using these two commands:

.. Code-Block:: JavaScript

  gl.blendFuncSeparate(enum src_factor, enum dst_factor, enum src_alpha, enum dst_alpha);
  gl.blendEquationSeparate(enum equation_rgb_mode, enum equation_alpha_mode);

For example, this command,

.. Code-Block:: JavaScript

  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.CONSTANT_ALPHA);

translates into this internal blending equation,

.. Code-Block:: JavaScript

  dst_color = vec4( src_color.rgb * (src_color.a, src_color.a, src_color.a),
                    src_color.a * 0.0 )
            + vec4( dst_color.rgb * (1-src_color.a, 1-src_color.a, 1-src_color.a),
                    dst_color.a * constant_alpha )


Experiments
-----------

The following WebGL program is rather complex because of the number
of options possible. Use the **COLOR** and **ALPHA** radio buttons to set
which factors are being modified. Please experiment with this program.

Again, this WebGL program performs no sorting. Therefore, accurate transparency is not
possible from most camera angles.

.. webgldemo:: W2
  :htmlprogram: _static/12_blending2/blending2.html

Color Blending Observations
...........................

Some observations concerning the *color blending* equations:

* The *color blending* equation is two multiplications followed by an
  addition (or subtraction). The multiplications are always times percentages
  between 0.0 and 1.0. Therefore, the multiplications can only decrease a
  color value; they can never increase a color value.

* The color values can be forced to black by using zero for the percentages.

* The color values can never be forced to white. (Note that the CONSTANT_COLOR
  values are restricted to the range 0.0 to 1.0.)

* Since two color values are added together and each value can't be greater
  than 1.0, the maximum value for their summation is 2.0. However, the sum is
  always clamped to the range :code:`[0.0,1.0]`.
  The summation always increase a color value (unless they are both zero)
  because both operands are positive
  in the range :code:`[0.0,1.0]`. (The subtraction mode can decrease a color
  value and even make it negative. All negative values are clamped to 0.0.)

* There is no blending option that will set a color component value to a
  specific value. If a specific color is needed, set the fragments' color
  in a *fragment shader*; no blending is needed.

* If the final value of a pixel has an alpha value that is less than 1.0, it
  is blended with the color of the web page behind the canvas. Therefore,
  not only does the background color of the canvas affect blending, the color of
  the web page does as well.

Summary
-------

*Color blending* can implement transparency when combined with the sorting of graphic
primitives and the rendering of surfaces from back to front.

*Color blending* can produce other interesting rendering effects but the background
color and the surface colors may need to be very specific to achieve a desired result.

Glossary
--------

.. glossary::

  source color
    A color value to be rendered for a surface.

  destination color
    A color value stored in a *color buffer*.

  color blending
    The color of a pixel is calculated as a combination of two colors: a
    "destination" color and a "source" color.

Self Assessment
---------------

.. mchoice:: 12.5.1
  :random:

  Which of the following settings for blending produces transparency?

  - :code:`gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)`

    + Correct. The source color's amount is controlled by the source alpha's value,
      and the remaining percentage is used for the color already in the *color buffer*.

  - :code:`gl.blendFunc(gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA)`

    - Incorrect. The blending factors are reversed.

  - :code:`gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA)`

    - Incorrect.

  - :code:`gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR)`

    - Incorrect. This would add the colors, not blend them.

.. mchoice:: 12.5.2
  :random:

  Which of the following settings for blending produces the same results as having blending disabled?

  - :code:`gl.blendFunc(gl.ONE, gl.ZERO)`

    + Correct. All of the source's color is used, while none of the destination's color is used.

  - :code:`gl.blendFunc(gl.ZERO, gl.ONE)`

    - Incorrect. This would leave the background color unchanged because the source color would never
      be used.

  - :code:`gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA)`

    - Incorrect.

  - :code:`gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR)`

    - Incorrect.

.. mchoice:: 12.5.3
  :random:

  What is the maximum color component value that can be calculated as a result of blending?

  - 2.0

    + Correct. The addition of 1.0 and 1.0.

  - 1.0

    - Incorrect. Although the final result of a color component is always clamped to the range 0.0 to 1.0.

  - 3.0

    - Incorrect.

  - 2.5

    - Incorrect.

.. mchoice:: 12.5.4
  :random:

  What is the minimum color component value that can be calculated as a result of blending?

  - -1.0

    + Correct. The subtraction of 0.0 minus 1.0.

  - 0.0

    - Incorrect. Although the final result of a color component is always clamped to the range 0.0 to 1.0.

  - -2.0

    - Incorrect.

  - -0.5

    - Incorrect.


.. index:: source color, destination color, color blending

.. _swizzle notation: ../13_shader_language/02_glsl_data_types.html#vector-components