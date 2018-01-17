..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

6.5 - Transformation Matrices
:::::::::::::::::::::::::::::

The previous three lessons described the basic transformations that can be
applied to models: translation, scaling, and rotation. These
transformations can be combined to produce complex motion. But we need
an easy and efficient way to combine these transformations. The solution is matrices!

This lesson will review the basics of matrix math and show you how to
combine transformations using matrices. Matrices are used for almost all
computer graphics calculations, including camera manipulation and the
projection of your 3D scene onto a 2D viewing window. Therefore, this is a
critical section of material that you need to master.

It is not the purpose of this tutorial to provide mathematical proofs
for these concepts, but rather to give you a solid foundation in how to use
matrix math to create computer graphics. If you desire a formal education
in matrix math, I suggest you study the `linear algebra course`_ at Kahn
academy, but that level of expertise is not required to master computer
graphics.

Matrix Basics
-------------

A system of equations can be written in matrix format by separating out
the coefficients of the equations from the variables. Let's take the
general equation for rotation and put it into matrix form. Please note
that the *x*, *y*, and *z* values are our "variables" and the *fn* values are the
"coefficients" of the equation terms. To manipulate a graphics
model for a
computer graphics scene, we will create the transformation by choosing
appropriate *fn* values and then apply the transformation to every vertex
in a model. The *fn* values are constant for the rendering of a single
model, but they typically change for each model in a scene.

The equations:

.. code:: C

  f1*x + f2*y + f3*z = x'
  f4*x + f5*y + f6*z = y'
  f7*x + f8*y + f9*z = z'

looks like this in matrix format:

