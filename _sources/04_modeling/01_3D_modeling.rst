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

4.1 - 3D Modeling
:::::::::::::::::

`3D modeling`_ is the process of developing a mathematical representation of
an object. The result is a **3D model** which
can be used for rendering 3D scenes or to prototype newly designed widgets.
Creating 3D models is an art that requires extensive training. In the
movie and game industries people often become experts at 3D modeling and that is
their sole job. The next time you watch a movie that contains CGI special
effects, notice the number of modelers that are listed in
the credits at the end of the film.

Note these characteristics of 3D models:

* The goal is to represent the 3D form of an object, so an object's surface
  is often the only thing that is modeled. There are
  exceptions, such as a model for simulating the inner workings of an engine.
  :raw-html:`<br /> <br />`

* A 3D model is typically a `polygonal mesh`_, which is a set of
  connected polygons. Polygons with more than 3 edges are converted to
  triangles for rendering. A *triangular mesh* is a polygonal mesh composed
  entirely of triangles.
  :raw-html:`<br /> <br />`

* The number of polygons used to represent the form of an object determines
  the accuracy of the model. More polygons means greater accuracy, but at
  the expense of more memory requirements and slower rendering.
  :raw-html:`<br /> <br />`

* The total number of triangles in a scene is often the deciding factor
  in whether the scene can be rendered in less than 1/30\ :sup:`th`  of a second.
  It is common to reduce the number of triangles in one model so that
  another model can have more.
  :raw-html:`<br /> <br />`

* A model is manipulated as a unit. If parts of an object move
  independently, then those parts must be modeled separately. For example,
  if you have a box with a lid that opens, this would be modeled as two separate
  objects - a five sided box and a lid.

Modeling Software
-----------------

There are many software applications designed to help a modeler create 3D
models. `Here is a partial list`_. Commercial modeling software can be very expensive.
For example, a single license for CATIA is $65,000 with an annual maintenance
fee of 18% (1_). We will use `Blender`_ for these tutorials, which is a free,
open-source modeling and animation program.

Glossary
--------

.. glossary::

  3D model
    a mathematical representation of an object.

  polygon
    a flat area enclosed by a set of connected boundary edges.

  polygonal mesh
    a group of polygons that define the surfaces of an object.

  triangular mesh
    a group of triangles that define the surfaces of an object.

  modeling software
    a software program that facilitates the creation of 3D models.

  modeler
    a person who creates 3D models.

  Blender
    an open-source, free modeling and animation tool.

Self Assessment
---------------

.. mchoice:: 4.1.1
  :random:
  :answer_a: For fast rendering, we only describe what is visible to the viewer.
  :answer_b: The surface is the object.
  :answer_c: The surface captures everything there is to know about a 3D object.
  :answer_d: Most modelers are just lazy.
  :correct: a
  :feedback_a: Correct. If some part of a object will never be rendered, then it is not typically modeled.
  :feedback_b: Incorrect. 3D objects are more than just their visible surfaces.
  :feedback_c: Incorrect. 3D objects are more than just their visible surfaces.
  :feedback_d: Incorrect. Modeling is actually precise, tedious, and hard work.

  Why does a 3D model typically only describe the 3D surfaces of an object?

.. mchoice:: 4.1.2
  :random:
  :answer_a: The total number of triangles in the scene.
  :answer_b: The distance the camera is from the scene's action.
  :answer_c: The number of colors used for the scene's models.
  :answer_d: The size of the triangles in the models.
  :correct: a
  :feedback_a: Correct. For example, your scene might be limited to 10 models with a 1,000 triangles each.
  :feedback_b: Incorrect. What is visible from the camera can impact the speed of a rendering, but it is typically not a limiting factor.
  :feedback_c: Incorrect. The number of colors used typically has no impact on the speed of rendering.
  :feedback_d: Incorrect. The physical size of individual triangles changes depending on the distance between an object and the camera. We typically don't worry about the triangle sizes.

  To create real-time renderings at 30 frames per second, what is typically one of the
  limiting factors on the models in the scene?

.. mchoice:: 4.1.3
  :random:
  :answer_a: 4
  :answer_b: 1
  :answer_c: 3
  :answer_d: 9
  :correct: a
  :feedback_a: Correct. Model the fish's body and then each individual fin.
  :feedback_b: Incorrect. If you model the entire fish as a single model, you will not be able to move the fins independently of the fish's body.
  :feedback_c: Incorrect. Three models for the fins, but what about the body of the fish?
  :feedback_d: Incorrect. How did you get 9?

  You are modeling a fish that has 3 fins, one on either side of its body and its tail fin.
  You want to animate the fish to simulate its swimming through water. How many models should you create?


.. index:: 3D model, polygonal mesh, triangular mesh, modeling software, modeler, Blender

.. _3D modeling: https://en.wikipedia.org/wiki/3D_modeling
.. _polygonal mesh: https://en.wikipedia.org/wiki/Polygon_mesh
.. _Here is a partial list: https://en.wikipedia.org/wiki/List_of_3D_modeling_software
.. _1: https://www.fictiv.com/resources/cad/list-of-cad-design-programs
.. _Blender: https://en.wikipedia.org/wiki/Blender_(software)
