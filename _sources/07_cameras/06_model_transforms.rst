..  Copyright (C)  Wayne Brown
   Permission is granted to copy, distribute
   and/or modify this document under the terms of the GNU Free Documentation
   License, Version 1.3 or any later version published by the Free Software
   Foundation; with Invariant Sections being Forward, Prefaces, and
   Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
   the license is included in the section entitled "GNU Free Documentation
   License".

7.6 - Model Transforms
::::::::::::::::::::::

Before we leave the topic of cameras, let's apply what you have learned
about a camera matrix transform to model transformations.

A model can be scaled, rotated, and translated in an infinite number
of ways to arrive at a final orientation, location and size for a specific
rendering of a scene. When a model is rendered it uses a single transformation
matrix that contains all of the model's location, orientation and scaling
information. The following analysis explains how we can extract useful
information from this final model matrix transform.

Please remember that a camera transformation moves the virtual camera to the
global origin and then aligns the camera's local coordinate system axes with
the global coordinate system axes. This requires a translation followed by
a rotation. Consider that an identical, but reverse, transformation happens to
all models. Models are typically defined in reference to the global
coordinate system. When a model is put into a scene, regardless of the transformations
used to create its matrix transform, it is fundamentally
rotated to a desired orientation, possibly scaled to a desired size, and
then moved to a desired location. In lesson 7.2 you saw that the local coordinate
system axes that defined a camera (i.e, :code:`u`, :code:`v`, and :code:`n`)
became the rotation matrix we needed. We can use this knowledge to better understand
a matrix transformation that places a model into a scene.

The matrix below rotates a camera's local coordinate system so that it aligns with
the global coordinate system.

.. matrixeq:: Eq1

   [M1: ux,uy,uz,0;vx,vy,vz,0;nx,ny,nz,0;0,0,0,1]

To do the opposite, which is to take a model defined at the origin
and rotate it to a desired orientation, as defined by a model's local coordinate
system, :code:`u`, :code:`v`, and :code:`n`, we need the inverse of this matrix,
which is

.. matrixeq:: Eq2

   [M2: ux,vx,nx,0;uy,vy,ny,0;uz,vz,nz,0;0,0,0,1]

Therefore, the transformation matrix used to place a model into a scene
must be equivalent to the following three transformations:

.. matrixeq:: Eq3

  [M1: translate]*[M2: scale]*[M3: rotate] = [M4: f1, f5, f9, f13; f2, f6, f10, f14; f3, f7, f11, f15; f4, f8, f12, f16]

or

.. matrixeq:: Eq4

  [M1: 1,0,0,tx;0,1,0,ty;0,0,1,tz;0,0,0,1]*[M2: sx,0,0,0;0,sy,0,0;0,0,sz,0;0,0,0,1]*[M3: ux,vx,nx,0;uy,vy,ny,0;uz,vz,nz,0;0,0,0,1]
  = [M4: f1, f5, f9, f13; f2, f6, f10, f14; f3, f7, f11, f15; f4, f8, f12, f16]

Performing the matrix multiplications gives this result:

.. matrixeq:: Eq5

  [M1: sx*ux, sx*vx,sx*nx,tx;sy*uy,sy*vy,sy*ny,ty;sz*uz,sz*vz,sz*nz,tz;0,0,0,1]
  = [M4: f1, f5, f9, f13; f2, f6, f10, f14; f3, f7, f11, f15; f4, f8, f12, f16]

The following implications of this are very useful!

* The 4th column of the transformation matrix contains the location of the model, :code:`(tx, ty, tz)`
* If there is no scaling (:code:`sx === sy === sz === 1`) or if the scaling is uniform (:code:`sx === sy === sz`), then

  * The 1\ :sup:`st` column of the matrix defines the model's local coordinate system's "to the right" axis, :code:`u`.
  * The 2\ :sup:`nd` column of the matrix defines the model's local coordinate system's "up" axis, :code:`v`.
  * The 3\ :sup:`rd` column of the matrix defines the model's local coordinate system's "back" axis, :code:`n`.
  * The magnitude of the :code:`u`, :code:`v`, or :code:`n` axis vector is equivalent to the scaling factors.

.. admonition:: Conclusion

  If you need the location of a model or the local coordinate system of a model,
  these values can be pulled directly from the model's transformation matrix.

Glossary
--------

.. glossary::

  model transformation
    A 4x4 transformation matrix that modifies the location, size, and orientation of a model.

Self Assessment
---------------

.. mchoice:: 7.6.1
  :random:
  :answer_a: Translates the camera to the global origin and then aligns the camera's axes with the global coordinate system.
  :answer_b: Aligns the camera's axes with the global coordinate system and then translates the camera to the global origin.
  :answer_c: Aligns the camera's axes with the global coordinate system.
  :answer_d: Translates the camera to the global origin.
  :correct: a
  :feedback_a: Correct. It is important that the translation happens first, so that the rotation is about the origin.
  :feedback_b: Incorrect. If the rotation is first, it will be about the global origin, which will also move the camera.
  :feedback_c: Incorrect. Yes, but it does more than just change the orientation.
  :feedback_d: Incorrect. Yes, but it does more than just change the location.

  A camera transformation performs the following tasks:

.. mchoice:: 7.6.2
  :random:
  :answer_a: a camera transform moves a camera to the origin, while a model transform moves a model away from the origin.
  :answer_b: a camera transform aligns a camera to the global axes, while a model transform typically rotates away from the global axes.
  :answer_c: a camera transform makes the camera point at a particular model in the scene.
  :answer_d: a camera transform is the transpose of a model transform.
  :correct: a,b
  :feedback_a: Correct.
  :feedback_b: Correct.
  :feedback_c: Incorrect. Maybe, maybe not.
  :feedback_d: Incorrect.

  A model transformation is "opposite" a camera transformation because ... (Select all that apply.)

.. mchoice:: 7.6.3
  :random:
  :answer_a: (4.52, -0.42, 2.5)
  :answer_b: (0.45, 0.52, 0.940)
  :answer_c: (0.12, 0.13, 0.01)
  :answer_d: (0.81, 0.17, 0.13)
  :correct: a
  :feedback_a: Correct. The last column contains the location.
  :feedback_b: Incorrect. This is a vector that indicates the "to the right" local coordinate axis of the model.
  :feedback_c: Incorrect. This is a vector that indicates the "up" local coordinate axis of the model.
  :feedback_d: Incorrect. This is a vector that indicates the "back" local coordinate axis of the model.

  Given the following model transformation matrix, where will the model be located
  in the scene after using this transform?

  .. matrixeq:: Eq6

    [M1: 0.45, 0.12, 0.81, 4.52; 0.52, 0.13, 0.17, -0.42; 0.94, 0.01, 0.13, 2.5; 0,0,0,1]



.. index:: model transformation
