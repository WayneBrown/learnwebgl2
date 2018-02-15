========================================
11.4 - Transparency (and Alpha Blending)
========================================

The *z-buffer* algorithm for performing *hidden surface
removal* stores the color of the object that is closest to the camera
in the *color buffer* of the *frame buffer*. This is the desired behavior when solid
objects block the view of other solid objects. But what about objects that
are partially transparent that allow the objects behind them to be partially visible?
This lesson explains the standard technique for rendering objects that contain
transparent surfaces.

Transparency
------------

If an object allows light to pass through it, a viewer sees some of the light
reflected from the object and some of the light reflected from the object that
is behind the surface. Therefore, transparency requires the combining of light from
two sources. Let's review the z-buffer algorithm -- which looks like this:

.. Code-Block:: C

  void renderPixel(x, y, z, color) {
    if (z < zbuffer[x][y]) {
      zbuffer[x][y] = z;
      colorbuffer[x][y] = color;
    }
  }

Notice that we have two colors represented in this algorithm: 1) the color
already in the *color buffer*, :code:`colorbuffer[x][y]`, and 2) the color
of the object being rendered, :code:`color`. If we set up the rendering
context carefully, the graphics pipeline can combine the colors using
the amount of transparency of the object. The rendering algorithm changes
to this:

.. Code-Block:: C
  :emphasize-lines: 4

  void renderPixel(x, y, z, color) {
    if (z < zbuffer[x][y]) {
      zbuffer[x][y] = z;
      colorbuffer[x][y] = (colorbuffer[x][y] * percent_left_over) + (color * percent_of_reflection);
    }
  }

Where do the "percentages" come from? Given an RGBA (red, green, blue, alpha)
color value, the "alpha" value represents the amount of light that is reflected.
If alpha is 1.0, all light is reflected and the object is "opaque". If the alpha
value is 0.75, the object reflects 75% of the light that strikes it, which means
25% of the light passes through. So the percentage values come from the :code:`color` value
like this:

.. Code-Block:: C

  percent_of_reflection = color.alpha; // or color[3]
  percent_left_over     = 1.0 - percent_of_reflection;

To setup the graphics pipeline to perform this "blending of colors", you call
two JavaScript functions: the first enables color blending, and the second specifies the
blending percentages using pre-defined enumerated constants. Hopefully the
names of the constants are self explanatory.

.. Code-Block:: JavaScript

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

Note that transparent objects are not visible if they are behind other objects.
Therefore, we don't want to turn *hidden surface removal* off. However, what if there are
multiple transparent objects in a scene and light travels through more than
one of them? In such a situation we need to perform the color combination for
each object the light passes through.
To calculate the correct final color we need to process the objects furthest
from the camera first, and the objects closest to the camera last! That means
we need to sort the transparent objects! We'll talk more about sorting in a few
minutes. Taking all of these issues into account, here are the major steps in a
rendering algorithm the handles transparent surfaces:

#. Clear the *color buffer* and the *z-buffer* - :code:`gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);`
#. Render all of the objects in a scene that are opaque. (The order does not matter.)
#. Sort the transparent objects in the scene based on their distance from the camera.
   (Greatest to least distance.)
#. Sort the graphic primitives in a model based on their distance from the camera.
   (Greatest to least distance.)
#. Enable blending and set the blending percentages.

   .. Code-Block:: JavaScript

     gl.enable(gl.BLEND);
     gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

#. Keep the *z-buffer* algorithm active, but disable changes to the *zbuffer* array.
   (:code:`gl.depthMask(false)`) (This applies only if transparent models
   occupy the same 3D space. This is discussed below in more detail.)
#. Render the sorted transparent objects and primitives, greatest distance
   from the camera to the least distance.

What makes this algorithm very inefficient is the sorting. But before we
discuss sorting, recognize that
prior knowledge about a specific scene might allow you to ignore sorting
altogether. Here are some specific scenarios where you can safely ignore sorting:

* There is only one transparent model in a scene. The primitives in the model
  must be sorted, but you can simply render the transparent model last in the scene.
* There are multiple transparent objects in a scene, but you know that none
  of them overlap each other from a particular camera angle. Therefore, you
  can simply render these models last (but in any order).
* If you have a model that contains some opaque surfaces and some transparent
  surfaces, then the following situations might apply:

  * You know that the transparent surfaces never face the camera. Therefore
    you don't have to worry about the transparent surfaces.
  * The model defines a totally enclosed 3D area and the surfaces behind any
    transparent surfaces are faces of the same model. Therefore you only have
    to be concerned with ordering the faces in that particular model, assuming
    that other models do not intersect in 3D space.

