..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

2.3 - JavaScript
::::::::::::::::

.. highlight:: javascript

The JavaScript language was developed alongside HTML to enable the manipulation
of a web page after it has been downloaded to a client.
JavaScript runs silently in the background
to process user events and dynamically modify a web page. If JavaScript code has
problems or produces errors it is designed to fail
silently so that the average user is not aware anything went wrong.

JavaScript and Java have nothing in common. They are totally different languages
designed for different purposes.

Some of the major distinctions of JavaScript are:

* JavaScript is an interpreted programming language; it is not compiled, though
  there are some *just-in-time* (JIT) JavaScript compilers that do increase its execution speed.
* Variables are dynamically typed. The type of data in a variable can change at any time.
  One moment a variable might contain a string, the next moment a number.
* JavaScript never "crashes". If an error occurs, the current thread of execution
  is terminated, but this has no affect on the operation of the web browser.
* JavaScript is a multi-paradigm language that supports ideas from
  object-oriented programming, imperative programming, and functional programming.
* **Everything** in JavaScript is an object. In fact, functions are objects!

Learning Javascript
-------------------

If you have limited or no prior programming experience, you need to study
JavaScript in depth. The `JavaScript tutorials at Code Academy`_ are a
good option. The lessons force you to implement the concepts you are learning
before moving to the next topic. The tutorials will take a considerable
amount of time, but you will learn JavaScript well. If you would like a tutorial
that allows you to work through the material at a faster pace, try
`The Modern JavaScript Tutorial`_.

If you are an experienced programmer, you can skip the tutorials linked
above and just study the document
`An Introduction to JavaScript for Sophisticated Programmers`_.

.. admonition:: STOP!

  Please don't proceed with the rest of this lesson until you have
  learned the **basics** of JavaScript.

Resources
---------

This `JavaScript Quick Reference Card`_ is a good resource to have by your side
as you develop JavaScript code.

Most browsers have a "development environment" where you can experiment with
JavaScript. In Google Chrome, if you right-click anywhere in a web page
and select "Inspect," the development environment will open. Select the "Console"
tab and you can see the output of :code:`console.log()` commands and
you can execute JavaScript commands from the prompt. Try it now!

The remainder of this lesson discusses critical concepts in JavaScript
that you must master if you want to understand the WebGL example
programs in this textbook.

Context
-------

Everything in JavaScript is an *object*. Objects are instances of a *class*.
Objects contain data and have
functions that can manipulate that data. Functions of an object
have a context in which they work. Their context is defined by the data they
can access and the current state of that data. The idea that every function
in JavaScript is executed from a "context" is central to understanding how
JavaScript works. Let's walk through some examples:

* If a function is called because a user clicked on a button, then the
  function is executed in the context of the HTML button element.

* If a function is called from code loaded from a JavaScript file,
  then it is executed in the context of the global address space.

* If a function is called from inside an object, then its context is that object.

There is a keyword in JavaScript that always references the
context from which a function is called. The keyword is called :code:`this`. The
keyword :code:`this` in Java, C++ and other object-oriented programming languages
means something totally different. Do not get them confused.

This is so important that it need to be repeated. In JavaScript, the keyword
:code:`this` references the context from which a function is called.

Classes and Objects in JavaScript
---------------------------------

All of the WebGL programs in this textbook are implemented using objects. Therefore it
is critical that you understand how JavaScript implements *object-oriented programming*.

A *class* is defined in the same way a normal function is defined. The function
definition is basically the constructor of the class. If you call the function
in the normal way, it will act like a normal function. If you use the :code:`new`
command in front of the function call you are creating an object.
Hopefully an example will make this clearer. Here is a simple function definition.

.. Code-block:: javascript

  function Example(a,b,c) {
    // Do some stuff
  }

You can call this function in the normal way and it will perform some processing,
like this:

.. Code-block:: javascript

  Example(alpha, beta, gamma);

Or, you can create an object from the definition like this:

.. Code-block:: javascript

  let my_object = new Example(alpha, beta, gamma);

When you create an object, any data defined inside the function is retained
inside the object and the data can be accessed and modified at a later time.

Public and Private Data in a Class
----------------------------------

By default, variables declared inside a function that defines a class
are private. In the following example, all of the data
and functions are private. (By convention, following our coding standard,
private functions will have a name starting with an underscore, :code:`_`.)

