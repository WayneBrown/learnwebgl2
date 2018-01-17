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

10.6 - Combining Ambient, Diffuse, and Specular Lighting
::::::::::::::::::::::::::::::::::::::::::::::::::::::::

Now that you understand the three basic lighting models, ie. *ambient*,
*diffuse*, and *specular*, let's combine them into a general model
for lighting a scene. This is straightforward because `light is additive`_.
The calculations we have discussed in the previous lessons can be used in
a single *shader program* and the resulting colors simply added together.

An Ambient, Diffuse, and Specular Lighting Model
------------------------------------------------

For a point light source that is inside a scene, we need the following
data to model the light:

* The light's position
* The light's color

There is typically some light in a scene that is not associated with
any particular light source:

* The ambient percentages for background lighting

Light interacts with the surfaces of an object. To model lighting effects
we also need basic properties of the surfaces, such as:

* The surface's color
* The surface's location
* The surface's orientation (its normal vector)
* The surface's shininess exponent

.. Admonition:: Shaders: Uniforms vs. Attributes

  If all surfaces of a model have the same shininess, then the
  *shininess exponent* should be stored as a single :code:`uniform`
  variable of the model. However, if some triangles of a model have
  different shininess, then an array of shininess values, one for
  each vertex, would be stored in a GPU *buffer object* and accessed
  using an :code:`attribute` variable.


The Math for a Combined Lighting Model
--------------------------------------

There is no new mathematics in this lesson. The *ambient*, *diffuse*, and *specular* light
calculations are performed as we discussed in the previous lessons and
the resulting colors are added together to get the final fragment color.

A WebGL Demo Program
--------------------

Experiment with the following WebGL program. There are many values to
experiment with, so please take your time and discover how the properties
interact with each other.

.. webgldemo:: W1
  :htmlprogram: _static/10_light_combined/light_combined.html
  :width: 300
  :height: 300

As you experiment with the demonstration program, please make sure you
observe the following characteristics of combining ambient, diffuse,
and specular lighting.

* If no direct light is shining on a face, the face's color is based solely
  on the ambient light calculation.
  :raw-html:`<br><br>`

* If the light source does not reflect into the camera, the colors are
  based on the sum of the ambient and diffuse calculations.
  :raw-html:`<br><br>`

* If the light source does reflect into the camera, the colors are based on
  the sum of the ambient, diffuse, and specular calculations.


Shader Programs for a Combined Lighting Model
---------------------------------------------

Please study the following *shader programs* using the notes below as your guide.

Vertex Shader
*************

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 9-13

  // Vertex Shader
  precision mediump int;
  precision mediump float;

  // Scene transformations
  uniform mat4 u_To_clipping_space; // Projection, camera, model transform
  uniform mat4 u_To_camera_space;   // Camera, model transform

  // Light model
  uniform vec3  u_Light_position;
  uniform vec3  u_Light_color;
  uniform float u_Shininess;
  uniform vec3  u_Ambient_intensities;

  // Original model data
  attribute vec3 a_Vertex;
  attribute vec3 a_Color;
  attribute vec3 a_Normal;

  // Data (to be interpolated) that is passed on to the fragment shader
  varying vec3 v_Vertex;
  varying vec4 v_Color;
  varying vec3 v_Normal;

  void main() {

    // Perform the model-camera transformations on the vertex and pass this
    // location to the fragment shader.
    v_Vertex = vec3( u_To_camera_space * vec4(a_Vertex, 1.0) );

    // Perform the model-camera transformations on the vertex's normal vector
    // and pass this normal vector to the fragment shader.
    v_Normal = vec3( u_To_camera_space * vec4(a_Normal, 0.0) );

    // Pass the vertex's color to the fragment shader.
    v_Color = vec4(a_Color, 1.0);

    // Transform the location of the vertex for the graphics pipeline.
    gl_Position = u_To_clipping_space * vec4(a_Vertex, 1.0);
  }

+------------+-----------------------------------------------------------------------------+
| Line(s)    | Description                                                                 |
+============+=============================================================================+
| 9-13       | The light model is defined by four values: :code:`u_Light_position`,        |
|            | :code:`u_Light_color`, :code:`u_Shininess`, :code:`u_Ambient_intensities`.  |
+------------+-----------------------------------------------------------------------------+

