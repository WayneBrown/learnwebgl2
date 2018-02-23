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

12.6 - Shadows
::::::::::::::

The lighting calculations discussed in chapter 10 assumed that all surfaces
in a scene received light from the scene's light sources. However,
some surfaces can potentially block light from hitting other
surfaces. If light is blocked, the portion of the surface that does not
receive direct light is in a `shadow`_. Humans rely heavily on shadows to
understand the 3D nature of objects in a 3D scene. Without shadows a 3D scene
is much harder to comprehend. This lesson explains how to render shadows
using a "shadow map".

The "Shadowmap" Algorithm
-------------------------

To render shadows, a *fragment shader* must be able to determine if
a fragment (pixel) receives direct light from the scene's
light sources. If the fragment receives no direct light, then the
pixel needs to be assigned only ambient light (or perhaps some low
percentage of diffuse light.) If the fragment receives direct light,
diffuse and specular light calculations can be performed to determine
the fragment's color.

In lessons `10.2`_ and `10.4`_ the diffuse and specular
light calculations formed a vector between the fragment being rendered and
a light source. The length of this vector can be used to determine if
the fragment is in shadow. This is accomplished by rendering the entire
scene from the location of the light source and remembering the distance
to the closest surface to the light. When the scene is rendered normally,
the distance to the light source is calculated and compared to the
distance from the light to the closest surface. If the distances are
different, there is another surface closer to the light source and
the location is in shadow.

The "big idea" of a *shadowmap* algorithm is to create a rendering of
a scene from the location of each light source and remember the distance
between the light source and it's closest surface. These distances are
stored in a *texture map* for later use. Then, render the scene
from the camera's location and orientation, using the saved "closest surface
to the light" *texture maps* to determine shadows. If a scene has three
light sources, this requires four renderings and three *texture maps*.
The algorithm requires extensive time and memory resources. Here are the major steps
of the algorithm:

#. For each light source in a scene:

   a. Set the *rendering target* to a programmer-created *frame buffer* composed
   of *texture objects*.

   b. Place a "camera" at the light source and render the scene. This places
   the z-value of the closest surface to the light into the *depth buffer*
   of the *frame buffer*. (This *depth buffer* is a *texture map*.)

#. Change the *rendering target* to the default *drawing buffer* and render the
   scene from the camera's location and orientation.

   * The *vertex shader* calculates the location of a surface in relationship
     to both the "light source" and the "camera view". Both locations are placed
     into :code:`varying` variables and interpolated across the surface.
     Therefore, for each fragment we know its location in both its "light source space"
     and its "camera space".
   * The *fragment shader* uses the *texture map* created by a "light source rendering"
     from step 1 to determine if a pixel is in full light or shadow.

To implement the details of this algorithm the following questions must be addressed:

* How can a scene rendering be saved to a *texture map*? (For the purposes of rendering shadows,
  the resulting *texture map* is called a *shadow map*.)
* How can a scene be rendered from the location and orientation of a light source?
* Exactly how can a *shadow map* be used to determine if a surface is in shadow?

We will discuss how to implement these three ideas in the following sections, but
first let's discuss WebGL extensions.

To determine which surfaces receive direct light the scene can
be rendered with a virtual camera positioned at the light source.
Such a rendering puts a color into the *color buffer* and a "distance
from the camera" value into the *depth buffer*. Therefore the
*depth buffer* contains the distance from a light source to its
closest surfaces.
The information for each pixel is the distance from the light source to the closest
surface. In theory this is a simple problem because the contents of the *z-buffer*
(created by the *hidden surface removal* algorithm) is the information we want.
Regrettably, WebGL does not allow access the default *z-buffer*.
But WebGL does allow you to create a separate *frame buffer* composed of
*texture objects* and then render an image to this "offscreen" *frame buffer*.
This is actually very advantageous because after we render the
scene from the light source's location, we need to use that data during
a normal rendering and a texture map image is a convenient way to lookup
values at specific locations.

