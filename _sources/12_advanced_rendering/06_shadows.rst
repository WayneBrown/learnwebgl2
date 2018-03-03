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

The "Shadow map" Algorithm
--------------------------

To render shadows, a *fragment shader* must be able to determine if
a fragment (pixel) receives direct light from the scene's
light sources. If the fragment receives no direct light, then the
pixel needs to be assigned only ambient light (or perhaps some low
percentage of diffuse light.) If the fragment receives direct light,
diffuse and specular light calculations can be performed to determine
the fragment's color.

.. tip:: If you need a refresher on modeling light, see lessons `10.2`_ and `10.4`_.

To calculate diffuse and specular
light a vector must be created between a fragment's 3D location and
the location of a light source. (The angle between this vector and the surface
normal determines the amount of diffuse light.) The length of this vector
can be used to determine if
the fragment is in a shadow. This is accomplished by rendering the entire
scene from the location of the light source and remembering the distance
to the closest surface to the light. When the scene is rendered normally,
the distance to the light source is calculated and compared to the
distance from the light to the closest surface. If the distances are
different, there is another surface closer to the light source and
the location is in shadow.

The "big idea" of the *shadow map* algorithm is to create a rendering of
a scene from the location of each light source and remember the distances
between the light source and it's closest surfaces. These distances are
stored in a *texture map* for later use. When the scene is rendered
from the camera's location and orientation the saved "light-to-the-closest-surface"
*texture maps* are used to determine shadows. If a scene has three
light sources, this requires four renderings and three *texture maps* --
a significant amount of time and memory resources.

Steps of the "Shadow map" Algorithm
...................................

#. For each light source in a scene:

   a. Set the *rendering target* to a programmer-created *frame buffer* composed
      of *texture objects*.

   b. Place a "camera" at the light source and render the scene. This places
      the z-value of the closest surface to the light into the *depth buffer*
      of the *frame buffer*. (This *depth buffer* is a *texture map*.)

#. Change the *rendering target* to the default *drawing buffer* and render the
   scene from the camera's location and orientation.

   a. The *vertex shader* calculates the location of a surface in relationship
      to each "light source" and the scene's camera. The locations are placed
      into :code:`varying` variables and interpolated across the surface.
      Therefore, each fragment knows its location relative to each light source
      and to the scene's camera.
   b. The *fragment shader* uses the *texture maps* created by the "light source renderings"
      from step 1 to determine if a pixel is in full light or shadow.

To implement the details of this algorithm the following questions must be answered:

* How can the data from a scene rendering be saved to a *texture map*? (For the purposes of rendering shadows,
  the resulting *texture map* is called a *shadow map*.)
* How can a scene be rendered from the location and orientation of a light source?
* How can a *shadow map* be used to determine if a surface is in shadow?

Rendering a Scene to a *Texture Map*
....................................

.. tip:: This discussion uses a **WebGL extension** which were explained in `12.1`_.

The most straightforward method to render to a *texture map* requires the
use of the :code:`WEBGL_depth_texture` extension. This allows a *texture object*
to be used as the *depth buffer* of a *frame buffer*. (Remember, a *frame buffer*
is a programmer defined "rendering target" that contains a *color buffer*, a
*depth buffer*, and an optional *stencil buffer*.) The following code enables
the :code:`WEBGL_depth_texture` extension and does something reasonable if the
extension is not supported. (This extension is widely supported. See `here`_ for details.)

.. Code-Block:: JavaScript

  depth_texture_extension = gl.getExtension('WEBGL_depth_texture');
  if (!depth_texture_extension) {
    console.log('This WebGL program requires the use of the ' +
      'WEBGL_depth_texture extension. This extension is not supported ' +
      'by your browser, so this WEBGL program is terminating.');
    return;
  }

.. note::

  The variable :code:`depth_texture_extension`
  in this example code is not needed in the rest of the code. However,
  in some cases the object returned by a call to :code:`gl.getExtension()` is
  needed to access the functionality of the extension.

To create a programmer-defined *frame buffer* composed of *texture objects*
the following steps are required:

#. Create a new *frame buffer* object: :code:`gl.createFramebuffer()`.

#. Create a *texture object* to store the *color buffer* values. The size
   of the *texture object* determines the resolution of the rendering. It's
   internal format is RGBA (red, green, blue, alpha), where each value is
   an unsigned byte, :code:`gl.UNSIGNED_BYTE`. (This is the only format
   WebGL 1.0 supports.) There are four steps to create a *color buffer*:

   a) :code:`gl.createTexture()` creates a *texture object*.
   b) :code:`gl.bindTexture()` makes the *texture object* the "active object".
   c) :code:`gl.texImage2D()` creates the buffer that holds the *texture object*'s image data.
   d) :code:`gl.texParameteri()` is used to set a *texture object*'s properties.

