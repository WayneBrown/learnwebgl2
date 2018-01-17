..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

.. role:: raw-html(raw)
  :format: html

8.7 - Bezier Path Orientation
:::::::::::::::::::::::::::::

Consider a race car speeding around a race track. Not only is the car
changing location, it is also changing orientation as it follows the
race track. The speed of an object along a Bezier defined curve is
a vector which has a magnitude and a direction. We can use the direction
of the speed vector to control the orientation of an object as it follows the
path.

Every object has a local coordinate system that is defined by three
orthogonal axes. The speed vector of a Bezier parametric equation
can be used to set one of the axes of a local coordinate system. To
solve for the other two axes we need one more vector, which must be
arbitrarily specified by an animator. Please note that this was also true
of a virtual camera. To calculate a local coordinate system for a camera
we made the animator specify which direction was "up".

With reference to lesson 7.6, if we know the desired orientation and
location of an object, the transformation matrix needed to place
the object in the scene is straightforward: the local coordinate system
axes become the first three columns, while the location fills in the
fourth column like this:

.. matrixeq:: Eq1

  [M1: ux,vx,nx,tx; uy,vy,ny,ty; uz,vz,nz,tz;0,0,0,1]

where the vector, :code:`<ux,uy,uz>` is "to the right" of the object,
the vector, :code:`<vx,vy,vz>`, is pointing "up", and
the vector, :code:`<nx,ny,nz>` is pointing away from the
"front" of the object.

The following WebGL program modifies the orientation of a model based on
the direction of the path's speed vector. We arbitrarily align the speed vector
with the :code:`n` axis of the local coordinate system and specify that
the "up direction" is in the y-axis direction. The local coordinate system
is calculated by taking cross-products of these vectors to create three
orthogonal axes. The location is calculated from the Bezier equation.
Please experiment with the following WebGL program and study the code.

.. webglinteractive:: W1
  :htmlprogram: _static/08_bezier_orientation/bezier_orientation.html
  :editlist: _static/08_bezier_orientation/bezier_orientation.js, _static/08_bezier_orientation/bezier_orientation_scene.js
  :hideoutput:
  :width: 300
  :height: 300


.. admonition:: Summary

  The first derivative of the Bezier equation produces a speed vector.
  This vector can be used to define a local coordinate system that
  aligns the animated model with the path of motion.

Glossary
--------

.. glossary::

  Bezier parametric equation
    A function of one variable, :code:`t`, that calculates changes along a "path".

  Speed vector
    The first derivative of an equation of motion. Speed always has a direction and a magnitude.

Self Assessment
---------------

.. mchoice:: 8.7.1
  :random:
  :answer_a: relative to the object, to the right.
  :answer_b: relative to the object, up.
  :answer_c: relative to the object, forward (away from the front).
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. "Up" is in the v direction.
  :feedback_c: Incorrect. "Forward" is in the n direction.

  The names :code:`u`, :code:`v` and :code:`n` are used to define a local
  coordinate system for an object (either a model or a camera.) In reference
  to the object, which direction does the :code:`u` vector point.

.. mchoice:: 8.7.2
  :random:
  :answer_a: n x u (cross product of n and u)
  :answer_b: u x n (cross product of u and n)
  :answer_c: v x n (cross product of v and n)
  :answer_d: u x v (cross product of u and v)
  :correct: a
  :feedback_a: Correct. Using the "right-hand-rule," align your thumb with n, your index finder with u, and your middle finder will point in the direction of v.
  :feedback_b: Incorrect. This calculates -v because the order of the cross-product is wrong.
  :feedback_c: Incorrect. You can't use v to calculate v.
  :feedback_d: Incorrect. You can't use v to calculate v.

  If :code:`u` and :code:`n` are known, how can :code:`v` be calculated.

.. mchoice:: 8.7.3
  :random:
  :answer_a: increase the number of frames used for the motion.
  :answer_b: adjust the intermediate control points.
  :answer_c: adjust the starting and ending control points.
  :answer_d: make the path non-linear.
  :correct: a
  :feedback_a: Correct. Speed is distance divided by time. Increasing the time lowers the speed.
  :feedback_b: Incorrect. This will change the speed and acceleration but also the path's location.
  :feedback_c: Incorrect. This will change the speed and acceleration but also the path's location.
  :feedback_d: Incorrect. Not relevant.

  How can you make an object move more slowly along a path -- without changing the path's location?

.. index:: Bezier parametric equation, speed vector

