..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

1.8 - Software Coding Standards
:::::::::::::::::::::::::::::::

From the very beginning of WebGL program development you need to use
good programming standards. This is a "chicken or the egg" problem. How can you
discuss coding standards before you know a language? You can't really, but discussing
coding standards after you learn a programming language is too late. So the
answer is to discuss coding standards **before**, **during**, and **after** you learn
a new language.

All of the example code in this textbook follows good programming standards as defined
in the hyperlinked documents below. Please use these coding standards as you
develop your own WebGL programs.

* `HTML(5) Style Guide and Coding Conventions`_
* `JavaScript Naming Conventions`_
* `OpenGLSL (Open Graphics Language Shader Language)`_

The major recommendations from these coding standards are listed below for
conciseness. If you want the full rational for any of the rules, please refer to
the original reference documents.

HTML Coding Standards
---------------------

* Always declare the document type as the first line in your document: :code:`<!doctype html>`
* Use lower case element names: :code:`<p>, <div>`
* Close all elements:  :code:`<p> ... </p>`
* Close empty elements:  :code:`<br />`
* Use lowercase attribute names:  :code:`<div class="...">`
* Quote all attribute values for consistency:  :code:`<div class="...">`
* Don't include spaces around equal signs:  :code:`<div class="...">`
* Try to avoid code lines longer than 80 characters.
* For readability, add blank lines to separate large or logical code blocks.
* For readability, add 2 spaces of indentation for code inside a parent element. Do not use TAB characters.
* Always include a <html>, <head> and <body> tag.
* Always include the language, character encoding, and title tags:

  .. code:: html

    <!doctype html>
    <html lang="en-US">
    <head>
      <meta charset="UTF-8">
      <title>HTML5 Syntax and Coding Style</title>
    </head>

* Include appropriate comments:  :code:`<!-- This is a comment -->`
* Use simple syntax for linking style sheets: :code:`<link rel="stylesheet" href="styles.css">`
* Use simple syntax for loading external scripts:  :code:`<script src="myscript.js">`
* Use the same naming convention in HTML as JavaScript.
* **Always use lower case file names**.
* Use consistent file name extensions: :code:`.html, .css, .js, .frag, .vert, .obj, .mtl`

Javascript Coding Standards
---------------------------

* Always include :code:`"use strict";` to force the declaration of variables.
* Avoid global variables whenever possible.
* Use JSLint to check for errors and style issues. (Most IDE's will do this for you, including `Pycharm`_.)
* Use two-space indentation.
* Use shorthand for conditional statements where appropriate: :code:`var results = (test === 5) ? alert(1) : alert(2);`
* Closing braces should be on the same indent as the original statement. For example,

  .. code:: js

    function func() {
      return {
        "name": "Batman"
      };
    }

* Naming conventions:

  * Constructors start with a capital letter.
  * Methods/functions start with a small letter.
  * Methods/functions should use camel case.  :code:`thisIsAnExample`
  * Variables should always use an underscore between words. :code:`this_is_an_example`
  * When appropriate, include the variable type in the name. :code:`value_list`
  * Element ID's and class names should always use an underscore between words.
  * Private methods should use a leading underscore to separate them from public methods.
  * Abbreviations should be avoided.
  * Plurals should not be used when assigning names.
  * Comments should be included within reason.
  * Use `YUIDoc`_ to document functions. For example,

    .. code:: javascript

      /**
       * Reverse a string
       *
       * @param  {String} input_string String to reverse
       * @return {String} The reversed string
       */
      function reverseString(input_string) {
        // ...
        return output_string;
      };

GLSL Coding Standards
---------------------

* Put the GLSL version number at the top of each shader. (E.g, :code:`#version 103` means version 1.03)
* Include appropriate comments in your code.

  * Write :code:`//VERTEX SHADER` at the top of your vertex shader.
  * Write :code:`//FRAGMENT SHADER` at the top of your fragment shader.

* Avoid "all-in-one-shaders". Write separate shaders as needed.

Refer back to this page as needed. Consistency in coding is important.

Glossary
--------

.. glossary::

  coding standard
    a set of rules that make programming code easier to understand, easier to
    modify, and more cross-platform compatible.

  HTML
    hypertext markup language - a language for describing the contents of a web page

  JavaScript
    a programming language for manipulating a web page after it has been downloaded to a client's computer.
    JavaScript is **not** related to Java.

  GLSL
    graphics language shader language - a programming language used in the graphics pipeline to
    manipulate graphics data.

Self-Assessments
----------------

.. mchoice:: 1.8.1
    :random:
    :answer_a: &#60;!doctype html&#62;
    :answer_b: &#60;head&#62
    :answer_c: &#60;body&#62
    :answer_d: &#60;title&#62
    :correct: a
    :feedback_a: Correct, this describes what kind of data the file contains.
    :feedback_b: Incorrect, the &#60;head&#62 tag describes a web page's meta-data, not the file's entire contents.
    :feedback_c: Incorrect, the &#60;body&#62 tag describes a web page's visible elements.
    :feedback_d: Incorrect, the &#60;title&#62 tag gives a title string to the web page, which is typically displayed by a browser in its tab name.

    What should always be the first line of a web page description file?

.. mchoice:: 1.8.2
    :random:
    :answer_a: example_file_name.js
    :answer_b: Example.html
    :answer_c: AGoodFileName.vert
    :answer_d: anExample_to_follow.xyz
    :correct: a
    :feedback_a: Correct, use only lower case in file names. (For some operating systems, Abc.txt and abc.txt are different files, while for other operating systems, they are the same file.)
    :feedback_b: Incorrect. Don't use upper case letters.
    :feedback_c: Incorrect. Don't use upper case letters.
    :feedback_d: Incorrect, because it mixes CamelCase and underscores, and it has an unrecognized file extension.

    Which of the following file names meet the coding standard? (Select all that apply.)

.. mchoice:: 1.8.3
    :random:
    :answer_a: class
    :answer_b: variable
    :answer_c: function
    :answer_d: private function
    :correct: a
    :feedback_a: Correct. Class names always begin with a capital letter.
    :feedback_b: Incorrect. Variable names use lower only case letters and no CamelCase.
    :feedback_c: Incorrect. Functions should always start with a small letter.
    :feedback_d: Incorrect. Private functions should always start with an underscore, _.

    If :code:`MyExample` is a JavaScript identifier that follows the coding standard, what is it the name of?

.. mchoice:: 1.8.4
    :random:
    :answer_a: an array
    :answer_b: a single float
    :answer_c: a string
    :answer_d: an integer
    :correct: a
    :feedback_a: Correct, since the type is included in the name.
    :feedback_b: Incorrect.
    :feedback_c: Incorrect.
    :feedback_d: Incorrect.

    If :code:`apples_array` is a JavaScript identifier that follows the coding standard, what type of data does it hold?


.. index:: coding standard, HTML, JavaScript, GLSL


.. _HTML(5) Style Guide and Coding Conventions: http://www.w3schools.com/html/html5_syntax.asp
.. _JavaScript Naming Conventions: http://www.j-io.org/Javascript-Naming_Conventions
.. _OpenGLSL (Open Graphics Language Shader Language): https://www.opengl.org/wiki/GLSL_:_recommendations
.. _Pycharm: https://www.jetbrains.com/pycharm/
.. _YUIDoc: https://github.com/yui/yuidoc



