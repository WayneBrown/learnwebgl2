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

3.8 - Modeling Cameras
::::::::::::::::::::::

A virtual world is viewed through the lens of a virtual camera. A camera
is modeled using the following information:

* **location** :raw-html:`<br />`
  The location of the camera in the virtual world. This is modeled by a
  :code:`(x,y,z)` point relative to the global origin.
  :raw-html:`<br /> <br />`

* **orientation** :raw-html:`<br />`
  The orientation of the camera determines its line-of-sight and which
  direction is conceptually "up". This is modeled by defining a 3D local
  coordinate system defined by 3 orthogonal axes.
  :raw-html:`<br /> <br />`

* **projection** :raw-html:`<br />`
  The projection is how 3D world coordinates are mapped to a 2D image.
  The two most widely
  used projections are *orthogonal* and *perspective*. An orthogonal
  projection maintains angles and distances and is useful for engineering
  renderings. A perspective projection models the lens of a camera and
  mimics the way our eyes see the real world.


WebGL Implementation
--------------------

A virtual camera is implemented with a 4x4 transformation matrix that moves
objects to their desired location and orientation in front of a camera.
The transformation matrix is multiplied by an object's vertices in your *vertex shader*.
Modeling a camera and modeling a projection are typically done separately,
but they are typically combined into a single 4x4 transformation matrix.

Glossary
--------

.. glossary::

  virtual camera
    A model of a camera that allows a view of a virtual world from a specific
    location and orientation.

  projection
    A mathematical operation that projects a 3D world into a 2D image.

.. index:: virtual camera, projection
