..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

6.3 - Translating
:::::::::::::::::

Translating a model changes the model's location. Translation does not affect the
model's size or orientation. Mathematically, translating is a simple
addition. Translating a vertex, :code:`(x, y, z)`, into a new location,
:code:`(x_new, y_new, z_new)`, is accomplished by adding a value to each component.
Let's call these translation values :code:`tx`, :code:`ty`, and :code:`tz`. In equation format,
translation is performed like this:

.. Code-block:: JavaScript

  x_new = x + tx;
  y_new = y + ty;
  z_new = z + tz;

Notice that translating by 0 leaves a component value unchanged.
Vertices are typically manipulated as a unit, so if you want to
translate along one axis and leave the other axes unchanged, use a
translation value of 0 for the unchanged axes.

Special Cases and Effects
-------------------------

There are no "special cases" for translation. Experiment with the following
example.

.. webgldemo:: W1
  :htmlprogram: _static/06_example05/translate.html


To negate (or undo) a translation operation, simply translate using a
negative :code:`(-tx, -ty, -tz)` translation. For example, if you translated a
model by :code:`(2, -3, 1)`, then translating by :code:`(-2, 3, -1)` puts it back
in its original location.

Glossary
--------

.. glossary::

  translate
    Change the location of a model.

Self Assessment
---------------

.. mchoice:: 6.3.1
  :random:
  :answer_a: addition
  :answer_b: multiplication
  :answer_c: division
  :answer_d: subtraction
  :correct: a
  :feedback_a: Correct. Addition is used for translation.
  :feedback_b: Incorrect. Multiplication performs scaling.
  :feedback_c: Incorrect. Division performs scaling.
  :feedback_d: Subtraction does perform translation, but we normally think of translation as pure addition. To move "backwards" you add a negative value.

  Translating a model requires a(n) _____________ operation on each vertex in the model.

.. mchoice:: 6.3.2
  :random:
  :answer_a: 3, 0, 0
  :answer_b: 3
  :answer_c: 0, 0, 3
  :answer_d: 1.5
  :correct: a
  :feedback_a: Correct. The x-axis component gets increased by 3 units and the y and z components do not change.
  :feedback_b: Incorrect. Translation acts on a vertex, which has 3 components. You need 3 translation values, even if 2 of the components are not changing.
  :feedback_c: Incorrect. This would move 3 units in the direction of the z axis.
  :feedback_d: Incorrect. Translation uses addition. (And you need 3 translation values, not just 1.)

  Translating a model 3 units in the direction of the x axis would use which translation values.

.. mchoice:: 6.3.3
  :random:
  :answer_a: dx, dy, dz
  :answer_b: dy, dz, dx
  :answer_c: 1, 2, 3
  :answer_d: tx, ty, tz
  :correct: a
  :feedback_a: Correct. You add the vector to every vertex in the model.
  :feedback_b: Incorrect. The values you add must be consistent with the vertex component values (x, y, z).
  :feedback_c: Incorrect. These values would move 1 unit in the x direction, 2 units in the y direction, and 3 units in the z direction, but this has nothing to do with the vector <dx, dy, dz>.
  :feedback_d: Incorrect. In general we have 3 translation values, and we generically call them tx, ty, and tz, but this has nothing to do with the vector <dx, dy, dz>.

  Translating a model in the direction of a vector <dx, dy, dz> would use what translation values?

.. index:: translate, translation


