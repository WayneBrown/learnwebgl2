.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

.. role:: raw-html(raw)
  :format: html

13.3 - GLSL Control Structures
::::::::::::::::::::::::::::::

GLSL is based on of the C programming language and its *control structures*
are very similar to C.

Overall Execution
-----------------

A shader program is composed of one or more functions. Execution always begins
with the :code:`main` function which receives no parameters and returns no
value:

.. Code-Block:: GLSL

  void main(void) {
    // statement(s)
  }

There is no limit to the number of functions you can create. Functions
must be defined before they can be called. A function header defines a function's
name, its parameter list, and the data type of it's return value. For example:

.. Code-Block:: GLSL

  vec3 example(float x, bool beta) {
    // statement(s)
  }

defines a function called "example" that receives two values when it is called,
a floating point value and a Boolean value. It must return a vector of 3 floating
point values.

All parameters are "pass by value" by default. You can change this behavior
using these "parameter qualifiers":

* :code:`in`: "pass by value"; if the parameter's value is changed in the
  function, the actual parameter from the calling statement is unchanged.
* :code:`out`: "pass by reference"; the parameter is not initialized when
  the function is called; any changes in the parameter's value changes the
  actual parameter from the calling statement.
* :code:`inout`: the parameter's value is initialized by the calling
  statement and any changes made by the function change the actual
  parameter from the calling statement.

The following example demonstrates these parameter qualifiers:

.. Code-Block:: GLSL

  vec3 example(in float x, in bool beta, inout int gamma, out int theta) {
    // statement(s)
  }

  // Call example: 3.5 is copied into x,
  //               true is copied into beta,
  //               delta is copied into gamma, and
  //               chi is NOT copied into theta.
  vec3 phi = example(3.5, true, delta, chi);
  // After the call, the value of delta might be changed,
  //                 the value of chi has changed,
  //                 phi contains the returned value

Selection
---------

The :code:`if` statement allows statements to be executed or skipped based
on a Boolean test. They can be nested, as shown in the following examples:

.. Code-Block:: GLSL

  if (x <= 5) {
    // statement(s)
  }

  if (x <= 5) {
    // statement(s)
  } else {
    // statement(s)
  }

  if (j == 1) {
      // statement(s)
  } else {
      if (j == 2) {
          // statement(s)
      } else {
          if (j == 3) {
              // statement(s)
          } else {
              // statement(s)
          }
      }
  }

Selection statements are discouraged because "they can reduce the ability
to execute operations in parallel on 3D graphics processors" (`1`_).

::

  If your shaders must use branches, follow these recommendations:

  * Best performance: Branch on a constant known when the shader is compiled.
  * Acceptable: Branch on a uniform variable.
  * Potentially slow: Branch on a value computed inside the shader.

Iteration
---------

Repeating a group of statements can be done in one of three ways. These are
demonstrated in the following examples. If the loop control variable is
declared in the loop, its scope is limited to the loop. Loops can be nested.

.. Code-Block:: GLSL

  for (int j = 0; j < 5; j += 1)
    // statement(s)
  }

  int j = 0;
  while (j < 5) {
    // statement(s)
    j += 1;
  }

  int j = 0;
  do {
    // statement(s)
    j += 1;
  } while (j < 5);

The :code:`while` and :code:`do-while` loops are optional. The only loop
construct you are guaranteed to have is the :code:`for` loop. In addition,
there are many restrictions on the looping constructs. In general "control
flow is limited to loops where the maximum number of iterations can easily
be determined at compile time."

Restrictions on loops:

* There can only be **one** loop control variable of type int or float.
* The initialization of the :code:`for` statement must be of the form:

  .. Code-Block:: GLSL

    type-specifier identifier = constant-expression

  Consequently the loop control variable cannot be a global variable.

* The test for loop termination of the :code:`for` statement must have the form:

  .. Code-Block:: GLSL

    loop_control_variable   relational_operator   constant_expression

  where :code:`relational_operator` is one of: :code:`>`, :code:`>=`, :code:`<`,
  :code:`<=`, :code:`==`, or :code:`!=`

* The "update" of the loop control variable in the :code:`for` statement must have the form:

  .. Code-Block:: GLSL

    loop_control_variable++
    loop_control_variable--
    loop_control_variable += constant_expression
    loop_control_variable -= constant_expression

* The loop control variable can not be changed in the body of the loop.

Modifying Control Inside a Loop
-------------------------------

Inside a loop you can modify the flow of control with the following statements:

* :code:`break`: immediately terminates a loop and jumps to the first statement
  after the loop.
* :code:`continue`: skips any remaining statements in the loop and jumps to
  the next iteration of the loop.
* :code:`return`: immediately exits the current function, thus terminating
  the active loop.

Glossary
--------

.. glossary::

  control structures
    The statements in a language that determine the order of statement execution.

  GLSL function
    A set of related statements that perform a task and then return a value.

  :code:`in` function parameter
    A value sent to a function at the start of a function's execution.

  :code:`out` function parameter
    A variable that is changed by a function and sent back to the calling function.

  :code:`inout` function parameter
    A variable sent to a function and changed after the function's execution is finished.

  selection
    The determination of which statements to execute and which statements to skip.

  iteration
    The repeated execution of a set of statements.

.. index:: GLSL, control structures, GLSL function, function parameter, selection, iteration,
  for loop, if statement, main(), break, continue, return

.. _1: https://developer.apple.com/library/ios/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/BestPracticesforShaders/BestPracticesforShaders.html

