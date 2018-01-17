..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

1.7 - Software Organization For WebGL Programs
::::::::::::::::::::::::::::::::::::::::::::::

A WebGL program is made up of a significant amount of software.
Without good software organization and abstraction, your
ability to maintain and enhance these graphic programs over time will be greatly diminished.
Most programmers dislike having a prescribed software structure imposed on them.
There are many ways to design software and a good design for one programmer
might be confusing to a different programmer. But there is no
getting around the fact that a well designed software structure is needed.

JavaScript supports object-oriented programming and the software in this
textbook is designed as a **collection of objects** for the following
important reasons:

* Javascript has a large number of variables and functions in its global address space.
  You should always design software that limits the number of values and
  functions that are defined globally, but even more so for JavaScript.
  This protects you from overwriting and redefining built-in Javascript
  functionality.

* Good software design mandates that data and its related functionality
  be combined into a logical unit.
  This creates a logical organization of your code, and
  protects the data inside each object from accidental modification.

* Your code should be structured in a way that facilitates multiple
  3D graphics renderings in multiple canvas windows on a single
  web page. Creating Javascript
  classes that can be used to create separate object instances, one
  for each canvas rendering, just makes sense.

* Some of your Javascript code can be generic enough to be re-used
  for a variety of graphics projects. Other code will be
  very program specific. If you don't separate generic code
  from program specific code, you will limit your code re-use.
  WebGL applications are complex and you will want to re-use
  code as often as possible.

* WebGL code is interdependent. If you change one statement
  in a shader program it might require you to change many aspects
  of your related Javascript code. Object-oriented design will
  help you to separate interdependent code from other "standalone" code.

* The importance of isolating one-time initialization code
  from repeatedly executed rendering code can't be overstated. Your code
  should make it very clear which logic is executed only once as
  a pre-processing step. This will make it easier for you to optimize
  your graphics for real-time rendering speeds.

A sample of the software structure used in these tutorials is shown in the UML (Unified
Modeling Language) diagram below. The arrows indicate relationships. The
classes in blue boxes are static Javascript libraries that remain unchanged
from one WebGL program to another. The classes in the orange boxes are
Javascript code that changes based on the sophistication and type of
graphics being produced.

.. image:: Figures/software_design.png
  :align: center

.. raw:: html

  <br>

The details of the UML diagram above are not important at this point. What
is important is that you understand that object-oriented programming will
be critical to the successful implementation of your WebGL programs. For example,
a scene is typically composed of multiple models. It makes sense to create
an object for each model. This isolates the complexity of each model in
a separate JavaScript object and it greatly facilitates code re-use.

The Javascript classes defined in this software design are written with
understanding and clarity in mind. They are well documented,
broken into separate files, and coded using descriptive names. These
classes are open-source and intended for your re-use. If you were to use
them as part of a larger "production" program, they would typically
be combined into fewer files and `minified`_ by removing
white space and comments. It is not recommended that you minify your
Javascript code until you have a completely debugged implementation of your
program. In addition, you are highly encouraged to keep a non-minified version
of your program around for future debugging and enhancements.

Much of your learning from this textbook will come from modifying example
WebGL programs. In some instances you will be able to change one line of code
and see immediate changes in the output. However, as more advanced
computer graphics concepts are introduced, modifications to the example code
will require many simultaneous changes to multiple objects. This is another
reason why the of use good object-oriented design is helpful.

Since you will be studying code examples and modifying existing code,
the next section discusses coding standards.

Glossary
--------

.. glossary::

    JavaScript
        a programming language supported by web browsers that allows for the modification of web pages.
        JavaScript runs on the client computer and performs client-side processing.

    object-oriented programming
        a style of programming where a *class* defines a collection of data and a set of
        methods/functions that manipulates that data. Multiple *instances of a class*
        can be created to implement separate *objects* of the class.

    class
        a collection of data and a set of methods/functions that manipulates that data.

    object
        an instance of a *class* that contains unique data. The manipulation of an object
        does not affect other objects implemented from the same *class*.

    global identifier
        a variable or function that can be used anywhere in a program. Global identifiers
        are bad and should be avoided whenever possible.

Self-Assessments
----------------

.. mchoice:: 1.7.1
    :random:
    :answer_a: the constructor of an object can perform the one-time pre-processing tasks needed for rendering.
    :answer_b: methods of an object can perform the actions needed at render time.
    :answer_c: it reduces the number of global variables that have to be created.
    :answer_d: WebGL is an object-oriented system.
    :correct: a,b,c
    :feedback_a: Correct, when the constructor creates an object, the pre-processing tasks can be done once.
    :feedback_b: Correct, tasks that must be preformed repeatedly can be performed by an object's methods.
    :feedback_c: Correct, an object encapsulates data and functions that would be global otherwise.
    :feedback_d: Incorrect. WegGL is collection of function calls and it is not explicitly object-oriented.

    Object-oriented programming facilitates WebGL programming because ... (Select all that apply.)

.. mchoice:: 1.7.2
    :random:
    :answer_a: True
    :answer_b: False
    :correct: a
    :feedback_a: Correct, since multiple instances of a class can be created as needed.
    :feedback_b: Incorrect.

    Object-oriented programming facilitates code re-use.

.. mchoice:: 1.7.3
    :random:
    :answer_a: Global variables can be accidentally redefined, which can make errors very difficult to track down.
    :answer_b: If you pick a variable name that JavaScript is already using for some other data, you might be modifying JavaScript in ways you don't understand.
    :answer_c: Global variables can't be changed easily.
    :answer_d: Your global variables might be changed by the browser.
    :correct: a,b
    :feedback_a: Correct, especially when JavaScript already has many, many global variables.
    :feedback_b: Correct. There are so many JavaScript global variables, you could easily pick a name that is already in use for something else.
    :feedback_c: Incorrect. Global variables nca be changed anywhere in a program.
    :feedback_d: Incorrect. The browser doesn't know about your global variables.

    Object-oriented programming encapsulates a group of related data values and
    functionality that can manipulate that data. In so doing, many variables that
    would otherwise be global variables are contained inside a single object instance.
    This reduces the number of global variables in a program. Why is this so important?  (Select all that apply.)


.. index:: JavaScript, object-oriented programming, class, object, global identifier

.. _minified: https://en.wikipedia.org/wiki/Minification_(programming)

