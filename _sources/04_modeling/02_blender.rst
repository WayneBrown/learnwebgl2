..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

4.2 - Blender
:::::::::::::

Blender is a combination of many tools. It is a:

* modeler - to create 3D models,
* renderer - to produce photo-realistic renderings of 3D models,
* rigger - to create "rigs," which are specially designed 3D models for animation,
* animation system - to create key-frame animations,
* compositor - to combine images from various sources to create video frames, and
* video renderer - to output complete animations in various video formats.

For this textbook you only need to learn how to use the modeling functionality
of Blender. Please don't even try to "master" all of the functionality of Blender.
It takes years to become a Blender "power user".

To understand the power of Blender, sample some of the animations
posted on `this youtube play list`_, all of which were created entirely using Blender.

Install Blender
---------------

Please install Blender on your computer. `Download Blender from here`_.

.. admonition:: IMPORTANT

  To use Blender effectively, you need to use a **3-button mouse**. If
  your mouse has 2-buttons and a wheel, the wheel often acts as a 3rd button.

Some Preliminary Issues
-----------------------

Blender uses a right-handed coordinate system, but a different default
view orientation as compared to WebGL.

* In Blender, the ground plane is the X-Y plane and the Z axis points up.
* In WebGL, the ground plane is the X-Z plane and the Y axis points up.

This discrepancy in default views can cause confusion, but
the difference is only a 90 degree rotation about the X axis. In the
WebGL program below, the x, y, z, axes are rendered as red, green, and
blue arrows respectively. In addition, the front, right, and top views
are labeled. Rotate the model down by 90 degrees and you will
have the default WebGL 3D orientation, where the z-axis is pointing
toward you and the y-axis is up.

.. webgldemo:: W1
  :htmlprogram: _static/04_blender_orientation/blender_orientation.html
  :width: 300
  :height: 300

To minimize confusion we suggest that you use the default view in Blender
as you design your models. Let the "front side" of your object be facing
away from the +Y axis and the "top side" of your object be along the +z-axis.
When you export your model, the exporter can change the orientation to match
WebGL's orientation. (More details on this are in the next lesson.)

When you create models for WebGL programs you can save
multiple models in a single file, or separate the models into distinct files.
If your models are in separate files, make sure you use
consistent units so that your models have an appropriate size when they
are used together in a scene.

Every model requires a unique name so that it can be manipulated
in your WebGL programs. Use the normal rules for creating program identifiers
to name your models -- because model names will become
object property names in your WebGL JavaScript programs.

.. admonition:: IMPORTANT

  When naming things in Blender, such as models, colors, or textures,
  all names should start with a letter (a-z) and contain
  only letters (a-z), digits (0-9) and the underscore character (_). Never use
  spaces in your names!

Learning Blender
----------------

Please watch the `Blender video tutorials by Neal Hirsig`_ listed below.
Your goal is to learn WebGL programming, so you don't need to watch all of
his Blender videos. Just learn from the subset of videos listed below.

.. admonition:: IMPORTANT

  **You should watch a small part of a video, pause the video, and then practice the actions described by the video.**
  Practice and experimentation are critical to your learning.

Please print a copy of the `Neal Hirsig cheat sheet`_ to have in front of you
as you watch the tutorials. As you learn each new functionality, it will be
helpful if you makes notes to yourself on the cheat sheet.

Learn the Blender interface (34 minutes of video):

* Learn the `Blender interface`_ by watching this 5 minute video.
* Learn how to `manage window layouts`_ by watching this 4 minute video.
* Learn how to quickly change the `editor views`_ by watching this 5:30 minute video.
* Learn how to `move around in 3D space`_ by watching this 9:45 minute video.
* Learn the `Blender controls`_ by watching this 5 minute video.
* Learn the `viewing and editing modes`_ by watching this 5 minute video.

Learn model manipulation in Blender (43 minutes of video):

* Learn about `Blender units`_ by watching this 5 minute video.
* Learn how to create the `basic mesh objects`_ by watching this 10:30 minute video.
* Learn how to `select objects`_ by watching this 6:30 minute video.
* Learn how to `translate objects`_ by watching this 6:30 minute video.
* Learn how to `rotate objects`_ by watching this 8 minute video.
* Learn how to `scale objects`_ by watching this 7 minute video.

Learn advanced model manipulation in Blender (39 minutes of video):

* Learn how to `combine meshes`_ into a single model by watching this 2:30 minute video.
* Learn how to `name objects`_ by watching this 2:30 minute video. (Use the rules for variable names!)
* Learn how to `delete things`_ by watching this 2:30 minute video.
* Learn how to `undo and redo`_ operations by watching this 3 minute video.
* Learn the difference between `local and global orientation`_ by watching this 4:30 minute video.
* Learn how to `manipulate an object's "center point"`_ by watching this 4:30 minute video.
* Learn how to `manipulate pivot points`_ by watching this 8 minute video.
* Learn how to `duplicate objects`_ by watching this 7 minute video.
* Learn how to `smooth the surface`_ of a mesh object by watching this 4:45 minute video.

