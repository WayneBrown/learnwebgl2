..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

.. role:: raw-html(raw)
   :format: html

3.2 - Modeling Color
::::::::::::::::::::

3D computer graphics creates raster images from geometric descriptions of 3D objects.
Each pixel of a raster image must be assigned an appropriate color. This
lesson describes the basics of color representation and manipulation.

Color Models
------------

For devices that produce images using light, such as computer monitors,
color is modeled as a combination of three base colors: red, green and blue.
Light is additive. If you add red, green and blue light at full intensity, you
get white light. The absence of light produces black. All colors discernible
by the human eye can be created using some combination of
red, green and blue light. This is called the RGB (red, green blue) color
system.

For devices that produce images from reflected light, such as printed pages,
color is modeled as a combination of three base colors: cyan, magenta and yellow.
These pigments absorb certain wavelengths of light and reflect red, green
and blue light. So this is not really a different way to represent color, it
is just a different way to produce reflected light.
All colors discernible by the human eye on a printed page can be created using some combination
of cyan, magenta and yellow pigments. This is called the CMY (cyan, magenta,
yellow) color system. Printers typically also use blank pigment to get crisper
black colors. This is called the CMYK system, where K stand for "blacK".

Colors represented in RGB can be converted to CMYK, and vis versa. We will
concentrate on RGB colors because that is what WebGL programs typically use.

We need three values to represent a specific color: how much red,
green, and blue light. A natural representation for these values
uses percentages: 0% means no color, while 100% means full color. It is up
to the hardware of a device to determine what 100% of a color means. For
example, take a look at various brands of TV's in a store.
They don't all create the same colors from the same data!

Device Independent Color
------------------------

One of the goals of creating WebGL programs in the browser
is that the graphics will execute correctly in cross-platform environments.
We could like to specify colors that are device independent.
The standard scheme for device independent colors uses floating point values.
For example, :code:`(0.45, 0.23, 0.89)` represents
a color that is composed of 45% red, 23% green, and 89% blue light.

How many unique colors can be represented using floating point values? A lot!
Each component value can represent approximately 8 million different percentage
values. This allows for approximately 600,000,000,000,000,000,000 possible colors!
Can the human eye see that many colors? No!
The typical person can only see about 250 different variations
in any particular shade of color, though color perception does vary from person
to person. Consider the image below that displays
various shades of black and white for various `color depth`_ choices.

.. figure:: figures/bitdepths_chart_med.jpg
  :align: center

  Color depth for shades of black and white. (`1`_)

Notice the following facts about the image above:

.. |28| replace:: 2 :sup:`8`

* Each block of color is one solid color, even though it looks like the color
  is changing within a block. This phenomenon is called `mach bands`_. To prove
  to yourself that each block of color is one solid color, take two
  pieces of paper and cover up the block of color on either side of a specific
  block. The block will become one uniform color! Remove the coverings and
  the "banding" effect will reappear. Your eye is designed to enhance contrast!
  :raw-html:`<br /> <br />`
* For most people, the 8 bit color depth provides a smooth progression of
  color. Can you see any *mach bands* in the '8 bits' strip of color blocks?
  If not, this is at or above your eye's maximum color resolution.
  :raw-html:`<br /> <br />`
* The '8 bits' *color depth* allows for 256 different shades of black and white.
  If you use 8 bits for each RGB component value, you can represent over 16
  million different colors. (|28|) :sup:`3`. For the average person this
  color precision is considered "full color".
  :raw-html:`<br /> <br />`

Transparency
------------

An opaque object reflects most of the light that
strikes it, while a transparent object allows some light to pass through it.
The amount of transparency of an object can vary widely based on its
composition. For example, a glass cup might be highly transparent, while water
is partially transparent. Accurately modeling transparency is very difficult.
A very simplistic model for transparency is to store a "percentage of
opaqueness" with a color value. This percentage is called the "alpha value".
The `RGBA`_ color system stores 4 component values for a color, where the first
three values are the red, green and blue components and the last value is
the alpha value. You will also see references to ABGR and ARGB color representations.
The order of the letters indicates the order of the values in the color specification.

Using floating point percentages for each component, here are a few examples:

.. |ab| replace:: :code:`1.0`
.. |cd| replace:: :code:`0.9`
.. |ef| replace:: :code:`0.5`
.. |gh| replace:: :code:`0.0`

