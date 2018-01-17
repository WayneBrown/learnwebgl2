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

13.1 - WebGL Shader Language
::::::::::::::::::::::::::::

WebGL requires a *shader program* for the vertex and fragment
manipulation sections of the graphics pipeline. *Shader programs*
are written in GLSL (Graphics Library Shader Language). This chapter
provides a general introduction to GLSL.

The GLSL language has gone through many versions. You can see a list
of the versions on the `GLSL wikipedia page`_. WebGL 1.0 only supports GLSL 1.0.17.
(Remember that WebGL is based on OpenGL ES 2.0, which
was designed for computing devices with low power and limited processing.)
If you are searching the web for GLSL information and examples, it will
be common to find GLSL programs that will not work in WebGL programs because
of version issues. You must pay attention to GLSL versions.

Please don't confuse the WebGL JavaScript API that allows access to the
GPU's graphics pipeline with shader programs written in GLSL. They are both
related to the generation of 3D graphics in a browser, but they are very
different in purpose and syntax.

Overview of GLSL 1.0.17
-----------------------

The `GLSL 1.0 specification`_ is 113 pages. To be an expert in the
GLSL language you should study the entire specification. However, the following
lessons should provide most of what you need to know about GLSL.
The lessons cover:

* `Data types and variables`_
* `Control structures`_
* `Operators (Mathematical and Logical)`_
* `Built-in functions and variables`_
* `Compiling and linking`_

Glossary
--------

.. glossary::

  GLSL
    Graphics Library Shader Language

  shader program
    a set of instructions written in GLSL that executes on a GPU

.. index:: GLSL, shader program

References
----------

WebGL 1.0 API Quick Reference Card - https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf

A GLSL online manual (of sorts): http://www.shaderific.com/glsl/

.. _GLSL wikipedia page: https://en.wikipedia.org/wiki/OpenGL_Shading_Language
.. _GLSL 1.0 specification: documents/_GLSL_ES_Specification_1.0.17.pdf

.. _Data types and variables: 02_glsl_data_types.html
.. _Control structures: 03_glsl_control_structures.html
.. _Operators (Mathematical and Logical): 04_glsl_mathematical_operations.html
.. _Built-in functions and variables: 05_glsl_builtin_functions.html
.. _Compiling and linking: 06_glsl_compiling_and_linking.html