..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

6.6 - A Matrix Library - :code:`GlMatrix4x4`
::::::::::::::::::::::::::::::::::::::::::::

Fundamental to all 3D computer graphics is the 4x4 matrix transform. In
the original OpenGL API, all basic transformations were implemented for
you in the library's code. All you had
to do was call the correct function in the correct order. WebGL was
implemented for low power mobile devices with limited CPU and GPU functionality.
Transformation matrix functionality was **not** included in the WebGL API.
Therefore, you have to implement your own matrix operations in JavaScript.
But it doesn't make sense for individual programmers to "re-invent the wheel".
This lesson presents you with a JavaScript matrix library and explains how
to use it.

WebGL Transformation Matrices
-----------------------------

A WebGL, 4x4, transformation matrix is a 1D array of type :code:`Float32Array`
which contains 16 floating point values. The values represent a 2D array that
are stored in column-major order. (Back in the 1960's, Fortran stored 2-dimensional
data in column-major order. That convention has propagated to various system still
in use today, including OpenGL. Most modern programming languages use row-major order.)

The 4x4 transformation matrix:

.. matrixeq:: Eq1

   [M1: 0,1,2,3;4,5,6,7;8,9,10,11;12,13,14,15]

would be created in JavaScript code like this:

.. Code-Block:: JavaScript

  var matrix = new Float32Array([0,4,8,12, 1,5,9,13, 2,6,10,14, 3,7,11,15]);
  // Or
  var m = new Float32Array(16);
  m[0] =  0;  m[4] =  1;  m[ 8] =  2;  m[12] = 3;
  m[1] =  4;  m[5] =  5;  m[ 9] =  6;  m[13] = 7;
  m[2] =  8;  m[6] =  9;  m[10] = 10;  m[14] = 11;
  m[3] = 12;  m[7] = 13;  m[11] = 14;  m[15] = 15;

In most cases the 2\ :sup:`nd` example above is used because it is easier to
debug the code if you can visualize the data values as a 2D array.

Note: If you re-format the matrix library code you will lose the "multiple
statements per line" formatting which helps to visualize the 4x4 matrices.
It is recommended that you do **not** re-format this code file.

Design Decisions for a Matrix Library
-------------------------------------

A typical *class* definition defines a set of data and a set of functions
that act on that data. One of the important ideas behind *classes* is the
encapsulation and protection of a set of data values inside an instance of the class.
We don't really need data protection for our matrix library. What we need
is encapsulation of the functionality of matrix operations so that we can minimize the
creation and deletion of scratch arrays that are needed for matrix processing.
Consider that an animation requires the rendering of a scene at least 30 times
per second. If you are constantly creating new object instances
every time you render, you will be creating a lot of
objects. JavaScript does dynamic memory garbage collection, so many programmers
simply ignore memory issues. But if you can minimize the creation of
new objects for each rendering, your animations have the potential to run
more smoothly.

The :code:`GlMatrix4x4` Class
-----------------------------

A class called :code:`GlMatrix4x4` is defined in a file named
`glmatrix4x4.js`_. It encapsulates the matrix functionality we
need to produce WebGL renderings. A :code:`GlMatrix4x4` object does
not store a matrix. It encapsulates matrix functionality and the scratch arrays
needed for that functionality. And, by separating matrix functionality from
matrix data, the syntax of the code is simplified.

You can typically create one instance of the library
and use it for your entire program. The library contains functions that:

* create transforms,
* set the values of a specific type of transform, and
* perform matrix operations.

A matrix transform is stored as a :code:`Float32Array`. Four functions in an
:code:`GlMatrix4x4` object create and return new transforms and their
names all start with :code:`create`. These functions should not be called in your
rendering code for every animation frame. They should be called once in your
setup code to create any transforms you need during rendering. The four
functions that create a new matrix transform are:

