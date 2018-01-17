.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

13.5 - GLSL Built-in Functions & Variables
::::::::::::::::::::::::::::::::::::::::::

Built-in Functions
------------------

GLSL provides a significant number of built-in functions and you should
be familiar with them. A complete list of these functions can be found on
page four of this `Quick Reference Card`_. Please note the following about the functions.

* The majority of the functions only work on floating point scalars or vectors. They
  do not work on integers or booleans. The exception is a group of "Vector
  Relational Functions" that accept Boolean and integer inputs and return Boolean values.

* The functions are overloaded to accept various inputs and return a result
  of the same data type. For example, consider the function prototype :code:`T sin(T angle)`,
  where T represents the data types :code:`float`, :code:`vec2`, :code:`vec3`, or
  :code:`vec4`. This represents four versions of the :code:`sin` function.
  Each version performs a component-wise sine calculation and returns a
  result that is the same size as its input.

  .. Code-Block:: GLSL

    float function sin(float angle);
    vec2  function sin(vec2 angles);
    vec3  function sin(vec3 angles);
    vec4  function sin(vec4 angles);

Please review the list of built-in functions on page four of the `Quick Reference Card`_.

Built-in Variables
------------------

*Shader programs* communicate with the graphics pipeline using pre-defined input
and output variables.

A *Vertex Shader*'s Outputs
***************************

A *vertex shader* has two outputs:

* :code:`gl_Position`: a :code:`vec4` position, :code:`(x,y,z,w)`, of a vertex
  in "clip coordinates". Clip coordinates were described in detail in lesson 9.1.

  * The values for :code:`x` and :code:`y` are in the range :code:`[-1.0,+1.0]`
    and represent the location of a vertex in the viewing window.
  * The :code:`z` value is in the range :code:`[-1.0,+1.0]` and represents
    the distance of the vertex from the camera.
  * The :code:`w` value is 1.0 for orthogonal projections, or the :code:`w` value is the
    *perspective divide* value for perspective projections.
  * Any vertex outside the clipping cube is clipped to the cube's boundaries.

* :code:`gl_PointSize`: the number of pixels to use to render a point.
  It is a float value that can have a fractional part. It only
  applies to the rendering of single points, not to the vertices of lines and
  triangles. If no value is specified, its default value it 1.0.

The outputs of a *vertex shader* are used by the graphics pipeline to determine
the pixels (i.e., the fragments) in the viewing window that compose a graphics primitive.
The *rasterizer* in the graphics pipeline creates a fragment for each pixel,
calculates the interpolated values for any :code:`varying` variables, and
sets the values for the following *fragment shader* input values.

Inputs to a *Fragment Shader*
*****************************

* :code:`gl_FragCoord`: a :code:`vec4` value that holds the (x,y,z,w) value
  of the fragment. This is the value of :code:`gl_Position` after it has
  been transformed by the viewport transform and the perspective divide has
  been performed. Therefore, the (x,y) values are the location of the fragment
  in the image to be rendered. The *z* value is the distance from the camera.
  Note that these are floating point values and that the (x,y) values are the
  center of a pixel. For example, the bottom-left corner pixel has an (x,y)
  value of (0.5, 0.5).

* :code:`gl_FrontFacing`: a Boolean value that is true if this fragment is
  part of a front-facing primitive. This only applies to triangles. A triangle
  is "front facing" if its normal vector is pointing toward the camera. The
  normal vector is calculated from the triangle's vertices, and a
  counter-clockwise ordering of the vertices will produce a "front-facing"
  normal vector.

* :code:`gl_PointCoord`: is a :code:`vec2` value where its (x,y) values
  are in the range [0.0,1.0].
  The values indicate the relative location of this fragment within the
  rendering of a point. The point's total size, in pixels, comes from the
  :code:`gl_PointSize` output variable. The origin of the coordinate system
  for a point rendering is the upper left corner of the square that covers
  the point. (This only applies to rendered points, gl.POINTS.
  It is undefined when rendering gl.LINES and gl.TRIANGLES.)

Outputs from a *Fragment Shader*
********************************

A WebGL *fragment shader* has one output -- a color value for its fragment.

* :code:`gl_FragColor` : a RGBA (:code:`vec4`) value that is placed into the
  *color buffer* for the fragment it is processing.

**OpenGL** supports rendering to multiple *color buffers* for the creation of
advanced visual effects. Writing colors to :code:`gl_FragData[n]` allows
a *fragment shader* to create multiple images that can be "composited" into
a single final rendering. WebGL 1.0 does not support multiple *color buffers*
without using extensions, so we will not discuss them here.

.. _Quick Reference Card: _static/documents/webgl-reference-card-1_0.pdf
