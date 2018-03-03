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

12.11 - Overlays
::::::::::::::::

WebGL 3D graphics are always rendered into a HTML :code:`canvas` element. The canvas is
always a rectangle. That said, it is possible to render arbitrary areas
of a canvas to make a rendering appear non-rectangular. And
it is possible to overlay the 2D HTML elements of a web page and a WebGL 3D rendering
in interesting ways. This lesson explains how to do the following:

* Render a 3D scene behind (or in the background) of a web page.
* Render a 3D scene in front of a web page.
* Render multiple canvas elements on top of each other.
* Render a HTML element (and its child elements) in *full screen* mode.

Overlays Using CSS Properties
-----------------------------

HTML elements have a "stack ordering" based on their CSS (Cascading Style Sheets)
:code:`z-index` property. Elements are rendered to a web page based on their
:code:`z-index` ordering -- from smallest to largest. This is identical to the "painter's
algorithm" described in `lesson 12.2`_. Elements rendered later in the process of creating
a web page over-write (or blend) any previously rendered elements. Using the :code:`z-index` property,
3D graphics can be rendered behind or in-front-of other HTML elements.

The :code:`z-index` property only affects elements that are rendered on top of each
other. Therefore, the :code:`z-index` ordering only works on elements
whose :code:`position` property is :code:`absolute`, :code:`relative`, or :code:`fixed`, which are
defined as follows:

* :code:`absolute`: The element is positioned relative to its first positioned (not static) ancestor element.
* :code:`relative`: The element is positioned relative to its normal position.
* :code:`fixed`: The element is positioned relative to the browser window.

The :code:`z-index` property has no impact on an HTML element if its :code:`position` property is
:code:`static`, :code:`initial`, or :code:`inherit`, which are defined as follows,

* :code:`static`: Elements render in order, as they appear in the document flow. (Default)
* :code:`initial`: Use its default value.
* :code:`inherit`: Inherits this property from its parent element.

The examples in this lesson are created by setting appropriate :code:`position`, :code:`width`,
:code:`height`, :code:`top`, :code:`bottom`, :code:`left` and :code:`right`
properties to make elements overlap and then setting the
rendering order using the :code:`z-index` property. The alpha component
of the background color is also used to implement transparency.

Positioning HTML elements can be very tricky. The examples in this lesson use this
strategy:

* Create a :code:`div` "container" to hold the overlapping elements. Set its
  :code:`position` property to :code:`relative` and its :code:`height`
  property to the the total
  height of the overlapping HTML elements. This allows elements after
  this "container" to follow the normal flow of the web page (which is
  left-to-right, top-to-bottom).

* Create the overlapping elements and make their :code:`position` property be
  :code:`absolute` or :code:`relative`.
  Set each element's size (:code:`width` and :code:`height`) and its relative
  location using two of the properties: :code:`top`, :code:`bottom`,
  :code:`left` and :code:`right`. (For example, to position an element
  in the upper-right corner of an area, use the :code:`top` and :code:`right`
  properties.)

To investigate the details of the examples in this lesson, right-click over a HTML
element and select "Inspect". The browser's "development tools" will display
the HTML source code and the CSS settings for the element.

3D Graphics Behind Text
-----------------------

To create 3D graphics behind HTML elements, position a canvas and the HTML
elements in the same relative position on a web page. In addition, assign the canvas
a :code:`z-index` value that is less than the HTML element's :code:`z-index` value.
Here are a set of example CSS definitions that define the example below.

.. Code-Block:: CSS
  :linenos:
  :emphasize-lines: 7, 12, 16, 21

  #graphics_under {        /* The "container" <div>. */
    position: relative;
    height: 400px;
  }

  #W1_text {               /* The "front" element */
    position: absolute;
    top: 0px;
    left: 0px;
    width: 400px;
    height: 400px;
    z-index: 1;
  }

  #W1_canvas {             /* The "back" element. */
    position: absolute;
    top: 0px;
    left: 0px;
    width: 400px;
    height: 400px;
    z-index: 0;
  }

The HTML code looks like this, where the inner :code:`<div>` and the :code:`canvas` are
taking up the same area of the web page:

.. Code-Block:: HTML

  <div id="graphics_under">
    <div id="W1_text">
      The following description is from ...
    </div>

    <canvas id="W1_canvas">
      Please use a browser that supports "canvas"
    </canvas>
  </div>