+-----------------------+--------------------------------+--------------------+
+ RGBA color            + Opaque                         + Transparent        +
+=======================+================================+====================+
+ (0.2, 0.1, 0.9, |ab|) + opaque, all light is reflected + 0% transparent     +
+-----------------------+--------------------------------+--------------------+
+ (0.2, 0.1, 0.9, |cd|) + mostly opaque                  + 10% transparent    +
+-----------------------+--------------------------------+--------------------+
+ (0.2, 0.1, 0.9, |ef|) + half the light passed through  + 50% transparent    +
+                       + the object                     +                    +
+-----------------------+--------------------------------+--------------------+
+ (0.2, 0.1, 0.9, |gh|) + all light travels through the  + 100% transparent   +
+                       + the object, the object is      +                    +
+                       + invisible                      +                    +
+-----------------------+--------------------------------+--------------------+

Shades of Color
---------------

Notice that since :code:`(0,0,0)` is black and :code:`(1,1,1)` is white, shades of any particular
color are created by moving towards black or towards white. You can use a parametric
equation to calculate a linear relationship between two values to make shades
of a color darker or lighter. The parametric equation, :code:`C = A + (B-A)*t`
calculates linear values between values A and B as the parameter, *t*, varies
between 0.0 and 1.0. When :code:`t == 0.0`, :code:`C == A`. When :code:`t == 1.0`,
:code:`C == B`. When :code:`t == 0.5`, :code:`C` is a value that is half way
between A and B.

To make color :code:`(r,g,b)` lighter, move it towards :code:`(1,1,1)`.

.. Code-block:: JavaScript

  newR = r + (1-r)*t;  // where t varies between 0 and 1
  newG = g + (1-g)*t;  // where t varies between 0 and 1
  newB = b + (1-b)*t;  // where t varies between 0 and 1

To make color :code:`(r,g,b)` darker, move it towards :code:`(0,0,0)`.

.. Code-block:: JavaScript

  newR = r + (0-r)*t;  // where t varies between 0 and 1
  newG = g + (0-g)*t;  // where t varies between 0 and 1
  newB = b + (0-b)*t;  // where t varies between 0 and 1
  // or
  newR = r*t;  // where t varies between 1 and 0
  newG = g*t;  // where t varies between 1 and 0
  newB = b*t;  // where t varies between 1 and 0

HTML and CSS Color
------------------

HTML and CSS code specifies color in one of two ways:

* As predefined color names. (See a list of the names at `html-color-codes.info`_.)
* As a hexadecimal string where each color is represented by 2 hexadecimal digits.
  Each component value is a number in the range 0 to ff, (0 to 255).

It is straightforward to convert between WebGL colors and HTML colors. Given
an HTML color value, convert each component value to a decimal number and divide it by 255.0.
Given a WebGL color value, multiply each component value by 255, round to the
closest integer, and convert the value to base 16.

If you select a color using the HTML input color selector below, the
following table will display its value in both HTML and WebGL formats.

.. raw:: html

  <script>
    function new_color() {
      var a_color = $('#pick_color')[0].value;
      var red = parseInt(a_color.slice(1,3),16);
      var green = parseInt(a_color.slice(3,5),16);
      var blue = parseInt(a_color.slice(5,7),16);

      var redFrac = red / 255.0;
      var greenFrac = green / 255.0;
      var blueFrac = blue / 255.0;

      $('#webgl_red').text(redFrac.toFixed(4));
      $('#webgl_green').text(greenFrac.toFixed(4));
      $('#webgl_blue').text(blueFrac.toFixed(4));
      $('#webgl_color').text('(' + redFrac.toFixed(4) + ', ' +
                                    greenFrac.toFixed(4) + ', ' +
                                    blueFrac.toFixed(4) + ', ' +
                                    ' 1.0)');

      $('#css_red').text(a_color.slice(1,3));
      $('#css_green').text(a_color.slice(3,5));
      $('#css_blue').text(a_color.slice(5,7));
      $('#css_color').text(a_color);
    }
  </script>

  <table border="0" class="table">
    <tr>
      <td>Select a color: <input id="pick_color" type="color" value="#FFFFFF" onchange="new_color();"/></td>
      <td>Red</td>
      <td>Green</td>
      <td>Blue</td>
      <td>Color Representation</td>
    </tr>
    <tr>
      <td>WebGL color:</td>
      <td id="webgl_red">1.0000</td>
      <td id="webgl_green">1.0000</td>
      <td id="webgl_blue">1.0000</td>
      <td id="webgl_color">(1.0000, 1.0000, 1.0000, 1.0)</td>
    </tr>
    <tr>
      <td>HTML and CSS color:</td>
      <td id="css_red">ff</td>
      <td id="css_green">ff</td>
      <td id="css_blue">ff</td>
      <td id="css_color">#ffffff</td>
    </tr>
  </table>

WebGL Color
-----------

All colors in WebGL require a four-component, RGBA, value, where each
component value is a floating point number between 0.0 and 1.0. If
you don't specify an *alpha* value, it is typically assumed to be 1.0.

Experiment with setting colors by changing the background color of the
following WebGL program. The background color is set in line 128 using
the WebGL :code:`clearColor` function.

