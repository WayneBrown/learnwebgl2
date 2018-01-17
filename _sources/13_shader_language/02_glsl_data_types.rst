.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

13.2 - GLSL Data Types & Variables
::::::::::::::::::::::::::::::::::

GLSL allows for three basic types of data:

* :code:`bool`: Boolean values; :code:`true` or :code:`false`
* :code:`int`: integer values; whole numbers in a certain range, -n..n
* :code:`float`: floating point values; numbers with a fractional component

GLSL facilitates the manipulation of
vectors and matrices. A vector or matrix is always composed of values of the
same basic data type. If a data type starts with a :code:`b` it contains Boolean
values; if it starts with an :code:`i` it contains integer values; if it starts with
anything else it contains floating point values. The vector and matrix data
types are:

* :code:`bvec2`, :code:`bvec3`, :code:`bvec4`: 2, 3, and 4-component Boolean vectors
* :code:`ivec2`, :code:`ivec3`, :code:`ivec4`: 2, 3, and 4-component integer vectors
* :code:`vec2`, :code:`vec3`, :code:`vec4`: 2, 3, and 4-component floating point vectors
* :code:`mat2`, :code:`mat3`, :code:`mat4`: 2x2, 3x3, and 4x4 floating point matrices

There are three other specialized data types:

* :code:`sampler2D`: a reference to a TEXTURE_2D *texture unit* (which has an attached *texture object*)
* :code:`samplerCube`: a reference to a SAMPLER_CUBE *texture unit*
* :code:`void`: used to identify functions that do not return a value or
  parameter lists to a function that are empty.

Precision of :code:`int` and :code:`float` Data Types
-----------------------------------------------------

Most programming languages define the range of values that can be stored in
a specific data type. For example, an "int" in Java can store values in the
range -2,147,483,648(-2\ :sup:`31`) to 2,147,483,647 (2\ :sup:`31` -1). GLSL let's you pick from
three different precision levels for the basic data types.

The following precisions are minimum requirements. The GPU hardware can use
more precision if it wants to, but never less. If a GPU can't support a program's
requested precision, it will fail to compile. Don't worry too much about
the precision of data types, because this concept goes away in higher versions
of GLSL.

Boolean values do not have a precision. A boolean value is either :code:`true` or :code:`false`.

Integers can have one of three possible precisions:

+--------------+-------------------------------+---------------------------+
| precision    | Range of values               | Specific Range            |
+==============+===============================+===========================+
| lowp         | (-2\ :sup:`8`,2\ :sup:`8`)    | -256 ... +256             |
+--------------+-------------------------------+---------------------------+
| mediump      | (-2\ :sup:`10`,2\ :sup:`10`)  | -1024 ... +1024           |
+--------------+-------------------------------+---------------------------+
| highp        | (-2\ :sup:`16`,2\ :sup:`16`)  | -65,536 ... +65,536       |
+--------------+-------------------------------+---------------------------+

Floats can have one of three possible precisions:

+-----------+-------------------------------+---------------------------------+
| precision | Range of values               | Fractional accuracy             |
+===========+===============================+=================================+
| lowp      | (-2,2)                        | 2\ :sup:`-8` = 0.00390625       |
+-----------+-------------------------------+---------------------------------+
| mediump   | (-2\ :sup:`14`,2\ :sup:`14`)  | 2\ :sup:`-10` = 0.0009765625    |
+-----------+-------------------------------+---------------------------------+
| highp     | (-2\ :sup:`62`,2\ :sup:`62`)  | 2\ :sup:`-16` = 0.0000152587    |
+-----------+-------------------------------+---------------------------------+

Individual variables can have different precisions, or all variables of a
particular type can be the same precision using a "precision statement," such
as:

.. Code-Block:: GLSL

  precision highp int;
  precision mediump float;

Literals & Constant Values
--------------------------

Boolean constants are either :code:`true` or :code:`false`.

Integers can be specified in decimal, octal, or hexadecimal (base 10, 8, or 16),
base on their leading character. For example:

.. Code-Block:: GLSL

  int alpha = 176;   // base 10 starts with a non-zero digit
  int beta  = 0176;  // base 8 starts with 0
  int gamma = 0x176; // base 16 starts with 0x

Floats are specified using a series of digits that include a decimal point,
an exponent, or both. Floats are always in base 10. For example:

.. Code-Block:: GLSL

  float delta   = 1.;
  float epsilon = 0.3421;
  float phi     = 2e4;
  float theta   = 2.45e-2

Your can create constants using the :code:`const` storage qualifier.
The compiler guarantees that the value will not be changed during shader
execution. For example:

.. Code-Block:: GLSL

  const float pi = 3.141592653589793;
  const int number_lights = 5;

Variables
---------

Variable names must start with a letter, :code:`a-z,A-Z,` or the underscore character, :code:`_`.
A variable name can contain letters, :code:`a-z,A-Z`, digits, :code:`0-9`, and the
underscore character, :code:`_`. User variable names are not allowed to start
with :code:`gl_`.

All variables must be declared before they can be used.

Variables can be declared with, or without, an initialization value.

.. Code-Block:: GLSL

  float alpha;
  float beta = 5.0;

Storage Qualifiers
------------------

Some variable are used to pass data between the web browser and a *shader program*,
and between a *shader program* and *object buffers*. These special variables
must be designated with a "storage qualifier". (Variables that do not
have a "storage qualifier" are used for storing constants and performing
calculations.)

