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

12.2 - Hidden Surface Removal
:::::::::::::::::::::::::::::

`Hidden surface removal`_ determines which triangles, lines, and points of
a scene are visible from a virtual camera.
This is a difficult problem to solve efficiently, especially if geometric primitives
intersect each other. Many algorithms have been developed
to solve this problem. Let's discuss just two of them.

The Painter's Algorithm
-----------------------

A human artist creates a painting by applying the background paint first and then
painting layer upon layer until the foreground objects are painted last.
This can be simulated in a computer by sorting the models
in a scene according to their distance from the camera and then rendering
them from back to front. It is a simple algorithm, but it has the following
drawbacks:

* Sorting is time consuming. If the camera or the models are moving,
  sorting is required before every render.
* The individual triangles that compose a model must also be sorted based on their
  relationship to the camera. Fast rendering is dependent on a model's data
  being stored in a GPU's memory and never being modified. Sorting
  a model's triangles breaks this scheme.
* If triangles intersect, they can't be sorted such that one of them is closer
  to the camera than the other one. To render them accurately, their
  intersection must be found, or the triangles must be split into smaller
  triangles that don't intersect and then sorted.

This is called the `painter's algorithm`_ and it is rarely used because of
its drawbacks. However, it is used to render transparent models, which
we will discuss in lesson 12.4.

The Z-Buffer Algorithm
----------------------

A "z-buffer" is a 2D array of values equivalent in size to the *color buffer*
that stores a rendered image. Each value in a *z-buffer*
represents the distance between an object rendered at
that pixel and the camera. Remember that the camera is always at the
origin looking down the -Z axis. Therefore the Z value of an element
represents its distance from the camera.

