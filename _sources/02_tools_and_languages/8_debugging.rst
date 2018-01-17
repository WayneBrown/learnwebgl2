..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

2.8 - Debugging
:::::::::::::::

.. role:: raw-html(raw)
   :format: html

Your workflow for developing WebGL programs will look like this:

.. Code-block:: javascript

  // Use an IDE to create your program files.

  while (your_program_is_not_finished) {
    /* Load your web page into your browser using localhost to test.

       Use the browser's "development tools" to debug your program, including:
         * Discovering errors in the console window.
         * Setting breakpoints on code lines to step through your coding statements.
         * Using the JavaScript console to experiment.

       Use your IDE to modify your source files. */
  }

Most web browsers include "development tools" that allow a web designer to
analyze their web sites and to fix problems. For brevity, this textbook
only discusses how to use the Google Chrome development tools.

Google Chrome Development Tools
-------------------------------

To open Google Chrome's development tools, do one of the following:

* From the main drop-down menu select "More tools" and then "Developer Tools".
* From the View menu --> Developer --> Developer Tools
* Right-click on any element in a web page and select "Inspect"
* Shortcut command: (Windows) CRTL + SHIFT + I, (Mac) CMD + OPT + I

Covering all of the tools in Google Chrome is beyond the scope of this
textbook, but you need to become very adept at performing the following tasks:

* Setting break points in Javascript code and executing your code to the break point.
* Stepping through your code one statement at a time.
* Examining variables and their values.
* Using the run-time stack to trace code execution.
* Modifying code in your browser to make a program work successfully before
  modifying your source code.
* Using the console window for experimentation.

To learn the basics of the developer tools and an overview of what is
possible, please watch this `9 minute video tutorial`_.

To learn how to use the JavaScript Debugger in the development tools,
please watch this `11 minute video tutorial`_.

Debugging principles
--------------------

A WebGL 3D graphics program is a complex combination of logic and data.
You will need strong debugging skills to make WebGL programs work properly.
The following debugging principles will be key to your success.

* **Whenever possible, start with a working program and modify it in small increments.**
  :raw-html:`<br />`
  If you add 100 lines of code and your software stops working, you have
  100 places to look for your problem. If you add four lines of code and your
  software stops working, you have four places to look. In which situation
  will you find your error more quickly? :raw-html:`<br /><br />`

* **Learn how to efficiently use your browser's debugger.**
  :raw-html:`<br />`
  If your code stops
  working, place a breakpoint at the first line of your new code and
  reload your web page. When execution halts at the breakpoint, step
  through your code one line at a time. Make sure that every variable
  has an accurate value before executing the next line. If a variable has
  an incorrect value, you can change its value in the console window before
  executing the next line. This allows you to continue debugging after you
  find your first error. :raw-html:`<br /><br />`

* **Use the Javascript console for experimenting.**
  :raw-html:`<br />`
  Don't change your code,
  re-load the web page, and "hope for the best." When you have a statement
  that does not produce the desired value for a variable, use the
  Javascript console to experiment with various statements until you find
  a new statement that works. Then modify your code with your proven correction.
  Now you can re-load your web page and perform a final validation. You will be
  amazed at how much time this will save you.

Experiment
----------

Please open the developer tools on a web page and experiment.

If there are specific features in the developer tools that you want to
learn about, there is probably a video tutorial that explains it. So, as
time allows, explore the tools.

Glossary
--------

.. glossary::

  debugging
    the modification of program code to remove errors.

  break point
    a location in program code where execution will halt. The code can be executed from this
    point one statement at a time.

  run-time stack
    the sequence of function calls that were made to get to the current execution point.

  JavaScript console
    the location where messages are displayed and interactive statements can be executed.

Self-Assessments
----------------

.. mchoice:: 2.8.1
  :random:
  :answer_a: Write lots and lots of code and test it after it is all finished.
  :answer_b: Ignore the browser development tools and just guess where errors happened.
  :answer_c: Ignore the JavaScript console interpreter.
  :answer_d: Start with a working program, add a few lines of new functionality, and test immediately.
  :correct: a,b,c
  :feedback_a: Correct. This is a horrible idea and will make software development very frustrating.
  :feedback_b: Correct. This is a horrible idea and will make software development very frustrating.
  :feedback_c: Correct. Ignoring the interpreter means you will go through many cycles of execution before finding a solution that works, wasting much time.
  :feedback_d: Incorrect. This is the best way to develop software.

  Which of the following are really **bad** software development ideas? (Select all that apply.)


.. index:: Google Chrome developer tools, debugging, break point, run-time stack, JavaScript console


.. _9 minute video tutorial: https://www.youtube.com/watch?v=FQKvro1Wz-E
.. _11 minute video tutorial: https://www.youtube.com/watch?v=htZAU7FM7GI
