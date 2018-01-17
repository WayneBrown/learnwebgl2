..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

5.7 - Example 3: One Color per Vertex
:::::::::::::::::::::::::::::::::::::

This example will help you understand :code:`varying` variables in shader
programs, which allow the color of the pixels across a triangle's face to
"vary". This allows all kinds of special
effects, such as gradient colors and lighting effects. To demonstrate how
:code:`varying` variables work, we can keep the
previous shader programs and just change our data. We will assign a
different color to each vertex of a triangle.

The Model
---------

In the WebGL program below, a :code:`Triangle3` object will contain 3 vertices,
but each vertex is defined by a :code:`(x,y,z)` location and a :code:`RGBA` color.

.. tabbed:: program_descriptions3

  .. tab:: Comments on simple_model3.js

    +-------+--------------------------------------------------------------------------+
    + Lines + Description                                                              +
    +=======+==========================================================================+
    + 60-64 + The vertices are defined by two separate arrays, a :code:`(x,y,z)`       +
    +       + location and a :code:`RGBA` color.                                       +
    +-------+--------------------------------------------------------------------------+
    + 38    + A :code:`Triangle3` object now stores 3 vertices, but each vertex        +
    +       + definition contains both a location and a color.                         +
    +-------+--------------------------------------------------------------------------+

.. webglinteractive:: W1
  :htmlprogram: _static/05_color_per_vertex/simple_pyramid3.html
  :editlist: _static/05_color_per_vertex/simple_model3.js
  :hideoutput:
  :width: 300
  :height: 300


The Shader Programs
-------------------

Our shader programs remain unchanged from the previous example, but they are
displayed below so that we can discuss them again.

.. webglinteractive:: W2
  :htmlprogram: _static/05_color_per_vertex/simple_pyramid3.html
  :editlist: _static/shaders/color_per_vertex.vert, _static/shaders/color_per_vertex.frag
  :hideoutput:
  :width: 300
  :height: 300

The previous explanations of *vertex shaders* said that a *vertex shader*'s job was
to position a vertex and set the :code:`gl_Position` output
variable for that vertex. This is true, but it is only half the story. A *vertex shader* also
prepares and passes data about the vertex to the *fragment shader*.
Remember, a *fragment* is a collection of data related to an individual pixel.
Well, any :code:`varying` variable declared in a
*vertex shader* will be passed to the *fragment shader* for that individual
vertex. If we declared and calculated six :code:`varying` variables in a
*vertex shader*, all six values will be passed on to the *fragment shader*.
:code:`Varying` variables can be thought of as parameters to the *fragment shader*
for that individual vertex.

Why are they call them :code:`varying` variables? It is because they automatically
change their value as they are applied to individual pixels on a triangle's face
(or along a line segment).
Technically the values are *linearly interpolated*. The term *interpolated*
means that given a starting and ending value, the values in-between are gradually
changed to morph from the starting value into the ending value. For example, starting
with 10 and ending in 22, with 3 intermediate values, a linear interpolation would
produce the sequence :code:`[10, 13, 16, 19, 22]`. The term *linearly interpolated*
means that the difference between any two sequential values is the same.

The *linear interpolation* of :code:`varying` variables happens automatically.
You have no control over the interpolation and you can't stop the interpolation.
If you have a value that you want to remain constant over all the pixels in
a triangle's face, you must still declare it as a :code:`varying` variable, but you can
set the starting and ending values to be the same and the interpolation will
calculate a value that doesn't change. For example, interpolating from 10 to 10
will calculate 10 for every value in-between.

The Buffer Object(s)
--------------------

In the WebGL program below each vertex has a distinct color. Therefore the
data in the *buffer object* that contains the **vertex colors** must be created
differently, as compared to the previous lesson. Study the code in the
:code:`model_to_gpu.js` file below, especially lines 80-109.

.. webglinteractive:: W3
  :htmlprogram: _static/05_color_per_vertex/simple_pyramid3.html
  :editlist: _static/05_color_per_vertex/model_to_gpu3.js
  :hideoutput:
  :width: 300
  :height: 300

Access to Shader Variables
--------------------------

The shader program did not change, so there are no changes to the code
that gets the shader variable locations.

Linking a Buffer Object to an Attribute Variable
------------------------------------------------

Linking to the *buffer objects* remained unchanged.

Rendering
---------

The rendering of the model remained unchanged. The rendering function
in the example below is in lines 71-128.

.. webglinteractive:: W4
  :htmlprogram: _static/05_color_per_vertex/simple_pyramid3.html
  :editlist: _static/05_color_per_vertex/simple_model_render3.js
  :hideoutput:
  :width: 300
  :height: 300


Summary
-------

The colors of fragments that compose a point, line or triangle are
assigned colors using interpolated values. The values calculated
at the vertices are the starting and ending values used for the interpolation.

Self-Assessments
----------------

.. mchoice:: 5.7.1
  :random:
  :answer_a: a value that is automatically interpolated from its starting to ending value.
  :answer_b: a value that is automatically passed from the vertex shader to the fragment shader.
  :answer_c: a color value.
  :answer_d: a value that never changes; a constant.
  :correct: a,b
  :feedback_a: Correct. The values assigned by the vertex shader at the vertices are the starting and ending values.
  :feedback_b: Correct. "Varying" variables are always available to the fragment shader.
  :feedback_c: Incorrect. In the examples in this lesson the varying variable was a color, but any type of value can be set up to be "varying".
  :feedback_d: Incorrect. It's called "varying" for a reason.

  A :code:`varying` variable in a shader program is ... (Select all that apply.)

.. mchoice:: 5.7.2
  :random:
  :answer_a: [10, 15, 20]
  :answer_b: [10, 12, 14, 16, 18, 20]
  :answer_c: [10, 11, 13, 15, 18, 19, 20]
  :answer_d: [10, 14, 16, 20]
  :correct: a,b
  :feedback_a: Correct. The difference between each value is 5.
  :feedback_b: Correct. The difference between each value is 2.
  :feedback_c: Incorrect. The difference between values is not a constant.
  :feedback_d: Incorrect. The difference between values is not a constant.

  Which of the following are valid linear interpolations between 10 and 20? (Select all that apply.)


.. index:: varying variables