Fragment Shader
***************

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 79-80

  // Fragment shader program
  precision mediump int;
  precision mediump float;

  // Light model
  uniform vec3  u_Light_position;
  uniform vec3  u_Light_color;
  uniform float u_Shininess;
  uniform vec3  u_Ambient_intensities;

  // Data coming from the vertex shader
  varying vec3 v_Vertex;
  varying vec4 v_Color;
  varying vec3 v_Normal;

  void main() {

    vec3 ambient_color;
    vec3 specular_color;
    vec3 diffuse_color;
    vec3 to_light;
    vec3 fragment_normal;
    vec3 reflection;
    vec3 to_camera;
    float cos_angle;
    vec3 color;

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // AMBIENT calculations
    ambient_color = u_Ambient_intensities * vec3(v_Color);

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // General calculations needed for both specular and diffuse lighting

    // Calculate a vector from the fragment location to the light source
    to_light = u_Light_position - v_Vertex;
    to_light = normalize( to_light );

    // The fragment's normal vector is being interpolated across the
    // geometric primitive which can make it un-normalized. So normalize it.
    fragment_normal = normalize( v_Normal);

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // DIFFUSE  calculations

    // Calculate the cosine of the angle between the vertex's normal
    // vector and the vector going to the light.
    cos_angle = dot(fragment_normal, to_light);
    cos_angle = clamp(cos_angle, 0.0, 1.0);

    // Scale the color of this fragment based on its angle to the light.
    diffuse_color = vec3(v_Color) * u_Light_color * cos_angle;

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // SPECULAR  calculations

    // Calculate the reflection vector
    reflection = 2.0 * dot(fragment_normal,to_light) * fragment_normal
               - to_light;
    reflection = normalize( reflection );

    // Calculate a vector from the fragment location to the camera.
    // The camera is at the origin, so just negate the fragment location
    to_camera = -1.0 * v_Vertex;
    to_camera = normalize( to_camera );

    // Calculate the cosine of the angle between the reflection vector
    // and the vector going to the camera.
    cos_angle = dot(reflection, to_camera);
    cos_angle = clamp(cos_angle, 0.0, 1.0);
    cos_angle = pow(cos_angle, u_Shininess);

    // If this fragment gets a specular reflection, use the light's color,
    // otherwise use the objects's color
    specular_color = u_Light_color * cos_angle;

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // COMBINED light model
    color = ambient_color + diffuse_color + specular_color;
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, v_Color.a);
  }

+------------+----------------------------------------------------------------------------------------------------+
| Line(s)    | Description                                                                                        |
+============+====================================================================================================+
| 36-41      | The :code:`to_light` and :code:`fragment_normal` vectors are used                                  |
|            | by both the diffuse and specular calculations. They should be calculated                           |
|            | only once.                                                                                         |
+------------+----------------------------------------------------------------------------------------------------+
| 48-52      | This code can be written in less lines if you combine the operations                               |
|            | into single statements. For example, the diffuse calculation could be                              |
|            | written like this in a single line:                                                                |
|            |                                                                                                    |
|            | .. Code-Block:: JavaScript                                                                         |
|            |                                                                                                    |
|            |   diffuse_color = vec3(v_Color) * u_Light_color * clamp(dot(vertex_normal, to_light), 0.0, 1.0);   |
|            |                                                                                                    |
|            | You are encouraged to **NOT** write complex statements like this until much                        |
|            | later in your learning. The GLSL compiler will optimize your code, so write                        |
|            | your code as clearly as possible for humans! Use descriptive variable names                        |
|            | and multiple, distinct statements for clarity.                                                     |
+------------+----------------------------------------------------------------------------------------------------+
| 79-80      | The final color of the fragment is the sum of the ambient, diffuse and                             |
|            | specular calculations. This is a component-wise vector addition.                                   |
|            | That is, if :code:`a = <a0,a1,a2>` and :code:`b = <b0,b1,b2>`, then                                |
|            | :code:`a + b` is equal to a 3-component vector                                                     |
|            | :code:`<a0+b0, a1+b1, a2+b2>`. It is possible that the calculated color values                     |
|            | become greater than 1.0, which means there is more than 100% of the                                |
|            | color -- which is not possible. Therefore, the values are clamped to 1.0                           |
|            | as the maximum possible value.                                                                     |
+------------+----------------------------------------------------------------------------------------------------+

Type of Light Source
--------------------

The example WebGL program above was based on a *point light source*. If you
had a different type of light source, such as a *sun light source*, the shader
programs would have to be changed because the definition of your light source would
change, but the fundamental math would be the same.

Self Assessment
---------------

.. mchoice:: 10.6.1
  :random:

  What does "light is additive" mean?

  - The color of a surface is the result of adding the reflected color from each
    light source (plus the ambient light in the scene).

    + Correct.

  - You can take the average location of all lights in a scene and calculate the reflected
    light from that average location.

    - Incorrect. Not even close!

  - You can add all lights in a scene to get the total light.

    - Incorrect. You add the reflected light from each light source, not the lights themselves.

  - Lights can be added together to create one "super light".

    - Incorrect.

.. mchoice:: 10.6.2
  :random:

  A "combined light model" creates the color a fragment by adding which of the
  following together? (Select all that apply.)

  - Ambient light.

    + Yes.

  - Diffuse light.

    + Yes.

  - Specular light.

    + Yes.

  - Sun light.

    - Incorrect.

.. mchoice:: 10.6.3
  :random:

  What is the purpose for the *shader program* statement,
  :code:`color = clamp(color, 0.0, 1.0);`?

  - If a color component of fragment's color becomes more than 100%,
    it makes the color be 100%.

    + Correct.

  - It makes each color component either 0.0 or 1.0.

    - Incorrect. 0.0 and 1.0 are the min and max values, respectively. If the value is between 0.0
      and 1.0, the value remains unchanged.

  - It sets each color component to an average of the three values.

    - Incorrect. Nope!

  - It makes the color values more homogeneous.

    - Incorrect. That's silly!


.. index:: combined light model

.. _light is additive: https://en.wikipedia.org/wiki/Additive_color