To summarize, if you can use knowledge of a scene to avoid sorting, it is
worth the trouble. This is a general principle of all computer graphics --
if something is not visible, don't worry about rendering it correctly.

Sorting for Transparency
------------------------

To render a scene we render a set of models, where each model
is composed of triangles. When we discuss sorting we have two issues:

* sorting models relative to each other, and
* sorting primitives (points, lines, and triangles) within models.

Sorting the Primitives of a Model
*********************************

Given the primitives of a model, we need to sort them based on their distance
from the camera. This is problematic because the big idea behind fast rendering
is to place the primitive data into a GPU *object buffer* that never changes.
Typically a model is rendered in different sizes, locations, and orientations
in a scene using a transformation matrix,
while the model data remains static. But now the data has to be
re-ordered. We have two basic options:

* Leave the model data in a GPU *object buffer* unchanged, and render each
  primitive (triangle) using a separate call to :code:`gl.drawArrays()`, or
* Re-order the triangle data in the GPU *object buffer*.

The first method produces slower rendering speeds, but is simpler
to implement. The second method will render faster, but requires more JavaScript
code to implement. The demonstration programs in this lesson use
the first method.

For the actual sorting, you should use an *insertion sort*. Why? Note that you
must sort on every rendering operation; you are not sorting just once.
If a scene changes very little from one rendering to the next, the relative
ordering of models in a scene will not change much. Therefore, assuming you
re-use your previous sorting
results, you need to sort a list of primitives that is almost sorted.
An *insertion sort* is the fastest way to sort a list that is already almost
sorted. (Don't ever use *quick sort* or *merge sort* for a soring task like
this. These sorting algorithms are the fastest *general purpose* sorting
methods in common use, but they can't "quit early" and they don't
have good run-time behaviour on sorted data.)

To sort the triangles that make up a model, we need the vertices of the
triangles after the *model* and *view* transforms have been applied to it. In
addition, we don't want to move the data in memory, we just want to find their
sorted order.
Therefore we can perform an "index sort", where we use indexes into an array
of values to keep track of the sorted order, but never actually rearrange the
data values. Here is a general algorithm for sorting the triangles that
compose a model:

#. For each triangle of a model:

   a. Transform each vertex of the triangle by the current *ModelView* transformation.
   b. Determine the vertex that is farthest from the camera. (Since the camera
      is looking down the -Z axis, this is the minimum value of *z*.)
   c. Store this vertex's z-component as the distance of the triangle from the camera.

#. Perform an *insertion sort* on the triangles, using the z-component of the
   vertex that is farthest from the camera as the sorting key.
#. Render the model:

   * If you leave the GPU *object buffer* unchanged, loop through the
     triangles and call :code:`gl.drawArrays()` once for each triangle.

   * If you create a new 1D array of model data in sorted order and copy it
     to a GPU *object buffer*, then make a single call to :code:`gl.drawArrays()`.

The following function initializes an array of index values in preparation for
sorting.

.. Code-Block:: JavaScript

  var sort_indexes = null;

  //-----------------------------------------------------------------------
  /**
   * Initialize the sort_indexes array for sorting the model's triangles.
   * This array is re-sorted before each render of a transparent model.
   * @private
   */
  function _initialize_sorting() {
    var j;

    if (number_triangles  > 0) {
      sort_indexes = new Array(number_triangles);
      for (j = 0; j < number_triangles; j += 1) {
        sort_indexes[j] = [j, 0.0];  // [index to triangle, distance from camera]
      }
    }
  }

Let's assume that a model is defined by a set of triangles whose vertices are
stored in a 1D array of floats -- 9 floats per triangle, 3 floats per vertex.
The array is organized like this:

.. Code-Block:: JavaScript

  vertices = [v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z, ...]

The following function sorts indexes into this array of floats. The model's
vertices are multiplied by a *ModelView* transform that
puts the camera at the origin looking down the -Z axis. For a given triangle,
the vertex with the smallest z-value is the farthest from the camera.