twice (similar to the object-selection
algorithm described in `lesson 12.3`_). The first rendering determines
which surfaces receive direct light. The second rendering creates the visual image
seen by a user, and uses information gained from the first rendering to
correctly render shadows.

WebGL Extensions
----------------

WebGL 1.0 is an evolving specification that has a standard mechanism for
developers to propose and implement new features. You can get a list of the
WebGL "extensions" that a particular browser supports with a call to
:code:`gl.getSupportedExtensions()`.
Extensions provide features at the cost of portability. Remember that
a WebGL program runs on a client's computer in a client's browser. You
typically have no control over the environment your WebGL program
might be executed. If
you want your WebGL program to execute correctly on any platform, you should
avoid using extensions. However, for some algorithms an extension is needed to
make the algorithm work. In other cases an extension can make an algorithm
easier to implement and in some cases execute faster. So use extensions wisely.

You can get basic information about the WebGL implementation you are executing
on with the following function calls:

.. Code-Block:: JavaScript

  console.log('WebGL version: ', gl.getParameter(gl.VERSION));
  console.log('WebGL vendor : ', gl.getParameter(gl.VENDOR));
  console.log('WebGL supported extensions: ', gl.getSupportedExtensions());

A more typical use of these commands would be to modify your WebGL program's
behaviour based on the version of WebGL a browser supports. The code might look
something like:

.. Code-Block:: JavaScript

  var version = gl.getParameter(gl.VERSION); // "WebGL 1.0"
  if (version.substring(6,9) === "1.0") {
    ...
  } else {
    ...
  }

We will be able to implement a traditional "shadow map" algorithm in an easier
and more efficient manner
if we use a WebGL extension that allows us to render to a *depth buffer* represented
by a *texture object*. The following code enables the :code:`WEBGL_depth_texture`
extension. If a call to :code:`gl.getExtension(name)` returns :code:`null`
the request to enable the extension failed.

.. Code-Block:: JavaScript

  depth_texture_extension = gl.getExtension('WEBGL_depth_texture');
  if (!depth_texture_extension) {
    console.log('This WebGL program requires the use of the ' +
      'WEBGL_depth_texture extension. This extension is not supported ' +
      'by your browser, so this WEBGL program is terminating.');
    return;
  }

Please note that the variable :code:`depth_texture_extension`
in the above code is not needed or ever used in the rest of the code. However,
in some cases the object returned by a call to :code:`gl.getExtension()` is
needed to access the functionality of the extension.

Let's discuss the details of how to render to a programmer-created *frame buffer*.

Rendering to a Texture Map
--------------------------

Remember that a *frame buffer* is a set of three buffers used for rendering:

* The *color buffer* stores the RGBA color values of a rendered image.
* The *depth buffer* (or *z-buffer*) stores the distance to the closest surface from
  the camera.
* The *stencil buffer* stores an optional "mask" that determines which pixels can be modified.

A *frame buffer* that contains a *color buffer* and a *depth buffer* is automatically
created by WebGL when its context is created. The size of the *frame buffer* matches
the size of it's associated HTML canvas. (The *stencil buffer* is optional and is
not created automatically.)

You can render to an programmer-created *frame buffer* to create special effects.
We would like to use the results of a rendering to produce shadows, so the
buffers are created as *texture objects* so that we can use them after the
rendering is finished. The steps for creating a programmer-defined
*frame buffer* composed of *texture objects* are as follows:

#. Create a new *frame buffer* object. :code:`gl.createFramebuffer()`

#. Create a *texture object* to store the *color buffer* values. The size
   of the *texture object* determines the resolution of the rendering. It's
   internal format is RGBA (red, green, blue, alpha), where each value is
   an unsigned byte, :code:`gl.UNSIGNED_BYTE`. (This is the only format
   WebGL 1.0 supports.)
   :code:`gl.createTexture()`, :code:`gl.bindTexture()`, :code:`gl.texImage2D()`,
   :code:`gl.texParameteri()`

