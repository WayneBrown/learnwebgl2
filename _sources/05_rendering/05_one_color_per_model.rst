..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

5.5 - Example 1: One Color per Model
::::::::::::::::::::::::::::::::::::

To render our simple pyramid model using a single color for all its
faces we need to examine the following issues:

* What logic is needed in the vertex and fragment shader programs?
* How is the model data organized in an *object buffer*?
* How is rendering actually performed?

The Shader Programs
-------------------

Examine the shader programs in the following demo and then study their
descriptions below.

.. webglinteractive:: W1
  :htmlprogram: _static/03_simple_pyramid/simple_pyramid.html
  :editlist: _static/shaders/uniform_color.vert, _static/shaders/uniform_color.frag
  :hideoutput:
  :width: 300
  :height: 300

.. tabbed:: program_descriptions

  .. tab:: Vertex Shader Comments

    +---------+--------------------------------------------------------------------------+
    + Line(s) + Description                                                              +
    +=========+==========================================================================+
    + 5-6     + The model will be rendered with the same transformation matrix for all   +
    +         + vertices. And all faces will be rendered with the same color. These are  +
    +         + :code:`uniform` values that will be set once before a rendering starts.  +
    +         + Notice the convention to start their names with a :code:`u_`. This will  +
    +         + help you track the types of your variables. (WebGL shaders could care    +
    +         + less what you name your variables. This convention is for you - the      +
    +         + programmer!)                                                             +
    +---------+--------------------------------------------------------------------------+
    + 5       + a :code:`mat4` is a 4x4 matrix; 16 floating point values.                +
    +---------+--------------------------------------------------------------------------+
    + 6       + a :code:`vec4` is a vector of 4 floating point values; in this case a    +
    +         + color defined as RGBA (red, green, blue, alpha).                         +
    +---------+--------------------------------------------------------------------------+
    + 8       + The vertices will change for every triangle that is rendered. Therefore  +
    +         + the variable, :code:`a_Vertex`, is an attribute variable. It will get    +
    +         + its values from a *buffer object*. A :code:`vec3` is an array of 3       +
    +         + floating point values; in this case an (x,y,z) location.                 +
    +---------+--------------------------------------------------------------------------+
    + 10-13   + The :code:`main()` function is always the entry point for a shader. This +
    +         + function will be executed once for each vertex in the model.             +
    +---------+--------------------------------------------------------------------------+
    + 12      + This shader executes a single command on each vertex. It is multiplying  +
    +         + a 4x4 matrix times a 4x1 vector using linear algebra matrix              +
    +         + multiplication. WebGL shaders have matrix math built-in! Notice that     +
    +         + the vertex has only three values (x,y,z) but 4 values are required for   +
    +         + the matrix multiplication. The vertex is converted to a 4-component      +
    +         + array, with the last component, the :code:`w` component, set to 1.0.     +
    +         + Note that the matrix is what allows the model to be rotated, positioned  +
    +         + in front of a virtual camera, and projected to a 2D image. Also note     +
    +         + that the value stored in the :code:`gl_Position` is the function's       +
    +         + output.                                                                  +
    +---------+--------------------------------------------------------------------------+

  .. tab:: Fragment Shader Comments

    +---------+--------------------------------------------------------------------------+
    + Line(s) + Description                                                              +
    +=========+==========================================================================+
    + 5       + The color of the pixels will be the same, so we have one :code:`uniform` +
    +         + value, :code:`u_Color`. Because the variable is global and has the same  +
    +         + name as a global *vertex shader* variable, the variable is linked to the +
    +         + *vertex shader*'s variable of the same name.                             +
    +---------+--------------------------------------------------------------------------+
    + 7-9     + The :code:`main()` function is always the entry point for a shader. This +
    +         + function will be executed once for each fragment of the rendered         +
    +         + primitive (either a point, line or triangle.)                            +
    +---------+--------------------------------------------------------------------------+
    + 8       + This shader executes a single command on each fragment. It is setting    +
    +         + the color of the fragment. The value stored in :code:`gl_FragColor`      +
    +         + is the function's output.                                                +
    +---------+--------------------------------------------------------------------------+

