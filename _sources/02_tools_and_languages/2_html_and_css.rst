..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

2.2 - HTML and CSS
::::::::::::::::::

HTML (hypertext markup language) and CSS (cascading style sheets) are used
to describe web pages. HTML describes the content of the page while CSS describes
the formatting of individual elements. If a web page is designed with special care,
the HTML code can remain static, while
the CSS style sheets can change based on the target screen. For example, a web
page might have very different formatting for a large desktop computer screen
as compared to a mobile phone screen.

Tutorials
---------

To build WebGL programs you need to understand the basics of HTML and CSS code;
you don't have to master all their intricate complexities.

Basic HTML and CSS can be learned from many on-line tutorials. Please
use the tutorials at `code academy`_ to learn how to create basic HTML and
CSS code.

.. admonition:: STOP!

  Please don't proceed with this lesson until you have learned **basic** HTML and CSS.

Resources
---------

These "cheat sheets" will be helpful to you:

* `HTML 4.0 Cheat Sheet`_ (`source cheatography.com <http://www.cheatography.com/davechild/cheat-sheets/html4/>`_)
* `CSS 3.0 Cheat Sheet`_ (`source gamifyedu.co <http://gamifyedu.co/wd/epicquest/extras/css3-cheat-sheet.pdf>`_)

This exhaustive cheat sheet for HTML 5 might be overwhelming, but useful at
the same time:

* `HTML 5.0 Cheat Sheet`_ (`source smashingmagazine.com <https://www.smashingmagazine.com/wp-content/uploads/images/html5-cheat-sheet/html5-cheat-sheet.pdf>`_)

If you want to experiment with HTML and CSS, https://jsfiddle.net/ is an excellent
"sandbox" where you can immediately view the results of your HTML and CSS code.

HTML User Input
---------------

The main HTML element tag we will use for WebGL programs in the :code:`<input ... />`
element which allows a user to specify values that can be used to control
a canvas 3D rendering. Here is a list of the standard input elements we will use
to create user interfaces:

+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+
| **input type** | **HTML code**                                                              | **Example rendering**                                                 |
+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+
| text           | :code:`<input type="text" value="abc" />`                                  | .. raw:: html                                                         |
|                |                                                                            |                                                                       |
|                |                                                                            |   <input type="text" value="abc" />                                   |
+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+
| number         | :code:`<input type="number" value="10" min="1" max="20" step="0.5"/>`      | .. raw:: html                                                         |
|                |                                                                            |                                                                       |
|                |                                                                            |   <input type="number" value="10" min="1" max="20" step="0.5"/>       |
+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+
| range          | :code:`<input type="range" value="15" min="10" max="20" step="0.1"/>`      | .. raw:: html                                                         |
|                |                                                                            |                                                                       |
|                |                                                                            |   <input type="range" value="15" min="10" max="20" step="0.1"/>       |
+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+
| button         | :code:`<input type="button" value="click me" />`                           | .. raw:: html                                                         |
|                |                                                                            |                                                                       |
|                |                                                                            |   <input type="button" value="click me" />                            |
+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+
| image          | | :code:`<input type="image" alt="some text" src="_images/login.png"`      | .. raw:: html                                                         |
|                | | :code:`width="50%" height="50%" />`                                      |                                                                       |
|                |                                                                            |    <input type="image" value="some text" src="../_images/login.png"   |
|                |                                                                            |    width="50%" height="50%" />                                        |
+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+
| checkbox       | | :code:`<input type="checkbox" checked="checked" />`                      | .. raw:: html                                                         |
|                | | :code:`<span>Example</span>`                                             |                                                                       |
|                |                                                                            |   <input type="checkbox" checked="checked" />                         |
|                |                                                                            |   <span>Example</span>                                                |
+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+
| radio          | | :code:`<input type="radio" name="my_radio" value="one" />`               | .. raw:: html                                                         |
|                | | :code:`abc<br />`                                                        |                                                                       |
|                | | :code:`<input type="radio" name="my_radio" value="two" />`               |   <input type="radio" name="my_radio" value="one" />abc<br />         |
|                | | :code:`def<br />`                                                        |   <input type="radio" name="my_radio" value="two" />def<br />         |
|                | | :code:`<input type="radio" name="my_radio" value="three" />`             |   <input type="radio" name="my_radio" value="three" />ghi<br />       |
|                | | :code:`ghi<br />`                                                        |                                                                       |
|                |                                                                            |                                                                       |
|                |                                                                            |                                                                       |
+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+
| color          | :code:`<input type="color" value="#FF0000" />`                             | .. raw:: html                                                         |
|                |                                                                            |                                                                       |
|                |                                                                            |   <input type="color" value="#FF0000" />                              |
+----------------+----------------------------------------------------------------------------+-----------------------------------------------------------------------+

