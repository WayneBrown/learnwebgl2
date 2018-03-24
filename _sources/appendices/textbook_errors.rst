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

Textbook Errors
:::::::::::::::

The WebGL programs in this textbook were verified to execute correctly
as of April 2018 in the following environments:

* macOS Sierra, version 10.12.6, using Chrome Version 65.0.3325.181
* Windows 7 Enterprise, Service Pack 1, using Chrome Version 65.0.3325.181
* Ubuntu 16.04 LTS (in a VMWare Player), using Firefox 59.0.1 (64-bit)

The following are unresolved errors in this textbook as of April 2018:

* Lesson 11.6 on Procedural Texture Mapping :raw-html:`<br>`
  Section "Designing Overlay Patterns": :raw-html:`<br>`

  * On Ubuntu using Firefox, the WebGL program generates no errors to
    the console window, but does not render any graphics.
  * The WebGL programs executes correctly on the other platforms.
    :raw-html:`<br><br>`

* Lesson 11.9 on Heightmaps and Displacement Maps :raw-html:`<br>`
  All three WebGL programs:

  * On Ubuntu using Firefox, all three WebGL programs do not
    execute because the WebGL 1.0 implementation does not allow :code:`texture2D`
    calls in *vertex shaders*.
  * The WebGL programs execute as desired on the other platforms. :raw-html:`<br><br>`

* Lesson 12.4 on Transparency :raw-html:`<br>`
  Sections: "Experimentation" and "Experiment with overlapping transparent surfaces" :raw-html:`<br>`

  * On Ubuntu using Firefox, the WebGL program renders random artifacts
    on some of the transparent surfaces.
  * The WebGL programs execute as desired on the other platforms. :raw-html:`<br><br>`

* Lesson 12.5 on Color Blending :raw-html:`<br>`
  Sections: "Experiment with color blending" and "Experiment with color blending" :raw-html:`<br>`

  * On Ubuntu using Firefox, the WebGL program renders random artifacts
    on some of the transparent surfaces.
  * The WebGL programs execute as desired on the other platforms. :raw-html:`<br><br>`

* Lesson 12.8 on Particle Systems :raw-html:`<br>`
  Section "Experimentation" :raw-html:`<br>`

  * On Ubuntu using Firefox, the WebGL program does not render the particle system
    and no errors are reported to the console window.
  * The WebGL program executes as desired on the other platforms. :raw-html:`<br><br>`

* Lesson 12.11 on Overlays :raw-html:`<br>`
  Section "Example: Graphics Under Text" :raw-html:`<br>`
  Section "3D Graphics in Front of Text" :raw-html:`<br>`
  Section "A Fullscreen Example" :raw-html:`<br>`

  * On Ubuntu using Firefox, the WebGL program does not perform alpha blending correctly
    at the boundaries of the model.
  * The WebGL program executes as desired on the other platforms. :raw-html:`<br><br>`

Please report any problems with this textbook to https://github.com/WayneBrown/learnwebgl2/issues.
THANKS!
