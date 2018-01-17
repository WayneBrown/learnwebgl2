..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

8.2 - Parametric Equations
::::::::::::::::::::::::::

**Key frame** animations require an animator to specify "key" properties
of an object or a camera at "key" frames. Then the computer is required
to calculate intermediate values for the specific properties between the key frames.
*Parametric equations* are the ideal method for these calculations. A
parametric equation is a function of a single variable, which we typically call
:code:`t`. Think of :code:`t` as representing *time*. To be as generic as possible we
assume that :code:`t` varies between 0.0 and 1.0. You can always scale the results
to match any particular time interval.

Let's start off with a simple example that calculates points along a straight
line between two points, :code:`p1` and :code:`p2`. All intermediate points
between :code:`p1` and :code:`p2` can be calculated using a fractional
combination of the two points. The equation looks like this:

.. Code-Block:: JavaScript

  p = (1-t)*p1 + t*p2;  // where t varies from 0.0 to 1.0

Notice the following:

* When :code:`t = 0.0`, the equation becomes :code:`p = p1`.
* When :code:`t = 1.0`, the equation becomes :code:`p = p2`.
* When :code:`t = 0.25`, the equation becomes :code:`p = 0.75*p1 + 0.25*p2`.
  The point :code:`p` is 75% of :code:`p1`\ 's value and 25% of :code:`p2`\ 's value.
* :code:`t + (1-t)` is always equal to 1.0. This means we are always getting 100%
  of the two points. For any value of t, you are taking t% of :code:`p2` and the
  leftover percentage of :code:`p1`.
* For a straight line in 3D space, we are calculating 3 values but only
  varying a single parameter :code:`t`:

  * p\ :sub:`x` = (1-t)*p1\ :sub:`x` + t*p2\ :sub:`x`
  * p\ :sub:`y` = (1-t)*p1\ :sub:`y` + t*p2\ :sub:`y`
  * p\ :sub:`z` = (1-t)*p1\ :sub:`z` + t*p2\ :sub:`z`

Animating Anything
..................

You can vary any type of value using a parametric equation. For example,
let's vary the scale of a model from 3.0 to 5.0. The equation would be:

.. Code-Block:: JavaScript

  p = (1-t)*3.0 + t*5.0;  // where t varies from 0.0 to 1.0

Or, let's vary a normal vector from a vector aligned with the x axis,
:code:`<1,0,0>`, to a vector aligned with the y axis, :code:`<0,1,0>`. The
equations would be:

.. Code-Block:: JavaScript

  nx = (1-t)*1.0 + t*0.0;  // where t varies from 0.0 to 1.0
  ny = (1-t)*0.0 + t*1.0;  // where t varies from 0.0 to 1.0
  nz = (1-t)*0.0 + t*0.0;  // where t varies from 0.0 to 1.0

Rotations Using Parametric Equations
....................................

Calculating intermediate points around a circular path that is centered about
an arbitrary 3D point and about an arbitrary rotation vector is best
done with a matrix transformation. Since all rotation is about the origin, you
need to do the following three steps:

#. Translate the center point to the global origin.
#. Use a rotation transform to rotate about the axis of rotation.
#. Translate the center point back to its original position.

To vary the angle of rotation use a parametric equation.
For example, to vary an angle between 10 and 55 degrees, the parametric
equation would be:

.. Code-Block:: JavaScript

  angle = (1-t)*10.0 + t*55.0;  // where t varies from 0.0 to 1.0

WebGL Example Program
---------------------

Study the code in :code:`path.js` below. Notice that the parametric
parameter :code:`t` is calculated as a percentage between 0.0 and 1.0
of the total number of frames in the animation. The calculation is
on line 66. Experiment with the program and the code.

.. webglinteractive:: W1
  :htmlprogram: _static/08_animation/animate.html
  :editlist: _static/08_animation/path.js, _static/08_animation/animate_scene.js
  :hideoutput:
  :width: 300
  :height: 300


You might experiment with values for :code:`t` that are less than 0.0 or greater
than 1.0. In :code:`path.js`, remove the cascading :code:`if statement` that makes
sure the value for :code:`t` is between 0.0 and 1.0. The positions calculated along
the path are still along a straight line, but outside the initial starting and ending
locations. (You will have to click and drag the scene to rotate the view to see the
model.)

Glossary
--------

.. glossary::

  parametric equation
    Calculate an intermediate value based on a starting and ending value.
    Any particular intermediate value is defined by a single parameter *t*,
    which varies between 0.0 and 1.0.

Self Assessment
---------------

.. mchoice:: 8.2.1
  :random:
  :answer_a: "time"
  :answer_b: distance
  :answer_c: speed
  :answer_d: acceleration
  :correct: a
  :feedback_a: Correct. The answer is in quotes because the t value is normalized to a range from 0.0 to 1.0.
  :feedback_b: Incorrect. You could think of t as a percentage of distance, but it is more related to time.
  :feedback_c: Incorrect. Speed is the distance traveled over a set unit of time.
  :feedback_d: Incorrect. Acceleration is the change in speed.

  The parametric parameter, :code:`t`, is best thought of in terms of what property?

.. mchoice:: 8.2.2
  :random:
  :answer_a: (0, 0, 0)
  :answer_b: (10,0,0)
  :answer_c: (0.5, 0, 0);
  :answer_d: (0, 0, 0.5)
  :correct: a
  :feedback_a: Correct. You always get the starting point when t === 0.0.
  :feedback_b: Incorrect. You get the ending point when t === 1.0.
  :feedback_c: Incorrect. You would get the mid-point when t === 0.5.
  :feedback_d: Incorrect. This location is not on the path for any value of t.

  Given :code:`p1` at :code:`(0,0,0)` and :code:`p2` at :code:`(10,0,0)`, what is the intermediate
  point between them when :code:`t=0.0`?

.. mchoice:: 8.2.3
  :random:
  :answer_a: (10,0,0)
  :answer_b: (0, 0, 0)
  :answer_c: (0.5, 0, 0);
  :answer_d: (0, 0, 0.5)
  :correct: a
  :feedback_a: Correct. You always get the ending point when t === 1.0.
  :feedback_b: Incorrect. You get the starting point when t === 0.0.
  :feedback_c: Incorrect. You would get the mid-point when t === 0.5.
  :feedback_d: Incorrect. This location is not on the path for any value of t.

    Given :code:`p1` at :code:`(0,0,0)` and :code:`p2` at :code:`(10,0,0)`, what is the intermediate
  point between them when :code:`t=1.0`?

.. mchoice:: 8.2.4
  :random:
  :answer_a: (2, 0, 0)
  :answer_b: (2, 2, 2)
  :answer_c: (0.2, 0.4, 0.6)
  :answer_d: (0, 0, 2)
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. Make sure you use the correct component value for each point.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect. Make sure you use the correct component value for each point.

  Given :code:`p1` at :code:`(0,0,0)` and :code:`p2` at :code:`(10,0,0)`, what is the intermediate
  point between them when :code:`t=0.2`?


.. index:: parametric equations