Each :code:`<input ... />` element will be assigned a unique ID so that it can be easily
accessed and modified as needed. For example, :code:`<input id="button1" type="button" value="click me" />`.

.. admonition:: No :code:`<form>` tags needed:

  You do not need to put :code:`<input>` tags inside a :code:`<form>` element.
  Forms are used to transfer data back to a web server. WebGL programs typically
  use the input data in the client to modify 3D graphics.

HTML Coding Standards
---------------------

These coding standards were introduced in chapter 1, but please study them
again now that you better understand HTML and CSS.

+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| **Rule**                                     | **Correct Example(s)**                             | **Incorrect Example(s)**               |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Always declare the document type as          | :code:`<!doctype html>`                            |                                        |
| the first line in your document.             |                                                    |                                        |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Use lower case element names.                | :code:`<p>, <div>`                                 | :code:`<P>, <Div>`                     |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Close all elements.                          | :code:`<p>example</p>`                             | :code:`<p>example`                     |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Close empty elements.                        | :code:`<br />`                                     | :code:`<br>`                           |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Use lowercase attribute names.               | :code:`<div class="...">`                          | :code:`<div CLASS="...">`              |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Quote all attribute values for consistency.  | :code:`<div class="example">`                      | :code:`<div class=example>`            |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Don't use spaces around equal signs.         | :code:`<div class="...">`                          | :code:`<div class = "...">`            |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Try to avoid code lines longer than 80 characters.                                                                                         |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| For readability, add blank lines to separate large or logical code blocks.                                                                 |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| For readability, add 2 spaces of indentation | .. Code-block:: html                               | .. Code-block:: html                   |
| for code inside a parent element. Do not     |                                                    |                                        |
| use TAB characters.                          |   <p>                                              |   <p>                                  |
|                                              |     Indented text.                                 |   Non-indented text                    |
|                                              |   </p>                                             |   </p>                                 |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Always include a :code:`<html>`, :code:`<head>` and :code:`<body>` tag.                                                                    |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Include appropriate comments:                | :code:`<!-- This is a comment -->`                 |                                        |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Use simple syntax for linking style sheets.  | :code:`<link rel="stylesheet"`                     |                                        |
|                                              | :code:`href="styles.css">`                         |                                        |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Use simple syntax for loading external       | :code:`<script src="myscript.js">`                 |                                        |
| scripts.                                     |                                                    |                                        |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Use the same naming convention in HTML as JavaScript.                                                                                      |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Always use lower case file names.            | :code:`my_file.txt`                                | :code:`MyFile.Txt`                     |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Use consistent file name extensions.         | :code:`.html, .css, .js,`                          | :code:`.HTM, .text`                    |
|                                              | :code:`.frag, .vert, .obj, .mtl`                   |                                        |
+----------------------------------------------+----------------------------------------------------+----------------------------------------+
| Always include the *language* and *character encoding* meta-data and the :code:`<title>` element.                                          |
+--------------------------------------------------------------------------------------------------------------------------------------------+

A complete example:

.. Code-block:: html
  :emphasize-lines: 2,4,5

  <!doctype html>
  <html lang="en-US">
  <head>
    <meta charset="UTF-8">
    <title>Example</title>
  </head>
  <body>
    Page elements
  </body>
  </html>

Summary
-------

As with all software development, when you design a web page you should
start with a very simple HTML document and add complexity little by little.