#. Create a second *texture object* to store the *depth buffer* values.
   The size of this *texture object* must match the size of the *color buffer*.
   It's internal format is :code:`gl.DEPTH_COMPONENT` and each value will be a 32-bit integer,
   :code:`gl.UNSIGNED_INT`, which will represent a depth value in the range
   [0.0, +1.0]. The integer values are scaled such that 0.0 represents
   the *z-near* clipping plane, and 1.0 represents the *z-far* clipping plane.

#. Attach the first *texture object* to the "Color attachment" of the *frame buffer*.
   Attach the second *texture object* to the "Depth attachment" of the *frame buffer*.

   a) :code:`gl.bindFramebuffer()` makes a specific *frame buffer* the "active" *frame buffer*.
   b) :code:`gl.framebufferTexture2D()` attaches a *texture object* to a *frame buffer*.

#. Verify that the *frame buffer* object is valid using :code:`gl.checkFramebufferStatus()`.

The following function creates a typical *frame buffer*.

.. Code-Block:: JavaScript

  /** ---------------------------------------------------------------------
   * Create a frame buffer for rendering into texture objects.
   * @param gl {WebGLRenderingContext}
   * @param width  {number} Rendering width in pixels.  (must be power of 2)
   * @param height {number} Rendering height in pixels. (must be power of 2)
   * @returns {WebGLFramebuffer} object
   */
  function _createFrameBufferObject(gl, width, height) {
    let frame_buffer, color_buffer, depth_buffer, status;

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
    //depth_buffer = gl.createRenderbuffer();
    //gl.bindRenderbuffer(gl.RENDERBUFFER, depth_buffer);
    //gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    depth_buffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depth_buffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0,
                                    gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Step 4: Attach the color and depth buffers to the frame buffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame_buffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                            color_buffer, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                               gl.RENDERBUFFER, depth_buffer);

    // Step 5: Verify that the frame buffer is valid.
    status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.log("The created frame buffer is invalid: " + status.toString());
      if (color_buffer) gl.deleteBuffer(color_buffer);
      if (depth_buffer) gl.deleteBuffer(depth_buffer);
      if (frame_buffer) gl.deleteBuffer(frame_buffer);
      frame_buffer = null;
    }

    // Unbind these objects, which makes the "draw buffer" the rendering target.
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return frame_buffer;
  }

This code to create a *frame buffer* only works if the :code:`WEBGL_depth_texture`
extension is available and enabled. The function can fail
for many reasons. Perhaps the most common problem is the lack of sufficient memory for
the buffers.

Please take special note of the parameters that control the texture maps.
It is important that the lookups into the *texture maps* interpolate between discrete values by
setting the minify and magnify filters to :code:`gl.LINEAR`. This makes the
lookups into the *texture maps* as accurate as possible. (You can experiment with
the demo code below and change the filters to :code:`gl.NEAREST`, but the results
will be very poor.) The "wrapping" parameters of the *texture maps* are also important.
There is no good choice for the *texture map* behaviour if a *texture coordinate*
is outside the *texture map*'s boundaries! Perhaps the least bad choice is to
repeat the values of the *shadow map* at its edges (:code:`gl.CLAMP_TO_EDGE`).

Rendering from a Light Source
.............................

.. admonition:: Definitions:

  A "scene camera" defines the view a user sees of a scene. :raw-html:`<br>`
  A "light source camera" defines a view of a scene that captures the distances
  to the closest surfaces from the location of a light source.

To determine which surfaces receive direct light in a scene, the scene is rendered
from the vantage point of a "light source camera." This is not a straightforward task
since a "point light source" shines light in all directions, while a "camera view"
has a single, specific direction and orientation. A "light source camera" must
be based on the direction and orientation of the "scene camera" so that the maximum
information about visible surfaces can be gathered.

Two pieces of information are needed to define a "light source camera": 1) its location, and
2) its orientation (i.e., its local coordinate system). The location is easy:
it is the 3D location of the light source. The orientation is a harder problem!
It turns out that the exact line-of-sight direction is not critical.
What is critical is that all of the models in the scene that
are visible from the "scene camera" are included in the rendering from the
"light source camera." Selecting a good line-of-sight and projection matrix for
a "light source camera" determines the accuracy of the resulting *shadow map*.