.. save

  These complications provide a more realistic input for any algorithm that is
  benchmarked with the Stanford bunny,[4] though by today's standards in
  terms of geometric complexity and triangle count, it is considered
  a simple model.

Example: Graphics Under Text
............................

.. raw:: HTML

  <style>
    #graphics_under {
      position: relative;
      height: 400px;
    }

    #W1_text {  /* The "front" element */
      position: absolute;
      top: 0px;
      left: 0px;
      width: 400px;
      height: 400px;
      z-index: 1;
    }

    #W1_canvas {  /* The "back" element. */
      position: absolute;
      top: 0px;
      left: 0px;
      width: 400px;
      height: 400px;
      z-index: 0;
    }
  </style>

  <div id="graphics_under">
    <div id="W1_text">
      <p>The following description is from
      <a href="https://en.wikipedia.org/wiki/Stanford_bunny">
      https://en.wikipedia.org/wiki/Stanford_bunny
      </a></p>

      <p>The Stanford bunny is a computer graphics 3D test model developed by
      Greg Turk and Marc Levoy in 1994 at Stanford University. The model consists
      of data describing 69,451 triangles determined by 3D scanning a ceramic
      figurine of a rabbit.[1] This figurine and others were scanned to test
      methods of range scanning physical objects.[2]</p>

      <p>The data can be used to test various graphics algorithms, including
      polygonal simplification, compression, and surface smoothing. There are
      a few complications with this dataset that can occur in any 3D scan data.
      The model is manifold connected and has holes in the data, some due to
      scanning limits and some due to the object being hollow.[3] ... </p>

      <p>The model was originally available in .ply (polygons) file format with
      4 different resolutions, 69,451 polygons being the highest.</p>
    </div>

    <!--The canvas window for rendering 3D graphics -->
    <canvas id="W1_canvas">
      Please use a browser that supports "canvas"
    </canvas>
  </div>

  <p>
  Alpha value of the canvas' background color: <span id="W1_bk_text"> [0.85, 0.60, 0.60, 0.00]</span><br>
  0.0 <input type="range" id="W1_bk_alpha" min="0.0" max="1.0" value="0.0" step="0.01" style="width:150px"> 1.0<br>
  </p>

  <!-- Load the JavaScript libraries and data files for the WebGL rendering -->
  <script src="../_static/learn_webgl/scene_download.js"></script>
  <script src="../_static/learn_webgl/console_messages.js"></script>
  <script src="../_static/learn_webgl/glpoint4.js"></script>
  <script src="../_static/learn_webgl/glpoint3.js"></script>
  <script src="../_static/learn_webgl/glvector3.js"></script>
  <script src="../_static/learn_webgl/glmatrix4x4.js"></script>
  <script src="../_static/learn_webgl/glmatrix3x3.js"></script>
  <script src="../_static/learn_webgl/model_definitions.js"></script>
  <script src="../_static/learn_webgl/model_arrays_gpu.js"></script>
  <script src="../_static/learn_webgl/obj_to_arrays.js"></script>
  <script src="../_static/learn_webgl/render_color_per_vertex.js"></script>
  <script src="../_static/learn_webgl/render_lighting.js"></script>
  <script src="../_static/12_bunny/bunny_scene.js"></script>
  <script src="../_static/12_bunny/bunny_events.js"></script>
  <script src="../_static/12_bunny/render_bunny.js"></script>

  <!--
    Create an instance of the learn_webgl class, and start the WebGL program.
    We do this here to pass the canvas ID into the javascript code.
  -->
  <script>
    let W1_shaders = ["../_static/12_bunny/bunny.vert",
                      "../_static/12_bunny/bunny.frag"];
    let W1_models = ["../_static/models/bunny3.obj"];
    window.W1_program = new SceneDownload("W1", "W1_canvas", "BunnyScene", W1_models, W1_shaders);
  </script>

Notes about 3D Graphics Under Text:
+++++++++++++++++++++++++++++++++++

* In all previous WebGL programs in this textbook, event callbacks to
  convert mouse drags into model rotations were attached to a canvas element.
  Since the canvas is totally covered by a :code:`div`, any events associated
  with the :code:`canvas` are never activated. The mouse events that
  manipulate the canvas graphics must be bound to the top HTML element of the overlay.
  Try rotating the bunny using a mouse click and drag. The mouse events are
  bound to the :code:`<div>` element, not the :code:`canvas` element.
  :raw-html:`<br><br>`

