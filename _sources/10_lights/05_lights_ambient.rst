.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

.. role:: raw-html(raw)
  :format: html

10.5 - Ambient Lighting
=======================

This lesson discusses how to implement `ambient`_ lighting.

An Ambient Lighting Model
-------------------------

Ambient light is "background" light. It bounces everywhere in all directions
and comes from no specific light source. Ambient light illuminates every face of a
model regardless of the face's orientation to a light source. All faces get the
same amount of ambient light.

Ambient light is modeled as a RGB value, where each component
represents a percentage of color that is visible. For example, the ambient
light value :code:`(0.2, 0.2, 0.2)` means that 20% of a surface's color is visible,
while :code:`(0.5, 0.5, 0.5)` means that 50% of a surface's color is visible.
For white background light the component values are all the same. However,
you can bring out one color
over others by using independent values. An ambient value of :code:`(0.5, 0.1, 0.1)`
would give the impression that a scene has a red light source somewhere in
the background.

The Math for Ambient Light
--------------------------

The math for ambient light is trivial. An RGB value that represents the color
of a surface is multiplied by the ambient percentages to calculate a pixel's
final color.

A WebGL Program for Ambient Light
---------------------------------

Experiment with the following WebGL program by modifying the ambient light
percentages. You can manipulate the percentages independently, or all at
the same time.

.. webgldemo:: W1
  :htmlprogram: _static/10_ambient_light/ambient_light.html
  :width: 300
  :height: 300


As you experiment with the WebGL program above, please make sure you
observe the following characteristics of ambient light.

* The relative position of an object, a light source, and/or a camera
  has no impact on ambient lighting.
  :raw-html:`<br><br>`

* Ambient lighting is a percentage of a surface's color that is visible
  from any direction. Ambient light can never make a surface's color
  "brighter"; it can only make a surface's color "darker". The purpose of
  ambient lighting is not to make surfaces "darker," but rather to make sure
  that a certain percentage of a surface's color is always visible, even if it
  has no direct light from a light source.
  :raw-html:`<br><br>`

* White background light uses the same value for each component of the ambient
  percentages. This maintains the relative color of objects in a scene. However, you can
  simulate a "background" light of any color to create special effects.
  :raw-html:`<br><br>`

* Ambient lighting is typically not used by itself. It is typically combined
  with diffuse and specular lighting. This will be demonstrated in the
  next lesson.

Ambient Lighting in Shader Programs
-----------------------------------

Please study the following *shader programs* and their explanations.

Vertex Shader
*************

The *vertex shader* is very simple since it does **not** have to initialize
"camera space" geometry values for the *fragment shader*.

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 9

  // Vertex Shader
  precision mediump int;
  precision mediump float;

  // Scene transformations
  uniform mat4 u_PVM_transform; // Projection, view, model transform

  // Light model
  uniform vec3 u_Ambient_color;

  // Original model data
  attribute vec3 a_Vertex;
  attribute vec3 a_Color;

  // Data (to be interpolated) that is passed on to the fragment shader
  varying vec4 v_Color;

  void main() {

    // Pass the vertex's color to the fragment shader.
    v_Color = vec4(a_Color, 1.0);

    // Transform the location of the vertex for the graphics pipeline.
    gl_Position = u_PVM_transform * vec4(a_Vertex, 1.0);
  }

+------------+--------------------------------------------------------------------------+
| Line(s)    | Description                                                              |
+============+==========================================================================+
| 9          | The :code:`uniform` variable :code:`u_Ambient_color` contains the        |
|            | percentages of color for the ambient lighting model.                     |
+------------+--------------------------------------------------------------------------+

Fragment Shader
***************

The *fragment shader* sets a fragment's color as a percentage of the
surface's color. Note that when you multiple two vectors in GLSL
it performs component-wise multiplication. That is, if :code:`a = <a0,a1,a2>`
and :code:`b = <b0,b1,b2>`. Then :code:`a * b` is equal to a 3-component
vector :code:`<a0*b0, a1*b1, a2*b2>`.

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 6, 16

  // Fragment shader program
  precision mediump int;
  precision mediump float;

  // Light model
  uniform vec3 u_Ambient_color;

  // Data coming from the vertex shader
  varying vec4 v_Color;

  void main() {

    vec3 color;

    // Vector, component-wise multiplication
    color = u_Ambient_color * vec3(v_Color);

    // Ambient color does not affect the alpha value of the object's color.
    gl_FragColor = vec4(color, v_Color.a);
  }

+------------+--------------------------------------------------------------------------+
| Line(s)    | Description                                                              |
+============+==========================================================================+
| 6          | The :code:`uniform` variable :code:`u_Ambient_color` contains the        |
|            | percentages of color for the ambient lighting model.                     |
+------------+--------------------------------------------------------------------------+
| 16         | Reduces the surface's color by the ambient intensities.                  |
+------------+--------------------------------------------------------------------------+


Type of Light Source
--------------------

Ambient lighting is **not** based on the type of light sources in a scene. Therefore,
the example WebGL program above would be the same for any scene with any type
of light sources.

Glossary
--------

.. glossary::

  ambient lighting
    Light that can't be associated with any specific light source. It is
    light that has no associated location or direction.

Self Assessment
---------------

.. mchoice:: 10.5.1
  :random:

  Where does ambient light come from?

  - It has no discernible source.

    + Correct.

  - It comes from light sources outside the scene.

    - Incorrect. Maybe, but who knows.

  - It comes from the sun.

    - Incorrect. Maybe, but who knows.

  - It comes from a sum of all the lights in a scene.

    - Incorrect. Maybe, but who knows.

.. mchoice:: 10.5.2
  :random:

  Ambient light comes from "point light sources". Ambient light would need to
  be modeled differently if there were *sun* light sources, *spotlight* light
  sources, or *area* light sources in a scene.

  - False.

    + Correct. Ambient lighting is not dependant on or related to types of light sources.

  - True.

    - Incorrect. Ambient lighting is not dependant on or related to types of light sources.

.. mchoice:: 10.5.3
  :random:

  How do you make ambient light represent "white" light?

  - Make all three components be the same value.

    + Correct.

  - Make the intensities be :code:`(1,1,1)`.

    - Incorrect. This is a "white" light source, but in general there are many other possibilities.

  - Set the ambient value to :code:`1.0`.

    - Incorrect. Ambient light is represented by a RGB triple, not a scalar.

  - Make the intensities be :code:`(0.5,0.1,0.3)`.

    - Incorrect. Since the red component is dominate, the ambient light would give a
      "reddish hue" to the scene.

.. mchoice:: 10.5.4
  :random:

  Ambient light comes from "point light sources". Ambient light would need to
  be modeled differently if there were *sun* light sources, *spotlight* light
  sources, or *area* light sources in a scene.

  - False.

    + Correct. Ambient lighting is not dependant on or related to types of light sources.

  - True.

    - Incorrect. Ambient lighting is not dependant on or related to types of light sources.


.. index:: ambient lighting

.. _ambient: https://en.wikipedia.org/wiki/Shading#Ambient_lighting
