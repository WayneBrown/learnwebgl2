..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

3.1 - Describing Virtual Worlds
:::::::::::::::::::::::::::::::

From Chapter 1:

.. admonition:: The field of *computer graphics*

  uses computational devices to create images from geometric
  descriptions of 3D objects or from algorithmically created data.

This chapter explains the **modeling** required to create a 3D virtual world.

The description of a 3D computer graphics scene is *virtual* because it
does not actually exist. A *virtual world* is composed of a group of
3D objects, a virtual camera, and virtual light sources. 3D objects are *modeled*
by describing their:

* location -- where is an object in reference to the entire scene?
* orientation -- which way is the object turned or facing?
* volume -- what 3-dimensional space does the object take up?
* surface properties -- what color is the object? Is the object smooth or rough? Etc.

In addition to the objects in a virtual scene, we must describe
a **virtual camera** which determines the location and direction of the scene's
view, and **virtual light sources** that illuminate the objects in the scene.

The description of a virtual world must be in mathematical values, symbols and
operations that a computer is capable of manipulating. This means you need
to understand some basic math! To make the math understandable it will be
introduced slowly in 2-dimensional (2D) space and then extended into
3-dimensional (3D) space.

Glossary
--------

.. glossary::

   virtual
      Something that does not physically exist but is created by software
      to appear real. A virtual world is a simulated, artificial, imitation
      of the real world -- or a make-believe world that exists only in your mind.

   object
      A single entity in a virtual world that has a location, takes up some
      volume of space, and can be moved, scaled, and rotated.

   model
      A mathematical description of an object.

   scene
      A collection of objects that make up a virtual world. A scene
      contains objects that we want to visualize.

   rendering
      The process of creating an image from a collection of virtual objects
      based on how virtual lights illuminate them and which objects are
      in the view of a virtual camera.

Self-Assessments
----------------

.. mchoice:: 3.1.1
  :random:
  :answer_a: virtual objects
  :answer_b: virtual camera
  :answer_c: virtual lights
  :answer_d: virtual scene
  :answer_e: virtual microphones
  :correct: a,b,c
  :feedback_a: Correct.
  :feedback_b: Correct.
  :feedback_c: Correct.
  :feedback_d: Incorrect. The word "scene" is a generic description of the contents of a rendering.
  :feedback_e: Incorrect. 3D computer graphics could include sounds, but traditionally it does not.

  What mathematical descriptions are needed to create a rendering of a 3D virtual world? (Select all that apply.)


.. index:: virtual, virtual world, object, model, scene, rendering

