.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

13.6 - GLSL Compiling & Linking
:::::::::::::::::::::::::::::::

Compiling
---------

GLSL programs are compiled using functionality in the WebGL API of your
JavaScript program. If errors occur during compilation they can be captured
and displayed. A function similar to the one below is part of any WebGL program.
The following function is a method of the :code:`SceneDownload` class defined
in the file :code:`scene_download.js`.

.. Code-Block:: JavaScript
  :linenos:

  /** ---------------------------------------------------------------------
   * Create and compile an individual shader.
   * @param gl {WebGLRenderingContext} The WebGL context.
   * @param type {Number} The type of shader, either
   *             gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @param source {String} The code/text of the shader
   * @returns {WebGLShader} A WebGL shader program object.
   */
  self.createAndCompileShader = function (gl, type, source) {
    let typeName;
    switch (type) {
      case gl.VERTEX_SHADER:
        typeName = "Vertex Shader";
        break;
      case gl.FRAGMENT_SHADER:
        typeName = "Fragment Shader";
        break;
      default:
        out.displayError("Invalid type of shader " +
                         "in createAndCompileShader()");
        return null;
    }

    // Create shader object
    let shader = gl.createShader(type);
    if (!shader) {
      out.displayError("Fatal error: gl could not create a shader object.");
      return null;
    }

    // Put the source code into the gl shader object
    gl.shaderSource(shader, source);

    // Compile the shader code
    gl.compileShader(shader);

    // Check for any compiler errors
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      // There are errors, so display them
      let errors = gl.getShaderInfoLog(shader);
      out.displayError('Failed to compile ' + typeName
                       + ' with these errors:\n' + errors);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

Some notes about this function:

* The :code:`type` parameter is a WebGL ENUM (a numeric constant). The switch
  statement in lines 9-20 is strictly for creating more meaningful error
  messages.
* The :code:`out` object is used to display messages to a web page. If you do
  not want web page messages, you could
  replace the function calls to :code:`out` functions with calls to :code:`console.log`
  and look for errors in the JavaScript console window.
* Typically the only reason why the :code:`gl.createShader()` function would
  fail is lack of GPU memory or a loss of the WebGL context. You could get
  the exact error using a call to :code:`gl.getError()`.
* The compiler error messages are typically very helpful. Make sure you notice
  the line number and column number of the error and that you read the error
  message very carefully.
* It is important that you not "pollute" the GPU memory with invalid or unused
  objects. The GPU does not do automatic "garbage collection". Notice that
  the shader is explicitly deleted if errors occur.

Linking
-------

Linking a *vertex shader* and a *fragment shader* into a single program makes
sure that both programs reference the same global variables. A function
similar to the one below is part of any WebGL program.
The following function is a method of the :code:`SceneDownload` class defined
in the file :code:`scene_download.js`.

.. Code-Block:: JavaScript
  :linenos:

  /** ---------------------------------------------------------------------
   * Given two shader programs, create a complete rendering program.
   * @param gl {WebGLRenderingContext} The WebGL context.
   * @param vertexShaderCode {String} Code for a vertex shader.
   * @param fragmentShaderCode {String} Code for a fragment shader.
   * @returns WebGLProgram {WebGLProgram} A WebGL shader program object.
   */
  self.createProgram = function (gl, vertexShaderCode, fragmentShaderCode) {
    // Create the 2 required shaders
    var vertexShader = self.createAndCompileShader(gl, gl.VERTEX_SHADER,
                                                   vertexShaderCode);
    var fragmentShader = self.createAndCompileShader(gl, gl.FRAGMENT_SHADER,
                                                     fragmentShaderCode);
    if (!vertexShader || !fragmentShader) {
      return null;
    }

    // Create a WebGLProgram object
    var program = gl.createProgram();
    if (!program) {
      out.displayError('Fatal error: Failed to create a program object');
      return null;
    }

    // Attach the shader objects
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Link the WebGLProgram object
    gl.linkProgram(program);

    // Check for success
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      // There were errors, so get the errors and display them.
      var error = gl.getProgramInfoLog(program);
      out.displayError('Fatal error: Failed to link program: ' + error);
      gl.deleteProgram(program);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      return null;
    }

    // Remember the shaders. This allows for them to be cleanly deleted.
    program.vShader = vertexShader;
    program.fShader = fragmentShader;

    return program;
  };

Automated Shader Programs
-------------------------

Since shader programs are simply strings of text before being compiled, it
is possible to create shader programs "on the fly." That is, you could have
a set of strings that define various shader commands and then combine
those strings in complex ways to create a specific shader for a specific
rendering situation. Such an idea is well beyond these basic tutorials, but
it is an idea you might find very powerful if you pursued more advanced
computer graphics.
