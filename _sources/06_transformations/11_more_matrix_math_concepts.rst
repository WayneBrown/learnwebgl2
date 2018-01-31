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


6.11 - More Matrix Math Concepts
::::::::::::::::::::::::::::::::

Before leaving the lessons on transformations, let's review some important
concepts related to matrix algebra.

Order Matters!
--------------

In mathematics, if a series of operations can be performed in any order,
we say the operations are "commutative." For example, the multiplication
of numbers is commutative because the multiplications can be done in any order.

.. Code-Block:: JavaScript

  // These 3 statements calculate the same answer.
  // Multiplication of numbers is commutative.
  a = 3 * 4 * 7 * 10;
  b = 10 * 7 * 4 * 3;
  c = 4 * 10 * 7 * 3;

**However, in matrix algebra, multiplication is NOT commutative**. The order
of the terms matter. If you change the order, you get a different result. For
example:

.. matrixeq:: Eq1

   [M1: 2,4;5,-3]*[M1: -4,3;-4,8] != [M1: -4,3;-4,8]*[M1: 2,4;5,-3]


Matrix Multiplication is Associative
------------------------------------

In mathematics, if a series of operations can be grouped in different ways
and you still get the same result, the operations are "associative." For example,
multiplication of numbers is associative because the order in which you perform the
operations does not matter.

.. Code-Block:: JavaScript

  // These 3 statements calculate the same answer.
  // Multiplication of numbers is associative.
  a = (3 * 4) * (7 * 10);
  b = 3 * ((4 * 7) * 10);
  c = ((3 * 4) * 7) * 10;

**In matrix algebra, multiplication is associative!** This means that no matter
which multiplications you perform first, second, or third, you get the same
result. For the following three example equations, if you performed the
multiplication in the parentheses first, you get the same
result for :code:`T`.

.. matrixeq:: Eq2

  T =  [M1: T1]*([M2: T2]*([M3: T3]*[M4: T4]))

.. matrixeq:: Eq3

  T = ([M1: T1]*[M2: T2])*([M3: T3]*[M4: T4])

.. matrixeq:: Eq4

  T = (([M1: T1]*[M2: T2])*[M3: T3])*[M4: T4])

The fact that multiplication of matrices is associative is what allows us
to combine a series of transformations into a single, 4-by-4 transformation
matrix. We could multiply a vertex by a series of individual matrices,
but this would be computationally expensive. We get a huge advantage in
rendering speed if we combine all of the transformations into a single transform.

Transformations Are Relative
----------------------------

Conceptually, a programmer must keep transformations separate because
each transform is actually processing a different model!
Let's explain that with an example. Suppose you have a model that is being
transformed by five different matrices like this:

.. matrixeq:: Eq5

  [M1: T1]*[M2: T2]*[M3: T3]*[M4: T4]*[M5: T5]*[M6: x;y;z;w] = [M7: x';y';z';w']

Conceptually, the matrix :code:`T5` is applied first to the model and now
the model has different values for each of its vertices. The matrix :code:`T4`
is now transforming the transformed model. This logic applies to each of the
succeeding multiplications. To make this idea more concrete, suppose that
transform :code:`T5` was a scaling
operation that is changing the model's vertices from units of feet to inches.
:code:`T5` would be this scaling matrix:

.. matrixeq:: Eq6

  T5 = [M1: 12,0,0,0;0,12,0,0;0,0,12,0;0,0,0,1]

Since :code:`T5` has changed the conceptual units of the model, all of the
other transforms must conceptually think in terms of feet, instead of in
inches, because they are now acting on the transformed model!

In summary, when you create a transformation matrix, you must consider the
transformations that have come before it. We will see more examples
of this when we study projection transforms.

Glossary
--------

.. glossary::

  commutative property
    the order that a math operation is performed does not
    affect the result. (e.g., :code:`3*7 == 7*3`). Matrix multiplication is **NOT** commutative.

  associative property
    the grouping of math operations does not affect the result of a calculation.
    (e.g. :code:`(3 + 4) + 5 == 3 + (4 + 5)`). Matrix multiplication is associative.

Self Assessment
---------------

.. mchoice:: 6.11.1
  :random:
  :answer_a: Usually not.
  :answer_b: Yes.
  :answer_c: No.
  :correct: a
  :feedback_a: Correct. There are special cases where the order does not matter, but they are rare cases. In general, order matters.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect. Basically correct, but there are special cases where this is true.

  When performing matrix multiplication, is :inline_matrixeq:`[M1]*[M2] == [M2]*[M1]` ?

.. mchoice:: 6.11.2
  :random:
  :answer_a: Always.
  :answer_b: Sometimes.
  :answer_c: No.
  :correct: a
  :feedback_a: Correct. Matrix multiplication is associative.
  :feedback_b: Incorrect. It is always true.
  :feedback_c: Incorrect.

  When performing matrix multiplication, is :raw-html:`<br>`
  :inline_matrixeq:`([M1]*[M2])*[M3] == [M1]*([M2]*[M3])` ?



.. index:: commutative, associative

