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

8.9 - Other Parametric Equations
::::::::::::::::::::::::::::::::

In this chapter you have studied two basic parametric equations that
can be used to describe motion:

.. Code-Block:: JavaScript

  // Simple linear motion with constant speed and no acceleration
  p = (1-t)*p1 + t*p2;  // where t varies from 0.0 to 1.0

  // Linear and non-linear motion with control of speed and acceleration
  p = (1-t)^3 * p0 + 3*t*(1-t)^2 * p1 + 3*(1-t)*t^2 * p2 + t^3 * p3;

Please note again that these are "weighted sums" of the control points and
they are both functions of a single parameter :code:`t`.

Many other parametric equations have been developed to describe "changes
over time." It is beyond the scope of this textbook to discuss them all,
but the following is a brief introduction to three such equations.
(Perhaps you might be interested in pursuing these ideas in more
depth at a future time.)

Four Point Parametric Equation
------------------------------

A "four point curve" passes through all of its control points and is defined
as:

.. Code-Block:: JavaScript

  p = ( -4.5*t^3 +    9*t^2 - 5.5*t + 1) * p0 +
      ( 13.5*t^3 - 22.5*t^2 +   9*t)     * p1 +
      (-13.5*t^3 +   18*t^2 - 4.5*t)     * p2 +
      (  4.5*t^3 -  4.5*t^2 +     t)     * p3;

The "four point curve" works well if you are only concerned with path
locations. Controlling speed and acceleration along such
a path is problematic.

B-spline Parametric Equation
----------------------------

B-splines is an abbreviated name for "basis splines," which are "splines" formulated
as parametric equations. The B-spline equation using four control points is:

.. Code-Block:: JavaScript

  p = (1/6)[(1-t)^3                   * p0 +
            (3*t^3 -6*t^2 + 4)        * p1 +
            (-3t^3 + 3*t^2 + 3*t + 1) * p2 +
            (t^3)                     * p3];

A B-spline path can be defined by as little as two control points or by many, many control
points. A B-spline path does not pass through any of its control points, but
the control points facilitate the chaining of paths while controlling
the speed and acceleration along the path.

NURBS (Non-rational Uniform B-splines)
--------------------------------------

There is only one type of parametric equation that can represent both
arbitrary curved paths and exact conics, such as circles, ellipses, and hyperbolas:
**non-rational uniform B-splines** (NURBS). They are "non-rational" because the
*basic functions* are represented as fractions. The *basis functions* are defined
recursively. For details please refer to the `Wikipedia page on NURBS`_.

Glossary
--------

.. glossary::

  four-point curve
    A path description that passes through each of its four control points.

  b-splines
    A path description that does not pass through any of its control points,
    but the placement of its control points facilitates the control
    of speed and acceleration along the path.

  conics
    A curve obtained as the intersection of the surface of a cone with a plane.
    The three types of conic sections are the hyperbola, the parabola, and the
    ellipse (including circles).

  NURBS
    A path description that can define exact conics and arbitrary curves.

.. index:: four-point curve, b-splines, NURBS

.. _Wikipedia page on NURBS: https://en.wikipedia.org/wiki/Non-uniform_rational_B-spline