* The alpha value of the canvas' background color can be used to
  blending the canvas with the web page's background. If you set the
  alpha value of the "clear color" to 1.0, the area covered by the canvas will
  have the color of the canvas. If you set the
  alpha value of the "clear color" to 0.0, the area covered by the canvas will
  have the color of the web page.
  :raw-html:`<br><br>`

3D Graphics in Front of Text
----------------------------

To render 3D graphics over the top of HTML elements, change the
:code:`z-index` property of the canvas to have the
largest :code:`z-index` value of the overlapping elements. This
causes the canvas to be rendered last, thus overwriting (or blending with)
any previous rendering at that location on the web page. Use an alpha value of 0.0 for the
canvas' background color to allow the "back elements" to be visible.


Example:
........

.. raw:: HTML

  <style>
    #graphics_over {
      position: relative;
      height: 400px;
    }

    #W2_text {  /* The "back" element. */
      position: absolute;
      top: 0;
      left: 0;
      width: 400px;
      height: 400px;
      z-index: 0;
    }

    #W2_canvas {  /* The "front" element. */
      position: absolute;
      top: 0;
      left: 0;
      width: 400px;
      height: 400px;
      z-index: 1;
    }
  </style>

  <div id="graphics_over">
    <div id="W2_text">
      <p>The following description is from
      <a href="https://en.wikipedia.org/wiki/Stanford_bunny">
      https://en.wikipedia.org/wiki/Stanford_bunny
      </a></p>

      <p>The Stanford bunny is a computer graphics 3D test model developed by
      Greg Turk and Marc Levoy in 1994 at Stanford University. The model consists
      of data describing 69,451 triangles determined by 3D scanning a ceramic
      figurine of a rabbit.[1] This figurine and others were scanned to test
      methods of range scanning physical objects.[2]</p>

      <p>The data can be used to test various graphics algorithms, including
      polygonal simplification, compression, and surface smoothing. There are
      a few complications with this dataset that can occur in any 3D scan data.
      The model is manifold connected and has holes in the data, some due to
      scanning limits and some due to the object being hollow.[3] ... </p>

      <p>The model was originally available in .ply (polygons) file format with
      4 different resolutions, 69,451 polygons being the highest.</p>
    </div>

    <!--The canvas window for rendering 3D graphics -->
    <canvas id="W2_canvas">
      Please use a browser that supports "canvas"
    </canvas>
  </div>

  <p>
  Alpha value of the canvas' background color: <span id="W2_bk_text"> [0.85, 0.60, 0.60, 0.00]</span><br>
  0.0 <input type="range" id="W2_bk_alpha" min="0.0" max="1.0" value="0.0" step="0.01" style="width:150px"> 1.0<br>
  </p>

  <!-- Load the JavaScript libraries and data files for the WebGL rendering -->
  <script src="../_static/learn_webgl/scene_download.js"></script>
  <script src="../_static/learn_webgl/console_messages.js"></script>
  <script src="../_static/learn_webgl/glpoint4.js"></script>
  <script src="../_static/learn_webgl/glpoint3.js"></script>
  <script src="../_static/learn_webgl/glvector3.js"></script>
  <script src="../_static/learn_webgl/glmatrix4x4.js"></script>
  <script src="../_static/learn_webgl/glmatrix3x3.js"></script>
  <script src="../_static/learn_webgl/model_definitions.js"></script>
  <script src="../_static/learn_webgl/model_arrays_gpu.js"></script>
  <script src="../_static/learn_webgl/obj_to_arrays.js"></script>
  <script src="../_static/learn_webgl/render_color_per_vertex.js"></script>
  <script src="../_static/learn_webgl/render_lighting.js"></script>
  <script src="../_static/12_bunny/bunny_scene.js"></script>
  <script src="../_static/12_bunny/bunny_events.js"></script>
  <script src="../_static/12_bunny/render_bunny.js"></script>

  <!--
    Create an instance of the learn_webgl class, and start the WebGL program.
    We do this here to pass the canvas ID into the javascript code.
  -->
  <script>
    let W2_shaders = ["../_static/12_bunny/bunny.vert",
                      "../_static/12_bunny/bunny.frag"];
    let W2_models = ["../_static/models/bunny3.obj"];
    window.W1_program = new SceneDownload("W2", "W2_canvas", "BunnyScene", W2_models, W2_shaders);
  </script>


Overlapping Canvas Elements
---------------------------

A canvas element can be overlaid on top of other canvas elements. For example,
the layout of a game might desire a small "world map" in the corner of a larger
"game play" window. The CSS definitions for overlapping canvas elements might
look like this:

