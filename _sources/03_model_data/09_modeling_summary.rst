..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

3.9 - Modeling Summary
::::::::::::::::::::::

In this chapter you have learned how to model virtual worlds. Before we
leave this chapter, let's summarize what you have learned.

.. admonition:: A model is

    a mathematical description of something.

To create a rendering of a virtual world, we will model the following
things in the following ways:

+----------------------+-------------------------------------+------------------------------------+
| To model ...         | The model consists of ...           | Common name ...                    |
+======================+=====================================+====================================+
| colors               | 4 floats; (red, green, blue, alpha) | RGBA                               |
+----------------------+-------------------------------------+------------------------------------+
| location             | 4 floats; (x, y, z, w)              | Cartesian homogeneous coordinates  |
+----------------------+-------------------------------------+------------------------------------+
| direction            | 3 floats; <dx, dy, dz>              | vector                             |
+----------------------+-------------------------------------+------------------------------------+
| volume               | a set of triangles, each defined by | triangular mesh                    |
|                      | 3 locations (i.e., vertices)        |                                    |
+----------------------+-------------------------------------+------------------------------------+
| lights               | location, color, type, etc.         |                                    |
+----------------------+-------------------------------------+------------------------------------+
| surfaces             | color(s), normal vectors, etc.      | texture map, bump map, etc.        |
+----------------------+-------------------------------------+------------------------------------+
| cameras              | location, 3 orthogonal axes         |                                    |
+----------------------+-------------------------------------+------------------------------------+

Rendering Lines
---------------

One final topic that we have not covered in this chapter is the rendering of lines.
This is useful if you want to draw a `wireframe`_ rendering of your model, or
outline a face with a border or highlight.

In WebGL you always define one or more lines using an array of vertices.
There are three different ways the vertices can be used to form lines,
as shown in the diagram below. The options are:

* :code:`LINES` - Two vertices for each line. If a vertex is needed for
  multiple lines, it must be repeated in the vertices array.
  Defining *n* lines requires *2n* vertices.
* :code:`LINE_STRIP` - After the initial two vertices, each additional vertex
  defines one more line. Defining *n* lines requires (*n* + 1) vertices.
* :code:`LINE_LOOP` - Identical to :code:`LINE_STRIP` with the addition of
  a line that connects the first and last vertex. Defining *n*
  lines requires *n* vertices.

.. figure:: figures/line_drawing_modes.png
  :align: center

  WebGL line drawing modes. (`1`_)

.. webgldemo:: W1
    :htmlprogram: _static/03_simple_pyramid/simple_pyramid.html

Glossary
--------

.. glossary::

   line
      A straight connection between two points.

   wireframe
      Rendering a model by displaying only the edges of each triangle.

Self Assessment
---------------

.. dragndrop:: models
  :match_1: color|||RGBA
  :match_2: location|||(x,y,z,w)
  :match_3: direction|||&#60;dx,dy,dz&#62;
  :match_4: volume|||triangular mesh
  :match_5: lights|||location, color, type, direction, etc.
  :match_6: surfaces|||texture maps, bump maps, etc.
  :match_7: cameras|||location and 3 orthogonal axes

  Match each of the following things on the left with the way they are modeled.


.. index:: line, wireframe, LINES, LINE_STRIP, LINE_LOOP


.. _wireframe: https://en.wikipedia.org/wiki/Wire-frame_model
.. _1: http://www.informit.com/articles/article.aspx?p=2111395&seqNum=2