.. Code-Block:: JavaScript

  //-----------------------------------------------------------------------
  /**
   * Sort the triangles of a model, back to front, based on their distance
   * from the camera.
   * @param vm_transform Float32Array The transformation to apply to the model vertices.
   */
  function _sort_triangles (vm_transform) {
    var j, k, n, which_triangle, vertices, max_z, temp;

    // Step 1: Transform each vertex in a model by the current *ModelView* transformation.
    // Step 2: For each triangle, determine its maximum distance from the camera.
    vertices = model.triangles.vertices;
    for (j = 0; j < number_triangles; j += 1) {

      which_triangle = sort_indexes[j][0];
      k = which_triangle * 3 * 3;
      max_z = 10e10;
      for (n = 0; n < 3; n += 1, k += 3) {
        one_vertex[0] = vertices[k];
        one_vertex[1] = vertices[k + 1];
        one_vertex[2] = vertices[k + 2];
        matrix.multiply(transformed_vertex, vm_transform, one_vertex);

        if (transformed_vertex[2] < max_z) {
          max_z = transformed_vertex[2];
        }
      }

      // Remember this triangle's distance from the camera
      sort_indexes[j][1] = max_z;
    }

    // Step 3: Perform an insertion sort on the triangles, using the vertex
    // that is farthest from the camera as the sorting key.
    for (j = 0; j < number_triangles; j += 1) {
      temp = sort_indexes[j];
      k = j - 1;
      while (k >= 0 && sort_indexes[k][1] > temp[1]) {
        sort_indexes[k + 1] = sort_indexes[k];
        k -= 1;
      }
      sort_indexes[k + 1] = temp;
    }
  }

Sorting Models
**************

We need to render the transparent models in a scene from back to front. If
the models do not overlap in 3D space, this is just a matter of sorting the
models based on their distance from the camera. Since the models do not overlap,
you can use any vertex on the model, or a model's center point, to calculate the
distance. For the WebGL demonstration program below, which displays spheres, the
distances are calculated using the center point of each sphere.

If two or more transparent models overlap in 3D space, it is
not possible to render them correct as independent models. To render them
correctly you must combine the models, sort their combined triangles, and then
render the triangles from back to front. This is a quandary! We keep models
as separate entities so that they can be transformed independently. But for
rendering, we need the models to be combined into a single list of primitives.
If you combine the models as a preprocessing step, the models can't be
transformed independently. If you combine the models at render time it can greatly
slow down your rendering frame rate.

Experimentation 1 (Non-overlapping models)
------------------------------------------

Please experiment with the following WebGL demonstration program by disabling
the animation and rotating the models to study the transparency. Rotate
to a view that allows you to see through multiple transparent models with
an opaque model in the background. Is the rendering correct? Do you see
any models that are rendered incorrectly? (There will be errors if any
of the spheres overlap.)

.. WebglCode:: W1
  :caption: Transparency experiments
  :htmlprogram: transparency_example/transparency_example.html
  :editlist: transparency_example_render.js, ../../lib/learn_webgl_model_render_41.js

Experiments on the :code:`transparency_example_render_js` code:

* If you restart the program you will get different combinations of random
  spheres.

* In lines 49-50 you can set the number of spheres to render and the
  number of spheres that are transparent. Try different combinations of
  models.

  * If you increase the numbers you will probably see spheres that
    overlap and therefore render incorrectly.
  * Set the numbers back to 10 and 5 before continuing.

* In line 200, comment out :code:`gl.enable(gl.BLEND);`. Notice
  that all transparency is now gone. Without color "blending" there is no
  transparency. (Enable blending before continuing.)

* Don't sort the models by commenting out line 211. You will get some strange
  visual effects because the the motion of the transparent spheres will not
  match your mental understanding of their position in the 3D world. (Turn
  the sorting back on before continuing.)

Experiments on the :code:`learn_webgl_model_render_41.js` code:

* In line 299, comment out the call to the :code:`_sort_triangles` function.
  Notice the "blotching" effect on the rendered spheres. This is because
  the triangles are being rendered in the order they are defined in the
  *buffer object*. This causes some of the triangles that are closest to
  the camera to be rendered before the object behind the triangle has the
  correct color. This causes the wrong colors to be blended together.

Experimentation 2 (Overlapping models)
--------------------------------------

This demonstration program allows you visualize what happens when transparent
models overlap. Disable the animation and manually rotate the view. Notice that
the rendering has dramatic changes when one sphere gets closer to the camera than
the other spheres. It is not possible to render each sphere independently and
render all of the triangles in the correct back-to-front order.

.. WebglCode:: W2
  :caption: Transparency experiments2
  :htmlprogram: transparency_example2/transparency_example2.html
  :editlist: transparency_example2_render.js

