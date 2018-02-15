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

12.1 - Introduction to Advanced Rendering
:::::::::::::::::::::::::::::::::::::::::

This chapter discusses the following, more advanced, rendering topics:

* **Hidden Surface Removal**

  Given a scene defined by a set of models and a camera, only render the graphic
  primitives that are visible to the camera.

* **Object Selection**

  Given the rendering of a scene that contains multiple objects, allow a
  user to select an individual object using a mouse click.

* **Transparency** / **Alpha Blending**

  Given transparent surfaces that allow light to pass through,
  render them **and** the partially visible objects behind them.

* **Shadows**

  Given a scene where one object blocks the light rays of a light source from
  striking some (or all) of another object, render all of the surfaces of
  the models with appropriate lighting.

* **Particle Systems**

  Given a scene that contains real-world phenomena that are not solid objects,
  such as clouds, smoke, fire, water, and dust, render these phenomena using
  many small "particles."

All of these advanced rendering techniques can be implemented using WebGL 1.0, but, in
some cases, they are easier to implement if WebGL "extensions" are used.

WebGL Extensions
----------------

A "WebGL extension" is functionality that has been added to a vendor's implementation
of WebGL after the original WebGL 1.0 standard was finalized. A browser typically
supports some subset of the `approved extensions`_. A WebGL program can query its
:code:`WebGLRenderingContext` object (i.e., its
:code:`gl` object) to determine which extensions are supported. The
version and vendor of the WebGL implementation can also be retrieved. For example:

.. Code-Block:: C

  let version    = gl.getParameter(gl.VERSION);  // {string}
  let vendor     = gl.getParameter(gl.VENDOR);   // {string}
  let extensions = gl.getSupportedExtensions();  // {array of strings}

The following WebGL program performs these queries and displays the results
below the canvas. Please note that the output is browser dependent. If you
have multiple browsers on your computer, please load this page into each one and
compare the results. (Please note that the ordering of the extension names is not
standardized. Therefore, do not expect to find a specific extension name in the
same list location in different browsers.)

.. webgldemo:: W1
  :htmlprogram: _static/12_webgl_extensions/example.html
  :width: 100
  :height: 100

The website https://webglstats.com/ provides a good resource for how much
support a particular WebGL extension has in various browsers. The use
of extensions possibly limits the number of users that can view your WebGL
program. Therefore, extensions should only be used if they are widely
supported or if your users are known to use a specific browser.

WebGL Buffers
-------------

To study advanced rendering you need a comprehensive understanding of WebGL buffers.
A buffer is a contiguous block of memory for storing a set of related values.
Previous lessons have described three types of buffers:

* **buffer object**: A 1D array of graphic primitive attribute values. The
  most common attribute is a :code:`(x,y,z)` value per vertex. Other
  attributes include color, normal vector, and texture coordinate. Any
  data stored on a "per vertex" basis is stored in a *buffer object*. (The
  official name is *vertex object buffer*, or VOB's.)

* **texture object**: A set of values that store the rendering parameters of
  a *texture map* and its 2D image.

* **draw buffer**: A 2D image that contains the rendered output of a scene.

This definition of a *draw buffer* is an over simplification. Actually,
a *draw buffer* is a collection of three distinct buffers used for rendering:

* **color buffer**: a 2D array of color values. Each element of a *color buffer*
  defines the color of a pixel using either three values, RGB, or four values, RGBA.
  The minimum memory for each color component value is 8 bits. Therefore each
  pixel requires three bytes (RGB) or four bytes (RGBA) of memory.

.. figure:: figures/pineapple-stencil_thumb.jpg
  :align: right
  :width: 135
  :height: 135

  :raw-html:`<style> span.caption-text { display: block; text-align: center} </style>`
  Example Stencil [`1`_]

* **depth buffer**: a 2D array of values that represent a "distance from the camera."
  A depth buffer is used for *hidden surface removal*. The minimum memory for
  each element is 16 bits.
  :raw-html:`<br><br>`

* **stencil buffer**: a 2D array of values that controls which locations in a *color
  buffer* are changeable. The minimum memory for each element is 8 bits.
  Each element is a boolean value: if the element is *true*, the corresponding
  element in the *color* and *depth* buffers can be modified; if the element is *false*,
  the corresponding element in the *color* and *depth* buffers can't be modified.
  The *stencil buffer* defines a `stencil`_ -- an example of which is shown to the right.

To emphasize again, a *draw buffer* is composed of three distinct buffers. A *draw buffer*
always has a *color buffer* and a *depth buffer*, while the *stencil buffer* is optional.
A *draw buffer* is created automatically when a WebGL context is created and
it is not directly accessible. The only functions that modify the *draw buffers*
are the :code:`gl.clear()`, :code:`gl.drawArrays()`, and :code:`drawElements()`
functions. A *draw buffer* is the default "rendering target" -- i.e., the default
buffers for storing the graphic pipeline's rendering output.

The *color buffer*, *depth buffer*, and *stencil buffers* are examples of
:code:`Renderbuffer` objects. A "Renderbuffer" holds a single type of data in a
specific data format for the process of rendering. WebGL allows you to create
customized "rendering targets" called *framebuffers*.
A *framebuffer* is composed of one or more "renderbuffers". In addition,
WebGL extensions allow for a single *framebuffer* to have multiple *color buffers*.
The details of *draw buffers* and *framebuffers* will
be explained in the coming lessons.

The diagram below shows the graphics pipeline and the various buffers used
for inputs and outputs.

.. figure:: figures/buffers_diagram.png
  :align: center

  :raw-html:`<style> span.caption-text { display: block; text-align: center} </style>`
  Buffers in the Graphics Pipeline

Double Buffering and Canvas Updates
-----------------------------------

*Double buffering* was explained in `lesson 8.1`_. As a refresher, rendering is
output to an *off-screen frame buffer* to prevent a user from seeing incremental
versions of a rendered image. When a rendering is finished the image in the "off-screen
buffer" is copied to an
"on-screen buffer" to make the rendering visible to a user. The *off-screen frame buffer*
is the *color buffer* of the *draw buffer*. The *on-screen buffer* is a sub-section
of a rendered web page.

WebGL automatically clears the contents of the *draw buffer* after
its image has been copied to the *on-screen buffer*. This prepares the *draw buffer*
for the next rendering. This clears two buffers: the *color buffer* to WebGL's current
:code:`clearColor()` value and the *depth buffer* to WebGL's current :code:`clearDepth()`
value.

.. admonition:: Warning

  Most browsers do not seem to follow the WebGL specification for clearing buffers.
  Chrome and Firefox use a "clear color" that has an alpha value of 0.0 (or a clear color
  that is equal to a canvas' background color) when they automatically clear the *color buffer*,
  regardless of what color is set by :code:`gl.clearColor(red, green,blue,alpha)`.
  To clear the color buffer to a specific color the function :code:`gl.clear(gl.COLOR_BUFFER_BIT)`
  must be explicitly called at the beginning of a rendering.

Glossary
--------

.. glossary::

  hidden surface removal
    The determination of which graphic primitives in a scene are visible from the
    current virtual camera.

  transparent
    A surface that allows light to pass through it.

  opaque
    A surface that reflects or absorbs all of the light that strikes it.

  shadow
    The area of a surface that does not receive direct light from a light source.

  particle system
    A model of a physical phenomena that is composed of many small particles.

  buffer
    A set of contiguous memory locations that store a collection of related values.

  color buffer
    A buffer containing color values.

  depth buffer
    A buffer containing "depth" (distance from the camera) values.

  stencil buffer
    A buffer containing "mask" values.

  draw buffer
    A combination of three related buffers: a *color buffer*, a *depth buffer* and an optional *stencil buffer*.

  renderbuffer
    A buffer that contains a single type of data in a specific format.

  framebuffer
     A set of renderbuffers used for rendering. (A customizable *draw buffer*.)

  double buffering
     Rendering to an *off-screen buffer* and copying it to an *on-screen buffer*
     only after the rendered image is totally complete.

.. index:: hidden surface removal, transparent, opaque, shadow, particle system, buffer, color buffer, depth buffer, stencil buffer, draw buffer, renderbuffer, framebuffer, double buffering

.. _approved extensions: https://www.khronos.org/registry/webgl/extensions/
.. _stencil: https://en.wikipedia.org/wiki/Stencil
.. _1: http://www.freestencilgallery.com/wp-content/uploads/2015/10/pineapple-stencil_thumb.jpg
.. _lesson 8.1: ../08_animations/01_introduction.html#double-buffering