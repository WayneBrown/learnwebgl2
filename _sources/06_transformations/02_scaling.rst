..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

6.2 - Scaling
:::::::::::::

Scaling changes the size of a model.
But it can also move a model's location and flip models about the global axes.
Mathematically, scaling is a simple multiplication.

Scaling is an **afine transformation** that is applied only to the vertices
of a model. A vertex is a
location in 3D space defined by its distance along 3 axes --
:code:`(x, y, z)`. Let's use the notation :code:`(x_new, y_new, z_new)` to represent a transformed
vertex location. **Uniform scaling** uses a single scale factor, :code:`s`, to
change all 3 components of a vertex. In equation format,
scaling is performed like this:

.. Code-block:: JavaScript

  x_new = x * s;
  y_new = y * s;
  z_new = z * s;

You can also scale using a different scale factor for each axis. Let's call
the 3 scale factors :code:`sx`, :code:`sy`, and :code:`sz`. This is referred
to as **non-uniform scaling**, which is a simple multiplication like this:

.. Code-block:: JavaScript

  x_new = x * sx;
  y_new = y * sy;
  z_new = z * sz;

Notice that scaling by 1 does not change an object. (Any value multiplied
times 1 is itself.)
Vertices are typically manipulated as a unit, so if you want to
scale along one axis and leave the other axes unchanged, use a scale factor
of 1 for the components you want unchanged.

Scaling by 0 is typically avoided since multiplication of any
value times 0 results in 0. Given that a scaling operation is applied to
every vertex of a model, scaling by 0 would make every vertex in the model
become (0,0,0) and the model would degenerate to a single point at the
origin -- which is typically not a desirable outcome -- unless you were
trying to make an object disappear.

All scaling is "about the origin." Consider a simple number line.
When you multiple a number by a value
greater than 1, the number moves further away from the origin.
When you multiple
a number by a value less than 1, the number moves closer to the origin.
Either way, the value changes its location relative to the origin!

Special Cases and Effects
-------------------------

Please study and experiment with the following scaling examples.

#.  Scaling a model that is centered at the origin shrinks or
    enlarges the model, but it does not change the model's location.

    .. webgldemo:: W1
      :htmlprogram: _static/01_example01/scale_about_origin.html

#.  Non-uniform scaling uses three distinct scaling factors, one for each
    axis. The model is still centered at the origin, so its location does not
    change.

    .. webgldemo:: W2
      :htmlprogram: _static/06_example02/nonuniform_scaling.html

#.  Scaling a model that is away from the origin shrinks or
    enlarges the model and also changes the model's location. The direction
    of motion is determined by which quadrant the model is located. Notice
    that in the next example each of the eight models move in different
    directions, but they all move away from or towards the origin. This
    is another visual demonstration that all scaling is "about the origin."
    Most models are centered about the origin when they are created for
    this very reason.

    .. webgldemo:: W3
      :htmlprogram: _static/06_example03/scale_away_from_origin.html

#.  A vertex at the origin, (0,0,0), is not affected by scaling. (Zero
    times any scale factor is still zero.) A vertex of (0,0,0) in a
    model provides a convenient reference point for locating a model
    in a scene.

#.  Scaling an object with a negative scale value preforms a *mirror*
    operation.

    .. webgldemo:: W4
      :htmlprogram: _static/06_example04/scale_mirror.html

#.  To negate (or undo) a scaling operation you simply need to scale a
    model by the reciprocal of the scaling factor. For example, if you
    scaled a model by a factor of 3, you can get the original model back
    by scaling by 1/3. (Note: You can't undo scaling by zero. Why not?)

Glossary
--------

.. glossary::

  scale
    Change the size of a model. (All vertices move closer, or farther away, from the origin.)

  uniform scaling
    Change the size of a model by the same amount along each of the
    coordinate system axes. One scale factor is used.

  non-uniform scaling
    Change the size of a model but by different amounts along each of the
    coordinate system axes. Three scaling factors are used.

  mirror
    Flip an object 180 degrees about a coordinate system axis. The scale
    factor is negative.

Self Assessment
---------------

.. mchoice:: 6.2.1
  :random:
  :answer_a: multiplication
  :answer_b: division
  :answer_c: subtraction
  :answer_d: addition
  :correct: a
  :feedback_a: Correct. Scaling is performed by multiplication.
  :feedback_b: Incorrect. While it is possible to produce scaling using division, division is the most expensive calculation a CPU can perform and in computer graphics divisions are avoided whenever possible.
  :feedback_c: Incorrect. Subtraction (really addition) is used for translation.
  :feedback_d: Incorrect. Addition is used for translation.

  Scaling a model requires a _____________ operation on each vertex in the model.

.. mchoice:: 6.2.2
  :random:
  :answer_a: When the model is not centered at the origin.
  :answer_b: When the model is composed of only triangles.
  :answer_c: When the model is centered at the origin.
  :correct: a
  :feedback_a: Correct. An object away from the origin will move further away from the origin when enlarged and closer to the origin when shrunk.
  :feedback_b: Incorrect. All models are composed of only triangles. This has no impact on scaling.
  :feedback_c: Incorrect. If the model is centered at the origin, then all vertices move the same percentage away or towards the origin, which keeps the object in the same relative location.

  Scaling changes the location of a model under what circumstances?

.. mchoice:: 6.2.3
  :random:
  :answer_a: 1.0
  :answer_b: 0.0
  :answer_c: the same scale factor as the x axis
  :correct: a
  :feedback_a: Correct. This leave the z components of all vertices unchanged because multiplying by 1.0 does not change them.
  :feedback_b: Incorrect. This makes all vertex z components be 0.0, which collapses your entire 3D model to a single plane.
  :feedback_c: Incorrect.

  If you want to scale the x and y dimensions of a model, but leave the z dimension unchanged,
  what scale factor should you use for the z scale factor?

.. mchoice:: 6.2.4
  :random:
  :answer_a: Y-Z plane
  :answer_b: X plane
  :answer_c: X-Y plane
  :answer_d: X-Z plane
  :correct: a
  :feedback_a: Correct. Since the x values become negative, the model goes on the opposite side of the Y-Z plane.
  :feedback_b: Incorrect. (A single axis does not define a plane.)
  :feedback_c: Incorrect. Mirroring about the X-Y plane requires a negative z scale factor.
  :feedback_d: Incorrect. Mirroring about the X-Z plane requires a negative y scale factor.

  Using a negative value for the X scale factor mirrors a model about which plane?

.. mchoice:: 6.2.5
  :random:
  :answer_a: Collapses all vertices to (0,0,0), thus losing all 3D information about the model.
  :answer_b: Performs the "unity" operation which leaves the model unchanged.
  :answer_c: Makes the model larger.
  :answer_d: Makes the model smaller.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. (The "unity" operation uses a scale factor of 1.0.)
  :feedback_c: Incorrect.
  :feedback_d: Partially correct, but there is a better answer.

  Uniform scaling of a model by 0.0 does what to a model?


.. index:: scale, uniform scaling, non-uniform scaling, mirror


