..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

Derivative Rules
::::::::::::::::

Sum rule:

.. Code-block:: C

  d(t1 + t2 + t3 + ...)/dt = d(t1)/dt + d(t2)/dt + d(t3)/dt + ...

Difference rule:

.. Code-block:: C

  d(t1 - t2 - t3 - ...)/dt = d(t1)/dt - d(t2)/dt - d(t3)/dt - ...

The derivative of a constant is zero: (beacuse there is no change in the equation)

.. Code-block:: C

  d(c)/dt = 0

Multiplication by a constant:

.. Code-block:: C

  d(c*t)/dt = c*d(t)/dt

The derivative of a linear equation is the line's slope:

.. Code-block:: C

  d(c*t)/dt = c        or d(t)/dt = 1

The derivative of a polynomial is a polynomial of one-less degree.

.. Code-block:: C

  d(t^n)/dt = n*t^(n-1)




