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

8.8 - Chained Bezier Paths
::::::::::::::::::::::::::

Complex animations can be defined by a series of connected Bezier paths.
Special care must be taken when connecting two Bezier paths to make
sure that the speed and acceleration at the point of connection are consistent.
An instantaneous change in either speed or acceleration
can cause a visible "jerk" or "jump" in motion that is typically
undesirable.

To connect two Bezier paths and maintain contiguous location,
the :code:`p0` control point for the second path must be equal to
the :code:`p3` control point of the first path.

To make the speed between two Bezier paths consistent
you must make the vector :code:`<p1-p0>` of the second path be equal
to the vector :code:`<p3-p2>` of the first path.

To make the acceleration between two Bezier paths consistent
you must make the vector :code:`<6*(-1)(p1-p0) + 6*(p2-p1)>` of
the second path be equal to vector :code:`<6*(-1)(p2-p1) + 6*(p3-p2)>`
of the first path. An instantaneous change in acceleration is
not as visibly noticeable as an instantaneous change in speed.
Therefore you can often ignore the sync'ing of the accelerations
because the visual artifacts might be minimal.

Mathematical Proof
------------------

The criteria to sync two Bezier paths is easily derived from the
Bezier parametric equations.

.. admonition:: Bezier parametric equation

  p = (1-t)\ :sup:`3` * **p0** + 3*(1-t)\ :sup:`2`\*t* **p1** + 3*(1-t)\*t\ :sup:`2`\* **p2** + t\ :sup:`3`\* **p3**;

Using derivatives we have:

.. Code-Block:: C

  speed = d(p)/dt = 3*[(1-t)^2(p1-p0) + 2(1-t)(t)(p2-p1) + (t^2)(p3-p2)]
  acceleration = d(speed)/dt = 6*[(-1+t)(p1-p0) + (1-2t)(p2-p1) + t(p3-p2)]

To synchronize two paths we need to know the speed and acceleration at
the end-points of the path. This is easily calculated by setting
:code:`t` to :code:`0.0` and :code:`1.0` respectively.

+-----------------------+----------------------------------------+-------------------------------------+
|                       | path starts when :code:`t===0.0`       | path ends when :code:`t===1.0`      |
+=======================+========================================+=====================================+
| speed =               | :code:`<3*(p1-p0)>`                    | :code:`<3*(p3-p2)>`                 |
+-----------------------+----------------------------------------+-------------------------------------+
| acceleration =        | :code:`<6*(-1)(p1-p0) + 6*(p2-p1)>`    | :code:`<6*(-1)(p2-p1) + 6*(p3-p2)>` |
+-----------------------+----------------------------------------+-------------------------------------+

A WebGL Program
---------------

The following WebGL program defines a complex path using four connected
Bezier parametric equations. A class named :code:`BezierPath` defines a path
using four control points along with a starting and ending frame to define when
the motion occurs. You can experiment with the animation by
changing the control points and the frame intervals in the
:code:`bezier_chained_scene.js` code, lines 81-101. A new class called :code:`BezierSeries`
implements functionality to track a frame counter over the various Bezier paths.
It is defined in the :code:`bezier_chained.js` file in lines 204-262.

Please experiment with this WebGL program and then study the comments below.

.. webglinteractive:: W1
  :htmlprogram: _static/08_bezier_chained/bezier_chained.html
  :editlist: _static/08_bezier_chained/bezier_chained.js, _static/08_bezier_chained/bezier_chained_scene.js
  :hideoutput:
  :width: 300
  :height: 300

Please note the following characteristics of the above demonstration program:

* The first segment of the path sets :code:`p0` and :code:`p1` at the same location.
  This makes the initial speed zero, which means the object starts from a
  stationary position. The same technique is used for :code:`p2` and
  :code:`p3` of the last path segment so that the speed is zero at
  the end of the motion.
* The starting and ending vectors defined by the control-points of each
  segment are deliberately set to make the speed and acceleration consistent
  over the transition from one path segment to the next, except in the last
  transition, where the speed vector makes a hard turn in direction. There
  is a visible "jump" or "jerk" in the animation at this transition point.
  (Try to change the definition of the last segment to remove this discontiuity.)
* If you drag or click on the HTML slider that manipulates the frame counter,
  it becomes the active
  input element and it will accept keyboard commands. Use the arrow keys
  on the keyboard to step through the animation sequence one frame at a time
  to see the detailed motion of the object along the path.

.. admonition:: Summary

  A series of connected Bezier paths can describe complex motion by giving
  an animator control over the location, speed, and acceleration of an
  animated object. Careful design and placement of the control points
  is required to achieve control of all three path characteristics at the
  same time.

Glossary
--------

.. glossary::

  Bezier parametric equation
    A function of one variable, :code:`t`, that calculates changes along a "path".

  Speed vector
    The first derivative of an equation of motion. Speed always has a direction and a magnitude.

Self Assessment
---------------

.. mchoice:: 8.8.1
  :random:

  What is required for a Bezier path to have a speed of zero at its starting location?

  - control-points :code:`p0` and :code:`p1` must be equal.

    + Correct. This make the vector :code:`<p1-p0>` be zero, which is the vector that controls speed when t=0.

  - the control-points must be co-linear.

    - Incorrect. Co-linear points make the path a straight line segment, but this does not control the speed of motion.

  - control-points :code:`p2` and :code:`p3` must be equal.

    - Incorrect. This is how you would make the speed zero at the end of the path.

  - control-points :code:`p1` and :code:`p2` must be equal.

    - Incorrect. This makes the acceleration zero at the mid-point of the path, but does not control speed.


.. mchoice:: 8.8.2
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

  If vectors :code:`u` and :code:`n` are known, how can vector :code:`v` be calculated.

.. mchoice:: 8.8.3
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

