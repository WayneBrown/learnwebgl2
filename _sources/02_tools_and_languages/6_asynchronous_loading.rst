..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

2.6 - Asynchronous File Loading
:::::::::::::::::::::::::::::::

We discussed in a previous lesson that a WebGL program is stored on a server,
downloaded to a client's
computer, and then executed. Since a WebGL program is composed of multiple
files, your WebGL program needs to wait until it has all of its required
files before it starts rendering. This is a little tricky since the files
are coming over the Internet where files are not guaranteed to arrive in the
same order they are requested. And browsers are not required to download files
in a particular order. You have probably seen this behaviour for web pages that
contain many large pictures. Many browsers will download the pictures that
are currently visible on the screen, regardless of the order they are
specified in the HTML document. The technical name for this is *asynchronous file loading*.

Requesting file downloads
-------------------------

There are two basic ways for a web page to request a file from the server.
The most straightforward way is to include a reference to it in the HTML
description of the page. The following are several examples of file downloads:

.. Code-block:: html

  <script src="../../lib/jquery.js"></script>
  <link rel="stylesheet" href="../../lib/webglcode.css" />
  <img src="picture.jpg">
  <object width="400" height="400" data="model.obj"></object>

It is not obvious, but some types of these file downloads become visible elements
on the web page, while others do not. In the above example, the data downloaded
from the :code:`script` and :code:`link` tags are never visible on the page.
However, the data downloaded from the :code:`img` and :code:`object` tags
become part of the visible page. You can set special properties
on the HTML elements to hide them, but why go to all the trouble when
there is a second way to download files using JavaScript?

In JavaScript you can request that a file be downloaded and then ask
JavaScript to "please call this specific function" when the file is ready
for processing. This "processing function" is called a *callback function*
because it is called at some future time when some event has happened. The
event in this case is the successful download of a file.
Why is this necessary? Because files are being downloaded asynchronously
from the server and you don't want your JavaScript code to "hang" waiting
for a file to download, especially if the file is large.

The :code:`$.get(url, callback(data))` jQuery function will retrieve a file
from a server and then call the :code:`callback(data)` function when the
file is totally downloaded and ready for processing. The one parameter, :code:`data`,
is the contents of the file. This is all fairly straightforward except the
callback function can only have the one parameter, :code:`data`. If you are
downloading multiple files, you would have to have a separate function for each
downloaded file, which is not practical. This is where the idea of a JavaScript
*context* comes in very handy. Remember, JavaScript functions are always
executed in a *context*. Consider the following code example:

.. Code-block:: JavaScript

  function getFile(file_url, storage) {
    $.get(file_url, function (data) { storage.push(data); });
  }

The :code:`$.get()` function has two parameters: 1) a string that
contains a universal resource locator (URL), such as "../lib/example.txt", and 2)
a callback function to receive the data and do something with it. The callback
function is an *anonymous function* -- it has no explicit name -- because
it doesn't need a name. But here is the weird part. The callback function will be
called in the *context* of the :code:`getFile()` function. This means that the
callback function has access to all the variables that :code:`getFile()` knows
about. Therefore it can access the :code:`storage` variable and change it.

The technical name for this language feature is *closure*. There is no need
to become an expert at *closure* code, but because of the way that JavaScript
works, *closures* are often the only way to get asynchronous tasks
accomplished.

The SceneDownload Object
------------------------

For a WebGL program we need to download several types of data files from the server:

* model data for our 3D scene objects
* material descriptions that define model surface properties including texture maps, and
* WebGL shader programs for rendering.

The number of these files will depend on the complexity of your scene and the
complexity of the rendering. We will be using a JavaScript object called
:code:`SceneDownload` to download all of these files. When you create a
:code:`SceneDownload` object, you pass it a list of shader file names and a list of
model file names. The constructor determines how many files it needs to
download by adding the number of files in each list together:

.. Code-block:: JavaScript

  downloads_needed = shader_list.length + model_list.length;
  number_retrieved = 0;

It then proceeds to call :code:`$.get()` for each required file. After each
successful download it saves the data in an object, increments
:code:`number_retrieved` by one, and calls a function called
:code:`_initializeRendering()`. This function only starts the WebGL rendering
of its canvas when all of the required files have been retrieved. The function
looks like this:

.. Code-block:: JavaScript

  function _initializeRendering() {

    if (number_retrieved >= downloads_needed) {
      // Pre-process the model data
      // Start rendering the canvas
    }
  }

Glossary
--------

.. glossary::

  synchronous
    something that occurs at the same time.

  asynchronous
    a process that operates independently of other processes; not synchronous

  asynchronous file loading
    files are downloaded from a server, but the order and timing of the downloads
    is not directly controlled by a web programmer.

  closure
    an inner function has access to the outer (enclosing) function’s variables,
    even after the execution of the outer function has terminated.

Self-Assessments
----------------

.. mchoice:: 2.6.1
  :random:
  :answer_a: unknown!
  :answer_b: in the order they are specified: glpoint4.js, glvector3.js, glmatrix4x4.js, and then obj_to_arrays.js
  :answer_c: in reverse order to what they are specified: obj_to_arrays.js, glmatrix4x4.js, glvector3.js, and then glpoint4.js.
  :answer_d: an order based on their code dependencies.
  :correct: a
  :feedback_a: Correct. The files could be retrieved in any order.
  :feedback_b: Incorrect, though they might be downloaded in this order.
  :feedback_c: Incorrect, though they might be downloaded in this order.
  :feedback_d: Incorrect, because JavaScript does not currently support code dependencies.

  Since browsers perform asynchronous file downloading, what order will these files be retrieved from the server?

  .. Code-block:: html

      <script src="../learn_webgl/glpoint4.js"></script>
      <script src="../learn_webgl/glvector3.js"></script>
      <script src="../learn_webgl/glmatrix4x4.js"></script>
      <script src="../learn_webgl/obj_to_arrays.js"></script>

.. mchoice:: 2.6.2
  :random:
  :answer_a: An anonymous callback function that will be executed after a file has been successfully downloaded from the server.
  :answer_b: A sub-function that is executed immediately.
  :answer_c: A sub-function that is executed asynchronously.
  :answer_d: An anonymous callback function that will be executed on "file events".
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect. It does define a sub-function, but it is not executed until something specific happens.
  :feedback_c: Incorrect. It does define a sub-function, but asynchronous execution implies random execution, which is not true.
  :feedback_d: Incorrect. It does define an anonymous callback function, but there is no such thing as generic "file events."

  In the :code:`getFile` function below, what does :code:`function (data) { storage.push(data); }` define?

  .. Code-block:: JavaScript

    function getFile(file_url, storage) {
      $.get(file_url, function (data) { storage.push(data); });
    }

.. mchoice:: 2.6.3
  :random:
  :answer_a: Shader programs.
  :answer_b: Model descriptions.
  :answer_c: Model material descriptions.
  :answer_d: JavaScript programs.
  :correct: a,b,c
  :feedback_a: Correct.
  :feedback_b: Correct.
  :feedback_c: Correct.
  :feedback_d: Incorrect. JavaScript programs are easily downloaded from &#60;script&#62; tags in the HTML code.

  A :code:`SceneDownload` object retrieved which type of files? (Select all that apply.)

.. index:: asynchronous, asynchronous file loading, closure


