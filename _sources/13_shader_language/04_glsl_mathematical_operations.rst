.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

13.4 - GLSL Operators (Mathematical & Logical)
::::::::::::::::::::::::::::::::::::::::::::::

GLSL is designed for efficient vector and matrix processing. Therefore almost
all of its operators are overloaded to perform standard vector and
matrix operations as defined in *linear algebra*.
In cases where an operation is not defined in linear algebra,
the operation is typically done *component-wise*, where the operation
is performed on each individual element of the vector or matrix.

Almost all math operators work on both :code:`float` and :code:`int` data types,
but not in the same expression. GLSL does not perform any automatic casting
of data types. Therefore, make sure all of the operands in an expression
are of the same data type. Here are some examples of invalid
*mixed mode* expressions:

.. Code-Block:: GLSL

  float a = 3 * 0.7;            // Error. The 3 is an integer. Make it 3.0
  int b = 10.0 * 0.7;           // Error. You can't assign a float to an integer.
  b = int(10.0 * 0.7);          // Valid
  vec3 c = vec3(1.0, 2.0, 3.0);
  ivec3 d = ivec3(1,2,3);
  vec3 e = c + d;               // Error. You can't add floats and integers.

Vector algebra operations require that the operands be of the same size.
For example, you can add two :code:`vec3`'s together, but not a :code:`vec3`
and a :code:`vec4`. The result of a vector operation is always the
same size as the original operands (except in the cases where a scalar and
a vector are used.)

GLSL only supports square matrices, so the size of two matrices must be equal
to multiply them together. A vector is treated as either a row or column
vector whenever it is multiplied by a matrix, whichever makes the operation
correct. You do **NOT** have to transpose a vector as you would in normal
matrix algebra.

The GLSL compiler optimizes your code for execution. Therefore, don't
make overly complex equations and think you are somehow making the code
faster. A series of well documented equations is preferable over a single,
hard to understand, equation.

GLSL Operators
--------------

The table below lists the GLSL operators in precedence order and
shows the type of overloaded operations they can perform. The examples use
the following variables. The term "scalar" means "non-vector" or "single value".

.. Code-Block:: GLSL

  bool  b;  // scalar
  int   i;  // scalar
  float f;  // scalar
  bvec2 bv; // Or bvec3, bvec4 (Boolean vector)
  ivec2 iv; // Or ivec3, ivec4 (integer vector)
  vec2  v;  // Or vec3, vec4   (floating point vector)
  mat2  m;  // Or mat3, mat4   (floating point matrix)

