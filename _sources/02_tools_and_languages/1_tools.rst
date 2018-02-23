..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

2.1 - Tools Setup
:::::::::::::::::

You need two tools for WebGL program development:

1. An IDE (integrated development environment) to assist in writing good code.
2. A web server.

Install an IDE
--------------

A good integrated development environment (IDE) is an essential tool for
developing good software. Configure your favorite IDE to perform
syntax highlighting, style checking, and error checking for the following
languages:

* HTML
* CSS
* JavaScript
* GLSL

If you don't already have a favorite IDE, JetBrain's `PyCharm-edu`_
or `WebStorm`_ are good options.

Install a Web Server
--------------------

To test your WebGL programs, run a local web server on your computer.
Many features of WebGL programs will not execute in your browser if you simply
open files locally. The program files must be loaded into your browser
by a web server. You will load your programs using 'localhost' with a URL
something like

.. Code-block:: html

  http://localhost/path/to/file/file.html

The `Apache2`_ web server is recommended, but any web server will do. After
you install the web server, configure it to access your
WebGL program files. The configuration will vary based on your operating
system and the specific web server you install.

If you are on a Macintosh, the Apache2 web server is already installed.
Configure it using `these instructions`_.

If you are on a Microsoft Windows computer, install Apache2
from `here`_ and then `configure it`_. You should run the Apache2 web server
as a "service" so that it starts every time you reboot.
See the instructions for this in `configure it`_.

Glossary
--------

.. glossary::

  integrated development environment (IDE)
    a program that combines a text editor with syntax highlighting,
    syntax checking, error checking and version control features to
    enhance code development.

  web server
    a program that listens for HTTP requests and responds by sending
    requested web pages and other files back to the requester.

Self-Assessments
----------------

.. mchoice:: 2.1.1
  :random:
  :answer_a: HTML
  :answer_b: CSS
  :answer_c: JavaScript
  :answer_d: GLSL
  :answer_e: Java
  :correct: a,b,c,d
  :feedback_a: Correct, HTML is the web page description.
  :feedback_b: Correct, CSS formats the HTML elements.
  :feedback_c: Correct, JavaScript allows programming logic to execute on the client.
  :feedback_d: Correct, GLSL is the language for WebGL shaders.
  :feedback_e: Incorrect, you will not be using Java.

  Which of the following languages should be supported by your IDE? (Select all that apply.)

.. shortanswer:: 2.1.2
  :optional:

  What IDE will you be using for code development?

.. mchoice:: 2.1.3
  :random:
  :answer_a: localhost
  :answer_b: webgl.com
  :answer_c: apache2
  :answer_d: mylocalserver
  :correct: a
  :feedback_a: Correct, localhost evaluates to your local IP address.
  :feedback_b: Incorrect, a remote server will not be able to serve up files on your hard drive.
  :feedback_c: Incorrect, apache2 is the name of the program that is running the local web server, but it is not the server's name.
  :feedback_d: Incorrect, this name has no predefined meaning.

  What server name will you use when you are testing your WebGL programs using your locally installed web server?


.. index:: IDE, PyCharm, Apache2 Web Server

.. _PyCharm-edu:  https://www.jetbrains.com/pycharm-edu/
.. _WebStorm: https://www.jetbrains.com/webstorm
.. _Apache2: https://httpd.apache.org/
.. _here: http://www.apachehaus.com/cgi-bin/download.plx
.. _these instructions: https://medium.com/@JohnFoderaro/how-to-set-up-apache-in-macos-sierra-10-12-bca5a5dfffba
.. _configure it: https://httpd.apache.org/docs/2.4/platform/windows.html