The Buffer Object(s)
--------------------

The only attribute of the vertices that is different for every vertex is their location.
Therefore, we need to store the vertex locations in a *buffer object*.
Remember that a *buffer object* is a 1-dimensional, homogeneous array of floating point values.
We need to gather up all of the vertices that define
the triangles into a single array -- and the order of the vertices matter.
Before you create the array you need to
decide how the triangles will be rendered. There are three choices:
:code:`gl.TRIANGLES`, :code:`gl.TRIANGLE_STRIP`, or :code:`g.TRIANGLE_FAN`.
In addition, the vertices of each triangle must be in counter-clockwise order
when looking at the front of the face. Our pyramid model can be rendered
in a single 'pass' through the *buffer object* using either the :code:`gl.TRIANGLES`
or the :code:`gl.TRIANGLE_STRIP` mode. Let's keep it simple and use the
:code:`gl.TRIANGLE` mode for this example. (If you changed rendering modes,
you would have to change the ordering of the vertices.)

Creating the *buffer object* is a pre-processing step which needs to happen
only once. Let's break the task into 2 parts:

* Get the triangle vertices into a 1D array in the correct order.
* Create a *buffer object* and upload the vertices into the GPU's memory.

For the rendering of a 4 triangle pyramid in the example WebGL program below,
the 1D array contains the following 36 floats. (Each three consecutive
values represent one vertex and three consecutive vertices define one triangle.)

.. Code-block:: JavaScript

  [0.5, -0.25, 0.25,   0,    0.25, 0,      -0.5, -0.25,  0.25,
  -0.5, -0.25, 0.25,   0,    0.25, 0,       0,   -0.25, -0.5,
   0,   -0.25, -0.5,   0,    0.25, 0,       0.5, -0.25,  0.25,
   0,   -0.25, -0.5,   0.5, -0.25, 0.25,   -0.5, -0.25,  0.25]

.. webglinteractive:: W2
  :htmlprogram: _static/03_simple_pyramid/simple_pyramid.html
  :editlist: _static/03_simple_pyramid/model_to_gpu.js, _static/03_simple_pyramid/simple_pyramid_scene.js
  :hideoutput:
  :width: 300
  :height: 300


Please study the code in the above example by comparing the code to
the following code descriptions.

.. tabbed:: program_descriptions_2

  .. tab:: model_to_gpu.js Comments

    +---------+--------------------------------------------------------------------------+
    + Line(s) + Description                                                              +
    +=========+==========================================================================+
    + 54-71   + The :code:`_createBufferObject` function does the following:             +
    +         +                                                                          +
    +         + #. Creates a new *buffer object*. (line 58)                              +
    +         + #. Makes the new *buffer object* be the "active buffer". (line 65)       +
    +         + #. Copies the model data into the *buffer object*. (line 68)             +
    +---------+--------------------------------------------------------------------------+
    + 76-99   + The constructor of the class does the following:                         +
    +         +                                                                          +
    +         + #. Creates a :code:`Float32Array` array to hold all the vertex values.   +
    +         +    (lines 80-82)                                                         +
    +         + #. Loops through all the triangles and then the 3 vertices of each       +
    +         +    triangle to fill the array. (lines 84-95)                             +
    +         + #. Calls :code:`_createBufferObject` to create the buffer and copy the   +
    +         +    array to the GPU's memory. (line 98)                                  +
    +---------+--------------------------------------------------------------------------+

  .. tab:: simple_pyramid_scene.js Comments

    +-------------+-------------------------------------------------------------------------------------------+
    + Line(s)     + Description                                                                               +
    +=============+===========================================================================================+
    + | 44-75     + | Constructor declarations.                                                               +
    + | 126-176   + | Constructor commands. (WebGL pre-processing commands).                                  +
    +-------------+-------------------------------------------------------------------------------------------+
    + | 148       + | Create the pyramid model.                                                               +
    + | 152       + | Pre-processing of the pyramid model to get its data into GPU object buffers.            +
    + | 155       + | Pre-processing of the pyramid model to get the location of shader variables in          +
    +             +   shader program that will be used to render the model.                                   +
    +-------------+-------------------------------------------------------------------------------------------+
    + | 159-172   + | Pre-processing of the axes models.                                                      +
    +-------------+-------------------------------------------------------------------------------------------+
    + | 78-100    + | The :code:`render` function creates a full rendering of the scene.                      +
    + | 91        + | Renders the pyramid.                                                                    +
    + | 96-98     + | Renders the global axes as three separate models.                                       +
    +-------------+-------------------------------------------------------------------------------------------+