#. Create a second *texture object* to store the *depth buffer* values.
   The size of this *texture object* must match the size of the first *texture object*.
   It's internal format
   is :code:`gl.DEPTH_COMPONENT` and each value will be a 32-bit integer,
   :code:`gl.UNSIGNED_INT`, which will represent a depth value in the range
   [0.0, +1.0]. (The integer values are scaled such that 0.0 represents
   the *z-near* clipping plane, and 1.0 represents the *z-far* clipping plane.)

#. Attach the first *texture object* to the "Color attachment" of the *frame buffer*,
   and attach the second *texture object* to the "Depth attachment" of the *frame buffer*.
   :code:`gl.bindFramebuffer()`, :code:`gl.framebufferTexture2D()`

#. Verify that the *frame buffer* object is valid. :code:`gl.checkFramebufferStatus()`

Here is a typical *frame buffer* creation function.

.. Code-Block:: JavaScript

  /** ---------------------------------------------------------------------
   * Create a frame buffer for rendering into texture objects.
   * @param gl WebGLRenderingContext
   * @param width Number The width (in pixels) of the rendering (must be power of 2)
   * @param height Number The height (in pixels) of the rendering (must be power of 2)
   * @returns WebGLFramebuffer object
   */
  function _createFrameBufferObject(gl, width, height) {
    var frame_buffer, color_buffer, depth_buffer, status;

    // Step 1: Create a frame buffer object
    frame_buffer = gl.createFramebuffer();

    // Step 2: Create and initialize a texture buffer to hold the colors.
    color_buffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, color_buffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
                                    gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Step 3: Create and initialize a texture buffer to hold the depth values.
    // Note: the WEBGL_depth_texture extension is required for this to work
    //       and for the gl.DEPTH_COMPONENT texture format to be supported.
    depth_buffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depth_buffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0,
                                    gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Step 4: Attach the specific buffers to the frame buffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame_buffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color_buffer, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,  gl.TEXTURE_2D, depth_buffer, 0);

    // Step 5: Verify that the frame buffer is valid.
    status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.log("The created frame buffer is invalid: " + status.toString());
    }

    // Unbind these new objects, which makes the default frame buffer the
    // target for rendering.
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return frame_buffer;
  }

Note that the above *frame buffer* definition only works if the :code:`WEBGL_depth_texture`
extension is available and enabled. Also note that this function could fail
for many reasons, the most common error being lack of sufficient memory for
the buffers. The version of this function included in the demo programs below contain
error checking and appropriate error messages if the function fails.

Also, take special note of the parameters that control the texture maps. It is important
that the lookups into the texture maps interpolate between discrete values by
setting the minification and magnify filters to :code:`gl.LINEAR`. This makes the
lookups into the texture maps as accurate as possible. You can experiment with
the demo code below and change the filters to :code:`gl.NEAREST`, but the results
will be very poor.

The "wrapping" parameters of the texture maps are also important. What is the
appropriate behaviour if we try to access a value that is outside the texture map?
There is no good choice, but the least bad choice is to repeat the values of the
shadow map at the edges. Thus the setting of :code:`gl.CLAMP_TO_EDGE`.

Rendering from a Light Source
-----------------------------

We need to render the scene from the vantage point of the light source to
determine which surfaces receive direct light. Only the surfaces closest
to the light source receive direct light, so the z-component of the
*depth buffer* can tell us how far away the closest surface is. Let's define
some terms so we don't get confused. Let's call the camera that
renders a scene from a light source the "light source camera." We will call
the camera that renders the visible scene the "view camera."

To render the scene from the vantage point of the light source we need two pieces
of information about the camera: 1) its location, and 2) its orientation
(i.e., its local coordinate system). The location is easy: it is the location of the
light source. The orientation is a harder problem -- which direction should
the camera at the light source be pointed? It turns out that the exact direction
is not critical. What is critical is that all of the models in the scene that
are visible from the "view camera" are included in the rendering from the
"light source camera." Therefore the line-of-sight and the projection used
with the "light source camera" is a critical piece of the algorithm because
together they define the clipping volume for a rendering. Here are the critical
points regarding the projection used for a shadow map rendering:

