..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

Matrix Transpose Is Its Inverse
:::::::::::::::::::::::::::::::

In the case where the rows (or columns) of a matrix define vectors that
are orthogonal, the inverse of the matrix is identical to its transpose.
This is very simple to prove using the following matrix:

.. matrixeq:: Eq1

   [M1: ux, uy, uz, 0; vx, vy, vz, 0; nx, ny, nz, 0; 0, 0, 0, 1]

Let's assume the vectors, :code:`<ux,uy,yz>`, :code:`<vx,vy,vz>`, and :code:`<nx,ny,nz>`
are orthogonal (at right angles) to each other. If you take the :code:`dot product`
of two orthogonal vectors the result is 0.0 because the :code:`dot product` calculates
the *cosine* of the angle between the vectors, and the :code:`cos(90)` is 0.0.
In addition, the :code:`dot product` of a vector times itself is always 1.0 because
the :code:`cos(0)` is 1.0. To summarize:

.. Code-block:: JavaScript

   dotProduct(<u>, <v>) === 0.0
   dotProduct(<v>, <n>) === 0.0
   dotProduct(<n>, <u>) === 0.0

   dotProduct(<u>, <u>) === 1.0
   dotProduct(<v>, <v>) === 1.0
   dotProduct(<n>, <n>) === 1.0

Notice what happens when you multiple the matrix in Eq1 with its transpose.
(Perform the multiplication by clicking on the multiplication sign, :code:`*`.

.. matrixeq:: Eq2

   [M1: ux, uy, uz, 0; vx, vy, vz, 0; nx, ny, nz, 0; 0, 0, 0, 1] * [M1: ux, vx, nx, 0; uy, vy, ny, 0; uz, vz, nz, 0; 0, 0, 0, 1]

Each term of the multiplication is identical to a :code:`dot product` of
two vectors, and we know the results of the calculations because the vectors
are orthogonal. Therefore, we have

.. matrixeq:: Eq3

   [M1: ux, uy, uz, 0; vx, vy, vz, 0; nx, ny, nz, 0; 0, 0, 0, 1] *
   [M2: ux, vx, nx, 0; uy, vy, ny, 0; uz, vz, nz, 0; 0, 0, 0, 1] ===
   [M3: 1, 0, 0, 0; 0, 1, 0, 0; 0, 0, 1, 0; 0, 0, 0, 1]

which demonstrates that the transpose of our original matrix is its inverse --
since the result of their multiplication is the identity matrix. Note that the
order of multiplication does not matter, as in the equation:

.. matrixeq:: Eq4

   [M2: ux, vx, nx, 0; uy, vy, ny, 0; uz, vz, nz, 0; 0, 0, 0, 1] *
   [M1: ux, uy, uz, 0; vx, vy, vz, 0; nx, ny, nz, 0; 0, 0, 0, 1] ===
   [M2: 1, 0, 0, 0; 0, 1, 0, 0; 0, 0, 1, 0; 0, 0, 0, 1]


