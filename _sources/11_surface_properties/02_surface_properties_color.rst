.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

11.2 - Surface Colors
:::::::::::::::::::::

Light reflects from a surface into a camera which allows us to "see"
objects. The previous chapter discussed three types of light reflection: ambient, diffuse,
and specular reflection and it was assumed that a single color could describe
a surface's properties. However, each type of reflection interacts
with a surface in slightly different ways and using a single color
for an object can't capture the true nature of these different types of
reflection.

Researchers took various types of physical objects and precisely
measured light reflection for ambient, diffuse, and specular reflection. Some
of their results are listed below. Instead of storing a single color for
a surface, a specific color for each type of light reflection is stored.
This provides more realistic visual results. In your *fragment shader*
calculations you would use the appropriate color for each type of light
reflection.

Examples of Surface Colors [1]_
-------------------------------

.. cssclass:: table-bordered

  +------------+----------------+----------------+----------------+----------------+
  | Material   | Ambient color  | Diffuse color  | Specular color | Shininess      |
  +============+================+================+================+================+
  | Brass      | | 0.329412     | | 0.780392     | | 0.992157     | 27.8974        |
  |            | | 0.223529     | | 0.568627     | | 0.941176     |                |
  |            | | 0.027451     | | 0.113725     | | 0.807843     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Bronze     | | 0.2125       | | 0.714        | | 0.393548     | 25.6           |
  |            | | 0.1275       | | 0.4284       | | 0.271906     |                |
  |            | | 0.054        | | 0.18144      | | 0.166721     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Polished   | | 0.25         | | 0.4          | | 0.774597     | 76.8           |
  | Bronze     | | 0.148        | | 0.2368       | | 0.458561     |                |
  |            | | 0.06475      | | 0.1036       | | 0.200621     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Chrome     | | 0.25         | | 0.4          | | 0.774597     | 76.8           |
  |            | | 0.25         | | 0.4          | | 0.774597     |                |
  |            | | 0.25         | | 0.4          | | 0.774597     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Copper     | | 0.19125      | | 0.7038       | | 0.256777     | 12.8           |
  |            | | 0.0735       | | 0.27048      | | 0.137622     |                |
  |            | | 0.0225       | | 0.0828       | | 0.086014     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Polished   | | 0.2295       | | 0.5508       | | 0.580594     | 51.2           |
  | Copper     | | 0.08825      | | 0.2118       | | 0.223257     |                |
  |            | | 0.0275       | | 0.066        | | 0.0695701    |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Gold       | | 0.24725      | | 0.75164      | | 0.628281     | 51.2           |
  |            | | 0.1995       | | 0.60648      | | 0.555802     |                |
  |            | | 0.0745       | | 0.22648      | | 0.366065     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Polished   | | 0.24725      | | 0.34615      | | 0.797357     | 83.2           |
  | Gold       | | 0.2245       | | 0.3143       | | 0.723991     |                |
  |            | | 0.0645       | | 0.0903       | | 0.208006     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Pewter     | | 0.105882     | | 0.427451     | | 0.333333     | 9.84615        |
  |            | | 0.058824     | | 0.470588     | | 0.333333     |                |
  |            | | 0.113725     | | 0.541176     | | 0.521569     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Silver     | | 0.19225      | | 0.50754      | | 0.508273     | 51.2           |
  |            | | 0.19225      | | 0.50754      | | 0.508273     |                |
  |            | | 0.19225      | | 0.50754      | | 0.508273     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Polished   | | 0.23125      | | 0.2775       | | 0.773911     | 89.6           |
  | Silver     | | 0.23125      | | 0.2775       | | 0.773911     |                |
  |            | | 0.23125      | | 0.2775       | | 0.773911     |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Emerald    | | 0.0215       | | 0.07568      | | 0.633        | 76.8           |
  |            | | 0.1745       | | 0.61424      | | 0.727811     |                |
  |            | | 0.0215       | | 0.07568      | | 0.633        |                |
  |            | | 0.55         | | 0.55         | | 0.55         |                |
  +------------+----------------+----------------+----------------+----------------+
  | Jade       | | 0.135        | | 0.54         | | 0.316228     | 12.8           |
  |            | | 0.2225       | | 0.89         | | 0.316228     |                |
  |            | | 0.1575       | | 0.63         | | 0.316228     |                |
  |            | | 0.95         | | 0.95         | | 0.95         |                |
  +------------+----------------+----------------+----------------+----------------+
  | Obsidian   | | 0.05375      | | 0.18275      | | 0.332741     | 38.4           |
  |            | | 0.05         | | 0.17         | | 0.328634     |                |
  |            | | 0.06625      | | 0.22525      | | 0.346435     |                |
  |            | | 0.82         | | 0.82         | | 0.82         |                |
  +------------+----------------+----------------+----------------+----------------+
  | Pearl      | | 0.25         | | 1.0          | | 0.296648     | 11.264         |
  |            | | 0.20725      | | 0.829        | | 0.296648     |                |
  |            | | 0.20725      | | 0.829        | | 0.296648     |                |
  |            | | 0.922        | | 0.922        | | 0.922        |                |
  +------------+----------------+----------------+----------------+----------------+
  | Ruby       | | 0.1745       | | 0.61424      | | 0.727811     | 76.8           |
  |            | | 0.01175      | | 0.04136      | | 0.626959     |                |
  |            | | 0.01175      | | 0.04136      | | 0.626959     |                |
  |            | | 0.55         | | 0.55         | | 0.55         |                |
  +------------+----------------+----------------+----------------+----------------+
  | Turquoise  | | 0.1          | | 0.396        | | 0.297254     | 12.8           |
  |            | | 0.18725      | | 0.74151      | | 0.30829      |                |
  |            | | 0.1745       | | 0.69102      | | 0.306678     |                |
  |            | | 0.8          | | 0.8          | | 0.8          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Black      | | 0.0          | | 0.01         | | 0.50         | 32             |
  | Plastic    | | 0.0          | | 0.01         | | 0.50         |                |
  |            | | 0.0          | | 0.01         | | 0.50         |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+
  | Black      | | 0.02         | | 0.01         | | 0.4          | 10             |
  | Rubber     | | 0.02         | | 0.01         | | 0.4          |                |
  |            | | 0.02         | | 0.01         | | 0.4          |                |
  |            | | 1.0          | | 1.0          | | 1.0          |                |
  +------------+----------------+----------------+----------------+----------------+