* If the "view camera" is rendered using an orthographic projection, an
  orthographic projection should be used for the shadow map rendering. Likewise
  for perspective rendering.
* The projection should be defined large enough to include all visible objects
  in the scene.
* The projection should be defined as small as possible to keep floating point
  calculation errors to a minimum.

Therefore, a critical part of calculating good shadow map data is setting up a
projection transformation that is just the right size for a particular scene.

Let's assume for now that each camera is defined using the standard parameters
sent to a :code:`LookAt()` function, which are:

* The location of the camera; the *eye* location.
* The location of a point in front of the camera along its line of sight; the
  *center* location.
* A vector that points in the general direction of "up".

The following demonstration program uses the following convention for setting
up the cameras:

* The same *center point* is used for both cameras. If the *center point* is
  chosen wisely, this allows both renderings to include the correct models.
  (Please note that for a normal camera defined by the :code:`LookAt()` function,
  the exact location of the *center point* is not important because it simple defines
  the line-of-sight of the camera. For shadow maps the *center point*'s exact
  location is critical.)
* The same *up vector* is used for both cameras. This keeps the orientation
  of the shadow map synchronized with the visible scene.

Using a Shadow Map to Determine Shadows
---------------------------------------

When we render a scene from a "view camera," we need to ask this question of
each fragment, "Is this the closest surface to the light source?" If it is,
the fragment gets full lighting. If it is not, the fragment is in a shadow. We can answer this
question using a *shadow map*, which is a texture map, where each component
value is the distance from a light source to the closest fragment. The "trick"
is to get the correct distance out of the shadow map.

When we render a scene from a "view camera," we will interpolate two different
(x,y,z) locations on the surface.

#. The (x,y,z) location of the surface as calculated by the "light source camera"
   transformation matrix. We use this location to look up "distance from the light"
   values from the "shadow map."

#. The (x,y,z) location of the surface as calculated by the "view camera"
   transformation matrix. We use this location to render the scene.

Here is a *vertex shader* that is calculating these two different locations in
3D space:

.. Code-BLock:: GLSL

  // Vertex shader
  // Scene transformations
  uniform mat4 u_PVM_transform; // Projection, view, model transform
  uniform mat4 u_Shadowmap_transform; // The transform used to render the shadow map

  // Original model data
  attribute vec3 a_Vertex;

  // Data (to be interpolated) that is passed on to the fragment shader
  varying vec4 v_Vertex_relative_to_light;

  void main() {

    // Calculate this vertex's location from the light source. This is
    // used in the fragment shader to determine if fragments receive direct light.
    v_Vertex_relative_to_light = u_Shadowmap_transform * vec4(a_Vertex, 1.0);

    // Transform the location of the vertex for the rest of the graphics pipeline.
    gl_Position = u_PVM_transform * vec4(a_Vertex, 1.0);
  }

Using these two 3D locations is straightforward, with the caveat that you must
understand the exact details of how the transformations work because the values must be
converted to appropriate units. The following GLSL *fragment shader* function
performs the calculations and conversions. Please study the code and pay
particularly close attention to the comments that describe each statement.