Let's assume a camera is defined using the standard
parameters of a :code:`matrix.lookAt()` function, which are:

* The location of the camera; the :code:`eye` location.
* The location of a point in front of the camera along its line-of-sight; the
  :code:`center` location.
* A vector that points in the general direction of "up".

A simple method for defining a "light source camera" is:

* The :code:`eye` is the 3D location of the light source.
* The :code:`center` point of the "scene camera" is used as the
  :code:`center` of the "light source camera". (Note: There are an infinite number
  of points that can define a "scene camera"'s line-of-sight,
  but a very restricted set of points that can define a good line-of-sight for
  both the "scene camera" and a "light source camera" at the same time.)
* The same *up vector* is used for both cameras. This keeps the orientation
  of the *shadow map* consistent with the "scene camera."

Concerning the projection:

* If the "scene camera" is rendered using an orthographic projection, an
  orthographic projection should be used for the *shadow map* rendering. Likewise
  for perspective projection.
* The clipping volume defined by a projection should be large enough to include
  all visible objects in the scene.
* The clipping volume defined by a projection should be as small as possible
  to keep floating point roundoff errors to a minimum.

In summary, a critical part of calculating a good *shadow map* is setting up a
projection transformation that is just the right size for a particular scene.

Using a *Shadow Map* to Determine Shadows
.........................................

When a scene is rendered from a "scene camera," a *fragment shader* must
ask, "is this fragment on the closest surface to a light source?" If it is,
the fragment receives direct light. If it is not, the fragment is in a shadow.
To answer this question a distance value is needed from a *shadow map*. A
full understanding of how the graphics pipeline works is required in order
to get the correct distance values out of the *shadow map*.

Lesson `10.1`_ explained the idea of performing lighting calculations
in "model space", "scene space", "camera space" or "clipping space". All example
WebGL programs in Chapter 10 used "camera space". However, "clipping space"
must be used for shadow calculations. Why? When a *shadow map* is created
by rendering a scene from the location of a light source, the *depth buffer* that
becomes the *shadow map* is the result of all operations of the graphics pipeline,
which include clipping, the perspective divide calculation, and viewport mapping.
The data in a *shadow map* is "clipping space" data and must be treated as such.

When a scene is rendered using a "scene camera," the *vertex shader* calculates
the location of a fragment in the following 3D "spaces":

#. For each light source: :raw-html:`<br>`
   The (x,y,z) location of the surface in "light source camera" "clipping space".
   This location is used in a *fragment shader* to look up a "distance from the light"
   value from the light source's *shadow map*.

#. The (x,y,z) location of the surface in "camera space". This location is
   is used for lighting calculations.

#. The (x,y,z) location of the surface in "clipping space." This location
   is placed into the :code:`gl_Position` variable and used for clipping,
   perspective divide calculations, and viewport mapping.

The following is an example *vertex shader* that calculates these locations.

.. Code-BLock:: GLSL

  // Shadow map vertex shader
  // Scene transformations
  uniform mat4 u_Scene_transform;        // Projection, camera, model transform
  uniform mat4 u_Camera_model_transform; // Camera, model transform

  // Light model
  struct light_info {
    vec3  position;
    vec3  color;
    mat4  transform;  // The matrix transform used to create the light's shadow map.
    sampler2D texture_unit;  // Which texture unit holds the shadow map.
  };

  // An array of lights
  const int NUMBER_LIGHTS = 1;
  uniform light_info u_Lights[NUMBER_LIGHTS];

  // Original model data (in "model space")
  attribute vec3 a_Vertex;

  // Data (to be interpolated) that is passed on to the fragment shader
  varying vec4 v_Vertex_camera_space;
  varying vec4 v_Vertex_shadow_map[NUMBER_LIGHTS];

  void main() {

    // Where is the vertex for each shadow-map?
    for (int light=0; light < NUMBER_LIGHTS; j++) {
      v_Vertex_shadow_map[j] = u_Lights[j].transform * vec4(a_Vertex, 1.0);
    }

    // Where is the vertex in "camera space"?
    v_Vertex_camera_space = u_Camera_model_transform * vec4(a_Vertex, 1.0);

    // Where is the vertex in "clipping space"?
    gl_Position = u_Scene_transform * vec4(a_Vertex, 1.0);
  }

In the *fragment shader* each light source is processed to determine
if its light rays shine directly on a fragment. This is not a straightforward
calculation because the precise manipulation of the rendering data must be taken
into account. Please study the following steps carefully.