.. Code-block:: javascript
  :linenos:
  :emphasize-lines: 2,5

  function ExampleClass(a,b,c) {
    // Private class variables
    let s,t,u;

    // Private functions
    function _innerOne() {
      // Can manipulate s, t, and u, (and a, b, c).
    }

    function _innerTwo() {
      // Can manipulate s, t, and u, (and a, b, c).
    }
  }

The above example is an *immutable* object because it has no public data
or public functions. To make an object's variables or functions
public you add them to the object as properties. Properties of an object
are accessed using dotted notation, as in :code:`object.property`. Since
JavaScript is an interpreted and dynamic language, new properties can be
added to an object at any time. This can cause hard-to-find errors if you misspell
property names. Instead of manipulating an existing property, a misspelled
property name will add an new unwanted property to an object. So watch your spelling!

When an object is created by calling the :code:`new` command, the :code:`this`
keyword is a reference to the new object (just like in Java and C++). Therefore,
you can prefix any variable or function with the :code:`this` keyword to
make them *public*. Below is an example class definition that includes
both *public*  and *private* data and functions.

.. Code-block:: javascript
  :linenos:
  :emphasize-lines: 6,7,10

  function ExampleClass(a,b,c) {
    // Private class variables
    let s,t,u;

    // Public class variables (actually properties of the object)
    this.m = value1;
    this.n = value2;

    // Public function
    this.doSomething = function () {
      // Can manipulate all private and public data.
      // Can call all private and public functions.
    }

    // Private function
    function _innerOne() {
      // Can manipulate all private and public data.
      // Can call all private and public functions.
    }
  }

An instance of this class (an object) can be created like this:

.. Code-block:: javascript

  let my_object = new ExampleClass(alpha, beta, gamma);

Now that :code:`my_object` exists, the following statements are **valid**
because they are accessing the public members of the object.

.. Code-block:: javascript

  my_object.doSomething();
  my_object.m = 5;

However, the following statements are **invalid** because they are attempting
to use the private members of the object.

.. Code-block:: javascript

  my_object._innerOne();  // would cause a run-time error
  my_object.s = 5;        // would cause a run-time error

But wait! The above example has a major flaw. The value of the keyword
:code:`this` changes with context. When the object is actually used,
the keyword :code:`this` will take on various other values besides a reference
to the object and cause the code to fail. The solution is to not use the keyword
:code:`this` for accessing public members. Instead, set a reference to the object
as a separate local variable and always use the local reference. The first statement
of a class definition will typically be :code:`let self = this` which creates
:code:`self` as a local reference to itself. (There is nothing special about the name :code:`self` --
you could use any variable name -- but using a different name would add more
confusion than it is worth.)

The example below shows how this works. When
the constructor is executed the keyword :code:`this` will be a reference to the new
object because of the :code:`new` command context. In line 3 a private variable
called :code:`self` stores a reference to the new object. Then the local private
variable :code:`self` is used throughout the rest of the class definition.

.. Code-block:: javascript
  :linenos:
  :emphasize-lines: 3,9,10,13

  function ExampleClass(a,b,c) {

    let self = this; // store a local reference to the new object

    // Private class variables
    let s,t,u;

    // Public class variables (actually properties of the object)
    self.m = value1;
    self.n = value2;

    // Public function
    self.doSomething = function () {
      // Can manipulate all private and public data using self.property.
      // Can call all private and public functions using self.property.
    }

    function _innerOne() {
      // Can manipulate all private and public data using self.property.
      // Can call all private and public functions using self.property.
    }
  }

You are encouraged to re-read the above description. Often the second reading
makes more sense.

Garbage Collection
------------------

In Javascript, you never delete objects. When an object is no longer referenced
by any variables, it is automatically deleted and its memory is reclaimed for
other uses. This is referred to as *garbage collection*. Garbage collection
is performed automatically at regular intervals and can't be controlled by a programmer.
For a WebGL program that is trying to produce real-time graphics at 30 frames
per second, *garbage collection* is a horrible idea because it can
happen at seemly random times and cause disruptions in the smooth flow
of an animation. We would like a way to turn *garbage collection* off, but
that is not allowed. Therefore, we do the next best thing and implement
our software so it doesn't create new objects. If there are no un-referenced objects
to reclaim, *garbage collection* happens very quickly and our animations can
maintain a smooth 30 frames per second.

To emphasize again, a WebGL program must be very conscience of when new objects
are created and minimize the creation of any new objects that might need
*garbage collection*.

