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

8.6 - Bezier Non-linear Path
::::::::::::::::::::::::::::

If the control points of a Bezier parametric equation are not co-linear,
the path it defines is non-linear. The path does not pass through the intermediate
control points, but moves towards them. The path that is created
is always inside the convex hull defined by the four control points.

.. admonition:: Convex Hull

  Given a set of points in 3D space, if you wrapped the points in
  cellophane and stretch the cellophane tight around the points, you would have
  the *convex hull* of the point set. It is the smalled area that contains all of the
  points and a line segment between any two of the points is totally
  contained inside the *convex hull*.

The following WebGL program defines a Bezier path using four non-linear
control points. You can change the path by editing the point definitions
in lines 46-49 of the code or by scaling the vectors defined by the
intermediate control points. Experiment by modifying the path's control points.

.. webglinteractive:: W1
  :htmlprogram: _static/08_bezier_curve/bezier_curve.html
  :editlist: _static/08_bezier_curve/bezier_curve.js, _static/08_bezier_curve/bezier_curve_scene.js
  :hideoutput:
  :width: 300
  :height: 300



.. admonition:: Summary

  If the control points of a Bezier parametric equation are not co-linear,
  the resulting path will be curved, such that the path lies inside the
  convex hull defined by the four control points. The intermediate points,
  :code:`p1` and :code:`p2`, "attract" the curve, but the path does not pass
  through them.

Glossary
--------

.. glossary::

  Bezier parametric equation
    A function of one variable, :code:`t`, that calculates changes along a "path".

Self Assessment
---------------

.. mchoice:: 8.6.1
  :random:
  :answer_a: Only if the four points are co-linear.
  :answer_b: true.
  :answer_c: false.
  :correct: a
  :feedback_a: Correct. If the four points do not define a straight line segment, only the first and last point are on the path.
  :feedback_b: Incorrect. It only passes through the intermediate control points if all four points are co-linear.
  :feedback_c: Partially correct, but the path does pass through the control points if they define a straight line segment.

  The path defined by a Bezier parametric equation always passed through its four control points?

.. mchoice:: 8.6.2
  :random:
  :answer_a: true
  :answer_b: false
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect.

  The path defined by a Bezier parametric equation lies entirely inside the convex hull defines by its control points.

.. mchoice:: 8.6.3
  :random:

  To create a Bezier parametric equation that defines constant speed (no acceleration) along a path
  requires which of the following criteria, even when the path is non-linear?

  - the length of the vectors :raw-html:`&lt;` p1-p0 :raw-html:`&gt;`, :raw-html:`&lt;` p2-p1 :raw-html:`&gt;`, and :raw-html:`&lt;` p3-p2 :raw-html:`&gt;` must be equal.

    + Correct. If the three vectors have the same length, the path defines constant speed.

  - the control points must be co-linear.

    - Incorrect. This makes the path linear, but there are many possibilities for the speed (as lesson 8.4 explains).

  - the length of the vectors :raw-html:`&lt;` p1-p0 :raw-html:`&gt;` and :raw-html:`&lt;` p3-p2 :raw-html:`&gt;` must be equal.

    - Incorrect. This makes the speed and acceleration symmetrical at the beginning and ending of the path, but it does not make the speed constant.

  - the number of frames must be equal to the number of changes in the parameter t.

    - Incorrect. This is a nonsensical statement.


.. index:: Bezier parametric equation, curved paths

