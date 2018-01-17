..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

2.4 - DOM and jQuery
::::::::::::::::::::

.. highlight:: javascript

The HTML and CSS code that is downloaded to a client's computer is plain text.
The client's browser creates a visual web page from the text
description. The web page can be dynamically modified by JavaScript code and
the visual representation is updated automatically.
As with all computer science tasks, a good *data structure*
can make a task easy, whereas a poor *data structure* can make a task very
difficult. Text is a convenient way for humans to specify a web page, but text
is a very poor *data structure* for web page manipulation.

Thus the Document Object Model (`DOM`_) was developed. The DOM is a standard
convention for creating a hierarchy of objects that describe a web page. This
provides an easy way to manipulate the elements of a web page.
However, the DOM has been implemented by various vendors in inconsistent ways.
This has happened because vendors have continually tried to "push the boundaries"
of web page design and because the HTML and CSS specifications have left room
for interpretation. Web page designers found themselves continually writing
code that looked something like this:

.. code-block:: javascript

  if (the_browser == Chrome) {
    element.property = 5;
  } else if (the_broswer == FireFox) {
    element.prop = 5;
  } else if (the_broswer == IE) {
    element.props = 5;
  } else if (the_browser == Opera) {
    ...

If you have to write code like this to make JavaScript code consistent with all the
different browsers, your job becomes 10 times harder. To solve this problem,
we use :code:`jQuery`, which is a 3rd party JavaScript library that provides
an easy way to find elements on a web page and **modify them in a consistent way**.
jQuery takes care of all the inconsistencies between browsers! A jQuery
equivalent to the above code might look like:

.. Code-block:: javascript

  $(element_id).attr("property", 5)

JavaScript Essentials
---------------------

Before we introduce jQuery, Let's review some aspects of the JavaScript language.

Functions in JavaScript are objects. In fact, **everything in JavaScript is an object**!
An object has properties. This is all very strange when compared
to other programming languages, but it is just the way JavaScript is designed.
Let's look at a simple example.

.. Code-block:: javascript

  // Define a function called "example" that adds 2 numbers together
  function example(a,b) {
    return (a+b);
  }

  // Add a property to the example object. The property is a reference to a function.
  example.subtract = function (c,d) { return (c-d); };

  var s = example(5,6);
  var t = example.subtract(9,4);
  console.log(s, t);

You can copy and paste the above code into a JavaScript console and it works
as expected.

One more time! Functions are objects. Objects have
properties. A property can hold an object that is a function. There is no
limit to this nesting of functionality.

Since functions are objects, they can be assigned to variables like any other
value. This allows for *function aliasing*, which gives a different name
to a function using a simple assignment statement. Remember that an identifier
in JavaScript must start with
a letter (A-Z,a-z), an underscore (_), or a dollar sign ($), with subsequent
characters being letters, digits, underscores, or dollar signs. Therefore,
the following code aliases the *example* function defined above with a shorter
name and then calls the function using the alias.

.. Code-block:: javascript

  // Alias the function example with a shorter name
  var _ = example;

  // Call the function to add to numbers together
  var result;
  result = _(4,5);

Please re-read this section if you are confused.

jQuery Syntax
-------------

The jQuery library only defines a single function! Amazingly enough, that
function is called :code:`jQuery`. But jQuery is aliased to the simpler name
:code:`$`, which is almost always used.

The jQuery function takes one parameter, a :code:`selector`, which is used
to find elements in the DOM. The function always returns a jQuery object
that contains an array of matching DOM elements. The jQuery object also
has predefined properties that allow any attribute of a DOM element
to be retrieved or modified.

Let's discuss the :code:`selector` first. The selector is typically a string
that describes some characteristic of the DOM elements you want to access.
The first character of the string determines the specific characteristic. Here
is a subset of the possible selectors:

+-------------+------------------------+--------------------------------------+
+ #id         + :code:`$('#alpha')`    + find all of the elements that have   +
+             +                        + an **id** of 'alpha'                 +
+-------------+------------------------+--------------------------------------+
+ .class      + :code:`$('.beta')`     + find all of the elements that use    +
+             +                        + a **CSS class** named 'beta'         +
+-------------+------------------------+--------------------------------------+
+ elementType + :code:`$('div')`       + find all of the 'div' elements       +
+-------------+------------------------+--------------------------------------+

Here is a complete `list of selectors`_. The :code:`$()` function
always returns a jQuery object which defines properties and functions that
can manipulate the DOM elements that were returned. Here is a few examples of
of those functions.

+--------------+----------------------------------+--------------------------------------+
+ .text()      + :code:`$('#alpha').text()`       + returns the text (stripped of any    +
+              +                                  + HTML) of all elements that have an   +
+              +                                  + **id** of 'alpha'                    +
+--------------+----------------------------------+--------------------------------------+
+ .text('abc') + :code:`$('#alpha').text('abc')`  + sets the text of all elements that   +
+              +                                  + have an **id** of 'alpha'            +
+--------------+----------------------------------+--------------------------------------+
+ .html()      + :code:`$('#alpha').html()`       + returns the text including any HTML  +
+              +                                  + tags of the 1st element that has an  +
+              +                                  + **id** of 'alpha'                    +
+--------------+----------------------------------+--------------------------------------+
+ .html('abc') + :code:`$('#alpha').html('abc')`  + sets the text including any HTML tags+
+              +                                  + of all elements that have an         +
+              +                                  + have an **id** of 'alpha'            +
+--------------+----------------------------------+--------------------------------------+
+ .width()     + :code:`$('#alpha').width()`      + returns the width of the 1st element +
+              +                                  + that has an **id** of 'alpha'        +
+--------------+----------------------------------+--------------------------------------+
+ .width('50%')+ :code:`$('#alpha').width('50%')` + sets the width of all elements that  +
+              +                                  + have an **id** of 'alpha'            +
+--------------+----------------------------------+--------------------------------------+

Notice that the presence or absence of a parameter determines whether the
function is getting or setting the related attributes of the elements.
Here is a complete `list of manipulation functions`_.

Because all queries and manipulation functions return a jQuery object, the function calls
can be chained. For example, this next example sets the width, height, and color
of all div elements on a web page:

.. Code-block:: javascript

  $('div').width('50%').height('30px').css('color','red');

One last note about jQuery. There is a set of utility functions that do not
fit the above scheme. They are defined as properties of the :code:`$()`
function so they are called like this: :code:`$.inArray()` or :code:`$.trim()`.
Each function returns a different type of return value, so these functions
can't be chained. Here is a complete `list of utility functions`_.

jQuery Resources
----------------

This `jQuery cheat sheet`_ (`source`_) might be helpful to you.

Glossary
--------

.. glossary::

  DOM (Document Object Model)
    a hierarchy of objects that describe a web page.

  jQuery
    A 3rd party JavaScript library that manipulates the DOM of a web page while
    taking care of inconsistencies between browsers.

  selector
    A string that is used to select one or more elements of a DOM.

  $()
    The jQuery function used to manipulate the DOM.

Self-Assessments
----------------

.. mchoice:: 2.4.1
  :random:
  :answer_a: Because each browser has implemented their DOM differently.
  :answer_b: Because setting the property value of a DOM element can require different code for different browsers.
  :answer_c: Because jQuery's search functionality makes manipulating the DOM easier.
  :answer_d: Because JavaScript requires the use of 3rd party libraries to do anything useful.
  :correct: a,b,c
  :feedback_a: Correct. And we would like our web pages to work the same across all browsers.
  :feedback_b: Correct. Without jQuery, simply setting a property value for an element can be very tricky.
  :feedback_c: Correct. jQuery allows you to find DOM elements easily.
  :feedback_d: Not true. JavaScript is a powerful language and you should avoid 3rd party libraries whenever possible.

  JavaScript contains functions that search and manipulate the DOM of a web page. Why not use those
  instead of using a 3rd party library like jQuery? (Select all that apply.)

.. mchoice:: 2.4.2
  :random:
  :answer_a: Because $ is a function alias for the "jQuery" function.
  :answer_b: Because Javascript is weird!
  :answer_c: Because $ is a reserved word in the jQuery library.
  :answer_d: Because $ stands for money and jQuery is an expensive 3rd party library.
  :correct: a
  :feedback_a: Correct. The name "$" was assigned the value of the object jQuery, which is a function.
  :feedback_b: Incorrect. JavaScript is not weird, but it may take you a while to understand how it works.
  :feedback_c: Incorrect. JavaScript libraries can't create reserved words.
  :feedback_d: Incorrect. jQuery is a free 3rd party library and the $ has no relationship to money.

  When using jQuery, why is :code:`jQuery('#abc')` and `$('#abc')` equivalent?

.. mchoice:: 2.4.3
  :random:
  :answer_a: $('#abc') finds all of the elements in the DOM that have an "id property" equal to 'abc'; $('abc') finds all elements whose tag is &#60;abc&#62;
  :answer_b: The $('#abc') finds all of the elements in the DOM that have a leading pound sign, #, in their name.
  :answer_c: $('#abc') finds all of the elements in the DOM that have 'abc' in their tag name; $('abc') finds all elements whose tag is &#60;abc&#62;
  :answer_d: $('#abc') finds all of the elements in the DOM whose tag name ends in 'abc'; $('abc') finds all elements whose tag is &#60;abc&#62;
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. And tag names can't include pound signs.
  :feedback_c: Incorrect. The leading pound sign means jQuery is to search based on element id's.
  :feedback_d: Incorrect. The leading pound sign means jQuery is to search based on element id's.

  When using jQuery, the leading character of a selector is very important. What is the difference between :code:`$('#abc')` and :code:`$('abc')`?

.. mchoice:: 2.4.4
  :random:
  :answer_a: It sets the contents of every &#60;div&#62; element to the string 'test'.
  :answer_b: It finds every &#60;div&#62 element, but only changes the content of the first one.
  :answer_c: It finds &#60;div&#62 elements that contain the string 'test'.
  :answer_d: It finds &#60;div&#62 elements that contain the substring 'test' anywhere it is contents.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. It does find every &#60;div&#62 element, but what does it modify?
  :feedback_c: Incorrect. The call to the text function is doing something to the &#60;div&#62 elements. What is it doing?
  :feedback_d: Incorrect. The call to the text function is doing something to the &#60;div&#62 elements. What is it doing?

  What does the jQuery call, :code:`$('div').text('test')`, do? (Hint: Try it in the JavaScript console!)

.. mchoice:: 2.4.5
  :random:
  :answer_a: An array containing every DOM element whose "class" property is set to 'abc'.
  :answer_b: The first DOM element whose "class" property is set to 'abc'.
  :answer_c: An array containing every DOM element whose tag name starts with the characters 'abc'.
  :answer_d: The last DOM element whose "class" property is set to 'abc'.
  :correct: a
  :feedback_a: Correct. This is all elements that have the same 'abc' CSS formatting.
  :feedback_b: Incorrect. It returns more than the first one, if there is more than one.
  :feedback_c: Incorrect. It does not use tag names in its search because of the leasing period.
  :feedback_d: Incorrect. It returns more than the last one, if there is more than one.

  What does the jQuery call, :code:`$('.abc')`, return? (Note the leading period in the selector!)


.. index:: DOM, jQuery, selector, $()

.. _DOM: https://en.wikipedia.org/wiki/Document_Object_Model
.. _list of selectors: http://www.w3schools.com/jquery/jquery_ref_selectors.asp
.. _list of manipulation functions: http://www.w3schools.com/jquery/jquery_ref_html.asp
.. _jQuery cheat sheet: ../_static/documents/jquery-1.5-visual-cheat-sheet.pdf
.. _source: http://www.cheat-sheets.org/saved-copy/jQuery-1.5-Visual-Cheat-Sheet.pdf
.. _list of utility functions: https://api.jquery.com/category/utilities/