Learn mesh editing techniques in Blender (49 minutes of video):

* Learn how to `select vertices, edges and faces`_ by watching this 6 minute video.
* Learn how to `select and manipulate vertices`_ by watching this 8 minute video.
* Learn how to `select and manipulate edges`_ by watching this 8 minute video.
* Learn how to `select and manipulate faces`_ by watching this 5 minute video.
* Learn how to use the `vertex, edge and face menus`_ by watching this 3 minute video.
* Learn how to `subdivide edges`_ to create more vertices by watching this 5 minute video.
* Learn how to use `loop cut and slide`_ to create more vertices by watching this 3 minute video.
* Learn how to use the `rip tool`_ to make openings in a model by watching this 3 minute video.
* Learn how to use the `extrusion tool`_ by watching this 8 minute video.

Putting it all together (9 minutes of video)

* `Examples of using the extrusion tool`_ (9 minute video).

Other Resources
---------------

There are many great video tutorials on the Internet that can help you
learn Blender. The `Blender Foundation tutorials`_ is a good place to
start. Just recognize that it will take you 100's of hours to master Blender
and any extra work in Blender should be put off until after your work
on this WebGL textbook is finished.

This `extensive cheat sheet`_ will be helpful if you want to learn more
about Blender.

Glossary
--------

.. glossary::

  Blender
    an open-source, free modeling and animation tool.

Self-Assessment
---------------

Using Blender, create a model of some simple 3D object. Be creative, but
don't make it too complex.

.. index:: Blender

.. _this youtube play list: https://www.youtube.com/watch?v=mN0zPOpADL4&list=PL6B3937A5D230E335
.. _Download Blender from here: https://www.blender.org/download/

.. _Blender video tutorials by Neal Hirsig: https://vimeo.com/channels/blendervideotutorials/videos
.. _Neal Hirsig cheat sheet: ../_static/documents/Blender_Hotkeys_Cheatsheet.pdf

.. _Blender interface: https://vimeo.com/channels/blendervideotutorials/44837735
.. _manage window layouts: https://vimeo.com/channels/blendervideotutorials/44837736
.. _editor views: https://vimeo.com/channels/blendervideotutorials/44837737
.. _blender controls: https://vimeo.com/channels/blendervideotutorials/44839019
.. _move around in 3D space: https://vimeo.com/channels/blendervideotutorials/44837741
.. _viewing and editing modes: https://vimeo.com/channels/blendervideotutorials/44839020
.. _Blender units: https://vimeo.com/channels/blendervideotutorials/44839021
.. _basic mesh objects: https://vimeo.com/channels/blendervideotutorials/44839113
.. _select objects: https://vimeo.com/channels/blendervideotutorials/44839112
.. _translate objects: https://vimeo.com/channels/blendervideotutorials/44839208
.. _rotate objects: https://vimeo.com/channels/blendervideotutorials/44839207
.. _scale objects: https://vimeo.com/channels/blendervideotutorials/44839210
.. _combine meshes: https://vimeo.com/channels/blendervideotutorials/46116580
.. _name objects: https://vimeo.com/channels/blendervideotutorials/44839584
.. _delete things: https://vimeo.com/channels/blendervideotutorials/44839585
.. _undo and redo: https://vimeo.com/channels/blendervideotutorials/44839587
.. _manipulate pivot points: https://vimeo.com/channels/blendervideotutorials/44840287
.. _duplicate objects: https://vimeo.com/channels/blendervideotutorials/44840398
.. _smooth the surface: https://vimeo.com/channels/blendervideotutorials/44840399
.. _manipulate an object's "center point": https://vimeo.com/channels/blendervideotutorials/44840284
.. _local and global orientation: https://vimeo.com/channels/blendervideotutorials/44839588
.. _select vertices, edges and faces: https://vimeo.com/channels/blendervideotutorials/44840535
.. _select and manipulate vertices: https://vimeo.com/channels/blendervideotutorials/44840536
.. _select and manipulate edges: https://vimeo.com/channels/blendervideotutorials/44840537
.. _select and manipulate faces: https://vimeo.com/channels/blendervideotutorials/44840538
.. _vertex, edge and face menus: https://vimeo.com/channels/blendervideotutorials/44840539
.. _subdivide edges: https://vimeo.com/channels/blendervideotutorials/44840702
.. _loop cut and slide: https://vimeo.com/channels/blendervideotutorials/44840703
.. _rip tool: https://vimeo.com/channels/blendervideotutorials/44840707
.. _extrusion tool: https://vimeo.com/channels/blendervideotutorials/46116676
.. _Examples of using the extrusion tool: https://vimeo.com/channels/blendervideotutorials/44841562

.. _Blender Foundation tutorials: https://www.blender.org/support/tutorials/
.. _extensive cheat sheet: ../_static/documents/BlenderHotkeyReference.pdf