To render a scene, each element in a *z-buffer* is set to some "maximum
value". As each pixel that composes a graphics primitive is
rendered, the z-component of its geometry is compared to the current value in
the *z-buffer*. If the z-component is less than the value in the
*z-buffer*, this object is closer to the camera, so its color is
placed in the *color buffer* and the *z-buffer*'s value is update.
If an object's z value is greater than the current *z-buffer*
value, the object is not visible to the camera because there is a closer object
in front of it. This algorithm is explained nicely in the following pseudocode. The
*clearBuffers* function is called once to initialize a rendering. The *renderPixel*
function is called for each pixel of every primitive that is rendered. (Note:
These pseudocode functions are "hardcoded" into the graphics pipeline hardware;
you don't implement them.)

.. Code-Block:: JavaScript

  void clearBuffers() {
    for (x = 0; x < image_width; x++) {
      for (y = 0; y < image_height; y++) {
        z_buffer[x][y]     = maximum_z_value;  // depth buffer
        color_buffer[x][y] = background_color;
      }
    }
  }

  void renderPixel(x, y, z, color) {
    if (z < z_buffer[x][y]) {
      z_buffer[x][y]     = z;                  // depth buffer
      color_buffer[x][y] = color;
    }
  }

The `z-buffer algorithm`_ is the most widely used method for solving the
hidden surface problem. It has the following major advantages over other
*hidden surface removal* algorithms:

* No sorting is required. Models can be rendered in any order.
* No geometric intersection calculations are required. The algorithm
  produces the correct output even for intersecting or overlapping triangles.
* The algorithm is very simple to implement.

Disadvantages of the z-buffer algorithm include:

* A *z-buffer* requires a non-trivial amount of memory. For example, assuming
  each value in a *z-buffer* is a 32 bit floating point value, a rendered image
  that is 1024x768 pixels requires 3MB of memory to store its *z-buffer*.
* Every pixel of every primitive element must be rendered, even if many of them
  never write their color to the *color buffer*.
* If two primitives are in exactly the same place in 3D space, as their
  positions are interpolated across their respective surfaces, the z values for each
  object will typically be different by a very small amount due to floating-point
  round-off errors. These small differences will alternate between
  primitives for adjacent pixels resulting in random and weird patterns in a rendering.
  This is called "z-fighting" and it can be avoided by never placing two
  primitives in the same location in 3D space.

WebGL Implementation of the Z-buffer Algorithm
----------------------------------------------

The WebGL graphics pipeline does not automatically perform *hidden surface removal*.
You must enable it with this command:

.. Code-Block:: JavaScript

  gl.enable(gl.DEPTH_TEST);

Since WebGL is a "state machine", you only need to execute this command once,
unless you want to turn *hidden surface removal* on and off for
special types of rendering. To disable *hidden surface removal*:

.. Code-Block:: JavaScript

  gl.disable(gl.DEPTH_TEST);

There are three buffers that typically need clearing before a rendering begins.
These are identified using *enumerated type* constants defined inside the
WebGL API. (Never use the numerical values; always use the constant
names.) These values are "bit flags". Notice that each value has a single bit
set. You can combine "bit flags" into a single value using a *bit-wise or*
operation, which in JavaScript is a single vertical bar, :code:`|`. (Note that
any value specified with a leading :code:`0x` is a hexadecimal value (base 16).)

.. Code-Block:: JavaScript

  const GLenum DEPTH_BUFFER_BIT   = 0x00000100;
  const GLenum STENCIL_BUFFER_BIT = 0x00000400;
  const GLenum COLOR_BUFFER_BIT   = 0x00004000;

To clear the *color buffer* and the *depth buffer* (z-buffer) at the beginning
of a rendering call :code:`gl.clear(bit_flags)`. The input argument is a single integer
containing "bit flags" that indicate which buffers to clear. You can clear one, two, or three
buffers simultaneously. The command

.. Code-Block:: JavaScript

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

clears the *color buffer* and *depth buffers*. Every pixel in the *color buffer* is set to the
background color (:code:`gl.clearColor(red, green, blue, alpha)`).
Every element in the *depth buffer* is set to the maximum depth value (which defaults
to 1.0, but can be changed using :code:`gl.clearDepth(depth)`).

WebGL Context Configuration
...........................

The default behaviour of a WebGL context is to automatically clear the
"off-screen frame buffer" after it is copied to the "on-screen canvas window".
You can modify this behaviour by setting the :code:`preserveDrawingBuffer`
attribute of the WebGL context to :code:`true`. This must be done when the
context is initially created like this:

.. Code-Block:: JavaScript

  context = canvas.getContext('webgl', { preserveDrawingBuffer : true } );

Preserving the contents of the *draw buffers* between rendering cycles is not recommended.

.. admonition:: WebGL Context Configuration

  WebGL context configuration must be done when the context is initially created.
  (See `this WebGL API page`_ for a list of all the possible attributes of a WebGL context.)

Fine Grain Control of a Depth Buffer
....................................

WebGL provides tools for fine grain control of its z-buffer (*depth buffer*) for special
rendering problems.

* :code:`gl.depthMask(bool flag)` : Enables or disables writing to the *depth buffer*.
  When the *depth buffer* is disabled, this renders a model to the *color buffer* but does not update
  the depth of those pixels. This can be used for rendering transparent surfaces.
* :code:`gl.clearDepth(float depth)`, where :code:`depth` is a percentage value between 0.0 and 1.0.
  This sets the value used to clear the *depth buffer*. The "depth" is a
  percentage of the range of values that can be stored in the *depth buffer*.
  The default value is 1.0, which clears a *depth buffer* to its maximum value.
* :code:`gl.depthFunc(enum func)`, where the parameter can be one of: :code:`gl.NEVER`,
  :code:`gl.ALWAYS`, :code:`gl.LESS`, :code:`gl.EQUAL`, :code:`gl.LEQUAL`, :code:`gl.GREATER`,
  :code:`gl.GEQUAL`, :code:`gl.NOTEQUAL`. This provides fine grain control over
  the test that determines whether a color is written to the *color buffer*.
  The default value is :code:`gl.LESS`.

Given the ability to set these extra values for the *z-buffer algorithm*, we
can describe the algorithm in more detail using the following pseudocode. This
is a description of the logic that is hard-coded into the graphics pipeline.

.. Code-Block:: JavaScript

  int     depth_test_func = LESS;  // DEFAULT
  boolean write_depth     = true;  // DEFAULT
  float   maximum_z_value = 1.0;   // DEFAULT

  void gl.depthMask(bool flag) {
    write_depth = flag;
  }

  void gl.clearDepth(float depth) {
    maximum_z_value = depth;
  }

  void gl.depthFunc(enum func) {
    depth_test_func = func;
  }

  void gl.clear() {
    for (x = 0; x < image_width; x++) {
      for (y = 0; y < image_height; y++) {
        depth_buffer[x][y] = maximum_z_value;
        color_buffer[x][y] = background_color;
      }
    }
  }

  void renderPixel(x, y, z, color) {
    if (depth_test_is_enabled) {           // gl.enable(gl.DEPTH_TEST);
      if (passes_depth_test(x, y, z)) {
        if (write_depth) depth_buffer[x][y] = z;
        color_buffer[x][y] = color;
      }
    } else {                               // gl.disable(gl.DEPTH_TEST);
      color_buffer[x][y] = color;
    }
  }

  boolean passes_depth_test(x, y, z) {
    switch (depth_test_func) {             // gl.depthFunc(enum func);
      case NEVER:    condition = false;
      case ALWAYS:   condition = true;
      case LESS:     condition = (z <  depth_buffer[x][y]);  // DEFAULT
      case EQUAL:    condition = (z == depth_buffer[x][y]);
      case LEQUAL:   condition = (z <= depth_buffer[x][y]);
      case GREATER:  condition = (z >  depth_buffer[x][y]);
      case GEQUAL:   condition = (z >= depth_buffer[x][y]);
      case NOTEQUAL: condition = (z != depth_buffer[x][y]);
    }
    return condition;
  }

WebGL Experimentation
.....................

Using the WebGL program below (which is a simple scaling example from
a previous lesson), make the following suggested
changes to see the effect of these z-buffer commands on a rendering.

* In line 123, change :code:`gl.enable(gl.DEPTH_TEST);` to :code:`gl.disable(gl.DEPTH_TEST);`.
  This turns off *hidden surface removal*. After re-starting the program, rotate
  the model to see different views. The result is basically the "painter's algorithm" without
  any sorting. Can you determine which cube is always drawn last?

* In the render function around line 71, add a call to clear the
  *color buffer*: :code:`gl.clear(gl.COLOR_BUFFER_BIT);`. This changes the background
  to white because of the :code:`gl.clearColor(0.98, 0.98, 0.98, 1.0);` command
  in the constructor.

* In the render function, before calling :code:`gl.clear()`, set :code:`clearColor`
  to a random color. That is: :code:`gl.clearColor(Math.random(), Math.random(), Math.random(), 1.0);`

* To investigate round-off errors in the z-buffer algorithm, render two versions of the model
  that take up the same 3D locations.

  * In the constructor, create a matrix for translation: :code:`let translate = matrix.create();`.
  * In the render function, render the model again, but with a translation:

    .. Code-Block:: JavaScript

      matrix.translate(translate, 0.5, 0.0, 0.0);
      matrix.multiplySeries(transform, transform, translate);
      for (let j = 0; j < scene_models.length; j += 1) {
        scene_models[j].render(transform);
      }

  The flickering in color is called "z-fighting" and is due to round-off errors in
  the z values. There are two triangles at the same z-depth and it can't resolve
  which one should be drawn.

* Enable the depth buffer, set the "clear depth" value to 0.0 (it's minimum value), clear
  both the *color buffer* and the *depth buffer*, and change the "depth test" to :code:`gl.GREATER`.
  That is:

  .. Code-block:: JavaScript

    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.depthFunc(gl.GREATER);

  Notice that the model is now rendered backwards.

* Create your own experiments!

.. webglinteractive:: W1
  :htmlprogram: _static/01_example01/scale_about_origin.html
  :editlist: _static/01_example01/scale_about_origin_scene.js


Summary
-------

In summary,

* To enable WebGL's "hidden surface removal" algorithm, simply call :code:`gl.enable(gl.DEPTH_TEST);` once.
  :raw-html:`<br><br>`

* To get a specific background color, set the color once using
  :code:`gl.clearColor(red, green, blue, alpha)` and then call
  :code:`gl.clear(gl.COLOR_BUFFER_BIT);` at the beginning of each rendering.

Glossary
--------

.. glossary::

  hidden surface removal
    An algorithm for determining the visible geometric primitives in a scene. Or, an
    algorithm for determining the hidden geometric primitives in a scene and not rendering them.

  painter's algorithm
    Sort the graphic primitives in a scene and render them back to front.

  z-buffer algorithm
    For every rendered pixel, store its distance from the camera and only
    render a different object for that pixel if the object is closer to the camera.

  bit flag
    An integer number that has a single bit set to one.

  bit flags
    An integer number where each bit represents a different "flag".

Self Assessment
---------------

.. mchoice:: 12.2.1
  :random:

  The *painter's algorithm* performs "hidden surface removal" by ...

  - rendering graphic primitives in sorted order, with the primitives furthest from
    the camera rendered first and the primitives closest to the camera rendered last.

    + Correct.

  - rendering graphic primitives based on their color values, with the red primitives
    first, the green primitives next, and the blue primitives last.

    - Incorrect. That's silly!

  - rendering graphic primitives in the order a programmer defines them.

    - Incorrect.

  - rendering graphic primitives in sorted order, with the primitives closest to
    the camera rendered first and the primitives furthest from the camera rendered last.

    - Incorrect. This is backwards.

.. mchoice:: 12.2.2
  :random:

  The *painter's algorithm* is simple but has the following flaws. (Select all that apply.)

  - Sorting graphic primitives based on their distance from the camera is slow.

    + Correct.

  - Sorting graphic primitives based on their distance from the camera requires
    the data that defines the graphic primitives be copied to the GPU over and over again.

    + Correct.

  - Graphic primitives that overlap in 3D space can't be sorted.

    + Correct.

  - Graphic primitive can be rendered in any order and still accomplish "hidden surface removal".

    - Incorrect.

.. mchoice:: 12.2.3
  :random:

    Which of the following are advantages of the z-buffer *hidden surface removal* algorithm? (Select all that apply.)

  - No sorting of the graphic primitives is required.

    + Correct.

  - It requires a trivial amount of extra memory.

    - Incorrect. The *depth buffer* requires a substantial about of memory.

  - It is super fast because it only processes surfaces that are visible.

    - Incorrect. Every pixel of every surface must be rendered even though many of them
      may never change the *color buffer*.

  - It's implementation is complex, but that's OK because it is really fast.

    - Incorrect. It's implementation is almost trival.

.. mchoice:: 12.2.4
  :random:

  Does the z-buffer algorithm perform *hidden surface removal* automatically in WebGL?

  - No, it must be enabled using the command :code:`gl.enable(gl.DEPTH_TEST);`

    + Correct.

  - Yes, the default WebGL behaviour is to perform *hidden surface removal*.

    - Incorrect.

  - Sometimes, depending on the models in a scene.

    - Incorrect.

.. mchoice:: 12.2.5
  :random:

  When should a bit-wise OR operator, :code:`|`, be used?

  - To combine bit-flags into a single value.

    + Correct.

  - To perform a boolean OR operation where the result is true if either value is true.

    - Incorrect. The boolean OR operation is double bars, :code:`||`

  - To add two bit-flags to get a single value.

    - Incorrect. The :code:`|` does not perform an addition operation, but if two bit-flags
      have different bits set, the result of a bit-wise OR and an algebraic addition
      produces the same result. (Always use the bit-wise OR!)

  - To combine two integers into their product.

    - Incorrect.

.. mchoice:: 12.2.6
  :random:

  What is "z-fighting"?

  - When floating point round-off errors cause the color of two surfaces that
    are in the same location in 3D space to alternate colors and cause random
    color patterns.

    + Correct.

  - When two surfaces have the exact same depth values.

    - Incorrect. The problem is not when the values are the same; it is when the depth values alternate.

  - When two different surfaces assign a different color to a fragment.

    - Incorrect. If a surface assigns a color to a fragment, it overwrites the color that
      was previously assigned.

  - When more than two surfaces have the same color.

    - Incorrect.


.. index:: hidden surface removal, painter's algorithm, z-buffer algorithm, bit flag, z-fighting


.. _hidden surface removal: https://en.wikipedia.org/wiki/Hidden_surface_determination
.. _painter's algorithm: https://en.wikipedia.org/wiki/Painter%27s_algorithm
.. _z-buffer algorithm: https://en.wikipedia.org/wiki/Z-buffering
.. _this WebGL API page: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext