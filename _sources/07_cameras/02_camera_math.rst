..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

7.2 - Camera Math
:::::::::::::::::

As we discussed in the previous lesson, in WebGL the camera is always
located at the origin looking down the -Z axis. The programmer's job is
to create a transformation that moves a scene in front of this stationary
camera. You will be able to perform more creative camera work if you
understand how this is done. This lesson explains the mathematics
behind a camera transformation. Let's review how a camera is defined.

A Camera Definition
-------------------

A camera is defined by a position and a local coordinate system. We typically
call the position of the camera the "eye" position. The camera's local
coordinate system is defined by three orthogonal axes, *u*, *v*, and *n*.
If a camera is located at the origin looking down the -Z axis, then *u* would align with
the x axis, *v* would align with the y axis, and *n* would align with the z axis.
This is summarized as:

.. code:: JavaScript

   u --> x
   v --> y
   n --> z

We can specify a camera using 12 values which define one global point and
three vectors.

.. Code-block:: JavaScript

   eye = (eye_x, eye_y, eye_z)  // the location of the camera
   u = <ux, uy, uz>             // vector pointing to the right of the camera
   v = <vx, vy, vz>             // vector pointing up from the camera
   n = <nx, ny, nz>             // vector pointing backwards; <-n> is forward

The vectors *u*, *v*, and *n* define **relative directions** because they are
pointing in a direction that is relative to the *eye*'s location and orientation.

Moving a Camera to its Default Location and Orientation
-------------------------------------------------------

Given a camera definition, if we could develop a transformation that moves
the camera to the global origin and aligns the camera's axes with the global axes,
then we could apply this transformation to every model in the scene. This
would move the scene in front of the camera!

This task is easily accomplished using two separate transformations:

* First, move the camera to the origin.
* Second, rotate the camera to align the camera's local coordinate system axes
  with the global axes.

In matrix format, we have the following, where the first operation is
on the right side of the chained transforms:

.. matrixeq:: Eq1

   [M1: rotateToAlign]*[M2: translateToOrigin]*[XYZ1: x;y;z;w]=[XYZ2: x';y';z';w']

The :code:`translateToOrigin` transform is trivial to create because we know
the eye location. The transform is:

.. matrixeq:: Eq2

   [M2: translateToOrigin] = [M1: 1, 0, 0, -eye_x; 0, 1, 0, -eye_y; 0, 0, 1, -eye_z; 0, 0, 0, 1]

The :code:`rotateToAlign` transformation is equally simple. (We will develop
this transform below.) The transformation is:

.. matrixeq:: Eq3

   [M2: rotateToAlign] = [M1: ux, uy, uz, 0; vx, vy, vz, 0; nx, ny, nz, 0; 0, 0, 0, 1]

Therefore, a transformation that will move a camera to the origin and align the axes is:

.. matrixeq:: Eq4

   [M1: ux, uy, uz, 0; vx, vy, vz, 0; nx, ny, nz, 0; 0, 0, 0, 1]*
   [M1: 1, 0, 0, -eye_x; 0, 1, 0, -eye_y; 0, 0, 1, -eye_z; 0, 0, 0, 1]*[XYZ1: x;y;z;w]=[XYZ2: x';y';z';w']

Perform the matrix math by clicking on the multiplication signs! This is the
standard camera transformation used for all 3D computer graphics! (Actually,
for all right-handed coordinate system 3D computer graphics.)

Deriving the Rotation Transform
-------------------------------

Let's look closer at the rotation matrix that aligns a camera's axes
with the global axes. Remember that the *u* axis maps to the global *x* axis,
the *v* axis maps to the global *y* axis, and the *n* axis maps to the global
*z* axis. Also remember that a general rotation about an arbitrary axis
requires a fractional value in the upper-left 3-by-3 positions of a transformation
matrix. Therefore, the desired rotation matrix must satisfy the following three
equations:

.. matrixeq:: Eq4
  :comment: u --> x, or &lt;ux, uy, uz&gt; maps to &lt;1, 0, 0&gt;

   [M1: f1, f2, f3, 0; f4, f5, f6, 0; f7, f8, f9, 0; 0, 0, 0, 1]*[XYZ1: ux;uy;uz;0]=[XYZ2: 1;0;0;0]

.. matrixeq:: Eq5
  :comment: v --> y, or &lt;vx, vy, vz&gt; maps to &lt;0, 1, 0&gt;

   [M1: f1, f2, f3, 0; f4, f5, f6, 0; f7, f8, f9, 0; 0, 0, 0, 1]*[XYZ1: vx;vy;vz;0]=[XYZ2: 0;1;0;0]

.. matrixeq:: Eq6
  :comment: n --> z, or &lt;nx, ny, nz&gt; maps to &lt;0, 0, 1&gt;

   [M1: f1, f2, f3, 0; f4, f5, f6, 0; f7, f8, f9, 0; 0, 0, 0, 1]*[XYZ1: nx;ny;nz;0]=[XYZ2: 0;0;1;0]

We need one transform that makes all three equations true. Because of the
way matrix multiplication works, it is OK to combine these three separate
equations into a single equation like this:

.. matrixeq:: Eq7

   [M1: f1, f2, f3, 0; f4, f5, f6, 0; f7, f8, f9, 0; 0, 0, 0, 1]*[M2: ux,vx,nx,0;uy,vy,ny,0;uz,vz,nz,0;0,0,0,1]
   =[XYZ2: 1,0,0,0;0,1,0,0;0,0,1,0;0,0,0,1]

Notice that the vectors in the three separate equations became the columns
of the single matrix. To solve for the rotation matrix, we need to multiply
both sides of the equation by the known matrix's inverse.

.. matrixeq:: Eq8

   Let [M3: M^(-1)] = inverse of [M2: ux,vx,nx,0;uy,vy,ny,0;uz,vz,nz,0;0,0,0,1]

Then,

.. matrixeq:: Eq9

   [M1: f1, f2, f3, 0; f4, f5, f6, 0; f7, f8, f9, 0; 0, 0, 0, 1]*[M2: ux,vx,nx,0;uy,vy,ny,0;uz,vz,nz,0;0,0,0,1]*[M3: M^(-1)]
   =[XYZ2: 1,0,0,0;0,1,0,0;0,0,1,0;0,0,0,1]*[M3: M^(-1)]

This reduces to:

.. matrixeq:: Eq10

   [M1: f1, f2, f3, 0; f4, f5, f6, 0; f7, f8, f9, 0; 0, 0, 0, 1] = [M3: M^(-1)]

The rotation matrix we need to align a camera's local coordinate system to
the global coordinate system is:

.. matrixeq:: Eq11

   the inverse of [M2: ux,vx,nx,0;uy,vy,ny,0;uz,vz,nz,0;0,0,0,1]

`It is straightforward to show`_ that if the columns of a matrix are vectors that
are orthogonal to each other, the inverse of such a matrix is just its
transpose. The columns of our matrix are orthogonal because they
define a valid right-hand coordinate system where each axis is at a right
angle to the other two axes. Therefore, the inverse is trivial to obtain -- you
interchange the rows and columns.

.. matrixeq:: Eq12

   the inverse of [M2: ux,vx,nx,0;uy,vy,ny,0;uz,vz,nz,0;0,0,0,1] = [M2: ux,uy,uz,0;vx,vy,vz,0;nx,ny,nz,0;0,0,0,1]

:code:`lookat` Implementation
-----------------------------

Below is a JavaScript implementation of the :code:`lookat` function. It
simply implements the math we just discussed. Note that the variables
*V*, *center*, *eye*, *up*, *u*, *v*, and *n* are class objects that were
created **once** when the :code:`GlMatrix4z4` object was created. These
objects are reused on each call to :code:`lookat`.

.. Code-Block:: JavaScript

  self.lookAt = function (M, eye_x, eye_y, eye_z, center_x, center_y, center_z, up_dx, up_dy, up_dz) {

    // Local coordinate system for the camera:
    //   u maps to the x-axis
    //   v maps to the y-axis
    //   n maps to the z-axis

    V.set(center, center_x, center_y, center_z);
    V.set(eye, eye_x, eye_y, eye_z);
    V.set(up, up_dx, up_dy, up_dz);

    V.subtract(n, eye, center);  // n = eye - center
    V.normalize(n);

    V.crossProduct(u, up, n);
    V.normalize(u);

    V.crossProduct(v, n, u);
    V.normalize(v);

    let tx = - V.dotProduct(u,eye);
    let ty = - V.dotProduct(v,eye);
    let tz = - V.dotProduct(n,eye);

    // Set the camera matrix
    M[0] = u[0];  M[4] = u[1];  M[8]  = u[2];  M[12] = tx;
    M[1] = v[0];  M[5] = v[1];  M[9]  = v[2];  M[13] = ty;
    M[2] = n[0];  M[6] = n[1];  M[10] = n[2];  M[14] = tz;
    M[3] = 0;     M[7] = 0;     M[11] = 0;     M[15] = 1;
  };

