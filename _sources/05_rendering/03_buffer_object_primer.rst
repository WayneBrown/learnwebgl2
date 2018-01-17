..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

5.3 - A Primer on Buffer Objects
::::::::::::::::::::::::::::::::

A *buffer object* is a contiguous block of memory in the GPU that can be
accessed very quickly by shader programs executing on the GPU. *Buffer objects*
store the data that shader programs need for rendering. For WebGL 1.0, the contents of a
*buffer object* is always an 1-dimensional array of floats.

*Buffer objects* provide the data for :code:`attribute` variables in *vertex
shader* programs. WebGL restricts the data types of :code:`attribute` variables
to be of type :code:`float`,
:code:`vec2`, :code:`vec3`, :code:`vec4`, :code:`mat2`, :code:`mat3`, and
:code:`mat4`. Note that all of these data types contain floating point values.

JavaScript is not a strongly typed language and it does not distinguish
between different types of numbers. Most programming languages have shorts, ints,
floats, and doubles. JavaScript has only one data type for numeric values:
:code:`number`. JavaScript was modified to deal with binary data values by adding
"typed array" objects. For WebGL, the data for all of your *buffer objects* will
be defined in :code:`Float32Array` arrays.

.. Code-block:: JavaScript

  // Floating point arrays.
  var f32 = new Float32Array(size); // Fractional values with 7 digits of accuracy

There are two ways to put data into a "typed array":

* Include a normal JavaScript array of numbers as a parameter to the constructor.
* Create the array of a certain size and then set individual elements to specific values.

For example:

.. Code-block:: JavaScript

  // Create an array containing 6 floats. Notice the brackets around the array data.
  var my_array = new Float32Array( [1.0, 2.0, 3.0, -1.0, -2.0, -3.0] );

  // Create an array to hold 4 floating point numbers.
  var an_array = new Float32Array(4);
  an_array[0] = 12.0;
  an_array[1] =  5.0;
  an_array[2] = 37.0;
  an_array[3] = 18.3;

Creating and Initializing Buffer Objects
----------------------------------------

Note that *buffer objects* reside in the GPU, but they are created, managed,
and deleted using the WebGL API from JavaScript code. Here is a typical
sequence of commands to create a *buffer object* and fill it with data.

.. Code-block:: JavaScript

  //-----------------------------------------------------------------------
  function createAndFillBufferObject(gl, data) {
    var buffer_id;

    // Create a buffer object
    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object for ' + model_name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

Please note the following about this code:

* Creating an *object buffer* does nothing more than reserve a new ID for a new buffer.
* You will typically have many *object buffers* and only one of them is the
  "active buffer". When you issue commands on *buffer objects* you are always
  manipulating the "active buffer". The :code:`bindBuffer` function simply changes
  the "active buffer" to the specific buffer using the buffer_id.
* The :code:`bufferData` function copies data from your JavaScript program
  into the GPU's *buffer object*. If there was already data in the *buffer object*
  then its current contents is deleted and the new data is added.
* The main error you will receive when copying data to the GPU is OUT_OF_MEMORY.
  The code above should check for *gl* errors by calling :code:`gl.getError()`, but
  we will worry about catching errors later.

Shaders, Buffers, and the Graphics Pipeline
-------------------------------------------

To help you understand the relationship between your shader programs and
the graphics pipeline, let's write some pseudocode that
describes how the graphics pipeline performs rendering. This functionality
is built into the graphics pipeline and hidden from your control.

Each time your JavaScript program calls :code:`gl.drawArrays(mode, start, count)`,
'count' number of vertices are sent through the graphics pipeline.
Your *vertex shader* program is called once for each vertex in an array of
vertices that is stored in a *buffer object*.
Inside the graphics pipeline, hidden from you, is a algorithm that is doing
this:

.. Code-Block:: C

  //////////// pseudocode ////////////
  pipeline_mode = mode;
  for (j = start; j < count; j += 1) {
    call vertex_shader(vertex_buffer[j]);
  }

.. admonition:: Please note:

  The pseudocode above is misleading because GPU's are multiprocessors and perform many
  operations in parallel. Vertices are not necessarily processed in the sequence they
  are defined and many vertices are typically being processed simultaneously.

Vertex and fragment shaders need more than just location data to create complex
graphic images. Such information includes color,
normal vector, texture coordinates, etc.. Because the graphics pipeline is
optimized for speed, the other data has to be organized in arrays in the same order
as the vertex data. If each vertex has additional attributes, the above pseudocode
becomes something like this:

.. Code-Block:: C

  //////////// pseudocode ////////////
  pipeline_mode = mode;
  for (j = start; j < count; j += 1) {
    call vertex_shader(vertex_buffer[j], color_buffer[j], normal_vector_buffer[j], ...);
  }

This is an important basic principle of WebGL rendering. All data must be
organized on a "per vertex" basis because of the way the pipeline works. This
means that in some cases your data must be duplicated in arrays multiple times
to "match up" with the vertex data.
This can be very inefficient for memory usage, but it makes rendering very fast.
To illustrate this principle, suppose you want to render two triangles, one
red (1,0,0) and one green (0,1,0). You must create an array that stores the color of each
individual vertex, which means duplicating the color values multiple times.
The code belows shows an array of 18 floats
that represent 6 vertices. If the color of the vertices is coming from
an array in a *buffer object*, the color has to be stored three times for
each triangle.

.. Code-Block:: JavaScript

  var triangle_vertices = [0,0,0, 1,6,2, 3,4,1, 3,4,1, 1,6,2, 2,5,1];
  var triangle_color    = [1,0,0, 1,0,0, 1,0,0, 0,1,0, 0,1,0, 0,1,0];

.. admonition:: Basic data organization

  Rendering data is always organized on a per-vertex basis.

Glossary
--------

.. glossary::

  buffer object
    a contiguous block of memory in the GPU that stores rendering data for a model.
    For WebGL 1.0, a *buffer object* is always a 1D array of floats.

  vertex object buffer
    a *buffer object* that contains vertices data. It is sometimes abbreviated as VOB.

  :code:`Float32Array`
    a JavaScript data type that creates an array of floating point values.

Self-Assessments
----------------

.. mchoice:: 5.3.1
  :random:
  :answer_a: a one-dimensional array of floats.
  :answer_b: a contiguous block of memory in the GPU that stores data values.
  :answer_c: always stored in the GPU's memory.
  :answer_d: a variable in a shader program.
  :correct: a,b,c
  :feedback_a: Correct.
  :feedback_b: Correct.
  :feedback_c: Correct.
  :feedback_d: Incorrect.

  A WebGL *buffer object* is ... (Select all that apply.)

.. mchoice:: 5.3.2
  :random:
  :answer_a: a JavaScript one-dimensional array of floats.
  :answer_b: a GLSL one-dimensional array of floats.
  :answer_c: an array of integers.
  :answer_d: an array of characters (a string).
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. GLSL does not define Float32Array.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  A :code:`Float32Array` is ...

.. mchoice:: 5.3.3
  :random:
  :answer_a: 1800 floats.
  :answer_b: 200 floats.
  :answer_c: 900 floats.
  :answer_d: 600 floats.
  :correct: a
  :feedback_a: Correct. There are 600 vertices and 3 floats per RGB color.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  Suppose you want to render a model defined by 200 triangles and you
  want to color each triangle with a unique color. The triangles are
  defined by 3 vertices per triangle, with each vertex defined by 3 floats.
  The color values are stored as RGB values in a separate *object buffer*.
  What is the required size for the color *object buffer*?


.. index:: buffer object, vertex object buffer, Float32Array
