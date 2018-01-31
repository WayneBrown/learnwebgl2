==============================================
10.10 - Combining Light and Surface Properties
==============================================

Wow! We have covered a lot of techniques related to surface properties. And
we have only touched the surface of what is possible! (Pun intended!)

To end our discussion of surface properties we need to combine them with
lighting calculations. In general a *fragment shader* will:

* determine a color for the fragment,
* set up the fragment's normal vector for lighting calculations, and
* modify the color based on the lighting calculations.

Each of these steps can be simple or complex. Each step can involve a single
method or combinations of methods. There is no limit on what your creative
mind might come up with! For example, to create a color for a fragment you
could combine a color attribute of the triangle with a color from an image texture
map and some percentage of another color, where the percentage is calculated
using a procedural texture map. To combine these colors you could pick from
an infinite number of possible percentages, such as 1/3, 1/3, 1/3, or
1/2, 1/4, 1/4, or 3/4, 3/16, 1/16. You get the idea. In fact, almost all
special effects are created by combining colors from multiple sources.
And beyond the color selection, the lighting calculations can be complex,
especially if there are multiple light sources of different types.

This lesson presents a very simple example of surface property and light
reflection interaction. Hopefully you
will be able to extrapolate the example into an infinite number of possibilities.

Experimentation Program
-----------------------

The following WebGL program creates two different *shader programs*, one to
render the cubes in the scene, and another to render the block letters. Both
*shader programs* use the same *vertex shader* but different *fragment shaders*.
Let's review the specifics of each shader before you experiment with the WebGL program.

The *fragment shader* that renders the cubes, *shader38.frag*, does the following:

* Calculates a percentage value using a procedural texture map. (See the function
  :code:`my_texture`.)
* Using the percentage, calculates a gradient color using the model's surface color and white.
* Normalizes the surface normal because it is being interpolated across the surface.
* Performs lighting calculations on the color.
* Outputs the color to :code:`gl_FragColor`

The *fragment shader* that renders the letters, *shader39.frag*, does the following:

* Gets a color from an image texture map (water.png).
* Creates a color that is half the texture map's color and half the face's color.
* Normalizes the surface normal because it is being interpolated across the surface.
* Performs lighting calculations on the color.
* Outputs the color to :code:`gl_FragColor`

Specifically notice the following in the :code:`surface_and_light_render.js` code below:

* In lines 383-384 the two shader programs are created: :code:`cube_program` and :code:`text_program`.
* In lines 393-396 the models for the cubes are created using the :code:`cube_program` shader.
* In lines 398-400 the models for the letters are created using the :code:`text_program` shader.
* When the scene is rendered in the right canvas:

  * In line 238 the :code:`gl2.useProgram()` function is used to make the
    :code:`cube_program` active. This allows all the cubes to be rendered using
    a *procedural texture map* (lines 255-258).
  * In line 262 the :code:`gl2.useProgram()` function is used to make the
    :code:`text_program` active. This allows all the letters to be rendered using
    an *image texture map* (lines 255-258).

* The lighting data has to be passed into the shaders twice, once for each
  *shader program*. This is done in lines 244-249 for the :code:`cube_program` shader
  and in lines 265-270 for the :code:`text_program` shader.

Please experiment with the WebGL program below and study the code.

.. WebglCode:: W1
  :caption: Texture Transforms
  :htmlprogram: surface_and_light/surface_and_light.html
  :editlist: surface_and_light_render.js, ../../lib/shaders/shader38.vert, ../../lib/shaders/shader38.frag, ../../lib/shaders/shader39.frag

Summary
-------

The final appearance of a rendered object is an interaction of a face's
surface properties and lighting calculations. With special care you can develop
*vertex shaders* and *fragment shaders* that produce photo-realistic
renderings and amazing visual effects.


.. index:: combining light and surface properties
