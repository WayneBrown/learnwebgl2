..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

5.4 - A Simple Model
::::::::::::::::::::

It will be easier to understand how rendering works if we start with the simplest
example possible and gradually add complexity. This lesson defines JavaScript
functions that create simple models from hard-coded values. You are strongly encouraged
to modify the code and experiment.

A Simple 3D Model
-----------------

Examine the code in the 'simple_model.js' file below. Note the following big ideas:

* The :code:`Triangle` function (line 36) is a class definition that contains no
  functionality. It will hold the data that defines one triangle. To start
  off simple, a :code:`Triangle` object will hold an array of three vertices.
* The :code:`SimpleModel` function (line 46) is a class definition that contains no
  functionality. It will hold a "name" for a model and an array of
  triangle objects. A model, in its simplest form, is just a collection of
  triangles.
* The :code:`CreatePyramid` function (line 56) creates 4 triangles, an instance of the
  :code:`SimpleModel` class called model, and sets its array of triangles
  to the 4 triangles of a pyramid.

.. admonition:: EXPERIMENT!!!!

  You can modify the JavaScript code and "re-start" the rendering to experiment.
  If you introduce errors in the code you can't fix, simply reload the page to
  get a fresh, error-free version of the code. Thing you might try are:

  * Change the location of one or more vertices.
  * Change the model to only have one or two triangles.
  * Add additional vertices and more triangles to the model.

.. webglinteractive:: W1
  :htmlprogram: _static/03_simple_pyramid/simple_pyramid.html
  :editlist: _static/03_simple_pyramid/simple_model.js
  :hideoutput:
  :width: 300
  :height: 300

In the following sequence of lessons we will use this simple
model to do the following:

* Render the pyramid using a single color for the entire model.
* Render the pyramid using a different color for each triangle face.
* Render the pyramid using a different color for each vertex.
* Render the pyramid using texture coordinates assigned to each vertex.

What you will discover as you go through these various examples is that your
*shader programs*, *buffer objects*, and JavaScript rendering code is
very interdependent. As you change one of them, they all must change!

.. admonition:: A reminder about re-definable functions.

  When you edit the JavaScript code above and "re-start" the rendering, the
  JavaScript functions must be redefined based on your changes. In order to
  do this the functions must be defined as properties of the global
  :code:`window` object. This is why the function definitions look like:

  .. Code-block:: JavaScript

    window.SimpleModel = function (name) { ... }

  A more typical syntax for function definitions would be:

  .. Code-block:: JavaScript

    function SimpleModel(name) { ... }

Self-Assessments
----------------

.. mchoice:: 5.4.1
  :random:
  :answer_a: The "pyramid" would contain only 2 triangles.
  :answer_b: The "pyramid" would be unchanged.
  :answer_c: The "pyramid" would have 3 triangles.
  :answer_d: The "pyramid" would have only 1 triangle.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  In the above WebGL program, how would changing line 73 to the following change the rendering?

  .. Code-Block:: Javascript

    model.triangles = [ triangle1, triangle3 ];

.. mchoice:: 5.4.2
  :random:
  :answer_a: Vertex 1
  :answer_b: Vertex 0
  :answer_c: Vertex 2
  :answer_d: Vertex 3
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. Vertex 0 is on the back, bottom of the pyramid.
  :feedback_c: Incorrect. Vertex 2 is the front, right vertex.
  :feedback_d: Incorrect. Vertex 3 is the front, left vertex.

  In the above WebGL program, which vertex would need to be modified to raise the
  apex of the pyramid (it's highest point on the y axis) one unit higher?
  (Note that arrays are zero sub-scripted.)

.. mchoice:: 5.4.3
  :random:
  :answer_a: [1]
  :answer_b: [0]
  :answer_c: [2]
  :correct: a
  :feedback_a: Correct. Change the y component in the (x,y,z) vertex.
  :feedback_b: Incorrect. This is the x component in the (x,y,z) vertex.
  :feedback_c: Incorrect. This is the z component in the (x,y,z) vertex.

  In the above WebGL program, which component of vertex 1 would need to be modified to raise the
  apex of the pyramid (it's highest point on the y axis) one unit higher?
  (Note that arrays are zero sub-scripted.)


.. index:: simple model