Please experiment with enabling and disabling "writing to the *zbuffer*" by
commenting out :code:`gl.depthMask(false)` in line 204. In normal operation,
the z-buffer algorithm updates the *zbuffer* to hold the distance of the
closest object to the camera from a particular pixel. So with "writing to the *zbuffer*"
enabled, :code:`gl.depthMask(true)`, the *color buffer* will only be updated with a
new color if an object closer to the camera is being rendered. If you have
sorted your models from back to front and are rendering them in that order,
you can leave "writing to the *zbuffer*" enabled and everything works fine,
except when two or more transparent models overlap in 3D space.

When "writing to the *zbuffer*" is disabled, :code:`gl.depthMask(false)`, you
get a reasonable rendering, but the rendering is wrong and the objects will
be rendered differently as the models change their relative location to the
camera.

When "writing to the *zbuffer*" is enabled, :code:`gl.depthMask(true)`, you
get a more accurate rendering of the model's intersections, but you lose some
of the interior surfaces because the *zbuffer* does not allow the "behind" surfaces
to be rendered.

In summary, when transparent models overlap, you get the wrong results whether
you enable or disable "writing to the *zbuffer*." For a particular situation
you need to decide which result gives the "better" visual results.


Experimentation 3 (Combined models)
-----------------------------------

This demonstration program displays a correct rendering of three overlapping
spheres. It is created by combining the models into a single model that
renders all triangles from back-to-front. To achieve this
rendering each vertex must store a unique RGBA value. Notice that as you rotate
the single model there is some visual artifacts at the intersections of the
three spheres. This is because there are some triangles at the intersection
locations that are being rendered in the wrong order. The visual artifacts could be eliminated
by subdividing the triangles around the intersection locations -- at the cost
of slower rendering.

.. WebglCode:: W3
  :caption: Transparency experiments3
  :htmlprogram: transparency_example3/transparency_example3.html
  :editlist: transparency_example3_render.js


Alpha Blending (All the details)
--------------------------------

The concept of blending the color that is already in the *color buffer* with
a new color from a rendered model has been generalized to allow for a
variety of blending factors. When you enable blending in the graphics
pipeline, the rendering algorithm looks like this:

.. Code-Block:: C
  :emphasize-lines: 4

  void renderPixel(x, y, z, color) {
    if (z < zbuffer[x][y]) {
      zbuffer[x][y] = z;
      colorbuffer[x][y] = (colorbuffer[x][y] * percent1) + (color * percent2);
    }
  }

The color in the *color buffer* is called the "destination color". The color
of the object to be rendered is called the "source color". And the percentage values
are called "factors". So the highlighted equation in the above pseudocode becomes:

.. Code-Block:: C

  colorbuffer[x][y] = (colorbuffer[x][y] * dst_factor) + (color * src_factor);

where :code:`dst_factor` and :code:`src_factor` are each 3-component factors and
the multiplication is component-wise. For example, if the :code:`color`
is (0.2, 0.3, 0.4) and the :code:`src_factor` is (0.5, 0.6, 0.7), then the result of
the multiplication :code:`color * src_factor` is (0.10, 0.18, 0.28). Hopefully
is it obvious, but when you see :code:`src` it refers to the "source color"
or the "source factor". Likewise, :code:`dst` refers to the "destination color"
or the "destination factor".

I don't like the names "source" and "destination", but we need to use them
so you will understand the constants that are used to specify the percentages.
You don't specify the factors explicitly; you specify an equation for
calculating the factors from the color values. We will use
the following names for the components of the color values:

.. Code-Block:: C

  colorbuffer[x][y] --> (dst_red, dst_green, dst_blue, dst_alpha)
  color             --> (src_red, src_green, src_blue, src_alpha)

You can select from the following equations for calculating a "factor". Any
of these can be used for the :code:`dst_factor` and/or the :code:`src_factor`.

