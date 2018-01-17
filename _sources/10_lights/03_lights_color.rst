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

10.3 - The Color of a Light Source
::::::::::::::::::::::::::::::::::

If you shine a red light onto a blue object you see black! In lesson 10.1
we discussed that when you see a blue object you are seeing a blue light ray
that was reflected from the object. The ray is blue because the object
absorbed all of the non-blue light. This lesson discusses how to model the color of a light source.

The Math for Light Color
------------------------

A light source is assigned an RGB color that represents its intensity
of red, green and blue light. White light has a color of :code:`(1,1,1)`
while a red light has a color of :code:`(1,0,0)`.

To simulate a light's color it is multiplied, component-by-component, times
a surface's color to determine the final color of a surface. For example,
if a surface has a color of :code:`(1.00, 0.76, 0.12)`, and a light
source has a color of :code:`(1.0, 0.0, 0.5)`, then the color of the surface
would be calculated as :code:`(1.00*1.0, 0.76*0.0, 0.12*0.5)`, or
:code:`(1.0, 0.0, 0.06)`. Notice that since the light source contains no
amount of green light, all of the surface's green color goes to zero. The
surface can't reflect green light because there is no green light from
the light source to reflect.

A WebGL Program for the Color of a Light Source
...............................................

Experiment with the following WebGL program. Note that although the objects
in the scene might appear to be solid colors, they are actually not pure
colors. The objects have the following colors:

+---------------------+---------------------------------+-----------------------------------------+
| Object              | Color                           | Comments                                |
+=====================+=================================+=========================================+
| "red cube"          | (0.640000, 0.150003, 0.109216)  | Mostly red, some green and blue.        |
+---------------------+---------------------------------+-----------------------------------------+
| "red letter X"      | (0.800000, 0.000000, 0.000000)  | All red.                                |
+---------------------+---------------------------------+-----------------------------------------+
| "green cube"        | (0.310609, 0.640000, 0.346694)  | Mostly green, significant red and blue. |
+---------------------+---------------------------------+-----------------------------------------+
| "green letter Y"    | (0.000000, 0.800000, 0.000000)  | All green.                              |
+---------------------+---------------------------------+-----------------------------------------+
| "blue cube"         | (0.075294, 0.285289, 0.800000)  | Mostly blue, very little red.           |
+---------------------+---------------------------------+-----------------------------------------+
| "blue letter Z"     | (0.000000, 0.000000, 0.800000)  | All blue.                               |
+---------------------+---------------------------------+-----------------------------------------+

.. webgldemo:: W1
  :htmlprogram: _static/10_colored_light/colored_light.html
  :width: 300
  :height: 300

As you experiment with the WebGL program, please make sure you
observe the following characteristics of light color.

* Setting the light source to a red light, :code:`(1,0,0)`, gives the
  entire object a "reddish hue" and the blue cube appears black. This is
  due to the fact that the red component of the blue cube's color,
  :code:`(0.07, 0.28, 0.8)` is so small, :code:`0.07`.

* Setting the light source to a green light, :code:`(0,1,0)`, gives the
  entire object a "greenish hue". Every object has enough green in its
  color, except the "red X" and the "blue Z", to give off some green
  reflected light.

Light Color in Shader Programs
------------------------------

Please study the following *shader programs* using the comments below as
your guide.

Vertex Shader
.............

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 11

  // Vertex Shader
  precision mediump int;
  precision mediump float;

  // Scene transformations
  uniform mat4 u_To_clipping_space; // Projection, camera, model transform
  uniform mat4 u_To_camera_space;   // Camera, model transform

  // Light model
  uniform vec3 u_Light_position;
  uniform vec3 u_Light_color;

  // Original model data
  attribute vec3 a_Vertex;
  attribute vec3 a_Color;
  attribute vec3 a_Normal;

  // Values initialized for the fragment shader (interpolated values)
  varying vec3 v_Vertex;
  varying vec4 v_Color;
  varying vec3 v_Normal;

  void main() {

    // Perform the model and view transformations on the vertex and pass
    // this location to the fragment shader.
    v_Vertex = vec3( u_To_camera_space * vec4(a_Vertex, 1.0) );

    // Perform the model and view transformations on the vertex's normal
    // vector and pass this normal vector to the fragment shader.
    v_Normal = vec3( u_To_camera_space * vec4(a_Normal, 0.0) );

    // Pass the vertex's color to the fragment shader.
    v_Color = vec4(a_Color, 1.0);

    // Transform the location of the vertex for the graphics pipeline
    gl_Position = u_To_clipping_space * vec4(a_Vertex, 1.0);
  }