* :code:`create()`, which creates and returns a new 4x4 transformation matrix.
* :code:`createOrthographic()`, which creates a new orthographic projection transformation matrix.
* :code:`createPerspective()`, which creates a new perspective projection transformation matrix.
* :code:`createFrustum()`, which creates a new perspective projection transformation matrix.

Functions that set the values of a transformation matrix must send a
transformation matrix as the first parameter. For example:

* :code:`scale(M, sx, sy, sz)` sets :code:`M` to a scale transform.
* :code:`translate(M, tx, ty, tz)` sets :code:`M` to a translation transform.
* :code:`rotate(M, angle, x_axis, y_axis, z_axis)` sets :code:`M` to a rotation transform.

Functions that perform matrix calculations change the value of their first parameter,
while leaving all of the other parameters unchanged. The parameters are ordered
similar to assignment statements which always change their left-hand side variable,
but leave all value on the right-hand-side of an assignment statement unchanged.
For example:

* :code:`multiply(R, A, B)` sets :code:`R` to the product of A times B. (:code:`R = A*B`)

The function :code:`multiplySeries()` will
multiply any number of matrices together to produce a single transformation
matrix. It uses *variable arguments* and will accept as many arguments as you send it.
For example, :code:`m.multiplySeries(R,A,B,C,D,E)` will calculate the matrix product
of :code:`A*B*C*D*E` and store the result in :code:`R`. In equation format, it performs
:code:`R = A*B*C*D*E;`. The order of the multiplications is critical. If the
transform :code:`R` is applied to a set of vertices, the effect of :code:`R`
would be that

#. transform :code:`E` was applied to a vertex,
#. then transform :code:`D` was applied to the transformed vertex,
#. then transform :code:`C` was applied to the transformed vertex,
#. then transform :code:`B` was applied to the transformed vertex, and
#. finally transform :code:`A` was applied to the transformed vertex.

When you create a single transform from multiple transforms, you must always
order the transformations from **right to left**.

The GlMatrix4x4 Code
--------------------

The WebGL program below displays the :code:`GlMatrix4x4` class code.
Please study the :code:`GlMatrix4x4` class to get familiar with its matrix functionality.
(Hide the canvas to better review the code.)
The :code:`translate_scene.js` code demonstrates how to use the matrix functionality
in a WebGL program. Notice that the creation of all matrices is done once in the
scene's constructor. The matrices are then used repeatedly in the scene's
rendering function. Since there are no new objects created for each rendering,
*garage collection* is minimized.

.. webglinteractive:: W1
  :htmlprogram: _static/06_example05/translate.html
  :viewlist: _static/learn_webgl/glmatrix4x4.js, _static/06_example05/translate_scene.js
  :hideoutput:
  :width: 300
  :height: 300

HTML Code To Use GlMatrix4x4
----------------------------

The :code:`GlMatrix4x4` class uses code from two other classes:

* :code:`glpoint4.js`, which defines a class for :code:`(x,y,z,w)` points.
* :code:`glvector3.js`, which defines a class for :code:`<dx,dy,dz>` vectors.

These files must be loaded into your browser along with the matrix library.
To use the matrix library include :code:`<script>` directives in your HTML
file that look something like this:

.. Code-Block:: HTML

  <script src="../learn_webgl/glpoint4.js"></script>
  <script src="../learn_webgl/glvector3.js"></script>
  <script src="../learn_webgl/glmatrix4x4.js"></script>

Change the file paths based on the relative location of your
JavaScript code files to your HTML file. If the HTML and JavaScript files
are in the same folder on the server, you can omit a file path.

Glossary
--------

.. glossary::

  code library
    a set of common functionality gathered into a single place. It is standard
    practice to put the functionality into a single class, or a group of classes.

  column-major order
    values in a 2-dimensional array are store in a 1D array and organized
    by columns. (All computer memory is 1-dimensional; multi-dimensional
    arrays are always stored in computer memory as 1D arrays in some
    agreed upon order.)

