..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

5.6 - Example 2: One Color per Triangle
:::::::::::::::::::::::::::::::::::::::

Suppose we would like to render a triangular mesh where each triangle
has a different color. This can be done using the previous version of our
shader program by calling :code:`gl.drawArrays()` to render each triangle
separately.  The code would look like this:

.. Code-block:: JavaScript

  // Draw each triangle separately
  for (var start = 0, color_index = 0;
    start < number_vertices;
    start += 3, color_index += 1) {

    // Set the color of the triangle
    gl.uniform4fv(u_Color_location, colors[color_index]);

    // Draw a single triangle
    gl.drawArrays(gl.TRIANGLES, start, 3);
  }

.. webglinteractive:: W1
  :htmlprogram: _static/05_color_per_triangle/simple_pyramid.html
  :editlist: _static/05_color_per_triangle/simple_model_render.js
  :hideoutput:
  :width: 300
  :height: 300

Performing a graphics pipeline for individual triangles is very inefficient.
In the example above the average rendering time for the pyramid
model is being calculated and displayed. If the model was composed of 100's,
or perhaps 1000's, of triangles, we would have a major speed problem.
Every call in your JavaScript program to a WebGL command is a huge time sink.
If we want the graphics to be fast,
we need to draw an entire model using a single call to :code:`gl.drawArrays()`.

If we change our shader program to allow for a different color for
each vertex, we must also change our model representation and our
buffer objects. So let's walk through all the changes required.

The Model
---------

To implement a different color for each triangle, let's store a RGBA color value
with each of our "triangle" objects. A new version of our 3D model is shown
in the following WEBGL program example. Please note the following changes:

.. tabbed:: program_descriptions

  .. tab:: Comments on simple_model2.js

    +-------+--------------------------------------------------------------------------+
    + Lines + Description                                                              +
    +=======+==========================================================================+
    + 37-41 + A :code:`Triangle2` object now stores a color. (line 40)                 +
    +-------+--------------------------------------------------------------------------+
    + 67-71 + Various RGBA colors are defined.                                         +
    +-------+--------------------------------------------------------------------------+
    + 74-77 + A different color is passed to the creation of each :code:`Triangle2`    +
    +       + object.                                                                  +
    +-------+--------------------------------------------------------------------------+

.. webglinteractive:: W2
  :htmlprogram: _static/05_color_per_triangle2/simple_pyramid2.html
  :editlist: _static/05_color_per_triangle2/simple_model2.js
  :hideoutput:
  :width: 300
  :height: 300

The Shader Programs
-------------------

Our shader programs must change because each vertex of our model now has two
attributes: a location, (x,y,z), and a color (r,g,b,a). Therefore, our
*vertex shader* program has two
:code:`attribute` variables: :code:`a_Vertex` and :code:`a_Color`.
Examine the shader programs in the following demo and
then study their descriptions below.

.. webglinteractive:: W3
  :htmlprogram: _static/05_color_per_triangle2/simple_pyramid2.html
  :editlist: _static/shaders/color_per_vertex.vert, _static/shaders/color_per_vertex.frag
  :hideoutput:
  :width: 300
  :height: 300

