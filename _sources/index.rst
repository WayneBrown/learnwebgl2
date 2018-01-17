..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

.. Learn Computer Graphics using WebGL: Interactive Edition

.. meta::
    :description: An interactive textbook to learn computer graphics and WebGL
    :keywords: Computer Graphics, WebGL

:::::::::::::::::::::::::::::::::::
Learn Computer Graphics using WebGL
:::::::::::::::::::::::::::::::::::

This interactive textbook will teach you how to create interactive 3D computer
graphics content that can be viewed and manipulated in a web browser.
As you learn computer graphic concepts you will apply them using WebGL --
a version of OpenGL (Open Graphics Library) that works in most web browsers.

.. admonition:: IMPORTANT

    To master the material in this textbook you **must** interact
    with its examples, demos, and self-assessments to verify that
    you understand the concepts being presented. Each lesson
    builds on the previous lessons. Therefore, please don't continue to the next
    lesson until you have a solid understanding of the lesson you just studied.

To understand how this textbook is interactive, please consider the following
examples.

An Example Interactive Matrix Equation
--------------------------------------

The matrix equation below can be manipulated in the following ways:

* Clicking on any operator (e.g, :code:`*` or :code:`=`) in the equation will cause the operation
  to be performed and the results displayed below the equation.
* In the results of an operation, clicking the "-" button will
  simplify the matrix terms, while clicking on the "X" button will remove the
  generated equation from the web page.
* Any element in a matrix that displays an edit box can be modified and the
  operations performed again. This allows you to experiment and learn!

.. matrixeq:: Eq1

    [M1: 1, 0, 0, {0}; 0, 1, 0, 0; 0, 0, -c2, c1; {0}, 0, -1, 0]*[M2: x;y;z;1]  = [M3: x';y';z';w']

An Example WebGL Program
------------------------

The HTML canvas below contains an example WebGL program. Notice the HTML controls
below the graphics that can be used to modify the 3D rendering. Try out the controls.
Also click and drag your mouse cursor inside the canvas window to rotate the
object in arbitrary directions. Pretty cool, don't you think? When you finish this
textbook you will know exactly how to create such 3D interactive graphics.

.. webgldemo:: W1
    :htmlprogram: _static/01_example01/scale_about_origin.html

How to use this Interactive Textbook
------------------------------------

* Study the lessons in the order they are presented in the table of contents.
* Spend time experimenting with each example and demo program.
* Answer the self-assessment questions at the end of each lesson and only proceed
  to the next lesson after all the questions have been answered correctly.
  If any of the material in the lesson is unclear, please study the lesson again.

Proceed to the `Table of Contents <toc.html>`_
----------------------------------------------

Contacts and Acknowledgements
-----------------------------

* If you have questions about this interactive textbook please contact the author at:  `wayne@brown37.net <mailto:wayne@brown37.net>`_.
* This textbook is open source and the files used to build it are available for free at `learnwebgl2 <https://github.com/WayneBrown/learnwebgl2>`_.
* This textbook would not be possible without the tremendous work of Brad Miller and his group of developers that
  have created the "runestone interactive textbook development system." Check out
  the `runestone project <https://github.com/bnmnetp/runestone>`_ on github.com.

.. toctree::
    :hidden:

    toc