.. Code-Block:: CSS
  :linenos:
  :emphasize-lines: 13, 23

  #overlapping_canvas {   /* The "container" div. */
    position: relative;
    height: 400px;
    width: 400px;
  }

  #large_canvas {      /* The "main" canvas */
    position: absolute;
    top: 0px;
    left: 0px;
    width: 400px;
    height: 400px;
    z-index: 0;
    background: lightgray;
  }

  #small_canvas {      /* The upper-right corner canvas. */
    position: absolute;
    top: 10px;
    right: 10px;
    width: 100px;
    height: 100px;
    z-index: 1;
    background: lightgreen;
  }

Example:
........

.. raw:: HTML

  <style>
    #overlapping_canvas { /* The "container" div. */
      position: relative;
      height: 400px;
      width: 400px;
    }

    #large_canvas {    /* The "main" canvas */
      position: absolute;
      top: 0px;
      left: 0px;
      width: 400px;
      height: 400px;
      z-index: 0;
      background: lightgray;
    }

    #small_canvas {    /* The upper-right corner canvas. */
      position: absolute;
      top: 10px;
      right: 10px;
      width: 100px;
      height: 100px;
      z-index: 1;
      background: lightgreen;
    }
  </style>

  <div id="overlapping_canvas">
    <canvas id="large_canvas">
      Please use a browser that supports "canvas"
    </canvas>

    <canvas id="small_canvas">
      Please use a browser that supports "canvas"
    </canvas>
  </div>

Full Screen Rendering
---------------------

HTML elements can be rendered in *full screen mode*, but as of early 2018
the interface to the functionality has not been standardized.
Each browser uses different naming conventions. To make *full screen mode*
function correctly for all browsers, the code must include all
possible naming conventions -- which makes the code seem more complex than
it really is. (As of early 2018, :code:`jQuery` has not standardized
*full screen mode* functionality either.)

The **proposed** standard for *full screen mode* can be found at `Fullscreen API`_.

Any HTML element can be requested to enter *full screen mode*. For 3D graphics,
a :code:`canvas` element would typically request *full screen mode*.

Fullscreen requests **must** be called from within an event handler. If they are
called anywhere else they will be denied. This means that a user must initiate
fullscreen mode by some user action. A user can always exit from fullscreen
mode by hitting the escape (ESC) key.

When *full screen mode* is initiated or exited, the size of the canvas element
must be updated accordingly. A callback function must be registered for any
:code:`fullscreenchange` events to make the needed size changes. Note
that in the following code example only one of the :code:`on` function calls
will succeed based on which browser the code is executing on.

.. Code-Block:: JavaScript

  $( '#' + canvas_id ).on(       'fullscreenchange', self.onFullScreenChange )
                      .on( 'webkitfullscreenchange', self.onFullScreenChange )
                      .on(    'mozfullscreenchange', self.onFullScreenChange )
                      .on(     'MSFullscreenChange', self.onFullScreenChange );

The event handler must recognize the current screen mode and then
take appropriate actions. Here is an example event handler:

.. Code-Block:: JavaScript

  /** ---------------------------------------------------------------------
   * Process "fullscreenchange" events.
   * @param event {x.Event} event that triggered a "fullscreenchange" event.
   */
  self.onFullScreenChange = function (event) {

    if (document.fullscreenElement ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement) {
      // The document is in full screen mode.
      self.updateCanvasSize( screen.width, screen.height );
    } else {
      // The document is NOT in full screen mode.
      self.updateCanvasSize(400, 400);
    }
    scene.render();
  };

To enter *full screen* mode a user event must initiate the action. Here is
a typical function that starts *full screen mode*:

.. Code-Block:: JavaScript

  /** ---------------------------------------------------------------------
   * Initiate full screen mode.
   * @param id {string} The ID of the element that will be made full screen.
   */
  self.startFullScreenMode = function (id) {

    // Get the element that will take up the entire screen
    let element = document.getElementById(id);

    // Make sure the element is allowed to go full screen.
    if (!element.fullscreenElement &&
        !element.mozFullScreenElement &&
        !element.webkitFullscreenElement &&
        !element.msFullscreenElement) {

      // Enter full screen mode
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      window.console.log("The element " + id + " can't go into full screen mode.");
    }
  };

The :code:`startFullScreenMode` function will become much simpler and cleaner
when all of the browsers standardize on a single naming convention (or :code:`jQuery` adds support for
*full screen mode*.)

