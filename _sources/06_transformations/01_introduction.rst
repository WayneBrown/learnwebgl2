..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

6.1 - Introduction to Transformations
:::::::::::::::::::::::::::::::::::::

Previous lessons have described virtual objects,
both their geometry and their appearance (i.e., their surface properties).
Fundamental to all computer graphics is the ability to manipulate the shape of
these objects and to create motion in a scene over time. The lessons in this
chapter explain how to transform an object's shape, location and orientation.
This is where computer graphics really gets fun!

Basic Transformations
---------------------

There are three basic transformations used in computer graphics:

* translate (move)
* scale (shrink, enlarge or mirror)
* rotate (about an axis)

We will discuss the details of each transformation in the following
lessons, but first let's discuss how these transformations are similar.
These three transformations retain the basic properties of a model. After
applying any of these transformations, or any combination of these
transformations, the following will be true:

* Parallel lines will still be parallel.
* Points that formed a line before a transformation still form a line after the transformation.
* The ratio of distances is maintained. The midpoint of a line before
  transformation remains the midpoint of the line after transformation.

Mathematicians call a transformation with these properties an
**affine transformation**. What is really important about such transformations is
this: we don't have to apply the transformation to every location in a model.
If we apply the transformation to the three vertices of a triangle, all
of the surface points on the interior of the triangle are transformed
correctly. This is huge! It makes 3D, real-time computer graphics possible.

So let's summarize. **We can transform a model by manipulating only its
vertices!** This fact drives the overall structure of a WebGL *shader program*.
A WebGL shader program contains two parts, a *vertex shader* that manipulates the
vertices of a model definition, and a *fragment shader* that assigns a color
to every pixel that defines a point, a line, or a triangle.

Glossary
--------

.. glossary::

  transformation
    A manipulation of a model to change its shape, location, or orientation.

  translate
    Change the location of a model.

  scale
    Change the size of a model. (And its location if it is not centered at the origin.)

  rotate
    Change the orientation of a model. (And its location if it is not centerd at the origin.)

  affine transformation
    A transformation of a model that can be performed by only manipulating the model's vertices.

Self Assessment
---------------

.. mchoice:: 6.1.1
  :random:
  :answer_a: translate
  :answer_b: scale
  :answer_c: rotate
  :correct: a,b,c
  :feedback_a: Correct. Changing location is fundamentally what translate does.
  :feedback_b: Correct. Changing location is a side-effect of scaling if the object is not centered at the origin.
  :feedback_c: Correct. Changing location is a side-effect of rotation if the object is not centered at the origin.

  Which of these transformations will change the location of an object if
  it is not centered at the origin? (Select all that apply.)

.. mchoice:: 6.1.2
  :random:
  :answer_a: They can be applied to only the vertices of a model and the entire model is transformed as expected.
  :answer_b: They allow a models' size to be manipulated.
  :answer_c: There is only three basic transformations which makes transformations less complex.
  :answer_d: They are simple to understand.
  :correct: a
  :feedback_a: Correct. We can transform an entire triangle by the transformation of just its three vertices.
  :feedback_b: Incorrect. This is true, but it is not the most important aspect.
  :feedback_c: Incorrect. There are actually other transformations in addition to the three listed, but beyond that, the three transformations can be combined in interesting ways to produce complex motion.
  :feedback_d: Incorrect. This is true, but it is not the most important aspect.

  What is the most important aspect of affine transformations?

.. mchoice:: 6.1.3
  :random:
  :answer_a: Parallel lines will still be parallel.
  :answer_b: Straight lines remain straight lines.
  :answer_c: The ratio of distances is maintained.
  :answer_d: The size and orientation of a model are unchanged.
  :correct: a,b,c
  :feedback_a: Correct.
  :feedback_b: Correct.
  :feedback_c: Correct.
  :feedback_d: Incorrect. One of the purposes of affine transformations is to change the size and orientation of a model.

  Which of these are properties of affine transformations? (Select all that apply.)


.. index:: transformation, scale, translate, rotate, affine transformation