* :code:`uniform`: The variable is assigned a value from the JavaScript code before a
  :code:`gl.drawArrays()` call is made. The value is accessible in both
  the *vertex* and *fragment* shader.
* :code:`attribute`: The variable is assigned a value from a *object buffer* as
  a series of graphics primitives are rendered. The value is only accessible
  in the *vertex* shader.
* :code:`varying`: The variable is assigned a value by a *vertex shader* and automatically
  interpolated across the surface of a graphics primitive before a *fragment
  shader* receives it. The value can be used in a *fragment shader*, but not
  changed.

User Defined Aggregate Data Types
---------------------------------

You can create new data types that contain a combination of values. A :code:`struct`
data type can contain values of different data types. The :code:`array` data type
requires that all values in the array be of the same data type.

A :code:`struct` is a good way to organize values that logically go together. The
identifier after the keyword :code:`struct` is the structure name.

.. Code-Block:: GLSL

  struct my_light {
    float intensity;
    vec3 position;
    vec4 color;
  };

An :code:`array` is a good way to organize values that logically go together
if they all have the same data type. The size of the array must be a constant.
Array indexes are zero-subscripted. Individual elements of an array must be
assigned individually.

.. Code-Block:: GLSL

        float    frequencies[3];
  const int      numLights = 2;
        my_light lights[numLights];

  frequencies[0] = 0.23;
  frequencies[1] = 0.67;
  frequencies[2] = 0.82;

Vector Components
-----------------

The individual element of a vector can be accessed using array notation,
:code:`[2]`, or "dotted notation", :code:`.x`. The names of the vector components
are :code:`x,y,z,w`, or :code:`r,g,b,a`, or :code:`s,t,p,q`. You can use
any of these names on a vector, regardless of the actual data in the vector,
but the intent is to use :code:`x,y,z,w` when you are accessing geometric data,
:code:`r,g,b,a` when you are accessing color data, and :code:`s,t,p,q` when
you are accessing texture data. The array notation always
accesses a single component. The "dotted notation" returns either a single
component or a new vector depending on the number of field names that is
used. This is best explained by studying the following examples:

.. Code-Block:: GLSL

  vec3 alpha = vec3(1.0, 2.0, 3.0);
  vec4 a;
  vec3 b;
  vec2 c;
  float d;

  b = alpha.xyz;  // b is now (1.0, 2.0, 3.0)
  d = alpha[2];   // d is now 3.0
  a = alpha.xxxx; // a is now (1.0, 1.0, 1.0, 1.0)
  c = alpha.zx;   // c is now (3.0, 1.0)
  b = alpha.rgb;  // b is now (1.0, 2.0, 3.0)
  b = alpha.stp;  // b is now (1.0, 2.0, 3.0)
  a = alpha.yy;   // compiler error; the right hand side is a 2-component vector,
                  // while "a" is a 4-component vector.

Using multiple property names to create a new vector is called *swizzle* notation.
*Swizzle* notation can also be used on the left-hand side of an assignment statement,
with the exception that each field name can only be used once. This is best
explained by studying the following examples:

.. Code-Block:: GLSL

  alpha.xx  = vec2(10.0, 20.0)      // compiler error; can't use x twice
  alpha.zxy = vec3(3.0, 4.0, 5.0);  // alpha is now (4.0, 5.0, 3.0)
  alpha.zx  = vec2(10.0, 20.0)      // alpha is now (20.0, 5.0, 10.0)
  alpha.xyz = vec2(10.0, 20.0)      // compiler error; not enough values

Constructors and Data Type Conversions
--------------------------------------

You can convert one data type to another data type using a "cast", which is
a "call" to a conversion function that has the same name as the data type. Casting
is important because GLSL does not support equations with mixed data types.

.. Code-Block:: GLSL

  int a = 37;
  float b = float(a) * 2.3;

Constructors also have the same name as their associated data types. A call to a constructor
creates a value of the indicated data type and must be sent the correct number
of initial values, but those values can be any combination of variables that
contain the appropriate number of initialization values. Please study these
examples:

.. Code-Block:: GLSL

  vec3 alpha = vec3(1.0, 2.0, 3.0);
  vec4 beta = vec4(4.0, 5.0, 6.0, 7.0);

  vec3 delta = vec3(alpha.xy, beta.w);   // delta is now (1.0, 2.0, 7.0)
  vec4 gamma = vec4(alpha[2], beta.rrr); // gamma is now (3.0, 4.0, 4.0, 4.0)

Glossary
--------

.. glossary::

  data type
    The description of a memory location that specifies three things: 1) the
    number of bits used to represent a value, 2) the meaning of the bits, and
    3) the valid operations that can be performed on the bits.

  integer
    A whole number, e.g., -5, 37, 0

  float
    A number that can represent fractions, e.g., 2.1, -6.74

  precision
    The number of bits used to represent a value. The number of bits determines
    the possible range of values.

  constant
    A value that never changes after its initial assignment.

  variable
    A memory location whose value can change as a program executes.

  storage qualifier
    Designates certain variables for special uses. These variables are used
    to exchange data between CPU and GPU components.

  swizzle notation
    The use of a vector's property names to access and create new vectors.

  cast
    An operation that changes the data type of a value.

  constructor
    An operation that creates and initializes a variable of a particular data type.

.. index:: GLSL, data type, integer, float, precision, constant, variable, storage qualifier, uniform, attribute, varying, struct, array, swizzle notation, cast, constructor


