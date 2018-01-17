.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

10.8 - Multiple Light Sources
:::::::::::::::::::::::::::::

A scene is often illuminated using multiple light sources. This lesson
describes how to include more than one light source in a scene.

Multiple Lights
---------------

As we discussed in lesson 10.6, `light is additive`_. This makes including
multiple light sources in a scene almost trivial. The calculations you have
learned in the previous lessons can be used to calculate the color of
a fragment based on each light source and then the colors are simply
added together.

Example WebGL Program
---------------------

Experiment with the following WebGL program by manipulating the two
light sources in the scene.

.. webgldemo:: W1
  :htmlprogram: _static/10_multiple_lights/multiple_lights.html
  :width: 300
  :height: 300


Fragment Shader
---------------

The following *fragment shader* program implements two lights in a scene.
The calculations for diffuse and specular lighting has been moved
into a function to minimize the duplication of code. The light
model for each individual light is stored in a :code:`struct` (structure)
and then grouped into an array. If there were more than two light
sources the array could be iterated over using a loop.

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 5-9, 11-12, 31, 115-116, 119

  // Fragment shader program
  precision mediump int;
  precision mediump float;

  // Light model
  struct light_info {
    vec3  position;
    vec3  color;
  };

  // An array of 2 lights
  uniform light_info u_Lights[2];

  // Ambient lighting
  uniform vec3 u_Ambient_intensities;

  // Attenuation constants for 1/(1 + c1*d + c2*d^2)
  uniform float u_c1, u_c2;

  // Model surfaces' shininess
  uniform float u_Shininess;

  // Data coming from the vertex shader
  varying vec3 v_Vertex;
  varying vec4 v_Color;
  varying vec3 v_Normal;

  //-------------------------------------------------------------------------
  // Given a normal vector and a light,
  // calculate the fragment's color using diffuse and specular lighting.
  vec3 light_calculations(vec3 fragment_normal, light_info light) {

    vec3 specular_color;
    vec3 diffuse_color;
    vec3 to_light;
    float distance_from_light;
    vec3 reflection;
    vec3 to_camera;
    float cos_angle;
    float attenuation;
    vec3 color;

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // General calculations needed for both specular and diffuse lighting

    // Calculate a vector from the fragment location to the light source
    to_light = light.position - v_Vertex;
    distance_from_light = length( to_light);
    to_light = normalize( to_light );

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // DIFFUSE  calculations

    // Calculate the cosine of the angle between the vertex's normal
    // vector and the vector going to the light.
    cos_angle = dot(fragment_normal, to_light);
    cos_angle = clamp(cos_angle, 0.0, 1.0);

    // Scale the color of this fragment based on its angle to the light.
    diffuse_color = vec3(v_Color) * light.color * cos_angle;

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
    specular_color = light.color * cos_angle;

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // ATTENUATION  calculations

    attenuation = 1.0/
      (1.0 + u_c1*distance_from_light + u_c2*pow(distance_from_light,2.0));

    // Combine and attenuate the colors from this light source
    color = attenuation*(diffuse_color + specular_color);
    color = clamp(color, 0.0, 1.0);

    return color;
  }

  //-------------------------------------------------------------------------
  void main() {

    vec3 ambient_color;
    vec3 fragment_normal;
    vec3 color_from_light_0;
    vec3 color_from_light_1;
    vec3 color;

    // AMBIENT calculations
    ambient_color = u_Ambient_intensities * vec3(v_Color);

    // The fragment's normal vector is being interpolated across the
    // geometric primitive which can make it un-normalized. So normalize it.
    fragment_normal = normalize( v_Normal);

    // Calculate the color reflected from the light sources.
    color_from_light_0 = light_calculations(fragment_normal, u_Lights[0]);
    color_from_light_1 = light_calculations(fragment_normal, u_Lights[1]);

    // Combine the colors
    color = ambient_color + color_from_light_0 + color_from_light_1;
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, v_Color.a);
  }