.. Code-BLock:: GLSL

  // Fragment shader
  //-------------------------------------------------------------------------
  // Determine if this fragment is in a shadow. Returns true or false.
  bool in_shadow(void) {

    // The vertex location rendered from the light source is almost in Normalized
    // Device Coordinates (NDC), but the perspective division has not been
    // performed yet. Perform the perspective divide. The (x,y,z) vertex location
    // components are now each in the range [-1.0,+1.0].
    vec3 vertex_relative_to_light = v_Vertex_relative_to_light.xyz / v_Vertex_relative_to_light.w;

    // Convert the the values from Normalized Device Coordinates (range [-1.0,+1.0])
    // to the range [0.0,1.0]. This mapping is done by scaling
    // the values by 0.5, which gives values in the range [-0.5,+0.5] and then
    // shifting the values by +0.5.
    vertex_relative_to_light = vertex_relative_to_light * 0.5 + 0.5;

    // Get the z value of this fragment in relationship to the light source.
    // This value was stored in the shadow map (depth buffer of the frame buffer)
    // which was passed to the shader as a texture map.
    vec4 shadowmap_color = texture2D(u_Sampler, vertex_relative_to_light.xy);

    // The texture map contains a single depth value for each pixel. However,
    // the texture2D sampler always returns a color from a texture. For a
    // gl.DEPTH_COMPONENT texture, the color contains the depth value in
    // each of the color components. If the value was d, then the color returned
    // is (d,d,d,1). This is a "color" (depth) value between [0.0,+1.0].
    float shadowmap_distance = shadowmap_color.r;

    // Test the distance between this fragment and the light source as
    // calculated using the shadowmap transformation (vertex_relative_to_light.z) and
    // the smallest distance between the closest fragment to the light source
    // for this location, as stored in the shadowmap. When the closest
    // distance to the light source was saved in the shadowmap, some
    // precision was lost. Therefore we need a small tolerance factor to
    // compensate for the lost precision.
    if ( vertex_relative_to_light.z <= shadowmap_distance + u_Tolerance_constant ) {
      // This surface receives full light because it is the closest surface
      // to the light.
      return false;
    } else {
      // This surface is in a shadow because there is a closer surface to
      // the light source.
      return true;
    }
  }

A Demo of the "Shadowmap" Approach
----------------------------------

As you experiment with the following demo program the shadows should make
sense to you. After you are convinced that the shadows are correct, try
to create scenes where the shadows fail. Can you discern what causes the errors?

.. WebglCode:: W1
  :caption: Shadow experiments
  :htmlprogram: shadows_example/shadows_example.html
  :editlist: shadows_example_render_shadows.js, ../../lib/shaders/shader_shadow.vert, ../../lib/shaders/shader_shadow.frag

Dealing with Errors in Shadow Maps
----------------------------------


Shadows will be rendered incorrectly because of the following reasons:

#. The shadow map did not include some of the visible surfaces.

   If your *fragment shader* program does a lookup of a z-value from its
   *shadow map* and the location is outside the texture map, this
   means that the location was outside the projection of the shadow map
   rendering. We set up the texture map to use the edge values in such
   cases (i.e., :code:`gl.CLAMP_TO_EDGE`) but this will typically be wrong.

#. The z-value from the shadow map is different from the z-value calculated
   during the rendering from the "view camera."

   It is impossible to accurately compensate for this problem, but we can get
   reasonable results in many cases with a simple "tolerance factor." The
   correct "tolerance factor" for your scene will not necessarily be the same
   "tolerance factor" that worked for the demo above. You will probably have
   to experiment to find a reasonable value.

   Here are the specifics for perspective projections. (You can refer back to
   section 8.3 for more details.)

   When you render the shadow map, the perspective projection places the following
   values in the :code:`gl_Position` output variable of the *vertex shader*.

   .. Code-Block:: C

     gl_Position[2] = c1 + (-z)*c2  // z component (distance from the camera)
     gl_Position[3] = -z;           // w component (the perspective divide)

   The :code:`c1` and :code:`c2` constants are defined by the distance between
   the z clipping planes:

   .. Code-Block:: C

     c1 = 2*near*far / (near-far);
     c2 = (far+near) / (far-near);

   The *depth buffer* has a specific number of bits allocated to storing the
   distance from the camera of each fragment. After the perspective divide,
   the *z* values are in *normalized device coordinates*, which are floating
   point numbers between -1.0 and +1.0. To map these values to the *depth
   buffer*, the values are scaled by 0.5 and shifted by 0.5 to be between
   0.0 and +1.0 and then converted to unsigned integers. The exact math is:

   .. Code-Block:: C

     depth_buffer[x][y] = ((z * 0.5) + 0.5) * (2^bits_per_value - 1);

   These depth values are the exact contents of the *depth buffer*. Therefore this is the
   values that are stored in a *shadow map* texture as a result of rendering
   to a programmer-defined *frame buffer*. Note that the depth values are
   not linear. The values closer to the camera have more resolution (accuracy),
   while the values further from the camera have less resolution. Also note
   that the number of bits used for the *depth buffer* limits the accuracy of
   the values. For the demo code above, the "depth component" of the
   texture map is specified to be :code:`gl.UNSIGNED_INT` which provides the
   greatest resolution possible, which is 32 bits per value.

   .. figure:: figures/shadow_error.png
      :width: 333
      :height: 163
      :align: right

      Errors in shadow calculations.

   Bottom line: When the shadow map is created, some of the accuracy of the
   depth values are lost. It would be nice if the loss of accuracy was consistent,
   but it is not. The error depends on the distance from the camera
   and on the z value itself. The graph to the right shows the errors for
   various values of z, where the near clipping plan is -4 and the far clipping
   plane is -50. As you can see, the size of the error gets larger for some
   values of z, but for some values of large z, the error can be close to zero.
   The fact that the error is not consistent means that using a single, constant
   "tolerance value" will not compensate correctly for all errors in your shadow
   calculations.