.. tabbed:: program_descriptions3

  .. tab:: Comments on colors_per_vertex.vert

    +-------+--------------------------------------------------------------------------+
    + Lines + Description                                                              +
    +=======+==========================================================================+
    + 5     + There is only one variable that is constant for an execution of          +
    +       + :code:`gl.drawArrays()` for this shader, the :code:`uniform` model       +
    +       + transformation matrix, :code:`u_Transform`.                              +
    +-------+--------------------------------------------------------------------------+
    + 7-8   + Each vertex has two attributes: a location and a color.                  +
    +-------+--------------------------------------------------------------------------+
    + 10    + Values are passed from a *vertex shader* to a *fragment shader* using    +
    +       + the :code:`varying` storage quantifier. This will make more sense later. +
    +       + For now, we need a 'varying' variable to pass a vertex's color           +
    +       + to the *fragment shader*. (Note that the vertex's location is being      +
    +       + passed to the *frament shader* through the :code:`gl_Position` variable. +
    +-------+--------------------------------------------------------------------------+
    + 17    + Pass the RGBA color value for this vertex to the *fragment shader*.      +
    +-------+--------------------------------------------------------------------------+

  .. tab:: Comments on colors_per_vertex.frag

    +-------+--------------------------------------------------------------------------+
    + Lines + Description                                                              +
    +=======+==========================================================================+
    + 5     + Declare a :code:`varying` variable using the same name as the *vertex    +
    +       + shader*. When the shaders are compiled and linked, this variable will    +
    +       + contain the value set in the *vertex shader*.                            +
    +-------+--------------------------------------------------------------------------+
    + 8     + Use the color of the vertex to set the color of every pixel inside the   +
    +       + triangle that is being rendered.                                         +
    +-------+--------------------------------------------------------------------------+

The Buffer Object(s)
--------------------

Since we have two attributes for each vertex, a location and a color,
we will create two *buffer objects*. Since all data is "per-vertex", each vertex
must be assigned a color, even though this requires that the same color value
be stored three times. Study the code in the :code:`model_to_gpu2.js` file
in the WebGL example below. Make sure you find where the data for the
two *buffer objects* are collected and then the separate *buffer objects*
are created in the GPU (lines 104 and 105).

.. webglinteractive:: W4
  :htmlprogram: _static/05_color_per_triangle2/simple_pyramid2.html
  :editlist: _static/05_color_per_triangle2/model_to_gpu2.js
  :hideoutput:
  :width: 300
  :height: 300

Below is the data in the buffer objects for our pyramid model.
Notice that the color values are repeated 3 times to make each vertex
of a specific triangle be the same color.

.. Code-block:: JavaScript

  // The vertex location array
  [0.5, -0.25, 0.25,   0,    0.25, 0,      -0.5, -0.25,  0.25,
  -0.5, -0.25, 0.25,   0,    0.25, 0,       0,   -0.25, -0.5,
   0,   -0.25, -0.5,   0,    0.25, 0,       0.5, -0.25,  0.25,
   0,   -0.25, -0.5,   0.5, -0.25, 0.25,   -0.5, -0.25,  0.25]

  // The color-per-vertex array
  [ 1,0,0,1,  1,0,0,1,  1,0,0,1,
    0,1,0,1,  0,1,0,1,  0,1,0,1,
    0,0,1,1,  0,0,1,1,  0,0,1,1,
    1,0,1,1,  1,0,1,1,  1,0,1,1 ]

Access to Shader Variables
--------------------------

Since your variables have changed in the shader programs, you need to
modify your rendering code to get the location of the shader variables.
Lines 135-139 of the demo code below get the shader variable locations:

.. Code-Block:: JavaScript

  // Get the location of the shader variables for the color_program
  color_program.u_Transform_location = gl.getUniformLocation(color_program, 'u_Transform');

  color_program.a_Vertex_location    = gl.getAttribLocation(color_program, 'a_Vertex');
  color_program.a_Color_location     = gl.getAttribLocation(color_program, 'a_Color');

.. webglinteractive:: W5
  :htmlprogram: _static/05_color_per_triangle2/simple_pyramid2.html
  :editlist: _static/05_color_per_triangle2/simple_model_render2.js
  :hideoutput:
  :width: 300
  :height: 300

A common convention in WebGL programs is to store the location of
shader variables as properties of the "program" object. This is especially
convenient if you have more than one shader program being used for
rendering.

Linking a Buffer Object to an Attribute Variable
------------------------------------------------

We now have two *buffer objects* to link variables to when we render the
model. Lines 83-91 in the above demo performs the linkage:

.. Code-Block:: JavaScript

  // Activate and attach the model's vertex Buffer Object
  gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);
  gl.vertexAttribPointer(color_program.a_Vertex_location, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(color_program.a_Vertex_location);

  // Activate and attach the model's color Buffer Object
  gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);
  gl.vertexAttribPointer(color_program.a_Color_location, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(color_program.a_Color_location);

Notice that you have to make a *buffer object* active using the :code:`gl.bindBuffer()`
function before linking it to a variable with the :code:`gl.vertexAttribPointer()`
function.

Rendering
---------

We can now render the entire model with a single call to :code:`gl.drawArrays()`
in line 95. Study the rendering function in the example above in lines 68-126.

It should be noted that we can no longer render the triangle edges as we
did in the previous lesson. Why? The shader program now requires a color
from a *buffer object* for each vertex. Using the *shader program* we have defined
above, we could render the triangle edges by creating a 3\ :sup:`rd` *buffer
object* and repeating the color black for each vertex. We could then
connect the :code:`a_Color` variable to this new buffer and render the
edges as we did in the previous lesson. This is very wasteful of memory.
Another option would be to have two separate shader programs: draw the
faces with one shader program, activate a different shader program, and then
render the edges. There are trade-offs for both options.

You can change the active shader program like this:

.. Code-Block:: JavaScript

  gl.useProgram(program);

Changing your active *shader program* changes the rendering context, which
takes time, which slows down rendering. Therefore, you should switch between
*shader programs* as few times as possible.

Summary
-------

To use a different color for each triangle of a model, we had to modify
the model's definition, the shader programs, the buffer objects, and the
rendering code. All of this code is interdependent. This makes code development
challenging because you have to make many changes in many different places before
you can test and verify your code. Here is a partial list of things you
might verify as you debug a rendering program:

* The shader program compiled and linked correctly.
* The location of all shader program variables were retrieved correctly.
* The data for an *object buffer* was created correctly.
* All *object buffers* were created correctly.
* The function that renders a model is called with the correct parameters.
* The rendering function assigns all :code:`uniform` variables an appropriate value.
* The rendering function links all :code:`attribute` variables to appropriate *object buffers*.
* The :code:`gl.drawArrays()` command is being called with the appropriate parameters.

Self-Assessments
----------------

.. mchoice:: 5.6.1
  :random:
  :answer_a: the rendering is very slow.
  :answer_b: it doesn't work.
  :answer_c: the rendering is too fast for real-time graphics.
  :answer_d: shader programs must always be executed on multiple triangles at one time.
  :correct: a
  :feedback_a: Correct. You lose most the GPU's builtin efficiencies.
  :feedback_b: Incorrect. See the first WebGL program in this lesson for an example that works.
  :feedback_c: Incorrect. It is not possible to render models too fast!
  :feedback_d: Incorrect. A shader program can execute on a single vertex if your set the gl.drawArrays' count parameter to 1.

  Rendering a model by calling :code:`gl.drawArrays()` for each individual triangle is a bad idea because...

.. mchoice:: 5.6.2
  :random:
  :answer_a: Because the graphics pipeline processes vertices, and all data must be store in a per-vertex order.
  :answer_b: Because three is the magic number for all vertex data.
  :answer_c: Because both object-buffers for the pyramid model are required to have the same number of floats.
  :answer_d: Because GPU memory is cheap and we can waste it without worry.
  :correct: a
  :feedback_a: Correct. The color values in the color object-buffer must match up one-to-one with the vertex data.
  :feedback_b: Incorrect. Three has no special meaning in WebGL programming.
  :feedback_c: Incorrect. They are required to represent the same number of vertices, but the number of floats can be different. Notice that the vertex object-buffer holds 36 floats, while the color object-buffer holds 48 floats.
  :feedback_d: Incorrect. GPU memory tends to be large, but still a limited resource.

  The second WebGL example program in this lesson stores a RGBA color value for each vertex of the model. The data
  for rendering the pyramid looks like the 1D array of values below. Why are the four color values for the four
  triangles each stored 3 times?

  .. Code-block:: JavaScript

    // The color-per-vertex array
    [ 1,0,0,1,  1,0,0,1,  1,0,0,1,
      0,1,0,1,  0,1,0,1,  0,1,0,1,
      0,0,1,1,  0,0,1,1,  0,0,1,1,
      1,0,1,1,  1,0,1,1,  1,0,1,1 ]

.. mchoice:: 5.6.3
  :random:
  :answer_a: Yes, though it does slow down overall rendering speed.
  :answer_b: Yes, but it is not recommended.
  :answer_c: No.
  :correct: a
  :feedback_a: Correct. Switching shader programs requires a "context switch" which does take a little time.
  :feedback_b: Incorrect. Actually is very common because special rendering effects require special shader programs.
  :feedback_c: Incorrect.

  Can you render a scene using more than one shader program?



.. index:: shader programs, vertex shader, fragment shader, buffer object,
  accessing shader variables, linking attribute variables to buffer objects

