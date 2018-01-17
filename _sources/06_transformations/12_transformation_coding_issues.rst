..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

6.12 - Coding Issues
::::::::::::::::::::

We have explained how rendering works and the transformations required
to position and orient models in a scene. In addition, you
have studied several example WebGL programs in detail.
This lesson explains how to download the WebGL program files we
have been using to create your own independent, standalone WebGL programs.
It is suggested that you start with a working program and modify it to meet
your needs.

The HTML Code:
--------------

A WebGL program needs a significant number of data files from the server.
A server responds to file download requests asynchronously, which
means that the files will be downloaded at the first available opportunity
but not necessary in the order you requested them. So the
first order of business is to download all of the files your program needs.

The JavaScript file `scene_download.js`_ contains a class called
:code:`SceneDownload`. An object of this class can download all of
your files. At the bottom of your HTML :code:`body`
element include a :code:`<script>` element similar to the following example:

.. Code-Block:: HTML

  <script>
    let my_models = ["../models/robot_base.obj",
                     "../models/robot_forearm.obj",
                     "../models/robot_upperarm.obj"];
    let my_shaders = ["../shaders/color_per_vertex.vert",
                      "../shaders/color_per_vertex.frag"];
    window.my_program = new SceneDownload("my", "my_canvas",
                        "RobotUpperarmScene", my_models, my_shaders);
  </script>

This JavaScript code creates a list of model files to download and a list
of shader programs to download. It
then creates an instance of the :code:`SceneDownload` class and sends it the
following parameters:

* A prefix ID for all HTML ID tags of your HTML code. For example, in the
  example above, all element ID tags are named with the prefix :code:`my_` so
  the first parameter is the string :code:`my`. (This was done so the :code:`my` could
  be replaced with a unique identifier and a WebGL program could be
  replicated multiple times on a single web page. This is not a typical
  requirement for WebGL programs.)
* The ID of the canvas to render into.
* The name of your "scene" class. An instance of this class is created
  after all of the shaders and models have been successfully downloaded.
* A list of model file names, including correct file paths.
* A list of shader program file names, including correct file paths.

The :code:`SceneDownload` object will download all of your files from the server,
convert each :code:`.obj` or :code:`.ply` model to a :code:`ModelArrays` object, and create
an instance of your scene rendering class. Remember that web pages are event
driven. Nothing happens on a page unless a user event or a timer event "fires".

Your HTML file must download the JavaScript code your program needs.
Use a series of :code:`<script>` elements like this:

.. Code-Block:: HTML

  <!-- Load the JavaScript libraries and data files for the WebGL rendering -->
  <script src="../learn_webgl/glpoint4.js"></script>
  <script src="../learn_webgl/glvector3.js"></script>
  <script src="../learn_webgl/glmatrix4x4.js"></script>
  <script src="../learn_webgl/model_definitions.js"></script>
  <script src="../learn_webgl/obj_to_arrays.js"></script>
  <script src="../learn_webgl/model_arrays_gpu.js"></script>
  <script src="../learn_webgl/render_color_per_vertex.js"></script>
  <script src="../learn_webgl/console_messages.js"></script>
  <script src="../learn_webgl/scene_download.js"></script>
  <script src="./robot_upperarm_scene.js"></script>
  <script src="./robot_upperarm_events.js"></script>

One last thing. The demo code uses :code:`jQuery` to make the
JavaScript code cross-platform and function correctly in all major browsers.
You need to download `jQuery.js`_ and include the jQuery library using a :code:`<script>` tag like:

.. Code-Block:: HTML

  <script src="../jquery.js"></script>

Put this element in the :code:`<head>` element of your HTML code. This guarantees
that it will be downloaded before any of your other JavaScript code
is executed.

For all of the :code:`<script>` examples above, modify the path to the file based on where you
store the JavaScript code files relative to your HTML file.

A "Scene" JavaScript Class
--------------------------

You need a class that will render your scene. Start with this class,
`robot_upperarm_scene.js`_ and modify it as needed.

An "Events" JavaScript Class
----------------------------

You need a class that will process events. Start with this class,
`robot_upperarm_events.js`_ and modify it as needed.

Shader programs
---------------

You need at least one *vertex shader* and one *fragment shader* program for
rendering. `color_per_vertex.vert`_ and `color_per_vertex.frag`_ are reasonable starting points.

Downloading Example Code
------------------------

You can download any code from this interactive textbook in one of two ways:

* Use the "Download" buttons on any of the interactive WebGL programs.
* Open a page that has demo code you want to save. Open the "Developer Tools"
  and select the "Sources" tab. Expand the folder lists in the left panel to find the file you
  want. Right-click on the file icon and select "Save as...". Note: You will
  have fewer (and clearer) file choices if you open a WebGL program in a
  separate browser tab or window using the
  "Open this webgl program in a new tab or window" link.

.. index:: SceneDownload, jQuery, script downloads

.. _scene_download.js: ../_static/learn_webgl/scene_download.js
.. _robot_upperarm_scene.js: ../_static/06_robot4/robot_upperarm_scene.js
.. _robot_upperarm_events.js: ../_static/06_robot4/robot_upperarm_events.js
.. _color_per_vertex.vert: ../_static/shaders/color_per_vertex.vert
.. _color_per_vertex.frag: ../_static/shaders/color_per_vertex.frag
.. _jQuery.js: ../_static/jquery.js

