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

12.7 - Particle Systems
:::::::::::::::::::::::

Natural phenomenon such as fire, clouds, water, explosions, and smoke as not
easily modeled by a triangular mesh. This lesson describes how to implement
a `particle system`_ which can be used to model this type of phenomenon.

The Big Idea
------------

A *particle system* models a physical phenomenon over a time span. Each
individual particle has a "lifetime" and each particle's properties are
independently varied over its lifetime.
While a *particle system* is running new particles are added and some of the
current particles "die off".
The complexity of a *particle system* is based on two things: 1) the number of properties
each particle has, and 2) the complexity of the manipulation of those properties
over time.

A simple *particle system* might define the following properties for each particle:

* **start_location** - a particle's initial position in 3D space when it is created.
* **location** - a particle's current position in 3D space.
* **direction** - a particle's direction of travel.
* **speed** - a particle's change in location over time (distance / time).
* **lifetime** - a particle's lifetime (in frames or time).

A property of a particle might remain constant during the execution
of a *particle system* or it might change on each frame. For example,
a particle might have a constant speed during its lifetime, or the
speed might increase or decrease during its lifetime.

Other possible properties of a particle include color,
texture coordinates, texture_maps,
normal vector, transparency, and/or spin.

Answers to the following questions will aid in the implementation
of a *particle system*.

* How are new particles added to a *particle system*?
* How are particles removed when their "lifetime" expires?
* How are properties of a particle changed over the particle's lifetime?
* How can particles be rendered to make they look like a single phenomenon
  and not individual elements?

Creating New Particles
......................

Natural phenomenon typically have a randomness to their appearance. Therefore
the properties of a particle are typically defined using random numbers in some
restricted range. For example, the starting location of a particle might be
defined as some random distance between 0.0 to 2.5 from a specific location. Along the
same idea, the number of new particles added to a *particle system* at each
time step might be a random value between 5 and 10. The number of possible
scenarios is only limited by your imagination.

A *particle system* is implemented as a list of particles. New particles are
added to the system by simply creating them and appending them to the list.

The rules for creating new particles are typically not constant. There might
be rules for how to create the initial particles when a *particle system*
is first started, other rules for how to create new particles over time,
and even other rules for how to create new particles towards the end of
a *particle system*'s lifetime.

Expiring Particles
..................

When a particle's lifetime expires, the particle needs to be removed from
the *particle system*'s list of particles. Such a list can be implemented as
an array or as a linked list. An array is simpler, executes faster, and uses
less memory. However, deleting elements from an array can be a costly operation.
Since the ordering of particles
in a list is typically not important,
Particle Motion and Lifetime
----------------------------

The motion of particles over time is obviously dependent on the type of
phenomenon the particle system is simulating. For example, the particles of
an explosion might travel in all directions from the center of a blast and
move very quickly. In comparison, the particles of smoke might generally
travel upwards and move more slowly. The number of possible variations
is limitless.

The following WebGL program demonstrates how a set of particles can be
created and modified over time. Most *particle systems* are based on random
values because it would be very tedious to manually set the individual
properties of hundreds or thousands of particles. The random values are
typically created from a carefully selected range of values. By changing the
initialization values in the demonstration slider bars you can create a
wide variety of particle system effects. For this demo:

* The direction of travel for each particle is set to a random direction.
* The speed of each particle is a random value in the range [avg_speed - speed_variation,
  avg_speed + speed_variation]. If you make the speed_variation be zero,
  all of the particles will have the same speed.
* The lifetime of each particle is a random value in the range [avg_lifetime - lifetime_variation,
  avg_lifetime + lifetime_variation]. If you make the lifetime_variation be zero,
  all of the particles will have the same lifetime.

.. WebglCode:: W1
  :caption: Particle System Motion
  :htmlprogram: ./particle_motion/particle_motion.html
  :editlist: particle_system.js

Study the example code and experiment with modifications. For example,

* Make the directions of the particles only be in the positive Y direction
  by changing line 100 to

  .. Code-Block:: JavaScript

    particle.direction[1] = _random(0.0, 1.0);

* Restrict the direction of the particles to the X-Y plane by making the Z
  direction zero. (line 101)

  .. Code-Block:: JavaScript

    particle.direction[2] = 0.0;

Note that if your particles are not going in the directions you expect, make
sure your speed values are all positive! (Negative speed values will make
particles move in the negative direction of the direction vector.)

Please make special note of the render function which creates a new vertex
array and copies it to the GPU. This has the potential to greatly reduce
rendering speeds, especially for large particle systems. OpenGL allows for
"geometry shaders" that can generate and manipulate vertex data inside
the graphics pipeline and the GPU, but WebGL 1.0 does not support "geometry
shaders." In the future, when WebGL adds support for "geometry shaders" you
will be able to render large particle systems at real-time speeds.

Particle Rendering
------------------

To simulate a real world phenomenon such as smoke or explosions we need to
render each particle with an appropriate visual image. This is best done
using texture mapping. A point can be rendered using more than one pixel,
so rendering each particle requires that we make the following choices:

* How big of an area should be used to render each particle?
* What portion of a texture map should be used to render a particle?
* How can we blend the particles together to make them appear like a single phenomenon?

Regarding the size of each particle, typically the size will vary over its
lifetime. The particles can get
bigger over time, smaller over time, or some combination. The change in size
can be determined by any number of factors, such as the distance from its
original location, its direction, its speed, etc. Since each particle
will have a different size,

.. WebglCode:: W2
  :caption: Particle Explosion Example
  :htmlprogram: ./particle_explosion/particle_explosion.html
  :editlist: particle_system_explosion.js

Glossary
--------

.. glossary::

  billboard
    a rendering of a texturemap onto a quad surface that is always facing the camera.

.. index:: particle engine

.. _particle system: https://en.wikipedia.org/wiki/Particle_system