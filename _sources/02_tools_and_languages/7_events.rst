..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

2.7 - Events
::::::::::::

.. highlight:: javascript

Web page manipulation happens because of events. The events can be some
action that the browser has taken, such as downloading a file, or some
action a user has taken, such as clicking on a button. We need to discuss
five issues:

#. What events does a browser track?
#. How do you associate events with specific DOM elements?
#. What information is contained in an event?
#. How do you write correct event handlers?
#. Event hierarchies.

Browser Events
--------------

There are too many events to discuss in detail here. See `HTML DOM Events`_
for a full list. Below is the typical events we will use in a WebGL program
to manipulate graphics in a canvas element.

+--------------+----------------------------------------------------------+
+ Event	       + Description                                              +
+==============+==========================================================+
+ onmousedown  + The user presses a mouse button over an element.         +
+--------------+----------------------------------------------------------+
+ onmouseup    + The user releases a mouse button over an element.        +
+--------------+----------------------------------------------------------+
+ onmousemove  + The user moves the location of a mouse over an element.  +
+--------------+----------------------------------------------------------+
+ onclick      + The user clicks on an element.                           +
+--------------+----------------------------------------------------------+
+ onkeydown    + The user is pressing a key.                              +
+--------------+----------------------------------------------------------+
+ onkeypress   + The user pressed and released a key.                     +
+--------------+----------------------------------------------------------+
+ onkeyup      + The user released a key.                                 +
+--------------+----------------------------------------------------------+
+ ondrag       + The user is dragging an element.                         +
+--------------+----------------------------------------------------------+
+ onwheel      + The user is moving the mouse wheel over an element.      +
+--------------+----------------------------------------------------------+

Notice that a key aspect of events is that the mouse is over an element.
The location of the user's mouse determines whether an event "fires"
or not. For example, a mouse cursor might be moving over
a web page, but only when it is over a specific element will a :code:`onmousemove`
event be generated.

Mapping Events to DOM Elements
------------------------------

There are two ways you can associate an event with a specific DOM element.

1. Add an event attribute to an element's HTML description. For example:

  * :code:`<element onclick="myAction();">`
  * :code:`<div onclick="var a = 5; var b = 7; callAbc(a,b);">`

2. Add an event handler to an element using JavaScript. For example:

  * :code:`my_button.addEventListener("click", myAction );`
  * :code:`$('#' + id).click( myAction );`
  * :code:`$('#' + id).on('click', myAction);`
  * :code:`$('#' + id).mousedown( myAction );`


Method 1 is discouraged for several reasons. It is considered bad design to
mix HTML content with JavaScript functionality. And if you use an element
attribute, you can only associate one event handler for the element. Method 2
is the preferred way. Not only does this separate content from functionality,
you can assign multiple event handlers to a single
element if you need to. Using the jQuery functions for assigning event handlers
takes care of browser inconsistencies, so those are the ones we will use.
See `jQuery Events`_ for a complete list of event functions.

You can **remove** an event handler using the jQuery :code:`.unbind` method.

* :code:`$(selector).unbind(event, callback)`

Event Objects
-------------

An event handler is a function that receives one object as a parameter --
an event object. Different types of events create different types of event objects.
See `HTML DOM Events`_ for a complete list and description of HTML event objects.
An event handler function is called each time it's event occurs. The data in
the event object differs between the browsers, so it is best to use
jQuery event objects which provide consistent data across all browsers.
See `Event Objects`_ for a complete list of event data included in jQuery event objects.

The following is a partial list of the data sent to a jQuery event handler for mouse events:

+---------------+---------------------------------------------------------------+
+ Property      + Description                                                   +
+===============+===============================================================+
+ .target       + The DOM element that initiated the event.                     +
+---------------+---------------------------------------------------------------+
+ .pageX        + The mouse position relative to the left edge of the document. +
+---------------+---------------------------------------------------------------+
+ .pageY        + The mouse position relative to the top edge of the document.  +
+---------------+---------------------------------------------------------------+
+ .clientX      + The mouse position relative to the left edge of the element.  +
+---------------+---------------------------------------------------------------+
+ .clientY      + The mouse position relative to the top edge of the element.   +
+---------------+---------------------------------------------------------------+
+ .which        + The specific key or button that was pressed.                  +
+---------------+---------------------------------------------------------------+

An Example Event Handler
------------------------

Below is an example event handler for an :code:`onmousemove` event inside a
canvas element. It calculates an offset from the previous location of the
mouse and uses those offsets to modify angles of rotation for a scene.