#. The value :code:`v_Vertex_shadow_map[j]` if the location of a fragment
   in *clipping space* relative to the rendering performed using a camera
   at the location of the j\ :sup:`th` light source. This :code:`(x,y,z,w)`
   location is in *normalized device coordinates*, but the perspective
   division has not been performed. To put the location into
   the clipping volume, the perspective division must be performed manually. That
   is, each component must be divided by the homogeneous coordinate, :code:`w`.
   The location in the clipping volume becomes :code:`(x/w,y/w,z/w,1)`.
   (The graphics pipeline did this automatically when the *shadow map* was rendered.)
   :raw-html:`<br><br>`

#. The :code:`(x/w,y/w,z/w,1)` location is now in *normalized device coordinates*, which
   is a 2 unit wide cube centered at the origin. (Each component is in the range
   :code:`[-1.0,+1.0]`.) The :code:`(x/w,y/w)` components specify the location of
   the fragment in the *shadow map*, while the :code:`z/w` component gives the distance
   of the current surface to the light source. These values must be discussed separately.

   a) When the *shadow map* was rendered, the graphics pipeline performed a
      *viewport mapping* of :code:`(x,y)` from *normalized device coordinates* to a 2D image array.
      Specifically, the :code:`(x,y)` components were mapped
      from :code:`[-1.0,+1.0]` to :code:`[0,imageWidth]` and :code:`[0,imageHeight]`.
      However, the *fragment shader* that is performing shadow calculations
      needs to execute a "texture map lookup" which requires *texture coordinates*.
      Therefore, the :code:`(x,y)` components need to be mapped from :code:`[-1.0,+1.0]` to
      :code:`[0.0,+1.0]`. This is easily done using either :code:`(x,y)*0.5 + 0.5` or
      :code:`((x,y)+1.0) * 0.5`.

   b) WebGL treats the value retrieved from the *shadow map* as a color value.
      (Internally WebGL has stored the value as a :code:`gl.UNSIGNED_INT` in the range
      [0,2\ :sup:`n`] where :code:`n` is 32. (i.e, the range :code:`[0,4,294,967,296]`).
      However, when the GLSL :code:`texture2D()` function is called to perform a
      *texture map* lookup, it always returns a :code:`vec4`, RGBA, color value where
      each component is in the range :code:`[0.0,+1.0]`. Therefore, :code:`z/w` component
      must be converted from *normalized device coordinates*, :code:`[-1.0,+1.0]`, to
      :code:`[0.0,+1.0]`.

Please study the following *fragment shader* code that tests a "light source position"
to determine if it is in shadow or not. The calculations are based on the above
explanations.

.. Code-BLock:: GLSL

  // Shadow map fragment shader
  //-------------------------------------------------------------------------
  // Determine if this fragment is in a shadow based on a particular light source.
  // Returns true or false.
  bool in_shadow(vec3 vertex_relative_to_light, sampler2D shadow_map) {

    // Convert to "normalized device coordinates" using perspective division.
    vec3 ndc = vertex_relative_to_light.xyz / vertex_relative_to_light.w;

    // Convert from range [-1.0,+1.0] to [0.0, +1.0].
    vec3 percentages = ndc * 0.5 + 0.5;

    // Get the shadow map's color value.
    vec4 shadow_map_color = texture2D(u_Sampler, percentages.xy);

    // The shadow_map contains only one depth value, but it was retrieved
    // as a vec4 that contains (d,0,0,1).
    float shadow_map_distance = shadow_map_color.r;

    // Is the z component of the vertex_relative_to_light greater than
    // the distance retrieved from the shadow map?
    // (Compensate for roundoff errors and lost precision.)
    return percentages.z > shadow_map_distance + u_Tolerance_constant
  }

A WebGL Shadow Map Program
--------------------------

Please experiment with the following WebGL program that implements shadows.
The program will render correct shadows in some configurations and not
other. Try to manipulate the scene to create incorrect shadows and then discern
why the errors are occurring.

.. webglinteractive:: W1
  :htmlprogram: _static/12_shadows/shadows.html
  :editlist: _static/12_shadows/shadows.vert, _static/12_shadows/shadows.frag
  :hidecode:


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
.. _10.2: ../10_lights/02_lights_diffuse.html
.. _10.4: ../10_lights/04_lights_specular.html
.. _12.1: ./01_introduction.html#webgl-extensions
.. _here: https://webglstats.com/webgl/extension/WEBGL_depth_texture
.. _10.1: ../10_lights/01_lights_introduction.html#calculating-light-reflection

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