+-----------------------------+-------------------------------------------------------------+--------------------+
| WebGL ENUM constant         | Resulting factor                                            | Alpha value        |
+=============================+=============================================================+====================+
+ gl.ZERO                     | (0.0, 0.0, 0.0)                                             | 0.0                |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.ONE                      | (1.0, 1.0, 1.0)                                             | 1.0                |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.SRC_COLOR                | (src_red, src_green, src_blue)                              | src_alpha          |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.ONE_MINUS_SRC_COLOR      | (1 - src_red, 1 - src_green, 1 - src_blue)                  | 1 - src_alpha      |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.DST_COLOR                | (dst_red, dst_green, dst_blue)                              | dst_alpha          |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.ONE_MINUS_DST_COLOR      | (1 - dst_red, 1- dst_green, 1- dst_blue)                    | 1 - dst_alpha      |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.SRC_ALPHA                | (src_alpha, src_alpha, src_alpha)                           | src_alpha          |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.ONE_MINUS_SRC_ALPHA      | (1 - src_alpha, 1- src_alpha, 1 - src_alpha)                | 1 - src_alpha      |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.DST_ALPHA                | (dst_alpha, dst_alpha, dst_alpha)                           | dst_alpha          |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.ONE_MINUS_DST_ALPHA      | (1 - dst_alpha, 1 - dst_alpha, 1 - dst_alpha)               | 1 - dst_alpha      |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.CONSTANT_COLOR           | (constant_red, constant_green, constant_blue)               | constant_alpha     |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.ONE_MINUS_CONSTANT_COLOR | (1 - constant_red, 1 - constant_green, 1 - constant_blue)   | 1 - constant_alpha |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.CONSTANT_ALPHA           | (constant_alpha, constant_alpha, constant_alpha)            | constant_alpha     |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.ONE_MINUS_CONSTANT_ALPHA | (1 - constant_alpha, 1 - constant_alpha, 1- constant_alpha) | 1 - constant_alpha |
+-----------------------------+-------------------------------------------------------------+--------------------+
+ gl.SRC_ALPHA_SATURATE       | a = min(src_alpha, 1 - dst_alpha); (a,a,a)                  | 1.0                |
+-----------------------------+-------------------------------------------------------------+--------------------+

You set the blending factors in JavaScript using a call to :code:`blendFunc` like this:

.. Code-Block:: C

  gl.blendFunc(enum src_factor, enum dst_factor);

For the factors that use a constant color, you set that color using this function:

.. Code-Block:: JavaScript

  void glBlendColor​(GLclampf red​, GLclampf green​, GLclampf blue​, GLclampf alpha​);

To complicate things further, you can also change the addition of the colors
to subtraction using the :code:`blendEquation` function. The three options are:

.. Code-Block:: C

  gl.blendEquation(gl.FUNC_ADD);
  gl.blendEquation(gl.FUNC_SUBTRACT);
  gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);

which makes the pipeline's calculation be one of:

.. Code-Block:: C

  colorbuffer[x][y] = (colorbuffer[x][y] * dst_factor) + (color * src_factor);
  colorbuffer[x][y] = (colorbuffer[x][y] * dst_factor) - (color * src_factor);
  colorbuffer[x][y] = (color * src_factor) - (colorbuffer[x][y] * dst_factor);

To add even more complexity, you can separate the blending of the color components
from the blending of the alpha values. If you use the functions:

.. Code-Block:: C

  gl.blendFunc(enum src_factor, enum dst_factor);
  gl.blendEquation(enum equation_mode);

then the color components and the alpha values are treated the same way. If you
use the functions:

.. Code-Block:: C

  gl.blendFuncSeparate(enum src_factor, enum dst_factor, enum src_alpha, enum dst_alpha);
  gl.blendEquationSeparate(enum equation_rgb_mode, enum equation_alpha_mode);

then the color components and the alpha values are treated separately. All of
these options can be very confusing, so let's put it all in pseudocode to attempt
to make it clearer. (Remember that this is implemented inside the graphics
pipeline. You can't change this implementation and you can't implement
this functionality in your *fragment shader* either.)

