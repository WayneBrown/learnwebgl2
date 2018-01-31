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

11.8 - Transformations on Texture Maps
======================================

*Texture coordinates* are often defined for a model and never modified. This
allows for the surface properties of a model to remain static, even while
the geometry of a model is being transformed in location, orientation, and scale.
But there are times when you would like a texture to move across a surface,
such as a surface that represents water in an ocean. The
water is constantly moving due to wind and other forces. This lesson introduces
the basic ideas behind *texture map* transformations.

Overview
--------

Transformations on 2D *texture coordinates* are identical to the
transformations applied to 3D geometry -- with the exception that there are
only 2 dimensions, :code:`(s,t)`, to modify. Therefore a *texture coordinate*
transformation matrix is 3-by-3 (instead of 4-by-4). The following table lists
the standard transformations and their associated matrices.

+----------------+----------------------------------------------------------------------------------------------------------------+
| Transformation | Transformation Matrix                                                                                          |
+================+================================================================================================================+
| Translate      | :inline_matrixeq:`[M1,white: 1,0,*tx; 0,1,*ty; 0,0,1]*[M2,white:s;t;1]`                                        |
+----------------+----------------------------------------------------------------------------------------------------------------+
| Rotate         | :inline_matrixeq:`[M1,white: *cos(angle),*-sin(angle),0; *sin(angle),*cos(angle),0; 0,0,1]*[M2,white:s;t;1]`   |
+----------------+----------------------------------------------------------------------------------------------------------------+
| Scale          | :inline_matrixeq:`[M1,white: *sx,0,0; 0,*sy,0; 0,0,1]*[M2,white:s;t;1]`                                        |
+----------------+----------------------------------------------------------------------------------------------------------------+

For this textbook, mathematical operations on 3-by-3 matrices are implemented in a JavaScript
class called :code:`GlMatrix3x3` which is in a file called :code:`_static/learn_webgl/glmatrix3x3.js`.
(Use the Chrome "development tools" to view or save a copy.)

In the GLSL language a :code:`mat3` data type holds a 3-by-3 matrix transformation
which is a 1D :code:`Float32Array` array organized in column-major order.

Remember that *texture coordinates* are percentage values in the range :code:`[0.0,1.0]`.
If a *texture coordinate* transformation causes the coordinate values to go outside
the bounds :code:`[0.0,1.0]` the "wrapping mode" for the texture determines how the
*texture coordinate* is interpreted. From lesson 11.4, the "wrapping modes" are:
:code:`gl.REPEAT`, :code:`gl.CLAMP_TO_EDGE`, and :code:`gl.MIRRORED_REPEAT`.
The easiest way to deal with transformed *texture coordinates* is to allow them
to be in any range while using a "tileable" image with the "wrapping modes" set
to :code:`gl.REPEAT`.

.. Code-Block:: JavaScript

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

.. figure:: figures/water.png
  :align: right

  :raw-html:`<style> span.caption-text { display: block; text-align: center} </style>`
  A "tileable" texture image [1]_

The 256x256 image to the right is a "tileable" image -- meaning its left
and right edges (and top and bottom edges) can meet with no discernible seam.

An Example
----------

The WebGL program below allows the image texture map on a plane to be translated,
rotated, and scaled. All of these transformations are performed by a single 3-by-3
transformation matrix. Consider the following before experimenting with the program.

* The *texture coordinates* for a model are stored in a *buffer object*
  in the GPU's memory and **that data never changes**. Each
  time the model is rendered, a *texture map* transformation matrix is set to a
  :code:`uniform` variable in the
  *shader program*. Each *texture coordinate* of the model is multiplied by
  this 3-by-3 transform in the *vertex shader*. The data is static; what is
  changing is the texture transformation matrix.
  :raw-html:`<br><br>`

* In the *vertex shader*, when you multiply a :code:`(s,t)` *texture coordinate* by
  a 3-by-3 transformation matrix you must change the :code:`(s,t)` value to :code:`(s,t,1)`.
  The 3rd component, :code:`1`, is the "homogeneous coordinate" for 2D coordinates.
  The value of :code:`1` allows for translation. If the *texture coordinate*
  is set to :code:`(s,t,0)`, it could be scaled and rotated, but not translated.
  :raw-html:`<br><br>`

* For this program the "animate" checkbox animates the texture map, not the model's geometry.

.. webglinteractive:: W1
  :htmlprogram: _static/11_transform_texture/transform_texture.html
  :editlist: _static/11_transform_texture/render_transform_texture.js, _static/11_transform_texture/transform_texture.vert, _static/11_transform_texture/transform_texture.frag

Summary
-------

Transforming a texture map is identical to transforming a 3D model, with the
except that transforming a 2D texture map is done in 2D space.

Transformations on a texture map are performed in the *vertex shader* (not per
fragment) so the impact on rendering speed is very minimal.

Glossary
--------

.. glossary::

  texture map transformation
    Change the location of *texture coordinates* at render-time using a 3-by-3
    transformation matrix that contains translation, rotation, and scaling.

  tileable texture map image
    An image that can be placed in tiles over a plane and the seams between
    individual tiles is not discernible.

  homogeneous coordinate
    An additional component to a point that extends the dimension of the point.
    For computer graphics, a homogeneous coordinate allows translation to be
    included in a transformation matrix.

.. index:: texture map transformation, tileable texture map image, homogeneous coordinate


.. [1] The original source for this image, http://www.rendertextures.com/seamless-water-13/, no longer exists.