Re-definable Functions
----------------------

When a function is defined in JavaScript it automatically becomes part of the global
scope, which is defined by the :code:`window` object. The newly defined function
is an object that can be referenced as a property of the :code:`window` object.
Therefore, the following two function definitions are basically equivalent.

.. Code-block:: javascript
  :linenos:

  function ExampleFunction(a,b,c) {
    // do some stuff
  }

  window.ExampleFunction = function (a,b,c) {
    // do some stuff
  };

However, there are subtle differences between these two definitions.
A function that is explicitly defined as a property
of the :code:`window` object can be redefined at a future time. To make it possible
to interactively edit the code in this textbook and then restart a WebGL program,
the functions must be defined as :code:`window` properties. For a typical WebGL
program, the first definition would be more common.

Some Examples
-------------

In the WebGL example code below, there are two examples of JavaScript class definitions.
Do not attempt to understand the functionality of the code at this time, but
rather examine the structure of the class definitions. Please do the following:

* Hide the canvas to make the JavaScript code easier to study.
* Notice the use of strict mode, :code:`"use strict";` at the top of both files. This
  makes the code less susceptible to spelling mistakes. It requires that all variables
  be defined before they are used, which means that the constructor code is
  sometimes not contiguous.
* Find the constructor code: (The code that executes once when objects of the class are created.)

  * For :code:`object_examples_scene.js`, the constructor code is in lines 44-64 and 112-142.
  * For :code:`object_examples_events.js`, the constructor code is in lines 34-45 and 139-146.

* Notice how the variable :code:`self` is used to define and access the public
  members of an object.

  * For object_examples_scene.js, see the reference to :code:`self` in lines 45 and 60-64.
  * For object_examples_events.js, see the reference to :code:`self` in line 35 and
    the public function declarations.

* When studying the code, **read the comments**!


.. webglinteractive:: W1
  :htmlprogram: _static/02_object_examples/object_examples.html
  :viewlist: _static/02_object_examples/object_examples_scene.js, _static/02_object_examples/object_examples_events.js
  :hideoutput:
  :width: 300
  :height: 300

Coding Standard
---------------

Before leaving this discussion of JavaScript, please review the coding
standard we will be using.

* Always include :code:`"use strict";` to force the declaration of variables.
* Avoid global variables whenever possible.
* Use JSLint to check for errors.
* Use two-space indentation.
* Use shorthand for conditional statements where appropriate: :code:`let results = (test === 5) ? alert(1) : alert(2);`
* The closing brace should be on the same indent as the original statement:

  .. code-block:: JavaScript

    function func() {
      return {
        "name": "Batman"
      };
    }

* Naming conventions

  * Constructors start with a capital letter.
  * Methods/functions start with a small letter.
  * Methods/functions should use camel case.  :code:`thisIsAnExample`
  * Variables should always use an underscore between words. :code:`this_is_an_example`
  * When appropriate, include the variable type in the name. :code:`value_list`
  * Element ID's and class names should always use an underscore between words.
  * Private methods should use a leading underscore to separate them from public methods.
  * Abbreviations  should not be used in names.
  * Plurals should not be used when assigning names.
  * Comments should be used within reason.
  * Use `YUIDoc`_ to document functions.

    .. code-block:: JavaScript
      :linenos:
      :emphasize-lines: 1-6

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

Glossary
--------

.. glossary::

  JavaScript
    JavaScript is a high-level, dynamic, untyped, and interpreted programming language
    that is used to manipulate the HTML and CSS code of a web page after the code has
    been downloaded to a client.

  class
    A construct that defines related data and functions.

  object
    An instance of a class. For example, a class might hold data and functions
    related to an automobile. Multiple instances of the class can be created to
    store specific data about individual automobiles.

  object property
    A specific piece of data stored in an object.

  JavaScript :code:`this` keyword
    A builtin variable in JavaScript that always references the context in
    which a function is executing.

  garbage collection
    A process run by your browser that reclaims the memory used by objects
    that are no longer being used.

Self-Assessments
----------------