Access to Shader Variables
--------------------------

Before you can render a model you must set appropriate values for the :code:`uniform`
and :code:`attribute` variables in your active shader program. But you have a problem.
The shader program is compiled into a binary executable in the GPU. How can you pass data
to the shader? This is a 2 step process:

* Pre-processing: Get the location of a variable in the shader program. This
  is equivalent to an index that could be used as an array lookup. The *location*
  of a variable in a shader program will never change, so the location only
  needs to be retrieved once.
* Use a variable's location in a shader program to set its value.

To get a variable's location in a shader program you use one of these two
WebGL functions:

.. Code-block:: JavaScript

  getUniformLocation(shader_program, string_variable_name); // returns a WebGLUniformLocation object
  getAttribLocation(shader_program, string_variable_name); // returns an integer index

Examples of these functions can be found in lines 121-123 of the demo code above.

To set a :code:`uniform` variable's value in a shader program you use one of these
WebGL functions:

.. Code-block:: JavaScript

  void uniform[1234][fi](uint location, value1, value2, value3, ...);
  void uniform[1234][fi]v(uint location, Array values);
  void uniformMatrix[234]fv(uint location, bool transpose, Array matrix);

The characters in brackets, :code:`[234]`, represent the number of values to be set.
The :code:`[fi]` means you are setting either a floating point value, :code:`f`, or an integer
value, :code:`i`. You can send values as discrete variables, or as multiple values
in a single array. The functions that use arrays end in a :code:`v`. Examples of setting
the values of :code:`uniform` shader program variables can be found at lines 150, and 164
in the above demo code.

Linking a Buffer Object to an Attribute Variable
------------------------------------------------

An attribute variable pulls its values from an array of values stored
in a *buffer object*. The positions in the array that are used
is determined by the 2\ :sup:`nd` and 3\ :sup:`rd` parameters in your call to
:code:`gl.drawArrays(mode, start, count)`. The :code:`start` parameter gives
the starting array index, while the :code:`count` parameter specifies how many
vertices to use. You must enable the use of 'vertex arrays' before you can
access values from a *buffer object*. In the WebGL demo program above, linking
the :code:`a_Vertex` attribute variable in the shader program to its *buffer object*
looks like this:

.. Code-block:: JavaScript

  // Make a specific buffer, triangles_vertex_buffer_id, the "active buffer".
  gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

  // Enable the linking of a specific attribute variable, a_Vertex_location, to a buffer object.
  gl.enableVertexAttribArray(a_Vertex_location);

  // Specify how the buffer object's data is organized.
  gl.vertexAttribPointer(a_Vertex_location, 3, gl.FLOAT, false, 0, 0);

First, use the :code:`bindBuffer` command to make a particular *buffer object* active.
Second, enable getting data from *buffer objects* for a specific :code:`attribute`
using the :code:`enableVertexAttribArray` function. Third, describe the
organization of the values in the *buffer object* using a call to
:code:`vertexAttribPointer`.
The 1\ :sup:`st` parameter, *a_Vertex_location*, is the location in the compiled
shader program of the variable that will be set from the buffer's values. The
parameter :code:`3` tells the graphics pipeline that there are 3 floats per vertex.
The parameter :code:`gl.FLOAT` tells the graphics pipeline that all the values are floats.
(We will discuss the last 3 parameters in a future lesson.)

Rendering
---------

In the example WebGL program below, the :code:`gl.drawArrays(mode, start, count)` command
is potentially called 5 times. (See lines 167 and 179.) Each time it is called, the
graphics pipeline is executed.

