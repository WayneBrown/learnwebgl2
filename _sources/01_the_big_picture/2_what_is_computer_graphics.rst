..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

1.2 - What is 3D Computer Graphics?
:::::::::::::::::::::::::::::::::::

Basic Definitions
-----------------

*Computer graphics* are pictures and movies created using computers. (`1`_)

There are two basic ways to describe a picture using a computer:

*   `Raster graphics`_, which describes a picture using many small dots of color.
    The dots are typically arranged in a rectangular grid. Each
    dot is called a *pixel*, which is an abbreviation for "picture element". If the
    dots are small enough and close enough together, a person does not sees
    the individual dots, but rather sees a "picture" (or "image").
*   `Vector graphics`_, which describes objects as geometric shapes using mathematical
    equations. A picture is created from the mathematical descriptions through
    a process called *rendering*. The results of a rendering is a 2-dimensional
    raster image.

Computer tools have been developed to create and manipulate both types of
computer graphics. For example, `Adobe PhotoShop`_ is the premier tool for
working with raster images. (An open-source equivalent to PhotoShop is `gimp`_.)
Creating new images by manipulating many small
dots of color is not advantageous for animations where objects
are changing over time. PhotoShop is great for creating single
images or "touching up" an existing image, but it is an inadequate tool for
creating movies.

*Computer-generated imagery* (CGI) is the application of computer graphics tools to
create or manipulate images in art, printed media, video games, films,
television programs, commercials, videos, and simulators. (`2`_) The average
person has probably only heard the term CGI in relationship to video games
and movies, but it has wide applications to many fields.

*3D computer graphics* are graphics that use three-dimensional representations
of geometric data for the purposes of performing calculations and the rendering
of 2D images. (`3`_) This textbook teaches you how to use
3D computer graphic techniques to create CGI. Or, said more technically,
these tutorials teach you how to create vector graphic representations of
3-dimensional objects and then render them into a raster image.

If you can create data and algorithms that render raster
images in less than 1/30th of a second, you can create *real-time* video.
Most video games are based on *real-time* rendering. If it takes longer
than 1/30th of a second to create each image, you can always store the
images to a file and play them back in real-time. Most movie CGI is not
rendered in real-time. In fact, it is not uncommon for the CGI processing
for a single image (frame) of a movie to take from 1 to 10 hours!

.. admonition:: Summary

    The field of *computer graphics* uses computational devices to create
    images from geometric descriptions of 3D objects or from algorithmically
    created data.

.. note::
    Don't confuse *computer graphics* with *image processing*.
    *Computuer Graphics* applications create raster images as their output.
    *Image Processing* takes a raster image as input and manipulates it or
    tries to interpret what the image means. Image enhancement and face
    recognition are sub-fields of *image processing*.

.. note::
    *Raster images* are also sometimes called *bitmaps*. In general, a **bitmap**
    is a mapping from information to binary numbers, or bits. Since a
    *raster image* is a set of pixel color values stored as binary numbers,
    it is indeed a *bitmap*. The term *bitmap* is more generic,
    while *raster image* is specifically a computer graphics term. Some
    people use *bitmap* to refer to a black and white image where each
    pixel is a single bit, and they use the term *pixmap* for images that
    have multiple bits per pixel.

Jobs in Computer Graphics
-------------------------

The field of *computer graphics* is very broad and includes many different types
of jobs, ranging from artists to technicians. Here are just a few recent job
openings related to *computer graphics*:

*   **Character Artist** - design and create models of animated characters
    (e.g., Kermit the Frog).
*   **FX Artists** - design and create models of special effects, such as explosions.
*   **Senior Concept Artist** - design storyboards for animations or movies.
*   **3D Animator** - design the motion of animated characters.
*   **Systems Engineer** (GPU Architecture Modeling) - drive the next generation of GPU
    architecture and rendering APIs through rigorous top-down modeling process.
*   **Graphics Performance Engineer** - Analyze graphics application performance.
*   **Software Engineer, Graphics** - pioneer, develop and build out our stunning visual experiences.
*   **Computer Graphics Research Scientist** - develop new algorithms from foundational theory.

Most, if not all, computer graphics projects are a team effort because of the
large range of skills needed. Just take a look at the credits of any movie that
contains CGI content to understand the number of people involved!