+----+-------+-----------------------------+-------------+---------------------+
| #  | OP    | Description                 | Examples    | Type of operation   |
+====+=======+=============================+=============+=====================+
| 1  | ( )   | grouping                    | ( )         |                     |
+----+-------+-----------------------------+-------------+---------------------+
| 2  | | [ ] | | array subscript           | | v[2]      | |                   |
|    | | ( ) | | function call             | | func( )   | |                   |
|    | | .   | | field selector, swizzle   | | v.xyz     | |                   |
|    | | ++  | | postfix increment         | | i++       | | scalar            |
|    | | - - | | postfix decrement         | | f++       | | scalar            |
|    | |     | |                           | | iv++      | | component-wise    |
|    | |     | |                           | | v++       | | component-wise    |
|    | |     | |                           | | m++       | | component-wise    |
+----+-------+-----------------------------+-------------+---------------------+
| 3  | | ++  | | prefix increment          | | ++i       | | scalar            |
|    | | - - | | prefix decrement          | | ++f       | | scalar            |
|    | |     | |                           | | ++iv      | | component-wise    |
|    | |     | |                           | | ++v       | | component-wise    |
|    | |     | |                           | | ++m       | | component-wise    |
|    | |     | |                           | |           | |                   |
|    | | +   | | unary + (positive value)  | | -i        | | scalar            |
|    | | -   | | unary - (negative value)  | | -f        | | scalar            |
|    | |     | |                           | | -iv       | | component-wise    |
|    | |     | |                           | | -v        | | component-wise    |
|    | |     | |                           | | -m        | | component-wise    |
|    | |     | |                           | |           | |                   |
|    | | !   | | Boolean negation          | | !b        | | bool              |
+----+-------+-----------------------------+-------------+---------------------+
| 4  | | \*  | | multiply                  | | i \* i    | | scalar            |
|    | |     | |                           | | f \* f    | | scalar            |
|    | |     | |                           | | v \* v    | | component-wise    |
|    | |     | |                           | | iv \* iv  | | component-wise    |
|    | |     | |                           | | i \* iv   | | component-wise    |
|    | |     | |                           | | f \* v    | | component-wise    |
|    | |     | |                           | | f \* m    | | component-wise    |
|    | |     | |                           | | v \* m    | | linear algebra    |
|    | |     | |                           | | m \* v    | | linear algebra    |
|    | |     | |                           | | m \* m    | | linear algebra    |
|    | |     | |                           | |           | |                   |
|    | | /   | | division                  | | i / i     | | scalar            |
|    | |     | |                           | | f / f     | | scalar            |
|    | |     | |                           | | v / v     | | component-wise    |
|    | |     | |                           | | iv / iv   | | component-wise    |
|    | |     | |                           | | iv / i    | | component-wise    |
|    | |     | |                           | | v / f     | | component-wise    |
|    | |     | |                           | | m / f     | | component-wise    |
+----+-------+-----------------------------+-------------+---------------------+
| 5  | | +   | | addition                  | | i + i     | | scalar            |
|    | | -   | | subtraction               | | f + f     | | scalar            |
|    |       |                             | | iv + iv   | | component-wise    |
|    |       |                             | | v + v     | | component-wise    |
|    |       |                             | | m + m     | | component-wise    |
+----+-------+-----------------------------+-------------+---------------------+
| 7  | | <   | | less than                 | | i < i     | | bool              |
|    | | >   | | greater than              | | f < f     | | bool              |
|    | | <=  | | less than or equal to     | |           | |                   |
|    | | >=  | | greater than or equal to  | |           | |                   |
+----+-------+-----------------------------+-------------+---------------------+
| 8  | | ==  | | equality                  | | i == i    | | bool              |
|    | | !=  | | not equality              | | f == f    | | bool              |
|    | |     | |                           | | bv == bv  | | bool              |
|    | |     | |                           | | iv == iv  | | bool              |
|    | |     | |                           | | v == v    | | bool              |
|    | |     | |                           | | m == m    | | bool              |
+----+-------+-----------------------------+-------------+---------------------+
| 12 | | &&  | | logical AND               | | b && b    | | bool              |
+----+-------+-----------------------------+-------------+---------------------+
| 13 | | ^^  | | logical EXCLUSIVE OR      | | b ^^ b    | | bool              |
+----+-------+-----------------------------+-------------+---------------------+
| 14 | | ||  | | logical INCLUSIVE OR      | | b || b    | | bool              |
+----+-------+-----------------------------+-------------+---------------------+
| 15 | | ?:  | | selection                 | | b ? n : m | | returns n if b    |
+----+-------+-----------------------------+-------------+---------------------+
| 16 | | =   | | assignment                | | b = b     | | bool              |
|    | |     | |                           | | i = i     | | scalar            |
|    | |     | |                           | | f = f     | | scalar            |
|    | |     | |                           | | bv = bv   | | vector            |
|    | |     | |                           | | iv = iv   | | vector            |
|    | |     | |                           | | v = v     | | vector            |
|    | |     | |                           | | m = m     | | matrix            |
|    | |     | |                           | |           | |                   |
|    | | +=  | | addition assignment       | | i += i    | | scalar            |
|    | | -=  | | subtraction assignment    | | f += f    | | scalar            |
|    | |     | |                           | | iv += iv  | | component-wise    |
|    | |     | |                           | | v += v    | | component-wise    |
|    | |     | |                           | | m += m    | | component-wise    |
|    | |     | |                           | |           | |                   |
|    | | \*= | | multiplication assignment | | i \*= i   | | scalar            |
|    | |     | |                           | | f \*= f   | | scalar            |
|    | |     | |                           | | v \*= v   | | component-wise    |
|    | |     | |                           | | iv \*= iv | | component-wise    |
|    | |     | |                           | | v \*= f   | | component-wise    |
|    | |     | |                           | | iv \*= i  | | component-wise    |
|    | |     | |                           | | m \*= f   | | component-wise    |
|    | |     | |                           | |           | |                   |
|    | | /=  | | division assignment       | | i /= i    | | scalar            |
|    | |     | |                           | | f /= f    | | scalar            |
|    | |     | |                           | | v /= v    | | component-wise    |
|    | |     | |                           | | iv /= iv  | | component-wise    |
|    | |     | |                           | | iv /= i   | | component-wise    |
|    | |     | |                           | | v /= f    | | component-wise    |
|    | |     | |                           | | m /= f    | | component-wise    |
+----+-------+-----------------------------+-------------+---------------------+
| 17 | | ,   | | sequence                  | |           | |                   |
+----+-------+-----------------------------+-------------+---------------------+

Notice that the precedence values in the left column of the above table are
not sequential. This is because the designers of GLSL have reserved some operators
for future versions. The reserved operators are:

+----+-------+-----------------------------+-------------+---------------------+
| #  | OP    | Description                 | Examples    | Type of operation   |
+====+=======+=============================+=============+=====================+
| 4  | | %   | |  modulus (reserved)       |             | | (not implemented) |
+----+-------+-----------------------------+-------------+---------------------+
| 6  | | <<  | | bitwise shift (reserved)  |             | | (not implemented) |
|    | | >>  | | bitwise shift (reserved)  |             | | (not implemented) |
+----+-------+-----------------------------+-------------+---------------------+
| 9  | | &   | | bit-wise AND (reserved)   |             | | (not implemented) |
+----+-------+-----------------------------+-------------+---------------------+
| 10 | | ^   | | bit-wise EXCLUSIVE OR     |             | | (not implemented) |
+----+-------+-----------------------------+-------------+---------------------+
| 11 | | \|  | | bit-wise INCLUSIVE OR     |             | | (not implemented) |
+----+-------+-----------------------------+-------------+---------------------+
