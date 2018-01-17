..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

5.9 - Interleaved Buffers
:::::::::::::::::::::::::

When you play a video game, the game pauses when you go
to a new level or a new scene and the screen often goes blank for a few seconds.
What is the video game doing? Can you guess based on what you learned
from the previous lessons?

.. admonition:: Answer

  A GPU has limited memory. When you play a video
  game and you change to a new scene, the game must delete all of its current
  *buffer objects*, create new *buffer objects* and upload to the GPU the
  model data needed to render the new scene!

Interleaved Buffer Objects
--------------------------

You have two options when uploading model data into *buffer objects*.

* Create a separate buffer object for each type of data, as was done in the
  previous lessons. Each *vertex shader* attribute variable is linked to a
  unique *buffer object*.

* Create a single *buffer object* for all vertex data of a model and *interleave* the data.

You have already seen several examples of the first option. For simple
scenes with only a few models, this approach is fine. When you
want to create complex scenes with 100's of models, interleaved data
is the better approach.

Interleaved data puts all vertex model data into a single 1-dimensional array and
uploads the data to a single *buffer object*. When you link an :code:`attribute`
variable in your vertex shader program to a *buffer object* you have to tell WebGL
how to get to the specific data for that variable. This is done using the
last two parameters of the :code:`gl.vertexAttribPointer` function, :code:`stride`
and :code:`offset`.

.. Code-Block:: JavaScript
  :emphasize-lines: 2

  gl.vertexAttribPointer(uint index, int size, enum type, bool normalized,
                         long stride, long offset);

The function parameters have the following meaning:

* :code:`index` : the location of the :code:`attribute` variable to link to.
* :code:`size` : the number of components in the attribute's value: 1, 2, 3 or 4.
* :code:`type` : the data type of each component value; for WegGL 1.0 it is always :code:`gl.FLOAT`.
* :code:`normalized` : if true, integer values are normalized to -1.0 to + 1.0; For WebGL 1.0, it is always false.
* :code:`stride` : number of **bytes** between the start of one attribute value and the next attribute value.
* :code:`offset` : number of **bytes** to skip to get to the first value.

An example should make things clear. You have an (x,y,z) value for every vertex
in your model, as well as a RGBA color value, and an (s,t) texture coordinate value.
All 9 values for every vertex will be stored sequentially in a 1D array. The data
will look like this:

.. Code-Block:: JavaScript

  [x1,y1,z1, r1,g1,b1,a1, s1,t1,
   x2,y2,z2, r2,g2,b2,a2, s2,t2,
   x3,y3,z3, r3,g3,b3,a3, s3,t3,
   ... ]

Let's assume your *vertex shader* has the three :code:`attribute` variables below that need to be
linked to the single *buffer object*.

.. Code-Block:: glsl

  attribute vec3 a_vertex;
  attribute vec4 a_color;
  attribute vec2 a_texture;

You need to make the *buffer object* active and then call the
:code:`gl.vertexAttribPointer` function three times like this:

.. Code-Block:: JavaScript
  :emphasize-lines: 3-5,9-11

  // buffer_data is a Float32Array;
  bytes_per_float = buffer_data[0].BYTES_PER_ELEMENT;
  stride = bytes_per_float*9;  // because there are 9 values per vertex
  offset1 = bytes_per_float*3; // skip the initial (x1,y1,z1)
  offset2 = bytes_per_float*7; // skip the initial (x1,y1,z1,r1,g1,b1,a1)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer_object_id);

  gl.vertexAttribPointer(vertex_location,  3, gl.FLOAT, false, stride, 0);
  gl.vertexAttribPointer(color_location,   4, gl.FLOAT, false, stride, offset1);
  gl.vertexAttribPointer(texture_location, 2, gl.FLOAT, false, stride, offset2);

Managing Buffer Objects
-----------------------

You can delete a *buffer object* using the WebGL :code:`deleteBuffer` command:

.. Code-Block:: Javascript

  gl.deleteBuffer(buffer_id);

You can modify the data in a *buffer object* by simply replacing the
current contents of a buffer with new data using the :code:`bufferData` command:

.. Code-Block:: Javascript

  // Make a buffer object be the "active buffer."
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

  // Upload new data for the buffer object to the GPU.
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

The last parameter to :code:`bufferData` is a "flag" that can optimize buffer
performance under some conditions. The options for the last parameter,
called :code:`usage` are:

* :code:`gl.STATIC_DRAW` : The data store contents will be specified **once** by the application,
  and used many times as the source for GL drawing commands.
* :code:`gl.DYNAMIC_DRAW` : The data store contents will be **respecified repeatedly** by the application,
  and used many times as the source for GL drawing commands.
* :code:`gl.STREAM_DRAW` The data store contents will be specified **once** by the application,
  and **used at most a few times** as the source of a GL drawing command.

Glossary
--------

.. glossary::

  interleaved data
    store all attribute values for a model in a single 1D array. The WebGL
    graphics pipeline can access the correct values assuming it knows
    where the first value starts, and how many bytes from the start of
    one attribute value to the start of the next attribute value.

Self-Assessments
----------------

.. mchoice:: 5.9.1
  :random:
  :answer_a: deleting un-needed buffer objects and creating new ones for the new scene's models.
  :answer_b: giving the user's fingers a rest from the game controller.
  :answer_c: developing new game logic for the new level.
  :answer_d: slowing things down so the user won't go into an epileptic fit.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. While the user should take a break from time to time, the pause between levels is not for that purpose.
  :feedback_c: Incorrect. Game logic is not typically dynamically created!
  :feedback_d: Incorrect. At least we hope so!

  In most video games there is a long pause between game levels. This is because the game is ...

.. mchoice:: 5.9.2
  :random:
  :answer_a: The buffer object contains interleaved data.
  :answer_b: Data will be retrieved from this buffer getting the 3rd, 4th and 5th values from each group of vertex data.
  :answer_c: Each vertex is define by 7 floats.
  :answer_d: Data will be retrieved from this buffer getting the 1st, 2nd and 3rd values from each group of vertex data.
  :correct: a,b,c
  :feedback_a: Correct. Because the "stride" and "offset" parameters are not zero.
  :feedback_b: Correct. Because the "offset" is bytes_per_float*2 and the "size" is 3.
  :feedback_c: Correct. Because the "stride" parameter skips 7 values.
  :feedback_d: Incorrect. To access the 1st, 2nd and 3rd values, the "offset" value would need to be zero.

  You are studying example code and you come across the following lines:

  .. Code-Block:: JavaScript

    // buffer_data is a Float32Array;
    bytes_per_float = buffer_data[0].BYTES_PER_ELEMENT;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_object_id);
    gl.vertexAttribPointer(variable_location,  3, gl.FLOAT, false,
                           bytes_per_float*7, bytes_per_float*2);

  Which of the following statements are true? (Select all that apply.)

.. index:: interleaved buffer data