This textbook teaches the technical side of computer graphics and its
intended audience is computer scientists who want to build
computer applications that contain 3D graphical content, especially in a web browser.

Glossary
--------

.. glossary::

    computer graphics
        pictures and movies created using computers.

    raster graphics
        a picture defined by many small dots of color.

    vector graphics
        a picture defined by geometric data and/or algorithms.

    bitmap
        a picture where each pixel is a single binary digit (0/1 for black/white)

    pixmap
        a picture where each pixel is represented by more than one bit.

    computer-generated imagery (CGI)
        using computers to create or modify raster images.

    3D computer graphics
        using computers to create raster images from vector graphics data.

    render
        the specific process that creates a raster image (picture) from vector graphics data.

Assessments
-----------

.. mchoice:: 1.2.1
    :random:
    :answer_a: A rectangular grid of pixels, where each pixel has a specific color.
    :answer_b: A description of a scene, including the types of objects in a scene (e.g., a dog eating a bone.)
    :answer_c: A set of geometric primitives, such as lines, arcs, polygons, etc.
    :answer_d: A group of spline curves that form an interesting pattern.
    :correct: a
    :feedback_a: Yes. Each pixel is a *picture element*.
    :feedback_b: No. But this might be the output of an *image processing* detection algorithm.
    :feedback_c: No. This is a *vector graphics* image description.
    :feedback_d: No. This is a *vector graphics* image description.

    A *raster graphics* image is composed of what?

.. mchoice:: 1.2.2
    :random:
    :answer_a: A rectangular grid of pixels, where each pixel has a specific color.
    :answer_b: A description of the types of objects in a scene (e.g., a boy walking a dog.)
    :answer_c: A set of geometric primitives, such as points, lines, and/or triangles.
    :answer_d: A group of colors.
    :correct: c
    :feedback_a: No. This is a *raster image*.
    :feedback_b: No. The computer does not understand such high level descriptions.
    :feedback_c: Yes. A *3D computer graphics* rendering creates a picture from the geometric primitives.
    :feedback_d: No. Color information is important, but insufficient to create a rendering.

    How do you define a scene for a *3D computer graphics* rendering?

.. mchoice:: 1.2.3
    :random:
    :answer_a: Input: geometric primitives; Output: raster image
    :answer_b: Input: raster image; Output: modified raster image
    :answer_c: Input: pixels; Output: geometric primitives
    :answer_d: Input: small dots of color Output: a scene description in English
    :correct: a
    :feedback_a: Correct.
    :feedback_b: No, this is image processing.
    :feedback_c: No, this is converting an raster image into a "higher level" description, which is image processing.
    :feedback_d: No, this is image processing.

    Which answer below best describes the **input** and the **output** of *3D computer graphics*?

.. mchoice:: 1.2.4
    :random:
    :answer_a: the rendering of a scene can be produced in less than 1/30th of a second.
    :answer_b: the resulting image contains the current time.
    :answer_c: the rendering of a scene happens right now.
    :answer_d: the rendering is really fast.
    :correct: a
    :feedback_a: Correct. Displaying 30 frames per second allows most people to perceive motion without flicker.
    :feedback_b: No, that's silly!
    :feedback_c: Maybe, but the important issue is whether 30 or more images per second can be created.
    :feedback_d: No, fast rendering does not guarantee motion without flicker, the number of frames per second does.

    **Real-time** *3D computer graphics* means ...?

.. shortanswer:: 1.2.5

    Perform a web search using the search term "computer graphics jobs" and examine the details of some of the jobs you find. Now describe the type of job you would enjoy being qualified to apply for.


.. index:: computer graphics, raster graphics, vector graphics, computer-generated imagery, CGI, 3D computer graphics, render


.. _1 : https://en.wikipedia.org/wiki/Computer_graphics
.. _Raster graphics: https://en.wikipedia.org/wiki/Raster_graphics
.. _Vector graphics: https://en.wikipedia.org/wiki/Vector_graphics
.. _Adobe PhotoShop: https://en.wikipedia.org/wiki/Adobe_Photoshop
.. _gimp: https://www.gimp.org/
.. _2 : https://en.wikipedia.org/wiki/Computer-generated_imagery
.. _3 : https://en.wikipedia.org/wiki/3D_computer_graphics



