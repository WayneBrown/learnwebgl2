..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

5.8 - Example 4: Textures
:::::::::::::::::::::::::

This chapter has explained how shader programs, GPU *object buffers*, and
JavaScript rendering code works together to create WebGL renderings.
We have keep the shader programs very simple to help make the concepts
understandable. However, we have barely scratched the surface on what
is possible. The WebGL program below is presented to spark your
interest in what is coming in future lessons. We won't walk through
the details of *procedural texture mapping* in this lesson, but please
review the program code to get an idea of what a more complex shader program
might do.

The example WebGL program below does the following:

* The pyramid model is defined in :code:`simple_model4.js` and stores
  "texture coordinates" with each vertex.
  In this example, the "texture coordinates" are 2 numbers that are used
  by a procedural texture map, which is implemented in the *fragment shader*.
* Three *buffer objects* are built: one for the vertex locations, :code:`(x,y,z)`,
  one for the vertex color values, :code:`RGBA`, and one for the texture coordinates,
  which we refer to as :code:`(s,t)`.
* At render time, each attribute variable in the *vertex shader* is linked
  to the *buffer object* that contains its data.
* The entire model is rendered with a single call to :code:`gl.drawArrays()`.
* The *fragment shader* uses the texture coordinates to modify the color
  of some of the fragments. Note that the texture
  coordinates and the vertex colors are :code:`varying` their values based on
  the values that were set at the vertices.

A Texture Map Example
---------------------

.. webglinteractive:: W1
  :htmlprogram: _static/05_simple_pyramid_texture/simple_pyramid_texture.html
  :editlist: _static/05_simple_pyramid_texture/simple_model4.js, _static/shaders/texture01.vert, _static/shaders/texture01.frag
  :hideoutput:
  :width: 300
  :height: 300


Summary
-------

To render a model, it requires a GPU *shader program*, one or more GPU *object-buffers*,
and JavaScript rendering code. Let's summarize the big picture behind rendering:

* A *vertex shader* program retrieves vertex and other associated data
  from *buffer objects*. All *buffer objects* are 1-dimensional arrays of floats.
  The data in the *buffer objects* are organized by vertex. The
  *vertex shader* calculates the position a vertex in the scene and
  prepares any data needed by the *fragment shader* for calculating colors.

* A *fragment shader* program receives data from the *vertex shader* for
  each vertex and then interpolates the values over the fragments of the
  primitive (either a point, line or triangle).

* A pre-processing step must create appropriate GPU *buffer objects* and copy
  the model data into them.

* Each time a model is rendered, a shader's :code:`uniform` variables must be
  assigned a value, a shader's :code:`attribute` variables must be linked to their
  appropriate *buffer objects* and a call to :code:`gl.drawArrays()` executes the
  graphics pipeline.

Self-Assessments
----------------

.. mchoice:: 5.8.1
  :random:
  :answer_a: 0 and 1.
  :answer_b: 0, 1, or 2.
  :answer_c: Any positive integer value greater than or equal to 0.
  :answer_d: Only 0 and 2.
  :correct: a
  :feedback_a: Correct. The sum of the two floor() values will always be an integer, and the remainder of dividing any integer by 2 has to be 0 or 1, which is equivalent to saying all integers are either even or odd.
  :feedback_b: Incorrect. It is not possible to get 2.
  :feedback_c: Incorrect. Mod(n,2) divides by 2 and returns the remainder as an integer.
  :feedback_d: Incorrect.

  Code in the example fragment shader in the above WebGL program uses a
  :code:`floor` function to to convert a floating point number to an integer,
  and a :code:`mod` function to get the remainder after division by 2.
  What are the only possible values this expression can return?

  .. Code-block:: glsl

    mod((floor(s/grid_size) + floor(t/grid_size)),2.0)

.. mchoice:: 5.8.2
  :random:
  :answer_a: Yes, the exact structure of the model data is arbitrary.
  :answer_b: No, there is only one way to define model data.
  :answer_c: Yes, but it would be very confusing.
  :answer_d: No, model data must be defined in arrays of arrays.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. There are many, many ways.
  :feedback_c: Incorrect. There is no confusion if you did it that way for a reason!
  :feedback_d: Incorrect. Using arrays of arrays might make the data more structured, but it is not required.

  The :code:`SimpleModel4` function in the above WebGL program uses a
  array of arrays to define the data for each vertex like this:

  .. Code-block:: Javascript

    vertices = [  [ [ 0.0, -0.25, -0.50], [1, 0, 0, 1], [2.0, 0.0] ],
                  [ [ 0.0,  0.25,  0.00], [0, 1, 0, 1], [0.5, 1.0] ],
                  [ [ 0.5, -0.25,  0.25], [0, 0, 1, 1], [1.0, 0.0] ],
                  [ [-0.5, -0.25,  0.25], [1, 0, 1, 1], [0.0, 0.0] ]
               ];

  Could you have defined the vertex data using a single array for each vertex like this:

  .. Code-block:: Javascript

    vertices = [  [ 0.0, -0.25, -0.50,   1, 0, 0, 1,  2.0, 0.0 ],
                  [ 0.0,  0.25,  0.00,   0, 1, 0, 1,  0.5, 1.0 ],
                  [ 0.5, -0.25,  0.25,   0, 0, 1, 1,  1.0, 0.0 ],
                  [ -0.5, -0.25,  0.25,  1, 0, 1, 1,  0.0, 0.0 ]
               ];


.. index:: varying variables