Literal Rendering of a Camera
-----------------------------

To summarize, a camera transformation changes the position and orientation of a scene
so that it is in front of a stationary camera that is at the origin looking down the -Z axis.
This makes the succeeding stages of the graphics pipeline easier to perform.
The WebGL program below demonstrates how a camera actually works. Please
experiment with the program.

.. webgldemo:: W1
  :htmlprogram: _static/07_camera_lookat2/camera_lookat2.html

After your experimentation, hopefully you concur that manipulating this version of
the demo program is much harder to visually understand -- as compared to the WebGL
program in the previous lesson.
This illustrates an important concept.

.. admonition:: Designing virtual cameras:

  We conceptually design a 3D rendering by placing a virtual camera inside
  the scene at a specific location and orientation. The fact that the
  mathematical camera works differently than our conceptual model is fine.
  We think conceptually in 3D space and the computer does the hard math!


Glossary
--------

.. glossary::

  orthogonal
    Two vectors are orthogonal if the angle between them is 90 degrees.

  maps to, :code:`-->`
    A mapping converts an element into another element.

  transpose
    An operation on a matrix that swaps rows with columns. Each :code:`M[i][j]` element
    moves to the :code:`M[j][i]` position.

  orthogonal matrix
    A matrix whose columns (or rows) form vectors that are orthogonal to each other.
    The inverse of an orthogonal matrix is just its transpose.

Self Assessment
---------------

.. mchoice:: 7.2.1
  :random:
  :answer_a: moves the scene in front on a stationary camera.
  :answer_b: moves the camera to a desired view of the scene.
  :correct: a
  :feedback_a: Correct. The camera is at the origin, looking down the -Z axis.
  :feedback_b: Incorrect. Conceptually, the camera is inside the scene at a specific location and orientation, but not mathematically.

  A virtual camera transformation, as defined in this lesson, ...

.. mchoice:: 7.2.2
  :random:

  Given a camera's local coordinate system defined by vectors :code:`<u>`, :code:`<v>`,
  and :code:`<n>`, what global axis does :code:`<u>` map to?

  - global :code:`<x>` axis

    + Correct.

  - global :code:`<y>` axis

    - Incorrect. The :code:`<v>` axis maps to the :code:`<y>` axis

  - global :code:`<z>` axis

    - Incorrect. The :code:`<n>` axis maps to the :code:`<z>` axis

.. mchoice:: 7.2.3
  :random:
  :answer_a: The upper left 3x3 sub-matrix must define 3 vectors that are orthogonal to each other.
  :answer_b: Nothing. Given any 4x4 matrix, its transpose is always equal to its inverse.
  :answer_c: The matrix has to contain translation, scaling, and rotation.
  :answer_d: The values along the diagonal have to all be 1.0.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. Given any 4x4 matrix, its transpose is typically NOT equal to its inverse.
  :feedback_c: Incorrect. In fact, the transformation can't contain translation and scaling.
  :feedback_d: Incorrect.

  Given a 4x4 transformation matrix, what must be true about the matrix
  for its inverse to be equal to its transpose?

.. mchoice:: 7.2.4
  :random:
  :answer_a: Conceptualize the camera inside the scene at a specific location looking towards a specific point.
  :answer_b: Conceptualize the scene as being moved in front of a stationary camera.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. Experiment with the demo WebGL program above again!

  When conceptually designing a virtual camera, which is easier to do?


.. index:: orthogonal, maps to, orthogonal matrix, camera math

.. _1: https://en.wikipedia.org/wiki/Orthogonal_matrix
.. _It is straightforward to show: ../appendices/camera_math.html