You can also experiment with the colors of the model by changing the
colors defined in the "materials descriptions" in the :code:`model_cone4.mtl`
file. Do not change the color names, just the RGB values of the lines
that start with :code:`Kd`.
(We will discuss exactly what :code:`Kd` stands for in a future lesson.)

.. webglinteractive:: W1
  :htmlprogram: _static/02_object_examples/object_examples.html
  :editlist: _static/02_object_examples/object_examples_scene.js, _static/models/model_cone4.mtl
  :hideoutput:
  :width: 300
  :height: 300


Glossary
--------

.. glossary::

  color model
    A mathematical representation for color.

  RGB color model
    Represent a color for a light emitting device using 3 percentage values, one for red, green, and blue light.

  CMY color model
    Represent a color for a printed page using 3 percentage values, one for cyan, magenta, and yellow pigment.

  CMYK color model
    Represent a color for a printed page using 4 percentage values, one for cyan, magenta, yellow and black pigment.

  color depth (or *bit depth*)
    The number of bits (binary digits) used to represent a color component value.

  full color
    Use a *color depth* large enough to represent the full range of color
    the average person can see. This is typically recognized to be 8 bits per component;
    24 bits for RGB colors; 32 bits for RGBA colors.

  opaque
    An object that reflects all of the light that hits it; not transparent.

  transparent
    An object's composition allows some of the light that strikes its surface
    to pass through. A person sees both the transparent object and the object behind.

  alpha component
    The percentage of light that is reflected from an object. :code:`(1.0 - alpha)`
    is the percentage of light that passes through an object.

Self-Assessments
----------------

.. mchoice:: 3.2.1
  :random:
  :answer_a: red, green, and blue light.
  :answer_b: real grand bright light.
  :answer_c: cyan, magenta and yellow pigments.
  :answer_d: reddish grass baseline colors.
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  The RGB color model represents a color as a combination of ...?

.. mchoice:: 3.2.2
  :random:
  :answer_a: The human eye automatically highlights contrasts between different colors.
  :answer_b: Because you should never place two blocks of different colors next to each other.
  :answer_c: Different colors don't co-exist well.
  :answer_d: The human eye does not perceive color very well.
  :correct: a
  :feedback_a: Correct. Your eye always enhances contrast.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  Why do "mach bands" happen?

.. mchoice:: 3.2.3
  :random:
  :answer_a: 24-bit
  :answer_b: 8-bit
  :answer_c: 1-bit
  :answer_d: 16 million
  :correct: a
  :feedback_a: Correct. Eight bits for red, eight bits for green, and eight bits for blue.
  :feedback_b: Incorrect. Eight bits allows for only 256 colors.
  :feedback_c: Incorrect. One bit allows for ony two colors.
  :feedback_d: Incorrect. 16 million colors is the number of colors in a "full color" system, but "color depth" is given in bits.

  What **color depth** is required for the average person to see their full range of possible colors?

.. mchoice:: 3.2.4
  :random:
  :answer_a: 0.75
  :answer_b: 0.25
  :answer_c: 0.50
  :answer_d: 1.0
  :correct: a
  :feedback_a: Correct. The object is 75% opaque.
  :feedback_b: Incorrect. The alpha value is the percentage of opaqueness.
  :feedback_c: Incorrect. The alpha value is the percentage of opaqueness.
  :feedback_d: Incorrect. 1.0 means the object is totally opaque.

  What should be the *alpha value* for an object that is 25% transparent?

.. mchoice:: 3.2.5
  :random:
  :answer_a: orange
  :answer_b: light-blue
  :answer_c: dark-grey
  :answer_d: greenish-blue
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  Which of the following color names best describe the HTML/CSS color :code:`#ffb04c`?

.. mchoice:: 3.2.6
  :random:
  :answer_a: (1.0, 0.62, 0.27)
  :answer_b: (1.0, 0.91, 0.46)
  :answer_c: (0.0, 0.27, 0.62)
  :answer_d: (0.0, 0.53, 0.75)
  :correct: a
  :feedback_a: Correct.
  :feedback_b: Incorrect.
  :feedback_c: Incorrect.
  :feedback_d: Incorrect.

  Which of the following WebGL colors matches the HTML/CSS color :code:`#ff9f46`?


.. index:: color model, RGB color model, CMY color model, CMYK color model, color depth, full color, opaque, transparent, alpha component

.. _1: http://www.the-working-man.org/2014/12/bit-depth-color-precision-in-raster.html
.. _color depth: https://en.wikipedia.org/wiki/Color_depth
.. _mach bands: https://en.wikipedia.org/wiki/Mach_bands
.. _RGBA: https://en.wikipedia.org/wiki/RGBA_color_space
.. _html-color-codes.info: https://html-color-codes.info/color-names/