Self-Assessments
----------------

.. mchoice:: 2.2.1
  :random:
  :answer_a: &#60;body&#62;
  :answer_b: &#60;head&#62;
  :answer_c: &#60;html&#62;
  :answer_d: &#60;title&#62;
  :correct: a
  :feedback_a: Correct, the body tag contains the page's visible elements.
  :feedback_b: Incorrect, the head tag contains meta-data about the page.
  :feedback_c: Incorrect, the html tag delimits the entire document.
  :feedback_d: Incorrect, the title tag gives a name to the page that is displayed in the browser's tab.

  In a HTML document, which tag contains all of the page's visible elements?

.. mchoice:: 2.2.2
  :random:
  :answer_a: image
  :answer_b: number
  :answer_c: range
  :answer_d: color
  :correct: a
  :feedback_a: Correct, &#60;input type="image" ... &#62; element is a button created from an image.
  :feedback_b: Incorrect, the input type number a user to pick a number from a range of possible values.
  :feedback_c: Incorrect, the input type range presents a slider bar that can be dragged to specify a number in a range.
  :feedback_d: Incorrect, the input type color presents a color picker in a separate, pop-up window.

  Which HTML :code:`<input>` type allows you to create a button from an image?

.. mchoice:: 2.2.3
  :random:
  :answer_a: Every radio button in a group has the same "name" attribute.
  :answer_b: Every radio button in a group has the same "value" attribute.
  :answer_c: Every radio button in a group has the same "type" attribute.
  :answer_d: Every radio button in a group has the same "step" attribute.
  :correct: a
  :feedback_a: Correct, the "name" attribute places a radio button in a unique group.
  :feedback_b: Incorrect, the "value" attribute allows you to assign a unique value to the radio button.
  :feedback_c: Incorrect, the "type" attribute is always "radio" for all radio buttons.
  :feedback_d: Incorrect, radio buttons do not use the "step" attribute.

  A set of *radio* type :code:`<input>` tags only allow one of the radio buttons to be
  selected at one time. How does the browser know which radio buttons form a group?

.. mchoice:: 2.2.4
  :random:
  :answer_a: When the input values inside the &#60;form&#62; need to be sent back to the web server.
  :answer_b: Always!
  :answer_c: Never!
  :answer_d: When you need to arrange the input values in a particular layout.
  :correct: a
  :feedback_a: Correct, &#60;form&#62;s tags group values that need to be sent back to the server.
  :feedback_b: Incorrect, use &#60;form&#62;s only when the input values need to be sent to the server.
  :feedback_c: Incorrect, use &#60;form&#62;s when the input values need to be sent to the server.
  :feedback_d: Incorrect, arrangement of input elements is done by normal HTML and CSS formatting.

  When should :code:`<input>` tags be enclosed in a :code:`<form>`?

.. mchoice:: 2.2.5
  :random:
  :answer_a: &#60;DIV&#62;example&#60;/DIV&#62;
  :answer_b: &#60;input&#62; type="number" value=50 /&#62;
  :answer_c: &#60;input type="image" src="MyImage.png" /&#62;
  :answer_d: &#60;p&#62;example&#60;/p&#62;
  :correct: a,b, c
  :feedback_a: Correct, the &#60;DIV&#62 tag should be in lower case, such as &#60;div&#62
  :feedback_b: Correct, all attributes should be enclosed in quotes, such as &#60;input&#62; type="number" value="50" /&#62;
  :feedback_c: Correct, all file names should be lower case, such as &#60;input type="image" src="my_image.png" /&#62;
  :feedback_d: Incorrect, this HTML code meets the coding standard.

  Which of the following HTML code strings violate the coding standard? (Select all that apply.)


.. index:: HTML, CSS

.. _code academy: https://www.codecademy.com/learn/learn-html
.. _HTML 4.0 Cheat Sheet: ../_static/documents/davechild_html4.pdf
.. _CSS 3.0 Cheat Sheet: ../_static/documents/css3-cheat-sheet.pdf
.. _HTML 5.0 Cheat Sheet: ../_static/documents/html5-cheat-sheet2.pdf