A WebGL Example Program
-----------------------

In the following WebGL program the left canvas is rendered
using a single color for the model. The specific color is the "diffuse color"
listed in the above chart. The *fragment shader* used for the left
rendering is described in `lesson 10.6`_. The canvas on the right is rendered
using the distinct colors list in the above chart.

.. webgldemo:: W1
  :htmlprogram: _static/11_reflected_colors/reflected_colors.html
  :width: 300
  :height: 300

Fragment Shader
***************

Here is the *fragment shader* used to render the right canvas above.
The specific changes are discussion in the comments below.

.. Code-Block:: GLSL
  :linenos:
  :emphasize-lines: 10-13, 33, 55, 78

  // Fragment shader program
  precision mediump int;
  precision mediump float;

  // Light model
  uniform vec3  u_Light_position;
  uniform vec3  u_Light_color;
  uniform vec4  u_Ambient_intensities;

  uniform vec4  u_Model_ambient;
  uniform vec4  u_Model_diffuse;
  uniform vec4  u_Model_specular;
  uniform float u_Model_shininess;

  // Data coming from the vertex shader
  varying vec3 v_Vertex;
  varying vec3 v_Normal;

  void main() {

    vec4 ambient_color;
    vec4 specular_color;
    vec4 diffuse_color;
    vec3 to_light;
    vec3 fragment_normal;
    vec3 reflection;
    vec3 to_camera;
    float cos_angle;
    vec4 color;

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // AMBIENT calculations
    ambient_color = u_Ambient_intensities * u_Model_ambient;

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
    diffuse_color = u_Model_diffuse * vec4(u_Light_color, 1.0) * cos_angle;

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
    cos_angle = pow(cos_angle, u_Model_shininess);

    // If this fragment gets a specular reflection, use the light's color,
    // otherwise use the objects's color
    specular_color = vec4(u_Light_color, 1.0) * u_Model_specular * cos_angle;

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // COMBINED light model
    color = ambient_color + diffuse_color + specular_color;
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = color;
  }

+------------+----------------------------------------------------------------------------------------------------+
| Line(s)    | Description                                                                                        |
+============+====================================================================================================+
| 10-13      | The model color values are :code:`uniform`\ 's.                                                    |
+------------+----------------------------------------------------------------------------------------------------+
| 33         | The model's ambient color reduces the total ambient reflection.                                    |
+------------+----------------------------------------------------------------------------------------------------+
| 55         | The model's diffuse color is used to calculate the diffuse reflection.                             |
+------------+----------------------------------------------------------------------------------------------------+
| 78         | The model's specular color is multiplied times the light's color to calculate the color            |
|            | of the reflected light ray.                                                                        |
+------------+----------------------------------------------------------------------------------------------------+

Conclusion
----------

More realistic light reflection calculations can be made if you know the specific
color values for each type of reflected light. However,

* This only applies to objects with uniform, "solid" color surfaces. Notice that most
  of the above examples are gems or precious metals, which have a uniform
  color over their entire surface. Most real-world objects do not have uniform surfaces.
* Special equipment is required to measure the precise colors values for a
  particular type of surface and light reflection. Access to such special equipment
  is not common.
* Using a single diffuse color for all lighting calculations provides reasonable results
  when you do not have access to more accurate data.

Glossary
--------

.. glossary::

  ambient color
    The amount of color reflected from a surface by indirect light.

  diffuse color
    The amount of color reflected in all directions from a surface by direct light.

  specular color
    The amount of color reflected directly into the camera from a surface by direct light.

Self Assessment
---------------

.. mchoice:: 11.2.1
  :random:

  To get the most realistic light modeling possible, the color of a surface should
  be represented by ...

  - one RGBA (red, green, blue, alpha) value.

    - Incorrect. This works fine for simple renderings, but not for realistic lighting.

  - two RGBA (red, green, blue, alpha) values: one for reflection and one for absorption.

    - Incorrect.

  - three RGBA (red, green, blue, alpha) values: one for ambient reflection, one for diffuse reflection, and one specular reflection.

    + Correct.

  - four RGBA (red, green, blue, alpha) values: one for red light, one for green light, one for blue light, and one for transparent light.

    - Incorrect. Besides, light can't be transparent.

.. mchoice:: 11.2.2
  :random:

  Using three distinct RGBA values to represent the color of a surface fundamentally
  changes how reflected light calculations are performed.

  - False

    + Correct. The lighting calculations are unchanged. The data for the calculations changes.

  - True

    - Incorrect.


.. index:: ambient color, diffuse color, specular color

.. [1] The original source of this information was
   "http://www.sgi.com/software/opengl/advanced98/notes/node119.html"
   but the hyperlink is no longer valid. The information have been replicated at various
   web sites such as http://sci.tamucc.edu/~sking/Courses/COSC4328/Assignments/Materials.html.

.. _`lesson 10.6`: ../10_lights/06_lights_combined.html

