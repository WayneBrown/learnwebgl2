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

WebGL Context Options
:::::::::::::::::::::

The first step to create 3D graphics in a HTML canvas is to retrieve
a WebGL context object, :code:`WebGLRenderingContext`, by calling
:code:`canvas.getContext('webgl', options)`. The :code:`options` parameter
sets properties of the "context" at the time of its creation. Only the
options that are different from their defaults need to be specified.
Options can't be changed later; they must be set when the context is created.
For example:

.. Code-Block:: JavaScript

  let gl = canvas.getContext('webgl', { antialias: false,
                                        depth: false } );

creates a :code:`WebGLRenderingContext` object and assigns it to the
variable :code:`gl` while changing the values for the :code:`antialias`
and :code:`depth` options. To leave all of the options to their default
values, simply leave off the :code:`options` parameter, as in:

.. Code-Block:: JavaScript

  let gl = canvas.getContext('webgl');

The options, as described by https://www.khronos.org/registry/webgl/specs/1.0/#5.2.1, are:

* **alpha** {Boolean} (default is :code:`true`) :raw-html:`<br>`
  "If the value is true, the drawing buffer has an alpha channel for the
  purposes of performing OpenGL destination alpha operations and compositing with
  the (web) page. If the value is false, no alpha buffer is available."
  :raw-html:`<br><br>`

  Comments:

* **depth** {Boolean} (default is :code:`true`) :raw-html:`<br>`
  "If the value is true, the drawing buffer has a depth buffer of at least 16 bits.
  If the value is false, no depth buffer is available."
  :raw-html:`<br><br>`

  Comments: A *depth buffer* is required for *hidden-surface removal*. There
  might be rare cases where *hidden-surface removal* is not needed and in such cases
  setting the **depth** option to *false* would save significant memory.
  :raw-html:`<br><br>`

* **stencil** {Boolean} (default is :code:`false`) :raw-html:`<br>`
  "If the value is true, the drawing buffer has a stencil buffer
  of at least 8 bits. If the value is false, no stencil buffer is available."
  :raw-html:`<br><br>`

  Comments:
  :raw-html:`<br><br>`

* **antialias** {Boolean} (default is :code:`true`) :raw-html:`<br>`
  "If the value is true and the implementation supports antialiasing
  the drawing buffer will perform antialiasing using its choice of technique
  (multisample/supersample) and quality. If the value is false or the
  implementation does not support antialiasing, no antialiasing is performed."
  :raw-html:`<br><br>`

  Comments:
  :raw-html:`<br><br>`

* **premultipliedAlpha** {Boolean} (default is :code:`true`) :raw-html:`<br>`
  "If the value is true the page compositor will assume the drawing
  buffer contains colors with premultiplied alpha. If the value is false
  the page compositor will assume that colors in the drawing buffer are
  not premultiplied. This flag is ignored if the alpha flag is false.
  See Premultiplied Alpha for more information on the effects of the premultipliedAlpha flag."
  :raw-html:`<br><br>`

  Comments:
  :raw-html:`<br><br>`

* **preserveDrawingBuffer** {Boolean} (default is :code:`false`) :raw-html:`<br>`
  "If false, once the drawing buffer is presented as described in
  the Drawing Buffer section, the contents of the drawing buffer
  are cleared to their default values. All elements of the drawing buffer
  (color, depth and stencil) are cleared. If the value is true the
  buffers will not be cleared and will preserve their values
  until cleared or overwritten by the author. On some hardware
  setting the preserveDrawingBuffer flag to true can have significant performance
  implications."
  :raw-html:`<br><br>`

  Comments:
  :raw-html:`<br><br>`

* **preferLowPowerToHighPerformance** {Boolean} (default is :code:`false`) :raw-html:`<br>`
  "Provides a hint to the implementation suggesting that, if possible, it
  creates a context that optimizes for power consumption over performance.
  For example, on hardware that has more than one GPU, it may be the case
  that one of them is less powerful but also uses less power. An
  implementation may choose to, and may have to, ignore this hint."
  :raw-html:`<br><br>`

  Comments:
  :raw-html:`<br><br>`

* **failIfMajorPerformanceCaveat** {Boolean} (default is :code:`false`) :raw-html:`<br>`
  "If the value is true, context creation will fail if the implementation
  determines that the performance of the created WebGL context
  would be dramatically lower than that of a native application making
  equivalent OpenGL calls. This could happen for a number of reasons, including:
  An implementation might switch to a software rasterizer if the user's
  GPU driver is known to be unstable.
  An implementation might require reading back the framebuffer from GPU memory
  to system memory before compositing it with the rest of the page, significantly
  reducing performance. Applications that don't require high performance should
  leave this parameter at its default value of false. Applications that
  require high performance may set this parameter to true, and if context
  creation fails then the application may prefer to use a fallback rendering
  path such as a 2D canvas context. Alternatively the application can retry
  WebGL context creation with this parameter set to false, with the knowledge
  that a reduced-fidelity rendering mode should be used to improve performance."
  :raw-html:`<br><br>`

  Comments:
  :raw-html:`<br><br>`