.. matrixeq:: Eq1

   [M1: f1,f2,f3;f4,f5,f6;f7,f8,f9]*[XYZ: x;y;z]=[XYZ2: x';y';z']

The matrix equations presented in these lessons can be
executed by clicking on the operator symbols in the equation. Try it now by
clicking on the
multiplication symbol in the equation above. A new version of the equation
will be displayed below the original equation, where the matrices before
and after the operation symbol have been replaced by a single
matrix that is the result of the operation.

Matrices are multiplied
as follows: each element in the result is calculated by taking the
corresponding row of the left matrix and the corresponding column of the
right matrix and multiplying the individual corresponding elements and
then adding up the terms. If you place your cursor over any element in the
newly displayed matrix,
the corresponding rows and columns that were used to calculate that term
will be highlighted in the original matrices. Perhaps it would be easier
to visualize these issues if the matrix contained numbers instead of
symbols. Perform the matrix multiplication below by clicking on the
multiplication symbol and then hover your mouse over each term of the
result.

.. matrixeq:: Eq2

   [M1: 1,0,3;5,2,0;6,1,0]*[XYZ: x;y;z]=[XYZ2: x';y';z']

The equation used to calculate each term is intentionally shown in the result
so that you can see where each value comes from. Selecting the "-"
button to the right of the equation will reduce each term to its simplest
symbol form. Please use this functionality throughout these tutorials
to closely examine how matrices work. If you click on the equal sign in
the equation, each side of the equation will be reduced to its simplest
form. The "X" button to the right will remove the generated equation from the web page.


Basic Transformations In Matrix Format
--------------------------------------

From the previous lesson you learned that a scaling transformation is
performed by multiplying the vertex components like this, where
:code:`(x,y,z)` is a
vertex, :code:`sx`, :code:`sy`, and :code:`sz` are scale factors
and :code:`(x',y',z')` is a transformed vertex:

.. code:: C

  x * sx = x'
  y * sy = y'
  z * sz = z'

These scaling equations can be written in matrix format like this:

.. matrixeq:: Eq3

   [M1:sx,0,0;0,sy,0;0,0,sz]*[XYZ: x;y;z]=[XYZ2: x';y';z']


Multiply the matrices and reduce the equations to see the equivalence.
It may seem crazy to take such simple equations and make them more
complex by using matrices. But you will see the power of matrices shortly.

Rotation transformations can easily be written in matrix format. Let's
put the equations for rotation about the Z axis in matrix format:

.. code:: JavaScript

   x * cos(angle) + y * -sin(angle) = x'
   x * sin(angle) + y *  cos(angle) = y'
                                  z = z'

.. matrixeq:: Eq4

   [M1: cos(angle),-sin(angle),0;sin(angle),cos(angle),0;0,0,1]*[XYZ: x;y;z]=[XYZ2: x';y';z']

Now we come to the hard one -- translation. Notice that in each of the
previous examples, the transformation of each vertex component was some
combination of the original *x*, *y*, and *z* values. But for translation, we simply
want to add a value to each component. The matrices we have used so
far have no way to do this. So we need a larger matrix. Instead of a 3 by 3
matrix, we use a 4 by 4 like this:

The translation equations are:

.. code:: C

  x + tx = x'
  y + ty = y'
  z + tz = z'

The equivalent equations in matrix format are:

.. matrixeq:: Eq5

   [M1: 1,0,0,tx;0,1,0,ty;0,0,1,tz;0,0,0,1]*[XYZ: x;y;z;1]=[XYZ2: x';y';z';1]

Let's make some observations about this matrix multiplication:

* The additional component of 1 at the end of the (x,y,z) column vector
  guarantees that the offsets (tx, ty, tz) will be unchanged.
* The one's down the diagonal guarantee that the original (x,y,z) values
  are included in the results unchanged.
* The last row of the transformation matrix (0,0,0,1) guarantees that the
  1 component at the end of the (x,y,z) value remains a 1 in the result.

Question? Do we really need that last row in the transformation matrix? Could we do this?

.. matrixeq:: Eq6

   [M1: 1,0,0,tx;0,1,0,ty;0,0,1,tz]*[XYZ: x;y;z;1]=[XYZ2: x';y';z']

From a pure mathematical perspective, yes you can.
However, our goal is to create a single, *consistent*
format for applying **a series of transformations**. In addition, we need
the ability to undo (or reverse) transformations, which requires that
our transformation matrices be square. Therefore, the 4\ :sup:`th` row in a
transformation matrix is required.

The extra value added to a vertex at the end, the trailing :code:`1`, is called
the *homogeneous coordinate*. The standard convention is to call this the
:code:`w` component. Therefore, a vertex in *homogeneous coordinates* looks
like :code:`(x,y,z,w)`. The :code:`w` component is useful for more than just translation,
and we will discuss those uses in future lessons. But for now, notice that
the :code:`w` component implements (and controls) translation. For a vertex,
we always want the :code:`w` component to be :code:`1`. However, remember
that a **vector** has a magnitude and a direction, but no location. **A vector
can't be translated!** When we represent a **vector** using *homogeneous coordinates*,
the :code:`w` value needs to be zero! Since we rarely store the homogeneous component
in memory to reduce memory usage, you will have to add the homogeneous component
when it is needed. Just remember:

* For **vertices** use :code:`(x,y,z,1)`, which allows for scaling, rotation, and translation.
* For **vectors** use :code:`<dx,dy,dz,0>`, which allows for scaling and rotation (but not translation).

Putting this all together gives us the following **consistent** way to
perform our three basic transformations:

**Scale**:

.. matrixeq:: Eq7

   [M1: *sx,0,0,0;0,*sy,0,0;0,0,*sz,0;0,0,0,1]*[XYZ: x;y;z;1]=[XYZ2: x';y';z';1]

**Translate**:

.. matrixeq:: Eq8

   [M1: 1,0,0,*tx;0,1,0,*ty;0,0,1,*tz;0,0,0,1]*[XYZ: x;y;z;1]=[XYZ2: x';y';z';1]

**Rotate** *angle* degrees about the Z axis:

.. matrixeq:: Eq9

   [M1: *cos(angle),*-sin(angle),0,0;*sin(angle),*cos(angle),0,0;0,0,1,0;0,0,0,1]*[XYZ: x;y;z;1]=[XYZ2: x';y';z';1]

**Rotate** *angle* degrees about the Y axis:

.. matrixeq:: Eq10

   [M1: *cos(angle),0,*sin(angle),0;0,1,0,0;*-sin(angle),0,*cos(angle),0;0,0,0,1]*[XYZ: x;y;z;1]=[XYZ2: x';y';z';1]

**Rotate** *angle* degrees about the X axis:

.. matrixeq:: Eq11

   [M1: 1,0,0,0;0,*cos(angle),*-sin(angle),0;0,*sin(angle),*cos(angle),0;0,0,0,1]*[XYZ: x;y;z;1]=[XYZ2: x';y';z';1]

**Rotate** *angle* degrees about any axis defined as <ux,uy,uz>:

Let's derive a transformation for rotating about any axis by combining the
transformations we have already created. This will give you an example
of how basic transformations
can be combined to form more complex transformations. If we want to rotate
about an axis defined by :code:`<ux, uy, uz>`, then we can accomplish this by
performing the following sequence of transformations:

#. Rotate about the Z axis to place the vector :code:`<ux, uy, uz>` in the Z-X plane. Let’s call this new vector :code:`<ux’, uy’, uz’>`.
#. Then rotate about the Y axis to place :code:`<ux’, uy’, uz’>` along the X axis.
#. Then rotate about the X axis the desired angle.
#. Then rotate about the Y axis to place :code:`<ux’, uy’, uz’>` back to its original location.
#. Then rotate about the Z axis to place :code:`<ux, uy, uz>` back in its original location.

This series of 5 rotations will provide the visual affect of rotating a model
about the axis :code:`<ux,uy,uz>`. But we don't want to do all of the 5 transformations
over and over again for each vertex. We want a single transformation that
will produce the visual motion we desire. We can accomplish this by
multiplying the 5 matrices together before we start rendering, and
then use a single transformation matrix to perform the desired rotation.
To make this idea clear, lets perform the 5 transformations above in the
order they are specified. The order is critical, because if you change
the order, you will get a very different result.

We need to calculate 2 angles of rotation that will get the axis of rotation
aligned with the X axis. Let *i* be the angle in step one, *j*
be the angle for step two, and *k* be the angle for step 3. And let's use
*s()* and *c()* to represent the *sin* and *cosine* functions. The
transformation looks like this:

.. matrixeq:: Eq12

   [M1: c(-i),-s(-i),0,0;s(-i),c(-i),0,0;0,0,1,0;0,0,0,1]*[M2: c(-j),0,s(-j),0;0,1,0,0;-s(-j),0,c(-j),0;0,0,0,1]*[M3: 1,0,0,0;1,c(k),-s(k),0;0,s(k),c(k),0;0,0,0,1]*[M4: c(j),0,s(j),0;0,1,0,0;-s(j),0,c(j),0;0,0,0,1]*[M5: c(i),-s(i),0,0;s(i),c(i),0,0;0,0,1,0;0,0,0,1]*[XYZ: x;y;z;1]=[XYZ2: x';y';z';1]

Perform the matrix multiplications in the above equation to see what the
single transformation is equal to. Note that the resulting answer is
in terms of sin and cos functions because the equations do not contain
specific numerical values, but in a specific instances, you would have
a single 4-by-4 matrix with 16 numeric values that would perform your
desired transformation. If the model you were transforming contained
10,000 vertices, reducing your complex transformations to a single 4-by-4
matrix saves a huge amount of computation.

It should be noted that a rotation about an axis :code:`<ux, uy, uz>` can be calculated
using simpler equations by combining like terms in the above equations. For operations
that are common, such as rotating about a specific axis, the calculations
are simplified to their simplest form before programming them into algorithms.
But for the general case, complex motion will be created by forming a **series**
of 4x4 matrix transformations and combining them into a single transformation
matrix.

Let's take a look at some basic properties of matrices.

Basic Properties of Matrices - Order Matters!
---------------------------------------------

A matrix represents a system of equations. Therefore, only a small set of
operations make sense. The fundamental operation is multiplication. We
defined how matrices are multiplied in the above discussion. The important
thing to understand
is that the order of multiplication matters. In general, :code:`M1*M2 != M2*M1`.
Experiment with the following example.

.. matrixeq:: Eq13

   [M1: 2,4;5,-3]*[M1: -4,3;-4,8] != [M1: -4,3;-4,8]*[M1: 2,4;5,-3]


From a visual computer graphics perspective it is easy to understand that
the order of matrix operations matters. For example, physically
take some object, assume it is located at the origin, and perform these
transformations on it:

#. Move it 2 units down the X axis.
#. Then rotate it about the Z axis by 90 degrees.

Now, perform the transformations in reverse order:

#. Rotate the object 90 degrees about the Z axis.
#. Then move it 2 units down the X axis.

The object ends up in a totally different place!

Let's perform these transformations in matrix format. The equation below
moves an object 2 units down the x axis and then rotates 90 degrees about
the Z axis:

.. matrixeq:: Eq14

   [M1: cos(90),-sin(90),0,0;sin(90),cos(90),0,0;0,0,1,0;0,0,0,1]*[T1: 1,0,0,2;0,1,0,0;0,0,1,0;0,0,0,1]*[XYZ: x;y;z;1]=[XYZ2: x';y';z';1]

while this equation performs the rotation first and then the translation:

.. matrixeq:: Eq15

   [T1: 1,0,0,2;0,1,0,0;0,0,1,0;0,0,0,1]*[M1: cos(90),-sin(90),0,0;sin(90),cos(90),0,0;0,0,1,0;0,0,0,1]*[XYZ: x;y;z;1]=[XYZ2: x';y';z';1]


Multiply and simplify the two equations to see that the transformations
indeed are totally different! Note that the matrix that is closest to the
:code:`(x,y,z,1)` vertex is the transformation that happens first. Then the transformation
to the left of that, and so on. Therefore, you must order the
transformations from right to left in your calculations to get the
desired order of transformations.

The Identity Matrix
-------------------

Multiplying a matrix times an *identity matrix* leaves a matrix unchanged.
This is identical to multiplying a single value by one. An *identity matrix*
is defined to be all zeroes with one's down the diagonal.
Experiment with the following two examples.

.. matrixeq:: Eq16

   [M1: 1,0,0,0;0,1,0,0;0,0,1,0;0,0,0,1]*[XYZ: x;y;z;1] = [XYZ: x;y;z;1]

.. matrixeq:: Eq17

   [M1: 1,0,0,0;0,1,0,0;0,0,1,0;0,0,0,1]*[M2: 2,-3,5,7;8,-4,3,2;0,5,-6,5;1,2,3,4] = [M2: 2,-3,5,7;8,-4,3,2;0,5,-6,5;1,2,3,4]

An identity matrix is represented by a capital :code:`I`.

The order of multiplication when using an identity matrix is not important.
That is, you can pre-multiply or post-multiply a matrix times an identity matrix and
the results will be the same. Therefore, :code:`M*I = I*M = M`.

The Matrix Inverse
------------------

A 4-by-4 matrix performs a transformation on a set of vertices. There
is often a need to reverse the transformation to get the original
values back. In algebra, the way you undo an addition is to subtract.
For example, examine how the :code:`5` is moved to the other side of the equation
by subtracting it from both sides:

.. code:: C

  x + 5 = x'
  x + 5 - 5 = x' - 5
  x = x' - 5

In a similar manner, the way to undo multiplication is to divide, (or multiply
times the reciprocal). For example, examine how the multiplication by :code:`5`
is moved to the other side of the equation by dividing by :code:`5`.

.. code:: C

  x * 5 = x'
  (x * 5) / 5 = x' / 5
  x = x' / 5
  x = x' * (1/5)

Division for matrices is performed by multiplying by a *matrix inverse*.
Given a matrix :code:`M`, if you multiply it by its inverse, the result is the
identity matrix. The notation M\ :sup:`-1` represents the inverse of M.
A matrix inverse will produce an identity matrix regardless of the order
of the matrix multiplication. That is,

.. matrixeq:: Eq18

  [M1: M]*[M2: M^(-1)] = [M1: M^(-1)]*[M2: M] = [I: I]


An arbitrary 4-by-4 matrices may or may not have an inverse. However, if you create
a transformation which is a combination of scaling, rotation, and/or
translation, the resulting 4-by-4 matrix will always have an inverse.
We will discuss how a matrix inverse is used in later lessons.

Matrix math follows the same simple rules as algebra. If you have an equation,
you must always perform the same operation on both sides of the equation
to maintain its equality. However, since the order of matrix multiplication
matters, if you pre-multiply one side of an equation by a matrix, make sure
you pre-multiply the other side of the equation by the same matrix. Consider
the following equation:

.. matrixeq:: Eq19

  [M1: S]*[M2: T] = [M1: U]

In the following manipulation of this equation, the first and second
equations are valid, while the third is not valid.

.. matrixeq:: Eq20
  :comment: is valid because B is pre-multiplied

  [*M1: B]*[M1: S]*[M2: T] = [*M1: B]*[M1: U]

.. matrixeq:: Eq21
  :comment: is valid because B is post-multiplied

  [M1: S]*[M2: T]*[*M3: B] = [M1: U]*[*M1: B]

.. matrixeq:: Eq22
  :comment: is invalid because the multiplications are inconsistent

  [M1: S]*[M2: T]*[*M3: B] = [*M1: B]*[M1: U]

Matrix Conventions
------------------

The fundamental issue with computer graphics transformations is
their order. As we have already discussed, this
correlates to the ordering of your matrix multiplications. By convention
WebGL (and the OpenGL system it was derived from) orders the
transformations from right to left. This is because of the way we created
the initial equations. We started by positioning the
transformation matrix
to the left of the :code:`(x,y,z,w)` vertex. There is another way you can perform
the same multiplication. You can put the :code:`(x,y,z,w)` vertex at the front
of the equation, like this:

.. matrixeq:: Eq19

   [XYZ: x,y,z,1]*[M1: 1,0,0,0;0,1,0,0;0,0,1,0;tx,ty,tz,1] = [XYZ: x',y',z',1]

Notice that the translation matrix in the above example had to move the
translation values to the last row of the matrix. In fact, every transformation
matrix we have discussed (except scaling) will have a different format if
you post-multiply the transformations. And if you use this convention,
the transformations are applied from left to right, not right to left.
The important thing
is that you select a convention and use it consistently. Never mix
the conventions! For this entire textbook, we will use the WebGL/OpenGL
convention of pre-multiplying the transformations times the vertices.

.. admonition:: A note of caution.

  It is easy to search the web and get conflicting
  information about graphic transformations because there are
  two ways to structure the transformations, pre-multiplying or post-multiplying.
  OpenGL uses the pre-multiplying convention while
  Microsoft's Direct3D uses the post-multiplying convention. Therefore, make
  sure that you understand which convention a web page is assuming so you
  don't get confused by conflicting information.

Experimentation
---------------

Below are two matrix equations you can experiment with.

.. matrixeq:: Eq20

   [M1: {1},{0},{0},{0};{0},{1},{0},{0};{0},{0},{1},{0};{0},{0},{0},{1}]*[M2: x;y;z;1] = [M3: x';y';z';1]

.. matrixeq:: Eq21

   [M1: {1},{0},{0},{0};{0},{1},{0},{0};{0},{0},{1},{0};{0},{0},{0},{1}]*[M2: {1},{0},{0},{0};{0},{1},{0},{0};{0},{0},{1},{0};{0},{0},{0},{1}]*[M3: x;y;z;1] = [M4: x';y';z';1]

Glossary
--------

.. glossary::

  vector
    In mathematics, a *vector* is any ordered list of values. In computer
    graphics a *vector* represents a direction in 3D space, i.e., :code:`<dx,dy,dz,0>`

  matrix
    The coefficients of a system of equations with the variables removed.

  linear algebra
    The mathematical concepts and theory concerning vectors and matrices.

  matrix multiplication
    An algorithm for multiplying two matrices to produce a single matrix.

  square matrix
    A matrix that has the same number of rows as columns.

  transformation matrix
    A 4x4 matrix with values in specific locations to perform a specific
    computer graphics operation.

  pre-multiply matrix
    The matrix goes on the left side of the multiplication operator.

  post-multiply matrix
    The matrix goes on the right side of the multiplication operator.

  identity matrix
    A square matrix with 1's down the diagonal and zeros in all other positions.
    Multiplication of a matrix times an identity matrix does not change the
    original matrix using either *pre* or *post* multiplication.

  matrix inverse
    A matrix that is derived from another matrix such that the multiplication
    of the original matrix and its inverse results in an identity matrix. A
    matrix inverse can be either *pre* or *post* multiplied to get an identity matrix.
    Multiplying by a matrix inverse is equivalent to division in algebra.

Extra Resources
---------------

If your understanding of matrix math is still weak, students have recommended
this `math is fun`_ web site.

Self Assessment
---------------

.. mchoice:: 6.5.1
  :random:
  :answer_a: It is an identity matrix.
  :answer_b: Any matrix multiplied by this matrix, either pre or post-multiply, does not change.
  :answer_c: It is a square matrix.
  :answer_d: It is equal to its inverse.
  :correct: a,b,c,d
  :feedback_a: Correct.
  :feedback_b: Correct.
  :feedback_c: Correct.
  :feedback_d: Correct.

  What is true about the following matrix? (Select all that apply.)

  .. matrixeq:: Skip
    :nolabel:

    [M1: 1,0,0,0;0,1,0,0;0,0,1,0;0,0,0,1]

.. mchoice:: 6.5.2

  What is the correct result of this matrix multiplication?

  .. matrixeq:: Skip
    :nolabel:
    :notexecutable:

    [M1: 1,2;3,4]*[M2: 3,1;2,4]

  - .. matrixeq:: Skip
      :nolabel:

      [M1: 7,9;17,19]

    + Correct.

      .. matrixeq:: Skip
        :nolabel:
        :notexecutable:

        [M1: 1*3 + 2*2, 3*3 + 4*2; 1*1 + 2*4, 3*1 + 4*4] = [M2: 7,9;17,19]

  - .. matrixeq:: Skip
      :nolabel:

      [M1: 7,9;19,17]

    - Incorrect.

  - .. matrixeq:: Skip
      :nolabel:

      [M1: 1,1;2,2]

    - Incorrect.

  - .. matrixeq:: Skip
      :nolabel:

      [M1: 9,4;6,2]

    - Incorrect.

.. mchoice:: 6.5.3
  :random:
  :answer_a: translation
  :answer_b: rotation
  :answer_c: scale
  :answer_d: inverse
  :correct: a
  :feedback_a: Correct. It translates the x coordinate by 2, the y coordinate by 5, and the z coordinate by -3.
  :feedback_b: Incorrect. (To be a rotation, it needs values in the upper-left 3-by-3 terms.)
  :feedback_c: Incorrect. (To be a scale, it needs scale factors down the diagonal.)
  :feedback_d: Incorrect.

  What computer graphics operation does this matrix perform?

  .. matrixeq:: Skip
    :nolabel:

    [M1: 1,0,0,2;0,1,0,5;0,0,1,-3;0,0,0,1]

.. mchoice:: 6.5.4
  :random:
  :answer_a: scale
  :answer_b: translation
  :answer_c: rotation
  :answer_d: inverse
  :correct: a
  :feedback_a: Correct. It scales the x coordinate by 2, mirrors the y coordinate, and scales the z coordinate by 3.
  :feedback_b: Incorrect. (To be a translation, it needs non-zero values in the last column.)
  :feedback_c: Incorrect. (To be a rotation, it needs values in the upper-left 3-by-3 terms.)
  :feedback_d: Incorrect.

  What computer graphics operation does this matrix perform?

  .. matrixeq:: Skip
    :nolabel:

    [M1: 2,0,0,0;0,-1,0,0;0,0,3,0;0,0,0,1]

.. mchoice:: 6.5.5
  :random:
  :answer_a: rotation
  :answer_b: scale
  :answer_c: translation
  :answer_d: inverse
  :correct: a
  :feedback_a: Correct. It is a rotation of 30 degrees about the Z axis. (Note that the z components do not change.)
  :feedback_b: Incorrect. (It may look a little like a scale, but it is not. The size remains unchanged!)
  :feedback_c: Incorrect. (To be a translation, it needs non-zero values in the last column.)
  :feedback_d: Incorrect.

  What computer graphics operation does this matrix perform?

  .. matrixeq:: Skip
    :nolabel:

    [M1: 0.866,-0.5,0,0;0.5,0.866,0,0;0,0,1,0;0,0,0,1]

.. mchoice:: 6.5.6
  :random:
  :answer_a: Transformation matrices are formatted differently based on whether they follow the pre or post multiply convention.
  :answer_b: Some web pages have incorrect information in them.
  :answer_c: There are many, many different ways to format transformation matrices.
  :answer_d: Transformation matrices vary based on the order they are applied to a problem.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. (This may be true, but it is not the primary reason.)
  :feedback_c: Incorrect. (There is really only two formatting conventions, based on pre or post multiplying.)
  :feedback_d: Incorrect. (Order changes the results of an overall transformation, but the format of individual transformations does not change -- assuming you stick to a single formatting convention.)

  Why must you be careful when using transformation matrices you find from google searches?


.. index:: vector, matrix, linear algebra, matrix multiplication, square matrix,
  transformation matrix, pre-multiply matrix, post-multiply matrix, identity matrix
  matrix inverse

.. _linear algebra course: https://www.khanacademy.org/math/linear-algebra
.. _math is fun: https://www.mathsisfun.com/algebra/matrix-multiplying.html