+------------+--------------------------------------------------------------------------+
| Line(s)    | Description                                                              |
+============+==========================================================================+
| 6-9        | A :code:`struct` is a group of related variables. Grouping the data      |
|            | for modeling an individual light source helps organize your code.        |
+------------+--------------------------------------------------------------------------+
| 12         | An array of two lights is created. This could easily be extended         |
|            | to any number of light sources by increasing the size of the array.      |
+------------+--------------------------------------------------------------------------+
| 15         | The ambient light in the scene is not associated with any particular     |
|            | light source, so it is stored as a separate variable.                    |
+------------+--------------------------------------------------------------------------+
| 18         | The light attenuation is typically a property of the scene and not of    |
|            | any specific light source. However, since the developer has total        |
|            | control of the calculations in the *fragment shader*, anything is        |
|            | possible.                                                                |
+------------+--------------------------------------------------------------------------+
| 21         | The shininess exponent for specular lighting is a property of a model's  |
|            | surfaces. While the lighting properties will typically remain constant   |
|            | for the rendering of a scene, the shininess exponent will typically      |
|            | change for each individual object.                                       |
+------------+--------------------------------------------------------------------------+
| 31-96      | A function to calculate the diffuse and specular lighting for a specific |
|            | light source.                                                            |
+------------+--------------------------------------------------------------------------+
| 108        | Ambient lighting is not associated with any particular light source.     |
+------------+--------------------------------------------------------------------------+
| 115-116    | The color from each light source is calculated.                          |
+------------+--------------------------------------------------------------------------+
| 119        | The color of the fragment results from the addition of the colors        |
|            | from the ambient light and the two light sources.                        |
+------------+--------------------------------------------------------------------------+

The example *fragment shader* above was written for clarity to emphasis that
light sources are additive. To extend this example to more than two light sources you would
probably want to use a loop. The code could have been written like this, (where
:code:`number_lights` must be a constant):

.. Code-Block:: C
  :linenos:
  :emphasize-lines: 7-9

  const int number_lights = 2;

  color = u_Ambient_intensities * vec3(v_Color);

  fragment_normal = normalize( v_Normal);

  for (int j = 0; j < number_lights; j += 1) {
    color = color + light_calculations(fragment_normal, u_Lights[j]);
  }

  color = clamp(color, 0.0, 1.0);
  gl_FragColor = vec4(color, v_Color.a);

Summary
-------

We have discussed the basics of the standard lighting model that was originally "hard-coded"
into the OpenGL graphics pipeline. In WebGL, lighting models must be implemented by a
developer in *vertex shaders* and *fragment shaders*. Having the lighting
calculations in a *fragment shader* gives a developer tremendous flexibility and opens
the possibilities for creativity -- but at the cost of higher development complexity.

In the next chapter we will continue our discussion of how to model the visual surface
properties of 3D objects.

Glossary
--------

.. glossary::

  multiple light sources
    The light in a scene comes from more than one source.

Self Assessment
---------------

.. mchoice:: 10.8.1
  :random:

  Multiple light sources in a scene is accomplished by ...

  - calculating the reflected light from each light source and adding up the results.

    + Correct. "Light is additive."

  - adding the lights together to get one "super light."

    - Incorrect. Each light must be treated separately.

  - calculating the reflected light from the average position of all lights.

    - Incorrect. The position of each light is important and can't be averaged.

  - ignoring all but the most significant light source.

    - Incorrect. All lights are important.

.. mchoice:: 10.8.2
  :random:

  *Shader programs* can use structures (i.e., :code:`struct`) and arrays to group
  related data.

  - True.

    + Correct.

  - False.

    - Incorrect. Structures and arrays are very useful in *shader programs.*

.. mchoice:: 10.8.3
  :random:

  *Shader programs* can implement sub-functions to reduce code duplication.

  - True.

    + Correct.

  - False.

    - Incorrect. sub-functions are very common in *shader programs*.


.. index:: multiple light sources

.. _light is additive: https://en.wikipedia.org/wiki/Additive_color