+------------+--------------------------------------------------------------------------+
+ Line(s)    + Description                                                              +
+============+==========================================================================+
+ 11         + :code:`u_Light_color` is a :code:`uniform` variable for the vertex       +
+            + shader.                                                                  +
+------------+--------------------------------------------------------------------------+

Fragment Shader
...............

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 7, 36

  // Fragment shader program
  precision mediump int;
  precision mediump float;

  // Light model
  uniform vec3 u_Light_position;
  uniform vec3 u_Light_color;

  // Data coming from the vertex shader
  varying vec3 v_Vertex;
  varying vec4 v_Color;
  varying vec3 v_Normal;

  void main() {

    vec3 to_light;
    vec3 fragment_normal;
    float cos_angle;

    // Calculate a vector from the fragment location to the light source
    to_light = u_Light_position - v_Vertex;
    to_light = normalize( to_light );

    // The fragment's normal vector is being interpolated across the
    // geometric primitive which can make it un-normalized. So normalize it.
    fragment_normal = normalize( v_Normal);

    // Calculate the cosine of the angle between the vertex's normal
    // vector and the vector going to the light.
    cos_angle = dot(fragment_normal, to_light);
    cos_angle = clamp(cos_angle, 0.0, 1.0);

    // Scale the color of this fragment based on its angle to the light.
    // Don't scale the alpha value, which would change the transparency
    // of the fragment
    gl_FragColor = vec4(vec3(v_Color) * u_Light_color * cos_angle, v_Color.a);
  }

+------------+-------------------------------------------------------------------------------------------------+
+ Line(s)    + Description                                                                                     +
+============+=================================================================================================+
+ 7          + :code:`u_Light_color` is a :code:`uniform` variable for the fragment                            +
+            + shader.                                                                                         +
+------------+-------------------------------------------------------------------------------------------------+
+ 36         + The color of the light source, :code:`u_Light_color`, is multiplied                             +
+            + times the color of the surface, :code:`v_Color`. In GLSL, when two                              +
+            + vectors are multiplied together, the default operation is an                                    +
+            + element-by-element multiplication. For example,                                                 +
+            + :code:`(v_Color[0]*u_Light_color[0], v_Color[1]*u_Light_color[1], v_Color[2]*u_Light_color[2])` +
+------------+-------------------------------------------------------------------------------------------------+

Summary
-------

Modeling the color of a *point light source* required a very small change to
previous *diffuse reflection* code. The remaining lighting models in this
chapter include the modeling of a light source's color.

Glossary
--------

.. glossary::

  light color
    An RGB, (red, green, blue), value that describes the color of a light source.

Self Assessment
---------------

.. mchoice:: 10.3.1
  :random:

  A flashlight that shines a pure blue light would have a color of?

  - :code:`(0.0, 0.0, 1.0)`

    + Correct.

  - :code:`(1.0, 0.0, 0.0)`

    - Incorrect. This is a red light.

  - :code:`(1.0, 1.0, 1.0)`

    - Incorrect. This is a white light.

  - :code:`(1.0, 1.0, 0.0)`

    - Incorrect. This is a yellow light.

.. mchoice:: 10.3.2
  :random:

  When a light defined by a color of :code:`(1, 0.5, 0.8)` shines on a pixel
  whose color is :code:`(0.1, 0.2, 0.3)`, what would be the color of the
  rendered pixel?

  - :code:`(0.1, 0.1, 0.24)`

    + Correct. You multiply the pixel's color times the color of the light.

  - :code:`(1, 0.5, 0.8)`

    - Incorrect.

  - :code:`(1.0, 1.0, 1.0)`

    - Incorrect.

  - :code:`(0.1, 0.2, 0.3)`

    - Incorrect.



.. index:: light color