Self Assessment
---------------

For all of these questions, assume that :code:`m` is an instance of the :code:`GlMatrix4x4` class.

.. mchoice:: 6.6.1
  :random:
  :answer_a: One
  :answer_b: Four
  :answer_c: One for each 4x4 transform you need in a program.
  :answer_d: Two for each 4x4 transform you need in a program.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. Where did four come from?
  :feedback_c: Incorrect. No, a GlMatrix4x4 contains functionality, not matrices.
  :feedback_d: Incorrect. No, a GlMatrix4x4 contains functionality, not matrices.

  How many instances of the :code:`GlMatrix4x4` do you typically need to create for a WebGL program?

.. mchoice:: 6.6.2
  :random:

  You have created an instance of the :code:`GlMatrix4x4` class called :code:`m` and you
  want to use it to create a 4x4 transformation matrix called :code:`sam`. Which of the following code examples
  accomplish this?

  - :code:`sam = m.create();`

    + Correct.

  - :code:`sam = new GlMatrix4x4().create();`

    - Incorrect. (While this will work in theory, it creates an unnecessary :code:`GlMatrix4x4` object.)

  - :code:`sam = new GlMatrix4x4();`

    - Incorrect. This creates an instance of the :code:`GlMatrix4x4` class.

  - :code:`m.create();`

    - Incorrect. It creates a new 4x4 transformation matrix but does not assign it to a variable so it can be used.


.. mchoice:: 6.6.3
  :random:
  :answer_a: matrix q
  :answer_b: matrix a
  :answer_c: matrix b
  :answer_d: matrix c
  :correct: a
  :feedback_a: Correct. Only the first parameter is modified and contains the results of the matrix multiplications.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  You need to multiple 3 matrices together, :code:`a` times :code:`b` times :code:`c`, and
  store the results in matrix :code:`q`. You can do this using the
  :code:`multiplySeries()` function like this:

  .. Code-block:: Javascript

    m.multiplySeries(q,a,b,c);

  Which of the parameters to the :code:`multiplySeries()` function are modified by the function call?
  (Select all that apply.)

.. mchoice:: 6.6.4
  :random:
  :answer_a: m.scale(mary, 2, 1, 1);
  :answer_b: m.scale(mary, 2, 2, 2);
  :answer_c: m.scale(mary, 2);
  :answer_d: m.scale(mary, 1, 1, 2);
  :correct: a
  :feedback_a: Correct. The x scale factor is 2, while the scale factors of 1 for the y and z components leaves them unchanged.
  :feedback_b: Incorrect. This doubles the x, y and z components of all vertices.
  :feedback_c: Incorrect. This does not provide the 3 scaling parameters required by the function call.
  :feedback_d: Incorrect. This doubles the z components, leaving the x and y components unchanged.

  Which of the following statements set a matrix called :code:`mary` to a
  scaling transformation that doubles only the x coordinates of a model?

.. mchoice:: 6.6.5
  :random:
  :answer_a: m.rotate(nice, 30, 0, 1, 0);
  :answer_b: m.rotate(nice, 30, 1, 0, 0)
  :answer_c: m.rotate(nice, 30, 0, 0, 1);
  :answer_d: m.rotate(nice, 30);
  :correct: a
  :feedback_a: Correct. The angle is 30 degrees and the axis of rotation is the y axis, <0,1,0>.
  :feedback_b: Incorrect. This rotates about the x axis, <1,0,0>.
  :feedback_c: Incorrect. This rotates about the z axis, <0,0,1>.
  :feedback_d: Incorrect. This is missing the 3 parameters that define the axis of rotation.

  Which of the following statements set a matrix called :code:`nice` to a
  rotation transformation that rotates a model 30 degrees about the y axis?


.. index:: code library, column-major order

.. _glmatrix4x4.js: _static/learn_webgl/glmatrix4x4.js