.. Code-block:: JavaScript
  :linenos:

  /**
   * Process a mouse drag event.
   * @param event {jQuery.Event} A jQuery event object
   */
  Function mouse_dragged (event) {
    var delta_x, delta_y;

    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = event.clientY - start_of_mouse_drag.clientY;

      scene.angle_x += delta_y;
      scene.angle_y += delta_x;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

Event Hierarchies
-----------------

Consider what happens when a user's mouse moves across a web page.
Let's assume the mouse just moved over a button, which is inside a :code:`<div>` element
which is inside a :code:`<body>` element. So there were several HTML elements
under the mouse when it moved. Which of the three elements does the event
"fire" on? It is actually a complex question and depends on which elements
have registered event handlers. Let's suppose only the button has
registered a mouse motion event handler. When the mouse moves over
the button its event handler will be called. However, some HTML elements have
default event handlers that are built into the browser. For example, moving
the mouse can scroll the entire page. A web page is a hierarchy of elements
and events travel up this hierarchy when they fire. So in our hypothetical
example, the mouse motion event will be passed to the default :code:`<div>`
event handler to be processed. Then the event will be passed to the
default :code:`<body>` event handler to be processed. Passing an
event up the element hierarchy is the default behaviour for events. If you would
like an event to be handled by a single event handler, then you must prevent
it from being passed up to its parent element by calling :code:`preventDefault()` on the
event object. An example is shown in the above code.

Experimentation
---------------

In the WebGL program below you can edit the event handlers. Experiment! Here's a
list of things you might try:

* Uncomment the :code:`out.displayInfo` function call in line 103 and click
  the "Re-start" button. You should see output in the panel below the canvas
  each time you click the "Animate" checkbox.
* Comment out lines 153-155 which register mouse events for the canvas and
  click the "Re-start" button. You will no longer be able to use a mouse
  drag operation to spin the model.
* Triple the rate of spin by multiplying the :code:`delta_x` and :code:`delta_y`
  values in the mouse drag event handler function.
* Change the amount added to the angles in the animate event handler.
* Etc. ...

.. webglinteractive:: W1
  :htmlprogram: _static/02_object_examples/object_examples.html
  :editlist: _static/02_object_examples/object_examples_events.js
  :hideoutput:
  :width: 300
  :height: 300


Glossary
--------

.. glossary::

  event
    something happened -- e.g., the mouse moved, a key was hit, a file was downloaded, etc.

  event handler
    a JavaScript function that will be called when a specific event happens.

  event hierarchy
    an event is processed by multiple event handlers because the event happened
    while the mouse cursor was over multiple elements, each element on top of the other.

  event object
    a JavaScript object whose properties describe an event.

Self-Assessments
----------------

.. mchoice:: 2.7.1
  :random:
  :answer_a: It is considered bad design to mix page content with user event functionality.
  :answer_b: If you use HTML, you can only assign one event handler to an element. Using JavaScript, multiple event handlers can be assigned to a single element.
  :answer_c: Using jQuery takes care of browser inconsistencies in handling events.
  :answer_d: JavaScript event handlers are faster.
  :answer_e: The HTML code can't be modified after the web page is loaded.
  :correct: a,b,c
  :feedback_a: Correct.
  :feedback_b: Correct.
  :feedback_c: Correct.
  :feedback_d: Incorrect. All event handlers are implemented in JavaScript, so there is no speed differences.
  :feedback_e: Incorrect. The HTML code can be easily modified after the web page is loaded. That is what JavaScript does!

  Why should event handlers be assigned in JavaScript code instead of in HTML code? (Select all that apply.)

.. mchoice:: 2.7.2
  :random:
  :answer_a: onclick
  :answer_b: onkeypress
  :answer_c: ondrag
  :answer_d: onmousemove
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. This event "triggers" when a keyboard key is pressed.
  :feedback_c: Incorrect. This event "triggers" when the mouse is moved while a mouse button is being held down.
  :feedback_d: Incorrect. This event "triggers" when the mouse is moved and no mouse button is being held down.

  What is the name of the event that is "triggered" when a user selects a button?

.. mchoice:: 2.7.3
  :random:
  :answer_a: clientX, clientY
  :answer_b: pageX, pageY
  :answer_c: which
  :answer_d: target
  :correct: a
  :feedback_a: Correct. This is the (x,y) location of the mouse relative to the element that "triggered" the event.
  :feedback_b: Incorrect. This is the (x,y) location of the mouse relative to the entire web page.
  :feedback_c: Incorrect. This the button that is down, or the keyboard key that was pressed.
  :feedback_d: Incorrect. This is the element that triggered the event.

  Which properties of a jQuery event object tells you the location of the mouse when the event happened,
  where the location is relative to the element that "triggered" the event.

.. mchoice:: 2.7.4
  :random:
  :answer_a: It prevents other elements that are also under the mouse cursor from processing the event.
  :answer_b: Causes the event to perform some pre-specified actions.
  :answer_c: Causes the event to not perform some pre-specified actions.
  :answer_d: Makes the event happen on all other elements under the mouse's cursor.
  :correct: a
  :feedback_a: Correct. This prevents the event from being processed by other elements in the event hierarchy.
  :feedback_b: Incorrect. Events do not have "pre-specified actions".
  :feedback_c: Incorrect. Events do not have "pre-specified actions".
  :feedback_d: Incorrect. This is the exact opposite of what preventDefault() does.

  What does the command :code:`event.preventDefault();` do if called inside an event handler?

.. index:: event, event handler, event object, event hierarchy, event preventDefault()

.. _HTML DOM Events: http://www.w3schools.com/jsref/dom_obj_event.asp
.. _jQuery Events: http://api.jquery.com/category/events/
.. _Event Objects: https://api.jquery.com/category/events/event-object/


