..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

2.5 - Canvas and GL Context
:::::::::::::::::::::::::::

.. highlight:: javascript

Graphics generated in real-time on a web page (as opposed to the
display of a picture) are always drawn into a rectangular HTML *canvas* element.
A *canvas* element has a *context*. The *context* defines how the graphics
are created. There is an API for
creating 2D graphics which we won't take time to discuss here.
(See `w3schools tutorial`_ for more information.) For WebGL programming, you
need to get a *WebGL context*. The *context* is a JavaScript object
that stores all of the state and behavior of the graphics displayed in a canvas.

Getting the Canvas Element
--------------------------

Using JavaScript, you need to get the *canvas* element you want to draw into.
If there is only one canvas element on the web page, you could get the element
by its type. But a more general scheme, which supports multiple canvas
elements on a single web page, is to use a unique :code:`id` for the canvas.
The standard HTML code for defining a *canvas* element is shown below. If
a browser does not support *canvas* elements, it will display the message inside
the <canvas> tag. Otherwise it will display a rectangular region on the page.
Notice that the canvas element is assigned a unique ID.

.. Code-Block:: html

  <canvas id="W1_canvas">
    Please use a browser that supports "canvas"
  </canvas>

In JavaScript, after a web page has been loaded, you can get a canvas
element using the :code:`document.getElementById(id)` function. You should
handle errors appropriately, so a function like this would be typical.

.. Code-block:: javascript
  :linenos:
  :emphasize-lines: 10

  /**
   * Get a canvas element given its unique id
   *
   * @param canvas_id {string} The HTML id of the canvas to render to.
   * @return the matching canvas element
   */
  function getCanvas(canvas_id) {
    let canvas;

    canvas = document.getElementById(canvas_id);
    if (!canvas || canvas.nodeName !== "CANVAS") {
      console.log('Fatal error: Canvas "' + canvas_id + '" not found');
    }
    return canvas;
  }

Getting the WebGL Context
-------------------------

Now that we have an object that represents the canvas element, we use a
method of the object called :code:`getContext('webgl')` to get a WebGL object
that represents the 3D graphics state and behavior of the canvas. Again we
should handle errors appropriately. (We will discuss WebGL environment
*options* in later lessons.)

.. Code-block:: javascript
  :linenos:
  :emphasize-lines: 10

    /**----------------------------------------------------------------------
     * Get a WebGL context from a canvas
     * @param canvas {canvas} The DOM element that represents the canvas.
     * @param options {object} options to set in the WebGL environment.
     * @return The WebGL context for the canvas.
     */
    self.getWebglContext = function (canvas, options = {}) {
      let context;

      context = canvas.getContext('webgl', options );
      if (!context) {
        out.displayError("No WebGL context could be found.");
      }

      return context;
    };

The WebGL Context
-----------------

The WebGL context is a JavaScript object that stores the current state of
the graphics library. WebGL is a *state machine*, which means that if you
set a WebGL variable to a specific value, that value will not change until
you change it. For example, you can set the color used to clear the
canvas background once. You don't need to set the color value every time
you want to clear the window.

The WebGL context object also defines methods for the entire WebGL API.
All WebGL functionality is accessed through the context object. The
convention is to name the context object :code:`gl`. Below is a typical
start to a WebGL program.

.. Code-block:: javascript

  // Get the rendering context for the canvas
  gl = getWebglContext( getCanvas(canvas_id) );
  if (!gl) {
    return null;
  }

  // Initialize the state of the WebGL context
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

Notice that all WebGL functionality is accessed through the :code:`gl` object.

Each canvas has its own WebGL context. If you have 4 canvas elements on a
web page, you will have to store 4 separate WebGL contexts. And regrettably
for WebGL 1.0, context's can't share data or shader programs.
Supposedly future versions of WebGL will allow sharing of resources between
contexts.

Canvas Size vs. WebGL Context Size
----------------------------------

An HTML canvas element has a size that determines how much area it takes up
on a web page. Two properties of a canvas element store its dimensions:
:code:`clientWidth` and :code:`clientHeight`. These values are always in pixels.

A WebGL context has a size which determines the dimensions of the framebuffer
it renders. Two properties of a canvas element store its framebuffer size:
:code:`width` and :code:`height`. These values are always in pixels.

For example, the following HTML code will create a canvas whose physical size
on the screen is 400-by-400 pixels, but whose context is only 100-by-100. Every
pixel rendered to the WebGL framebuffer will be displayed in 16 pixels on the
screen (in a 4-by-4 block) which will make the image appear blurry.

.. Code-block:: html

  <canvas id="W1" width="100" height="100" style="width: 400px; height: 400px;">
    Please use a browser that supports "canvas"
  </canvas>

If you want the highest resolution renderings possible, the dimensions of a
canvas element should be the same size as its physical size on the screen. That is,

.. Code-block:: javascript

  canvas.width  = canvas.clientWidth;
  canvas.height = canvas.clientHeight;


Glossary
--------

.. glossary::

  canvas
    an HTML element which defines a rectangular area in a web page on
    which graphics can be displayed.

  context
    the environment in which something happens.

  WebGL context
    a JavaScript object that stores the state of WebGL for a specific canvas
    and provides an interface to all WebGL API functions.

Self-Assessments
----------------

.. mchoice:: 2.5.1
  :random:
  :answer_a: It creates a rectangular area which can contain graphics.
  :answer_b: It defines an error message.
  :answer_c: It defines a surface to paint on, such as an "oil canvas."
  :answer_d: It defines a pop-up window that can contain graphics.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect, though the text inside the element is displayed as an error message if the browser does not support the canvas element.
  :feedback_c: Incorrect, HTML does not do oil paintings.
  :feedback_d: Incorrect, pop-up windows are created with the alert() function.

  What does this HTML code do?

  .. Code-block:: html

    <canvas id="W1_canvas">
      Please use a browser that supports "canvas"
    </canvas>

.. parsonsprob:: 2.5.2
  :noindent:
  :adaptive:

  Please correctly order the following steps when creating a 3D rendering in a canvas element.
  -----
  Get the canvas DOM element.
  =====
  Get a WebGL context for the canvas element.
  =====
  Call WebGL functions to produce a 3D rendering.
  =====
  Re-render the 3D rendering when events happen.
  =====

.. mchoice:: 2.5.3
  :random:
  :answer_a: WebGL remains in the same state it is in until it is told to change.
  :answer_b: WebGL is used to render maps of geographic states.
  :answer_c: WebGL is always in a state of change.
  :answer_d: WebGL commands must be issued over and over again for each new rendering.
  :correct: a
  :feedback_a: Correct. If you set the color to red, it stays red until it is changed to something else.
  :feedback_b: Incorrect, though WebGL could be used to draw maps.
  :feedback_c: Incorrect, WebGL only changes its "context" when WebGL commands are called.
  :feedback_d: Incorrect. In fact, to make rendering as fast as possible, you should not make unnecessary WebGL function calls.

  What does it mean that "WebGL is a state machine?"

.. mchoice:: 2.5.4
  :random:
  :answer_a: True.
  :answer_b: False.
  :correct: a
  :feedback_a: Correct. And if the canvas is bigger than the WebGL context, the displayed image will be "blurry."
  :feedback_b: Incorrect.

  The physical size of a canvas element on the screen and the size of its associated WebGL context can be different.

.. index:: canvas, context, WebGL context, WebGL Context Size

.. _w3schools tutorial: https://www.w3schools.com/graphics/canvas_reference.asp

