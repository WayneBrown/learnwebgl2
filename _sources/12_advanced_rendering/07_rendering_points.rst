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

12.7 - Rendering Points
:::::::::::::::::::::::

In preparation for a discussion of "particle systems" in the next lesson,
this lesson explains how to render points using WebGL.

Points
------

A **point** is a single location in 3D space defined by a :code:`(x,y,z)`
value. By default, the rendering of a point sets the color of one pixel
in an image. The color of multiple pixels can be set by specifying the
:code:`gl_PointSize` property of a point in a *vertex shader*.
:code:`gl_PointSize` is the side length of a square centered at the point's
raster location. It is a floating point value in pixel units.
The exact definition from the OpenGl ES 2.0 specification is:

.. admonition:: gl_PointSize

  Point rasterization produces a fragment for each framebuffer pixel whose center
  lies **inside a square** centered at the point’s (xw, yw), with side length equal to
  the point size.

If the point (xw, yw) is not directly in the center of a pixel and the
value of :code:`gl_PointSize` is fractional, the area colored for a "point"
will be rectangular.

Anti-aliasing
.............

Anti-aliasing is a technique for minimizing the errors due to sampling a 3D
scene only at the center of each pixel location. With no anti-aliasing,
a pixel is either colored, or not colored, with a primitives's color. This produces
a jagged edge at the boundaries of a triangle, line, or point rendering.
When anti-aliasing is enabled, pixels receive a portion of the color of a primitive
based on a percentage of coverage of a pixel. The images below show a point
rendered with a :code:`gl_PointSize` of 8.0 and enlarged to view individual pixels.
With anti-aliasing disabled, a point rendered with a size of 8 will color exactly
64 pixels. With anti-aliasing enabled, the edges around the 64 pixels will potentially
have partial coloring.

.. figure:: figures/antialiasing.png
  :align: center

WebGL enables anti-aliasing by default. To disable it, the :code:`antialias`
option must be set to :code:`false` when the WebGL context is initially created.
The commands look something like this:

.. Code-Block:: JavaScript

  canvas = document.getElementById(canvas_id);
  gl = canvas.getContext('webgl', {antialias : false} );

Anti-aliasing is rarely disabled. This discussion was primarily to help you
understand why the borders of a multi-pixel "point" are typically lighter shades
of the color assigned by a *fragment shader*.

Experiment with :code:`gl_PointSize`
....................................

The following WebGL program renders eight points at the corners of a cube.
Experiment with the program by varying the point size.

.. webglinteractive:: W1
  :htmlprogram: _static/12_points1/points1.html
  :editlist: _static/12_points1/points1_scene.js, _static/12_points1/uniform_point_size.vert, _static/12_points1/uniform_point_size.frag
  :hideoutput:

Experiments:

* Disable anti-aliasing when the gl context is created. (See lines 107-108
  in the :code:`points1_scene.js` file.) To see the difference between
  anti-aliasing and no anti-aliasing use any tool on your computer that allows
  the screen to be "zoomed in".

  * On a Mac: Enable "Zoom" in the "Accessibility" tools of the "System Preferences".
  * On a PC: Use the "Magnifier" tool.
    :raw-html:`<br><br>`

* Enable anti-aliasing and change the point size while in a "zoomed" state
  to investigate the boundaries of a point rendering.
  :raw-html:`<br><br>`

Non-square Points
-----------------

When points are rendered by a *vertex shader*, (and only for points),
the *vertex shader* passes an additional variable to the *fragment shader*,
:code:`gl_PointCoord`, which is 2-component vector that gives the location
of a fragment relative to it's "point" square. The components are in the range 0.0 to
1.0, where [0.0,0.0] is the upper-left corner of the square, [1.0, 1.0]
is the lower-right corner of the square, and [0.5,0.5] is the center of
the square.

A *fragment shader* can use the :code:`gl_PointCoord` values to determine
how to manipulate a specific pixel. For example, it is easy to render
a "point" as a circle instead of a square. The GLSL :code:`distance`
function can be used to calculate
the distance from a fragment's location, :code:`gl_PointCoord`, to the
center of the "point", [0.5,0.5]. If the distance is greater than 0.5, the fragment
is not inside a circle centered on the point's square. The statement,
:code:`discard`, in a *fragment shader* prevents the graphics pipeline
from performing any further processing of the fragment.

Experiment with size of the points in the following WebGL program
and study the *fragment shader*.

.. webglinteractive:: W2
  :htmlprogram: _static/12_points2/points2.html
  :editlist: _static/12_points2/uniform_point_size.vert, _static/12_points2/uniform_point.frag
  :hideoutput:

Experiments:

* In the *fragment shader*, change the greater-than sign in the distance test to a
  less-than sign. (I.e., :code:`if (distance(center, gl_PointCoord) < 0.5)`. :raw-html:`<br>`
  Predict the results and then verify you predicted correctly.
  :raw-html:`<br>`

* Change the *fragment shader* to the single line: :raw-html:`<br>`
  :code:`gl_FragColor = vec4(gl_PointCoord, 0.0, 1.0);` :raw-html:`<br>`
  Study the resulting output until is makes sense.
  :raw-html:`<br>`

* Change the *fragment shader* to this logic: :raw-html:`<br>`

  .. Code-Block:: C

    float d = distance(center, gl_PointCoord);
    if (mod(floor(d*4.0), 2.0) == 0.0) {
      discard;
    }

  Try various scalar values other than :code:`4.0` and see what happens.
  :raw-html:`<br><br>`

* Change the *fragment shader* to this logic: :raw-html:`<br>`

  .. Code-Block:: C

    float d = distance(center, gl_PointCoord);
    if (d >= 0.5) discard;
    float alpha = 1.0 - d*2.0; /* center has the largest alpha */
    gl_FragColor = vec4(u_Color.rgb, alpha);

* Change the *fragment shader* to this logic: :raw-html:`<br>`

  .. Code-Block:: C

    float d = distance(center, gl_PointCoord);
    if (gl_PointCoord.t > 0.5 || d >= 0.5) discard;
    d = 1.0 - d*2.0;
    gl_FragColor = vec4(u_Color.rgb, d);

* Come up with your own experiments. Your goal is to understand
  how to use :code:`gl_PointCoord` to manipulate the shape and
  color of a "point" rendering.

Billboard (or Sprite)
---------------------

A `billboard`_ in computer graphics is a texture mapped quad
(four sided polygon) that always faces the camera, regardless of
its location and 3D orientation. A `sprite`_ is a 2D bitmap that
can be placed into a scene. The common practice in WebGL is
to render *billboards* and *sprites* as "points" with an appropriate
:code:`gl_PointSize` and *texture map* image. This will become
clearer after studying the next lesson on "particle systems."

Glossary
--------

.. glossary::

  point
    A single location in 3D space.

  gl_PointSize
    A predefined output variable of a *vertex shader* when rendering points.
    It is the side length of a square, in pixels, that is centered about
    the location of a 3D point.

  gl_PointCoord
    A 2D vector where each component is a percentage value between 0.0 and 1.0.
    It gives the relative location of a fragment compared to the square that
    composes the entire point rendering. :code:`[0,0]` is the upper-left corner.

  billboard
    A rendering of a texturemap onto a quad surface that is always facing the camera.

.. index:: point rendering, gl_PointSize, gl_PointCoord, discard

.. _particle system: https://en.wikipedia.org/wiki/Particle_system
.. _Anti-aliasing: https://en.wikipedia.org/wiki/Spatial_anti-aliasing
.. _billboard: http://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/billboards/
.. _sprite: https://en.wikipedia.org/wiki/Sprite_(computer_graphics)