Canvas Element Size
...................

A canvas element has two different sizes:

* a HTML size, defined by an element's :code:`width` and :code:`height` properties, and
* a CSS (cascading style sheets) size, defined by an element's :code:`width`
  and :code:`height` style properties.

Here is an example canvas that has two different sizes:

.. Code-Block:: HTML

  <canvas width="100" height="100" style="width:200px; height:200px;"> </canvas>

If the CSS properties, :code:`width` and :code:`height`, are not specified,
the HTML properties determine the element's size. However, the CSS properties
always override the HTML properties. Therefore, the example canvas will have a size of
200x200 pixels on the screen. WebGL always creates its *draw buffer* using
a canvas' HTML properties. In the example above, the canvas on the screen will
be 200x200 pixels, but the WebGL *draw buffer* will be 100x100 pixels. When the
*draw buffer* is copied to the screen it will be stretched to fill the canvas.
The stretching causes the image to be blurry because each pixel in the *draw buffer* will
be used to color multiple pixels in the canvas.

To change the size of a
canvas the CSS properties should be changed and then copied into
the canvas' HTML properties. The CSS properties are called :code:`clientWidth` and
:code:`clientHeight`. The following function updates the size of
a canvas element whose ID is :code:`W4_canvas`:

.. Code-Block:: JavaScript

  /** ---------------------------------------------------------------------
   * Reset the size of a canvas after a full screen mode event.
   * @param new_width {Number} The new width for the canvas element.
   * @param new_height {Number} The new height for the canvas element.
   */
  self.updateCanvasSize = function (new_width, new_height) {

    // Change the CSS size of the canvas.
    $('#W4_canvas').css('width', new_width).css('height', new_height);

    // Re-size the WebGL draw buffer for the canvas.
    let canvas = document.getElementById('W4_canvas');
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };

A Fullscreen Example
....................

.. webglinteractive:: W4
  :htmlprogram: _static/12_bunny/bunny.html
  :editlist: _static/12_bunny/bunny_events.js, _static/12_bunny/bunny_scene.js
  :hidecode:

Experiments concerning *full screen mode*:

* Don't resize the canvas when a :code:`fullscreenchange` event occurs.
  (Comment out lines 145 and 148 of
  :code:`bunny_events.js`.) Notice that the canvas has not changed size
  and full screen mode simply blacked-out the surrounding screen area.
  :raw-html:`<br><br>`

* Initially the :code:`gl` context sets the rendering viewport to the size
  of the canvas (and the *draw buffer*.) Changing the size
  of the canvas does not update the viewport. Therefore, when the size of the
  canvas changes, the viewport must be updated appropriately. (See line
  85 in :code:`bunny_scene.js`.) Try commenting out line 85. (Close the
  browser's development environment if you have it open while you are experimenting.)
  :raw-html:`<br><br>`

* If the aspect ratio of the canvas changes, the projection transformation
  must be updated. (See lines 82-83 in :code:`bunny_scene.js`.)
  Move the lines that create of the projection matrix to the constructor
  of :code:`BunnyScene` so that it only happens once. Notice that the rendering
  in *full screen mode* is stretched either horizontally or vertically based
  on the aspect ratio of the screen.
  :raw-html:`<br><br>`

* If the dimensions of the canvas are not modified to match the size of the
  screen when *full screen mode* is entered, the rendering will be blurry.
  To see this, comment out lines 134-135 in :code:`bunny_events.js`.
  Do you understand why the rendering is blurry? Also notice that this
  makes the rendering stretched either horizontally or vertically. This is because the *draw buffer*
  is initially square (300x300), while the rendering in *full screen mode*
  is being mapped to a rectangular viewport.

Glossary
--------

.. glossary::

  overlay
    The rendering of more than one element in the same location on a web page.

  stack ordering
    The back-to-front ordering of a set of overlaid HTML elements.

  z-index
    A value that specifies the position of an element in a "stack ordering".
    The ordering is from smallest to largest. The element with the largest
    z-index is rendered last.

  full screen mode
    Render an HTML element (and all of its children) to a window that covers
    the entire screen. All window borders and title bars disappear. You can
    exit *full screen mode* by hitting the ESC key.

.. index:: overlay, stack ordering, z-index, full screen mode


.. _Fullscreen API: https://fullscreen.spec.whatwg.org/
.. _lesson 12.2: ./02_hidden_surface_removal.html
