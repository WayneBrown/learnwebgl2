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

12.8 - Particle Systems
:::::::::::::::::::::::

Natural phenomenon such as fire, clouds, water, explosions, and smoke are not
easily modeled by a triangular mesh. This lesson describes the concept of
a `particle system`_ which can be used to model this type of phenomenon.

The Big Idea
------------

A *particle system* models a physical phenomenon over a time span and
is composed of many individual "particles." Each
particle has a "lifetime" that controls how long it is part of an animation.
Between frames of an animation new particles
might be added while other active particles might "die off".
Various properties of a particle can be modified over its lifespan
to affect how it is rendered.
The complexity of a *particle system* is based on 1) the number of active
particles in the system, 2) the number of properties of
each particle, and 3) the complexity of the property manipulation over time.
A **simple** *particle system* might define the following properties for each particle:

* **location** - a particle's current location in 3D space.
* **path** - a particle's path over time. (A single direction vector or perhaps a Bezier curve.)
* **speed** - a particle's change in location over time (distance / time).
* **size** - a particle's size.
* **texture coordinates** - a particle's location in a texture map.
* **lifetime** - how long a particle is part of a *particle system* (in animation frames or clock time).

The behaviour of a *particle system* is defined by a set of "rules" that
control how particles are initialized and modified over time. A single "rule"
might define how a property changes during the entire lifetime of a particle,
or separate "rules" might be used at various stages of a particle's life.
Therefore, a *particle system* defines particle properties, "rules" for
changing those properties, and "rules" for changing the "rules". The
big idea behind a *particle system* is straightforward, but its implementation
can be complex.

A *particle system* is often implemented with randomness built into its
"rules." Properties and the rules that update them typically define a range
of possible values. For example, the **size** of a particle might be some
random value in the range 3.6 to 6.8.
Getting a *particle system* to simulate a particular physical phenomenon
requires careful tuning of the property ranges. (To remove all randomness,
use the same value for the lower and upper limits of a range.)

Typically the rendering of a *particle system* is intended to produce a
visual representation of a coherent physical phenomenon -- not the rendering
of a set of disjoint "particles." Transparency and color blending
are often critical parts of a *particle system* rendering. If a camera is allowed to view
a *particle system* from any angle, transparency requires that the particles
be sorted from back-to-front before rendering. If the camera view can be restricted,
no sorting of the particles is required as long as the particles are created and
organized in an appropriate sorted order.

Implementing a Particle System
------------------------------

Real-time rendering of complex scenes is possible because of the speed
of GPU's. To render a triangular mesh, its data is copied into a
GPU *buffer object* once and then rendered under a transformation
thousand's of times using a single call to :code:`gl.drawArrays()`.
This type of rendering is not possible for a *particle system* where
the particles' properties are changing between each animation frame.
Here are some possible scenarios for rendering a *particle system*:

1. Render each particle using a call to :code:`gl.drawArrays()`. The
   properties of a particle are modified and uploaded to a *shader program*
   as :code:`uniform` variables before calling :code:`gl.drawArrays()`.
   This is very inefficient and the number of particles that can be
   rendered in real-time is limited.
   :raw-html:`<br><br>`

2. Create an array of data for each particle property. For each
   frame of an animation, update the property values for every particle,
   copy the arrays to the GPU, and render all of the particles with a
   single call to :code:`gl.drawArrays()`. (Sorting of the particles
   is possible -- if needed.)
   :raw-html:`<br><br>`

3. Create an array of data for each particle property **and** arrays of
   data that define how the particles are changing. Use a :code:`uniform`
   shader variable to represent a frame number (or time value). Given a
   specific frame number, the *shader program* calculates modifications
   to the particle properties and no data arrays
   need to be copied to the GPU. The entire *particle system* can
   be rendered with a single call to :code:`gl.drawArrays()`. However,
   the *shader program* will be complex and sorting of the particles
   is not possible because a *shader program* is not allowed to modify
   a *vertex object buffer*.

The example WebGL program in this lesson is implemented using scenario #2.

Experimentation
...............

Please experiment with the following WebGL program and study the
*particle system* implementation in :code:`particle_system.js`.
Please note the following data arrays used to represent a *particle system*:

.. Code-Block:: JavaScript

  // Rendering data for particles:
  let location            = new Float32Array(max_particles * 3);
  let size                = new Float32Array(max_particles);
  let texture_coordinates = new Float32Array(max_particles * 2);
  let color_alpha         = new Float32Array(max_particles);

  // Data to update and manage the particles:
  let direction = new Array(max_particles);
  let speed     = new Array(max_particles);
  let alive     = new Array(max_particles);
  let lifetime  = new Array(max_particles);

Please note the functions used to create and manage a *particle system*:

.. Code-Block:: JavaScript

  // Private functions:
  function _randomFloat(min, max) { .. }
  function _randomInt(min, max) { .. }
  function _create() { .. }
  function _initializeParticle(index) { .. }
  function _deleteParticle(delete_index) { .. }
  function _updateParticle(index) { .. }
  function _updateBufferObject(buffer_id, data) { .. }
  function _updateGPU () { .. }

  // Public functions:
  self.reset  = function() { .. }
  self.update = function() { .. }
  self.render = function(transform, camera_space) { .. }

