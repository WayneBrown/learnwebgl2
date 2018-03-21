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

12.10 - 3D Text
:::::::::::::::

This lesson explains one method of displaying text in a 3D scene.

3D Models of Textual Characters
-------------------------------

To display text in a 3D scene, a geometric model of each character is required.
If the text is static, a single geometric model can be created to represent the entire string.
If text is composed during run-time, a set of individual
models for each possible character must be used to render the string one
character at a time, using transformations to appropriately place each character.

Modeling Static Text
....................

Using Blender:

* Add a *text object*. (Add --> Text.)
* Enter edit mode. (Tab key)
* Edit the *text object's* characters.
* Use the "Font" tool of the "Properties" editor to set properties of the *text object*. Among other things:

  * The font can be modified.
  * The characters can be extruded to 3D by setting the "Geometry" "Extrude" value.
  * The edges of the characters can be beveled using the "Geometry" "Depth" value.

* Exit edit mode. (Tab key)
* Convert the *text object* to a geometric model. (ALT-C --> "Mesh from Curve/Meta/Surf/Text")
* Manipulate the polygonal mesh as needed or desired. (For example, rotate the model 90 degrees
  about the x axis to make it face "forward" instead of "up".)
* Export the model to an :code:`*.obj` data file and render it in a WebGL program as any other 3D model.

Modeling Dynamic Text
.....................

Using Blender:

* Add a *text object*. (Add --> Text.)
* Enter edit mode. (Tab key)
* Add a single instance of every possible character that a text string might contain. For example,
  here is every possible ASCII character in their ASCII order (ordinal values 33 through 126).

  .. Code-block:: text

    !"#$%&'()*+,-./0123456789:;<=>?
    @ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_
    `abcdefghijklmnopqrstuvwxyz{|}~

* Use the "Font" tool of the "Properties" editor to set properties of the *text object*.
* Exit edit mode. (Tab key)
* Convert the *text object* to a geometric model. (ALT-C --> "Mesh from Curve/Meta/Surf/Text")
* Select the model and enter edit mode. (Tab key)
* Select each character and make it a separate model. ("P" --> Selection.)
* Use the "Outliner" to give each model
  an appropriate name. (The model name should be a legal JavaScript variable name.) The
  WebGL program below uses names that start with a "c" and include the ordinal value of
  the character. For example, "A" has the name "c65".
* Export the models to an :code:`*.obj` data file.

In a WebGL program, a dynamic string must be parsed into its individual characters and
each character rendered as a separate model. The translation of each model to an appropriate
location in the string is performed by a translation matrix.

Some fonts are proportional -- each character has a different width. Other
fonts are non-proportional -- each character has the same width. In either case,
code can be written to gather information about each character's model and this
data can be used to space the characters appropriately.

Experiments
-----------

Please experiment with the following WebGL program and study the JavaScript code.

.. webglinteractive:: W1
  :htmlprogram: _static/12_text_3d/text_3d.html
  :editlist: _static/12_text_3d/text_3d.js, _static/12_text_3d/text_3d_scene.js

Notes:

* Non-printable characters, such as spaces and new-lines must be dealt with
  as special cases. A "space" character increases the distance to the next
  character and does not render a model. A "new-line" character must reset
  the horizontal and vertical offsets to the next character.

* The depth of the characters can be adjusted in real-time by scaling the
  z axis. However, this introduces non-uniform scaling. If lighting is
  used for rendering, a special transformation matrix (the inverse transposed)
  must be created and used to transform the normal vectors of the
  character models. If possible, assign an appropriate depth for the
  character models when they are created in Blender and avoid non-uniform
  scaling.

* The spacing between characters in a string is called `kerning`_. The
  spacing between lines can vary, such as "single spacing," "double spacing,"
  etc. Given the many choices in fonts, kerning, and line spacing, a software
  implementation must make many decisions on how to produce a desired textual rendering.

Glossary
--------

.. glossary::

  text
    a sequence of characters from an alphabet.

  3D text
    a rendering of text in 3D space.

Self Assessment
---------------

.. mchoice:: 12.10.1
  :random:

  Suppose the text string "Yeah" is needed in a 3D scene and it will never change.
  How many models are needed to render this string into the scene?

  - one

    + Correct.

  - four

    - Incorrect. It could be modeled as four separate characters, but why go to the trouble?

  - eight

    - Incorrect. Each character could be modeled using two separate models, but why?

  - none (just use the :code:`gl.renderText()` function)

    - Incorrect. No such function in the WebGL API exists.

.. mchoice:: 12.10.2
  :random:

  Suppose there is a need to display various text strings in a 3D scene, but
  the characters in those strings are not know in advance. It is known that
  examples include "This", "that", and "whatever." In addition, digits or
  special characters will never be included.
  How many models are needed to render these strings into the scene?

  - 52

    + Correct. Upper and lower case for each of the 26 letters in the English alphabet.

  - 26 (each letter in the english alphabet)

    - Incorrect. What about upper and lower case letters?

  - 1

    - Incorrect.

  - 20

    - Incorrect.

.. mchoice:: 12.10.3
  :random:

  How does the WebGL program above decide the width of a "space" character?

  - It uses the average width of all character models.

    + Correct.

  - It uses the width of the capital "A" character.

    - Incorrect. The capital "A" character is used to set the :code:`baseline`
      and :code:`character_height` values, but not the width of a space.

  - It uses the width of the model that describes a "space".

    - Incorrect. No such model is included in the character models. A "space"
      model has no geometry, so it has no model.

  - It uses the width of the "m" character.

    - Incorrect.

.. mchoice:: 12.10.4
  :random:

  The WebGL program above renders characters using models from a proportional font.
  How could the program be simplified if the characters were defined from a
  non-proportional font. (Select all that apply.)

  - The variable :code:`sizes` would not need to be an array; it could be a
    single set of MIN/MAX values.

    + Correct. Because each model would have the same size.

  - The doubly nested loop in :code:`_gatherCharacterInfo()` could be simplified
    to a single loop.

    + Correct. Because only one character would need to be tested for its size.

  - The height of the characters could be hard-coded instead of calculated.

    - Incorrect. The height could be hard-coded, but not because the font is non-proportional.

  - The depth along the z axis of the characters could be set to zero instead of calculated.

    - Incorrect. The depth could be hard-coded, but not because the font is non-proportional.


.. index:: text 3D

.. _kerning: https://en.wikipedia.org/wiki/Kerning