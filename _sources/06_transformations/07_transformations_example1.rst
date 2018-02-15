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

6.7 - Using :code:`GlMatrix4x4` - A Robot Arm
:::::::::::::::::::::::::::::::::::::::::::::

This lesson introduces an example WebGL program that uses the :code:`GlMatrix4x4`
JavaScript class to create and manipulate transformation matrices. Before the
example program is explained, let's review how the *graphics pipeline* works.

.. figure:: figures/pipeline.png
  :scale: 75%
  :alt: Graphics pipeline
  :align: right

  The Graphics Pipeline :raw-html:`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`

A Review of the Graphics Pipeline
---------------------------------

In the first stage of the *graphics pipeline*, vertices
are passed through a *vertex shader program* to position and orient models in
a scene. Notice that the second stage clips away everything that is outside
the view of the scene's virtual camera. Therefore, a *vertex shader program*
needs to accomplish the following tasks:

#. *Model Transform*: Transform a model into it's correct size, location, and
   orientation for the current scene.

#. *View Transform*: Transform a model into the correct location and orientation
   in front of the scene's virtual camera.

#. *Projection Transform*: Transform a model into *normalized device coordinates*
   to facilitate clipping, which discards anything outside the view frame of
   the scene's camera. (The *projection* also "projects" a 3D world into a 2D view.)

It is important that you understand the following "big ideas":

* Each of these *transformation* operations can be performed by multiplying
  the vertices of a model by a 4-by-4 matrix.

* You must **always** include **all** of these transformations. They are not optional!

* There are too many details to discuss all of these transforms at the same
  time. This lesson concentrates on the *model transform*. The other
  transforms will be fully explained in later lessons.

It is common practice to combine the *model*, *view*, and *projection* transformations
into a single 4-by-4 transformation matrix which minimizes the calculations a
*vertex shader* program must execute. The example WebGL program below creates
such a combined transform. Remember that transformations must be ordered from
right to left. Every WebGL program you ever develop will create a vertex
transformation matrix like this:

.. matrixeq:: Eq1

  [M4: VertexTransform] = [M1: ProjectionMatrix]*[M2: ViewMatrix]*[M3: ModelMatrix]

To create this :code:`VertexTransform` 4x4 matrix there are pre-processing commands
that need to be executed only once and separate commands that need to executed every
time an individual frame of an animation is rendered. Let's walk through the details
of these separate sets of commands.

WebGL Program Example
---------------------

The :code:`RobotBaseScene` class used in the WebGL program below places its initialization
code in its class constructor and the rendering commands for a single frame in
a class function called :code:`render`. The constructor code
is all statements that are not inside a sub-function of the class. Because
we use the JavaScript :code:`"use strict";` mode, all variables and
functions must be defined before they can be used. This causes the constructor
code to be spread throughout the class definition. The public and private variable
declarations are at the top of the class definition, while the constructor commands
are at the bottom of the definition.

This WebGL program renders of a single model which is the base of a robotic arm.

.. webglinteractive:: W1
  :htmlprogram: _static/06_robot1/robot_base.html
  :editlist: _static/06_robot1/robot_base_scene.js
  :hideoutput:
  :width: 300
  :height: 300

Please study these detailed notes about the :code:`RobotBaseScene` class definition above.