.. webglinteractive:: W1
  :htmlprogram: _static/12_particles1/particles1.html
  :editlist: _static/12_particles1/particle_system.js
  :hideoutput:

As you experiment with the above WebGL program, please ensure
that you observed the following:

* Pause the *particle system* and then rotate the particles
  using a click and drag in the canvas window. This allows
  investigation of the 3D nature of the *particle system*.
  :raw-html:`<br>`

* To remove the randomness in the system, use identical values
  for the minimum and maximum values of a property range.
  :raw-html:`<br>`

* The effect of sorting (or not sorting) the particles can best
  be seen when the particles have a large size.
  :raw-html:`<br>`

* Set the number of particles to 1 to see individual particles
  being created and modified.
  :raw-html:`<br>`

* The :code:`color_alpha` value is set based on the "age" of
  a particle using a :code:`cos` function. This causes a particle
  to "fade out" as it gets close to its "death". When :code:`percent_alive`
  goes to 100%, the alpha value goes to 0.0. The calculations
  are:

  .. Code-Block:: JavaScript

    let percent_alive = alive[index] / lifetime[index];
    color_alpha[index] = Math.cos(percent_alive * Math.PI*0.5);


Implementation Details
......................

To efficiently render a *particle system* the particle properties must
be stored in GPU *vertex object buffers*, which is always a :code:`Float32Array`
for WebGL 1.0. Large arrays must be efficiently organized as new particles
are added and other particles "die off". JavaScript allows for dynamic array growth,
but at a cost of slower execution speeds. The following options assume that
a large array is allocated to store a property of all particles and the array's
size remains unchanged during the execution of a *particle system*.

1. Given an array of size :code:`m`, only elements :code:`[0,n)` contain
   valid data. Elements :code:`[n,m)` are available for storing new data.
   New particles are added to the unused array slots at the end
   of the array. When a particle is deleted, all elements in the array with
   a greater index must be shifted one position over to maintain the contiguous
   organization of active particles. (For efficiency, this shifting of data
   should be done using a single pass through the array.)
   The particle system is drawn with a single call to :code:`gl.drawArrays(0, n)`,
   where :code:`n` is the number of active particles.
   :raw-html:`<br><br>`

2. Given an array of size :code:`m`, only elements :code:`[0,n)` contain
   valid data. Elements :code:`[n,m)` are available for storing new data.
   New particles are added to the unused array slots at the end
   of the array. When a particle is deleted, the last element in the
   array is copied to the position of the element to be deleted. No
   shifting of data is required, but the original ordering of the particles
   is lost. The particle system is drawn with a single call to
   :code:`gl.drawArrays(0, n)`, where :code:`n` is the number of active particles.
   :raw-html:`<br><br>`

3. Given an array of size :code:`m`, :code:`n` of the positions contain
   valid data, while the remaining array positions contain "unused" values.
   A *linked list* of "free slots" is maintained to keep track of the positions
   of "unused" elements. New particles are added to the unused "free slots"
   and the *linked list* is updated appropriately. When a particle is deleted,
   its position is added to the "free slots" *linked list* and its data is
   invalidated in some way. The particle system is drawn with a single call to
   :code:`gl.drawArrays(0, m)`, where :code:`m` is the size of the array.
   Particles that are "dead" can be handled in two ways by a *shader program*:
   1) a special property value can assigned to "dead" particles, such as their
   size being :code:`-1`, and a *fragment shader* can discard all such fragments,
   or 2) set the location of a particle outside the clipping
   volume, (e.g., :code:`(-9999, -9999, -9999)`, which causes the particle
   to be clipped by the graphics pipeline.

Option #2 was used in the example WebGL program above.

Particle Engines
----------------

A *particle engine* is a software system that creates a *particle system*.
Sharing a *particle system* between computer graphic systems is problematic because
the programming logic is a critical part of any *particle system* and simply
storing the parameters that define the *particle system* are insufficient
to re-create the same visual effects.

Blender has an extensive *particle engine* that you can experiment with.
To create a *particle system* in Blender, follow these basic steps:

.. |particles_icon| image:: figures/particles_icon.png
  :align: middle

1. Create any mesh object (e.g., a plane or a cube), to serve as the *particle system*'s "emitter."
2. With the "emitter" as the currently selected object, in the property editor,
   select the "Particles" tab, |particles_icon|.
3. Create a new *particle system* and begin setting its parameters.
4. To visualize a *particle system* the "Timeline" window must be used
   to vary the active frame.

For full documentation, see https://docs.blender.org/manual/en/dev/physics/particles/particle_system_panel.html

Glossary
--------

.. glossary::

  particle system
    a large collection of geometric primitives (points, lines, or triangles) whose
    properties vary over time to simulate real-world phenomenon.

  particle engine
    a software system that facilitates the creation of a particle system.

.. index:: particle system, particle engine

.. _particle system: https://en.wikipedia.org/wiki/Particle_system