.. Code-Block:: C
  :emphasize-lines: 4

  vec3 getColorFactor(mode, src_color, dst_color, constant_color) {
    switch (mode) {
      case gl.ZERO:                     factor = (0.0, 0.0, 0.0);
      case gl.ONE:                      factor = (1.0, 1.0, 1.0);
      case gl.SRC_COLOR:                factor = (    src_color[0],     src_color[1],     src_color[2]);
      case gl.ONE_MINUS_SRC_COLOR:      factor = (1.0-src_color[0], 1.0-src_color[1], 1.0-src_color[2]);
      case gl.DST_COLOR:                factor = (    dst_color[0],     dst_color[1],     dst_color[2]);
      case gl.ONE_MINUS_DST_COLOR:      factor = (1.0-dst_color[0], 1.0-dst_color[1], 1.0-dst_color[2]);
      case gl.SRC_ALPHA:                factor = (    src_color[3],     src_color[3],     src_color[3]);
      case gl.ONE_MINUS_SRC_ALPHA:      factor = (1.0-src_color[3], 1.0-src_color[3], 1.0-src_color[3]);
      case gl.DST_ALPHA:                factor = (    dst_color[3],     dst_color[3],     dst_color[3]);
      case gl.ONE_MINUS_DST_ALPHA:      factor = (1.0-dst_color[3], 1.0-dst_color[3], 1.0-dst_color[3]);
      case gl.CONSTANT_COLOR:           factor = (constant_color[0], constant_color[1], constant_color[2]);
      case gl.ONE_MINUS_CONSTANT_COLOR: factor = (1.0-constant_color[0], 1.0-constant_color[1], 1.0-constant_color[2]);
      case gl.CONSTANT_ALPHA:           factor = (constant_color[3], constant_color[3], constant_color[3]);
      case gl.ONE_MINUS_CONSTANT_ALPHA: factor = (1.0-constant_color[3], 1.0-constant_color[3], 1.0-constant_color[3]);
      case gl.SRC_ALPHA_SATURATE:       a = min(src_color[3], 1.0-dst_color[3]);
                                        factor = (a,a,);
    }
    return factor;
  }

  vec3 getAlphaFactor(mode, src_color, dst_color, constant_color) {
    switch (mode) {
      case gl.ZERO:               alpha_factor = 0.0;
      case gl.ONE                 alpha_factor = 1.0;
      case gl.SRC_COLOR           alpha_factor =     src_color[3];
      case gl.ONE_MINUS_SRC_COLOR alpha_factor = 1.0-src_color[3]);
      case gl.DST_COLOR           alpha_factor =     dst_color[3];
      case gl.ONE_MINUS_DST_COLOR alpha_factor = 1.0-dst_color[3];
      case gl.SRC_ALPHA           alpha_factor =     src_color[3];
      case gl.ONE_MINUS_SRC_ALPHA alpha_factor = 1.0-src_color[3];
      case gl.DST_ALPHA           alpha_factor =     dst_color[3];
      case gl.ONE_MINUS_DST_ALPHA alpha_factor = 1.0-dst_color[3];
      case gl.SRC_ALPHA_SATURATE  alpha_factor = 1.0;
    }
    return alpha_factor;
  }

  void renderPixel(x, y, z, color) {
    if (z < zbuffer[x][y]) {
      zbuffer[x][y] = z;

      dst_color = colorbuffer[x][y];
      src_color = color;

      dst_factor[0,1,2] = getColorFactor(dst_mode, src_color, dst_color, constant_color);
      dst_factor[3] = getAlphaFactor(dst_mode, src_color, dst_color, constant_color);

      src_factor[0,1,2] = getColorFactor(src_mode, src_color, dst_color, constant_color);
      src_factor[3] = getAlphaFactor(src_mode, src_color, dst_color, constant_color);

      switch (blendEquation) {
        case gl.FUNC_ADD:              dst_color = dst_color * dst_factor + src_color * src_factor;
        case gl.FUNC_SUBTRACT:         dst_color = dst_color * dst_factor - src_color * src_factor;
        case gl.FUNC_REVERSE_SUBTRACT: dst_color = src_color * src_factor - dst_color * dst_factor;
      }
      colorbuffer[x][y] = dst_color;
    }
  }

Experimentation 4 (Alpha Blending Percentages)
----------------------------------------------

Please experiment with the following WebGL demonstration program by selecting
various combinations of blending factors.

.. WebglCode:: W4
  :caption: Transparency experiments4
  :htmlprogram: transparency_example4/transparency_example4.html
  :editlist: transparency_example4_render.js

Summary
-------

Simple visual effects related to transparency can be achieved using alpha blending.
Accurate rendering of transparent models that intersect in 3D space requires a combination
of techniques that involve the definition of the models, sorting, and configuration
of the graphics pipeline. You would typically implement the minimum functionality
needed to achieve the results your require for a particular scene.

Glossary
--------

.. glossary::

  transparency
    Some of the light that strikes an object passes through the object and
    surfaces behind the object are partially visible.

  opaque
    All light that strikes a surface is reflected. Opaque means no transparency.

  insertion sort algorithm
    The fastest, general purpose algorithm for sorting data that is already close to being sorted.

  index sort
    A set of data values is sorted without ever moving the data. The sort order
    is described as an array of indexes into the array that holds the data.

  destination color
    A color value stored in the *color buffer* of the *frame buffer*.

  source color
    A color value to be rendered for a surface.

  alpha blending
    The color of a pixel is calculated as a combination of two colors: the
    the destination color and the source color.

.. index:: transparency, opaque, insertion sort, index sort, destination color, source color, alpha blending