.. mchoice:: 2.3.1
  :random:
  :answer_a: Define a function; use the "new" command when calling the function.
  :answer_b: Use the keyword "class"; use the "new" command with the "class" name.
  :answer_c: Use the keyword "object"; objects are automatically created as needed.
  :answer_d: Define a function; call the function.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect, this is the way Java and C++ create and use classes, but not in JavaScript.
  :feedback_c: Incorrect, there is no keyword "object" in JavaScript.
  :feedback_d: Incorrect, you do define a function, but you must use the "new" keyword when you call it to create an object.

  In JavaScript, how do you define a *class* and then create instances of the *class*?

.. mchoice:: 2.3.2
  :random:
  :answer_a: The context in which a function is executed.
  :answer_b: When creating a new object using the "new" command, a reference to the new object.
  :answer_c: Inside an object's method, the instance of the object that is being executed.
  :answer_d: Always refers to the global scope, i.e., the "window" object.
  :correct: a,b
  :feedback_a: Correct.
  :feedback_b: Correct. This is the same as "The context in which a function is executed" because the context is the creation of a new object.
  :feedback_c: Incorrect, this is the meaning in Java and C++, but not JavaScript.
  :feedback_d: Incorrect, the meaning of "this" changes based on the context of a function call.

  In JavaScript, the keyword :code:`this` refers to what? (Select all that apply.)

.. mchoice:: 2.3.3
  :random:
  :answer_a: A function is an object and you make the "public" members be properties of the object.
  :answer_b: You use the keyword "public" when you declare them.
  :answer_c: You declare them using the "let" keyword.
  :answer_d: All members of a class are automatically "public" unless you specify otherwise.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect, this is how Java and C++ do it, but not JavaScript.
  :feedback_c: Incorrect, declaring a variable using "let" makes it a private member.
  :feedback_d: Incorrect, the default for variables and functions in a class is to be "private."

  In JavaScript, how do you create "public" members of a class?

.. mchoice:: 2.3.4
  :random:
  :answer_a: The memory used by new objects must be reclaimed by the garbage collection process, which can cause real-time animations to loss their frame rate.
  :answer_b: It is just bad programming to create new objects.
  :answer_c: Continually creating new objects will cause you to run out of memory.
  :answer_d: You don't need objects for WebGL programming.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect, JavaScript is object-oriented and you have to create new objects. You just want to minimize the number of objects that need to be garbage collected.
  :feedback_c: Incorrect, because typically the garbage collection process with recover memory for objects that are no longer being used.
  :feedback_d: Incorrect, because even the WebGL context is an object.

  Why should a WebGL program avoid repeatedly creating new objects?

.. mchoice:: 2.3.5
  :random:
  :answer_a: window.MyFunction = function(a,b) { ... };
  :answer_b: function MyFunction(a,b) { ... }
  :answer_c: let MyFunction = function(a,b) { ... };
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect.

  Which of the following function definitions allow the function
  to be re-defined after a web page has been loaded?

.. mchoice:: 2.3.6
  :random:
  :answer_a: 2
  :answer_b: 0
  :answer_c: 1
  :answer_d: 5
  :correct: a
  :feedback_a: Correct. The functions are "render()" and "delete()".
  :feedback_b: Incorrect. (Look for properties that are added to "self" and that are set to function definitions.)
  :feedback_c: Incorrect. (Look for properties that are added to "self" and that are set to function definitions.)
  :feedback_d: Incorrect. (Look for properties that are added to "self" and that are set to function definitions.)

  In the example WebGL program, the class :code:`ObjectExampleScene` defines how many public methods (i.e., functions)?

.. mchoice:: 2.3.7
  :random:
  :answer_a: It is a function because it uses CamelCase.
  :answer_b: It is a function that defines a "class" to create objects because it starts with a capital letter.
  :answer_c: It is a global variable.
  :answer_d: It is a local variable.
  :correct: a,b
  :feedback_a: Correct.
  :feedback_b: Correct.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  Based on the coding standard we will be using in this textbook, what is :code:`ExampleId`? (Select all that apply.)


.. index:: JavaScript, class, object, object property, this keyword, garbage collection, re-definable functions

.. _JavaScript Quick Reference Card: http://www.cheat-sheets.org/saved-copy/jsquick.pdf
.. _YUIDoc: http://yuilibrary.com/projects/
.. _JavaScript tutorials at Code Academy: https://www.codecademy.com/learn/introduction-to-javascript
.. _An Introduction to JavaScript for Sophisticated Programmers: http://casual-effects.blogspot.com/2014/01/an-introduction-to-javascript-for.html
.. _The Modern JavaScript Tutorial: https://javascript.info/

