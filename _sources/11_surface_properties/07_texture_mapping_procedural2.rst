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

11.7 - Procedural Texture Mapping (2)
:::::::::::::::::::::::::::::::::::::

*Texture maps* that simulate the surfaces of real world objects such
as cloth, wood, marble, and water can be created with just the right
mixture of gradients, patterns, and noise combined at different scales.
However, finding the correct mixture for a specific "look and feel" is non-trivial.
The job of a "texture designer" is to find the right combination of these methods for
a specific situation.
Take special note of the "visual effects artists" in the trailing credits of any
movie that contains computer graphics imagery (CGI).
It takes very talented people who have both technical and artistic talents to
design *procedural texture maps*.

This lesson introduces some resources for further investigation
into *procedural texture maps*. If this topic has peeked your interest then
these resources would be a good place to start additional studies. However, if you
are using this textbook for a course, you should probably skip this lesson and
return to it at a later time.

Shadershop
----------

Toby Schachman has created a very cool tool called **Shadershop**. It allows
you to combine functions in interesting ways and see the results in both
visual and equation format. A description and video tutorials for
Shadershop can be found at http://tobyschachman.com/Shadershop/. The actual
tool is web based and can be used at http://www.cdglabs.org/Shadershop/.

There are many ways to combine functions and Shadershop will help you
better understand the possibilities. For example:

* add functions, :code:`f1(x) + f2(x)`
* multiply functions, :code:`f1(x) * f2(x)`
* compose functions, :code:`f1( f2(x) )`
* minimum, :code:`min(f1(x), f2(x))`
* maximum, :code:`max(f1(x), f2(x))`

where :code:`f1(x)` and :code:`f2(x)` can be any function from a large
set of possibilities, such as :code:`sin()`, :code:`floor()`, :code:`abs()`, etc.

Useful Functions
----------------

Several researchers have created lists of foundational functions for the generation
of patterns. Check some of them out:

* Golan Levin :

  * Polynomials : http://www.flong.com/texts/code/shapers_poly/
  * Exponential : http://www.flong.com/texts/code/shapers_exp
  * Circular & Elliptical : http://www.flong.com/texts/code/shapers_circ
  * Bezier and Parametric : http://www.flong.com/texts/code/shapers_bez

* Inigo Quilez : http://www.iquilezles.org/www/articles/functions/functions.htm

* Jari Komppa : http://sol.gfxile.net/interpolation/index.html

Graph Toy
---------

Another nice visualization tool for complex functions is Inigo Quilez's
"Graph Toy" at http://www.iquilezles.org/apps/graphtoy/. Note that you
can enter any complex equation into each of 6 function edit boxes and
plot them on top of each other.

Book of Shaders
---------------

Patricio Gonzalez Vivo has created an excellent interactive textbook on
shaders called `The Book of Shaders`_. It will take you significant time to
work through the entire book, but it has great content.

Other Resources
---------------

* A lesson on OpenGL ES shaders: :raw-html:`<br>`
  https://www.raywenderlich.com/70208/opengl-es-pixel-shaders-tutorial

* A series of lessons on surface properties and shaders: :raw-html:`<br>`
  http://content.udacity-data.com/cs291/notes/UdacityLesson9ShaderProgramming.pdf

* An amazing example (with source code): :raw-html:`<br>`
  http://reindernijhoff.net/2015/05/rendering-a-planet-with-two-triangles/

* WebGL halftone shader: :raw-html:`<br>`
  http://webstaff.itn.liu.se/~stegu/webglshadertutorial/shadertutorial.html

* Beyond Programmable Shading (SIGGRAPH course on things more advanced than
  programmable *shader programs*) :raw-html:`<br>`
  http://bps12.idav.ucdavis.edu/


.. index:: Shadershop, functions for patterns, The Book of Shaders

.. _The Book of Shaders: http://patriciogonzalezvivo.com/2015/thebookofshaders/
