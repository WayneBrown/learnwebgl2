.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

10.10 - Fragment Shader Debugging
:::::::::::::::::::::::::::::::::

A *fragment shader* program performs calculations to assign a color to a pixel
in a rendering.
*Fragment shaders* can be difficult to debug. Debugging a normal computer
program is typically done in one of two ways: 1) print intermediate
values to a console window, or 2) use an interactive debugger to set breakpoints
and step through the code one statement at a time. Neither method works for
*fragment shaders* running on a GPU. The following are several suggestions
for developing and debugging *fragment shader* programs.

Do Your Homework!
-----------------

The easiest way to minimize debugging is to write a correct shader program.
This might sound silly, but if you create good logic
and good equations on paper before you start coding, it can save you the
hassle of debugging. Do your homework! Don't skimp on the design phase. Don't
guess and "hope it works." Do meticulous design, and sometimes debugging is
not required.

Substitute Intermediate Values for Colors
-----------------------------------------

The only output of a *fragment shader* is the color of the pixel stored in
the :code:`gl_FragColor` output shader variable. You can substitute various
values into this color variable and visualize the values of intermediate
calculations by examining the rendering output. Experiment with the following
WebGL program by reassigning the :code:`gl_FragColor` value to various values.
Note that a color is defined as three distinct values, as is a vertex and
a vector. The only difference is the permitted range for each value. A color component is
always a value between 0.0 and 1.0. So in some cases you might need to scale
or manipulate the intermediate values before putting them into the
:code:`gl_FragColor` variable.

Try these variable substitutions as you experiment with the WebGL program below.
You will be changing line 88 of the *fragment shader*.

Experiment #1
*************

.. Code-Block:: JavaScript

  gl_FragColor = vec4(fragment_normal, v_Color.a);

Make sure you click on the "Re-start" button after you make the change. You should
see a color in each pixel that represents the normal vector for each pixel.
The normal vector was normalized, so each component value is between -1.0 and +1.0. When
this is used as a color, the negative values will be clamped to 0.0. If you see
red, the vector is pointing along the X axis. If you see green, the vector is
pointing along the Y axis. If you see blue, the vector is pointing along the
Z axis. Make sure you move the camera so that the vertex normals are changing.
If you see only black, then the :code:`fragment_normals` are :code:`(0.0, 0.0, 0.0)`
and there is some error related to retrieving or calculating the normal vector.

Experiment #2
*************

.. Code-Block:: JavaScript

  gl_FragColor = vec4(abs(fragment_normal), v_Color.a);

The :code:`abs()` function will invert any negative values in the normal vector,
but you won't know which values were negative. This output might confuse you more than
help you.

Experiment #3
*************

.. Code-Block:: JavaScript

  gl_FragColor = vec4(cos_angle, cos_angle, cos_angle, v_Color.a);

This displays the :code:`cos(angle)` as an intensity value from white (1.0)
to black (0.0). This can be very helpful in debugging the angle.

Experiment #4
*************

.. Code-Block:: JavaScript

  gl_FragColor = vec4(v_Vertex, v_Color.a);

This displays the 3D location of each vertex as a color. You could use
this to "sanity check" your vertex transformations.

Experiment #5
*************

.. Code-Block:: JavaScript

  gl_FragColor = vec4(reflection, v_Color.a);

This displays the reflection vector of each fragment (pixel) as a color.
You could use this to "sanity check" your reflection vector calculations.

Experiment
----------

.. webglinteractive:: W1
  :htmlprogram: _static/10_light_attenuation/light_attenuation.html
  :editlist: _static/shaders/attenuated_light.frag


Summary
-------

Putting intermediate calculated values into the :code:`gl_FragColor` variable
is an art more than a science. Be creative! Debugging *shader programs*
can be very challenging, so do your best to write them bug free from the
very beginning.

Glossary
--------

.. glossary::

  debugging
    The art and science of finding mistakes in a computer program.

.. index:: GLSL debugging