The shader program is written to render with a single color, :code:`u_Color`.
To render a red pyramid with black edges :code:`drawArrays()` must be called at least
twice: once when the color is set to red, and a second time after the color
has been changed to black. Examine the demo code. Notice that the color
is set to red in line 164 and then the triangles are rendered in line 167.
Then the color is changed to black in line 175 (the :code:`edge_color`), and
then the same vertices in the *buffer object* are used to draw the triangle
edges using the :code:`gl.LINE_LOOP` mode. However, this can't be done with
a single draw command because the vertices are not organized that way
in the *buffer object*. So we have to step through the buffer and change
the starting index each time.

.. webglinteractive:: W3
  :htmlprogram: _static/03_simple_pyramid/simple_pyramid.html
  :editlist: _static/03_simple_pyramid/simple_model_render.js
  :hideoutput:
  :width: 300
  :height: 300

Summary
-------

In the next few lessons we will modify our model, our shader programs,
and our rendering code to produce more sophisticated graphics. It is important
that you understand the concepts presented above before proceeding to the
next lesson. Therefore, please study this lesson again before proceeding.

Self-Assessments
----------------

.. mchoice:: 5.5.1
  :random:
  :answer_a: Yes, but a separate execution of the graphics pipeline is required for each distinct color.
  :answer_b: Yes, a single execution of the graphics pipeline could render using different colors.
  :answer_c: No, the shader program only allows for a single color.
  :answer_d: No, the shader program is only ever executed once.
  :correct: a
  :feedback_a: Correct. The color can be set before each execution of the graphics pipeline.
  :feedback_b: Incorrect. For a single execution of the graphics pipeline, the color is a constant value.
  :feedback_c: Incorrect. The shader program allows for a single color during one graphics pipeline execution, but you can execute the graphics pipeline multiple times.
  :feedback_d: Incorrect. Actually, the graphics pipeline is typically executed at least one for each separate model.

  Using the :code:`uniform_color.vert` and :code:`uniform_color.frag` shaders as described in this lesson, is it
  possible to render models in different colors?

.. mchoice:: 5.5.2
  :random:
  :answer_a: It gets the location in a binary compiled shader program of the uniform variable named "x".
  :answer_b: It sets the value of the uniform variable called "x".
  :answer_c: It modifies the shader program to include a new uniform variable called "x".
  :answer_d: It changes the location of a variable in a shader program.
  :correct: a
  :feedback_a: Correct. The variable "a" can then be used to set the value of the uniform variable "x".
  :feedback_b: Incorrect. You set the value of a uniform variable using variants of the function uniform() and uniformMatrix().
  :feedback_c: Incorrect. You can't modify a compiled shader program.
  :feedback_d: Incorrect. You can't modify a compiled shader program.

  What does the following code do?

  .. Code-block:: Javascript

    a = getUniformLocation(my_shader_program, "x");

.. dragndrop:: 5.5.3
  :match_1: uniform|||Set from JavaScript code before the graphics pipeline is executed.
  :match_2: attribute|||Linked to an object buffer before the graphics pipeline is executed.

  Match each type of shader program variable with how it gets its values.

.. mchoice:: 5.5.4
  :random:
  :answer_a: uniform3f(location, value1, value2, value3);
  :answer_b: uniform4fv(location, my_array);
  :answer_c: uniform4i(location, value1, value2);
  :answer_d: uniform3fv(location, value1, value2, value3);
  :correct: a,b
  :feedback_a: Correct.
  :feedback_b: Correct. Assuming the variable "my_array" holds 4 floats.
  :feedback_c: Incorrect. The function is expecting 4 values, but the call only sends two.
  :feedback_d: Incorrect. The function is expecting a single array parameter that hold 3 values, not 3 separate values.

  Which of the following function calls are valid? (They are setting the value of a uniform variable in a shader program.) (Select all that apply.)


.. index:: shader programs, vertex shader, fragment shader, buffer object,
  accessing shader variables, linking attribute variables to buffer objects