.. tabbed:: program_descriptions

  .. tab:: Initialization

    +-----------+--------------------------------------------------------------------------+
    + Line(s)   + Description                                                              +
    +===========+==========================================================================+
    + 33-42     + The class function header. The :code:`download` object has downloaded    +
    +           + all of the required files and creates an instance of this class.         +
    +           + The object receives the shader programs (                                +
    +           + :code:`vshaders_dictionary` and :code:`fshaders_dictionary`), and        +
    +           + the models that will be used in the scene.                               +
    +-----------+--------------------------------------------------------------------------+
    + 44-67,    + The class constructor. This code is executed once when the object is     +
    + 110-139   + created. It initializes all data needed to render the scene.             +
    +-----------+--------------------------------------------------------------------------+
    + 56        + One instance of the :code:`GlMatrix4x4` object is created.               +
    +           + This gives you access to all of the matrix functionality we discussed    +
    +           + in the previous lesson.                                                  +
    +-----------+--------------------------------------------------------------------------+
    + 57-60     + The required transformation matrices are created.                        +
    +-----------+--------------------------------------------------------------------------+
    + 64-66     + The variables that events can modify are made public variables.          +
    +-----------+--------------------------------------------------------------------------+
    + 114-120   + The GL context for the canvas window is retrieved.                       +
    +-----------+--------------------------------------------------------------------------+
    + 129       + A *shader program* is created using a *vertex shader* and a *fragment    +
    +           + shader*.                                                                 +
    +-----------+--------------------------------------------------------------------------+
    + 130       + The *shader program* is made the active graphics pipeline program.       +
    +-----------+--------------------------------------------------------------------------+
    + 134       + *Buffer objects* in the GPU are created and the model data is copied     +
    +           + to the GPU.                                                              +
    +-----------+--------------------------------------------------------------------------+
    + 135       + *Shader program* variables are retrieved.                                +
    +-----------+--------------------------------------------------------------------------+
    + 138       + Callbacks for user events are initialized.                               +
    +-----------+--------------------------------------------------------------------------+

  .. tab:: Render a Single Frame

    Each time the scene needs to rendered, the :code:`render` function in lines
    70-85 is called. It takes the following major actions:

    +---------+--------------------------------------------------------------------------+
    + Line(s) + Description                                                              +
    +=========+==========================================================================+
    + 74      + The *color buffer* that holds the rendered image is cleared to a         +
    +         + background color, and the *depth buffer* that determines which pixels    +
    +         + are visible is cleared.                                                  +
    +---------+--------------------------------------------------------------------------+
    + 78      + The rotation transform that is causing the base model to rotate is       +
    +         + calculated because the angle of rotation changes on every frame.         +
    +---------+--------------------------------------------------------------------------+
    + 81      + A single *vertex transform* is calculated, which includes the            +
    +         + *projection*, *camera*, and *model* transforms. The transforms are       +
    +         + ordered from right to left. Conceptually, the *model* transform happens  +
    +         + first, then the *view* transform, and finally the *projection*           +
    +         + transform.                                                               +
    +---------+--------------------------------------------------------------------------+
    + 84      + The model is rendered using the calculated transform.                    +
    +---------+--------------------------------------------------------------------------+

Notes:
------

The :code:`delete` function in lines 89-108 is used by the interactive textbook
background processes when you "restart" a demo. The running program must be
"cleared" from memory so that a modified version of the demo code can be executed.
In a game environment, a
function like :code:`delete` might be used when you change the game level and want
to clear memory for an entirely new scene.

This example will be enhanced in the next several lessons, so please make
sure you understand this example before proceeding to the next lesson.


Glossary
--------

.. glossary::

  model transform
    A 4-by-4 transformation matrix that changes the vertices of a model
    to set its desired size, location, and orientation.

  view (or camera) transform
    A 4-by-4 transformation matrix that moves a model into the correct
    location and orientation in front of the scene’s virtual camera.

  model-view transform
    A 4-by-4 transformation matrix that contains both the *model transform*
    and the *view transform*.

  projection transform
    A 4-by-4 transformation matrix that projects a 3-dimensional world
    into *normalize device coordinates* in preparation for clipping.
    It also "projects" the 3D world to a 2D view.

Self Assessment
---------------

.. mchoice:: 6.7.1
  :random:
  :answer_a: When using the JavaScript "use strict" mode, variables and functions must be defined before they can be used.
  :answer_b: It separates declarations from commands.
  :answer_c: JavaScript syntax requires it this way.
  :answer_d: It makes the code easier to read and maintain.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. While the code is basically separated in this way, the organization is for logical reasons instead of necessity.
  :feedback_c: Incorrect. All code not in a sub-function is part of a class constructor.
  :feedback_d: Incorrect. Having all the constructor code contiguous in one place would be a better organization.

  Why is the constructor code in the :code:`RobotBaseScene` class in two separate
  places in the class definition?

.. mchoice:: 6.7.2
  :random:
  :answer_a: To access all of the functionality in a "GlMatrix4x4" object.
  :answer_b: To perform matrix multiplication.
  :answer_c: To create a 4x4 transformation matrix.
  :answer_d: To setup a rotation transformation matrix.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. It allows access to the "multiplySeries()" function, but much more.
  :feedback_c: Incorrect. It allows access to the "create()" function, but much more.
  :feedback_d: Incorrect. It allows access to the "rotate()" function, but much more.

  What is the :code:`matrix` object used for? (It is created in line 56 and used
  throughout the entire class.)

.. mchoice:: 6.7.3
  :random:
  :answer_a: projection, camera, model
  :answer_b: model, camera, projection
  :answer_c: camera, projection, model
  :answer_d: model, projection, camera
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  What is the correct multiplication order for the three required transformation
  matrices when rendering a scene?


.. index:: Model Transform, View Transform, Model-View Transform, Projection Transform