Summary
-------

Rendering shadows correctly is a fascinating topic that you might enjoy
pursuing in more detail. The Wikipedia article on `shadow maps`_ is a good
reference for other algorithms that implement the rendering of shadows.

Glossary
--------

.. glossary::

  shadow
    The portion of a surface that does not receive direct light from a light source.

  shadow map
    A *texture map* used to determine if a fragment receives direct light or is in a shadow.

  WebGL extension
    Functionality added to a WebGL specification.

  frame buffer
    A group of buffers used for rendering. It must contain a *color buffer*.
    If hidden surface removal is enabled it must also contain a *depth duffer*.

  depth_texture_extension
    A WebGL extension that allows a *texture map* to be used as the *depth buffer*
    of a *frame buffer*. This extension also added the option to create a
    *texture map* that contains 32-bit unsigned integers for each value of the map.

.. index:: shadow, shadow map, WebGL extension, depth_texture_extension

.. _shadow: https://en.wikipedia.org/wiki/Shadow
.. _shadow maps: https://en.wikipedia.org/wiki/Shadow_mapping
.. _10.2: 02_lights_diffuse.html
.. _10.4: 04_lights_specular.html

.. Notes-to-self

  When two triangles that share an edge are rendered, the edge pixels get
  rendered twice. Because the edges are in the same 3D space and have
  almost identical z values, z-fighting
  will cause some pixels to be drawn from each triangle.

  I tried to create a shadow algorithm where each triangle stores a unique
  ID in the "shadow map" and then compares the contents of the shadow map
  with the ID of the triangle that is rendering. If the triangle ID matched
  the shadow map ID, then I know that that pixel has direct light. However,
  because the edge pixels are rendered twice, they always don't match the
  ID in the shadow map and therefor all edge pixels get rendered as if
  they were in shadow.

.. Text-to-save

  Each camera has a position, (*eye*), and three orthogonal coordinate axes,
  (*u*, *v*, and *n*). Using :code:`L` for the *light source camera* and :code:`V` for the
  *view camera*, we have eight distinct values: :code:`L.eye, L.u, L.v, L.n` and
  :code:`V.eye, V.u, V.v, V.n`

  Please remember that the *center point* for a camera defines the line-of-site
  of the camera and, in general, the exact location is not critical for a
  typical camera definition. This is not the case for shadows. If the *center point*
  does not point the "light source camera" in a direction that includes the
  majority of the scene in its perspective frustum (or orthographic volume), then
  the shadow map will have no information about the shadows in parts of the scene.
  You need to be careful when defining the *center point* so that shadow map
  contains all of the objects in the scene. You can make the projection of the
  "light source
  rendering" arbitrarily wide and height to include the entire scene, but you
  will lose shadow map accuracy in doing so. Careful placement of the *center
  point* for the cameras is critical to accurate shadow calculations.

.. Demo-that-did-not-work

  .. WebglCode:: W2
    :caption: Shadow experiments2
    :htmlprogram: shadows_example2/shadows_example2.html
    :editlist: shadows_example2_render_shadows.js

