.. Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

10.7 - Light Attenuation
::::::::::::::::::::::::

A basic property of light is that it loses its intensity the further it
travels from its source. That is why Venus and Mercury are much hotter than
the Earth and Mars is much colder. The intensity of light from the sun changes
in proportion its distance from the sun. The technical name for
this is `light attenuation`_.

This lesson explains how to include light attenuation in a lighting model.

Light Attenuation
-----------------

Light becomes weaker the further is travels from its source. In the physical
world the attenuation is proportional to 1/d\ :sup:`2`, where :code:`d` is
the distance between the light source and a surface.
Using the function 1/d\ :sup:`2` causes light to decrease very rapidly and so it is
common for CGI applications to make attenuation be proportional to 1/d.
Notice that if :code:`d`
is greater than 1, both equations calculate a fraction
between 0.0 and 1.0. Attenuation simply calculates a percentage of the
original light that is used to color a pixel.

In the original OpenGL lighting model, the equation :code:`1.0/(c1 + c2*d + c3*d^2)`
was used to give programmers control over attenuation. You could
set the values for :code:`c1`, :code:`c2`, and :code:`c3` to create a large number of possible
attenuation functions. Since programmable shaders were introduced, you
can implement any attenuation function that meets your
application's needs.

In the literature you typically see an attenuation equation like
:code:`10.0 / d` written with the proportional constant in the denominator like this,
:code:`1.0 / 0.1*d`. You get the same results with either equation, but perhaps
one of the equations is more intuitive to you.

If you don't want the attenuation to abruptly "kick in" at some distance from
the light source, you can add a one to the denominator to guarantee that
the denominator is always larger than the numerator. You can experiment below
with various values for the constants c1 and c2 in the plot of the attenuation function
:code:`1.0/(1.0 + c1*d + c2*d^2)`. In many scenarios, setting :code:`c1` to :code:`0.1`
and :code:`c2` to :code:`0.0` gives good results.

.. raw:: html

    <div style="text-align:center">
    <canvas id="myCanvas" width="300" height="150" style="border:1px solid blue;"></canvas><br>
    <span id="text">attenuation = 1.0 / (1.0 + 1.00*d + 1.00*d<sup>2</sup></span><br>
    <span>c1: 0.0 <input type="range" id="c1" min="0.0" max="3.0" value="1.0" step="0.01" style="width:300px" oninput="myDraw(this);"> 3.0</span><br>
    <span>c2: 0.0 <input type="range" id="c2" min="0.0" max="3.0" value="1.0" step="0.01" style="width:300px" oninput="myDraw(this);"> 3.0</span>
    </div>
    <script>
      function Graph(config) {

        self = this;

        // user defined properties
        var canvas = document.getElementById(config.canvasId);

        // relationships
        var context = canvas.getContext('2d');
        var rangeX = config.maxX - config.minX;
        var rangeY = config.maxY - config.minY;
        var centerY = (config.maxY * canvas.height) / rangeY;
        var centerX = (-config.minX * canvas.width) / rangeX;
        var iteration = rangeX / 1000;

        var scaleX = canvas.width / rangeX;
        var scaleY = canvas.height / rangeY;

        var xLabels = [];
        var yLabels = [];

        // constants
        self.axisColor = '#aaa';
        self.font = '0.08pt Calibri';
        self.tickSize = 5 / scaleX;

        //-----------------------------------------------------------------
        function worldToPixel(x_world, y_world) {
          x_mouse = [(x_world - config.minX) / (config.maxX - config.minX)] * canvas.width;
          y_mouse = [(config.maxY - y_world) / (config.maxY - config.minY)] * canvas.height;
          return [x_mouse, y_mouse];
        }

        //-----------------------------------------------------------------
        function drawAxes () {

          var xPos, yPos;

          // draw x and y axis
          context.beginPath();
          context.moveTo(config.minX, 0.0);
          context.lineTo(config.maxX, 0.0);
          context.moveTo(0, config.minY);
          context.lineTo(0, config.maxY);

          context.strokeStyle = config.axisColor;
          context.lineWidth = 0.1/scaleX;
          context.stroke();

          // draw X axis tick marks
          xLabels = [];
          xPos = 0;
          while(xPos < config.maxX) {
            context.moveTo(xPos, -self.tickSize / 2);
            context.lineTo(xPos, self.tickSize / 2);
            context.moveTo(-xPos, -self.tickSize / 2);
            context.lineTo(-xPos, self.tickSize / 2);
            context.stroke();
            xLabels.push( [xPos, 0, xPos.toFixed(1)] );
            xLabels.push( [-xPos, 0, (-xPos).toFixed(1)] );
            xPos = xPos + config.unitsPerXTick;
          }

          context.lineWidth = 0.1/scaleY;

          yLabels = [];
          yPos = 0;
          while(yPos < config.maxY) {
            context.moveTo(-self.tickSize / 2, yPos);
            context.lineTo( self.tickSize / 2, yPos);
            context.stroke();
            yLabels.push( [0, yPos, yPos.toFixed(1)] );
            yPos += config.unitsPerYTick;
          }

        };

        //-----------------------------------------------------------------
        function labelAxes () {
          context.save();

          context.textAlign = 'center';
          context.textBaseline = 'top';

          // draw X labels
          for (j = 0; j< xLabels.length; j += 1) {
            pixels = worldToPixel(xLabels[j][0], xLabels[j][1]);
            context.fillText(xLabels[j][2], pixels[0], pixels[1]+3);
          }

          context.textAlign = 'left';
          context.textBaseline = 'middle';

          // draw Y labels
          for (j = 0; j< yLabels.length; j += 1) {
            pixels = worldToPixel(yLabels[j][0], yLabels[j][1]);
            context.fillText(yLabels[j][2], pixels[0]+3, pixels[1]);
          }

          // label X axis
          pixels = worldToPixel(xLabels[xLabels.length-1][0], xLabels[xLabels.length-1][1]);
          context.fillText("Distance (d)", 125, 135);

          // label Y axis
          context.save();
          context.translate( 10, canvas.height/2 - 10 );
          context.rotate( -Math.PI / 2 );
          context.textAlign = "center";
          context.fillText( "Attenuation", 0, 0 );
          context.restore();

          context.restore();
        };

        //-----------------------------------------------------------------
        self.drawEquation = function (c1, c2, color, thickness) {
          context.save();

          context.translate(centerX, centerY);
          context.scale(scaleX, -scaleY);

          context.clearRect(config.minX, config.minY, rangeX, rangeY);

          drawAxes();

          context.beginPath();
          context.moveTo(0.0, 1.0);

          for(var x = iteration; x <= config.maxX; x += iteration) {
            context.lineTo(x, 1.0 / (1.0 + c1*x + c2*Math.pow(x,2)) );
          }

          context.lineJoin = 'round';
          context.lineWidth = 1.0 / scaleX;
          context.strokeStyle = color;
          context.stroke();
          context.restore();

          labelAxes();
        };
      }

      var myGraph = new Graph({
        canvasId: 'myCanvas',
        minX: -1.0,
        minY: -0.4,
        maxX: 10.4,
        maxY: 1.2,
        unitsPerYTick: 0.2,
        unitsPerXTick: 2.0
      });

      function myDraw(slider) {
        var c1 = Number( $('#c1').val() );
        var c2 = Number( $('#c2').val() );
        // update the equation text
        $('#text').html("attenuation = 1.0 / (1.0 + " + c1.toFixed(2) + "*d + " + c2.toFixed(2) +
                        "*d<sup>2</sup>)<br>");
        myGraph.drawEquation(c1, c2, 'green', 2);
      }

      $(document).ready( myDraw($("#exponent")[0]) );

    </script>

Example WebGL Program
---------------------

Experiment with the following WebGL program by varying the constants in the attenuation
function :code:`1.0/(1.0 + c1*d + c2*d^2)`.

.. webgldemo:: W1
  :htmlprogram: _static/10_light_attenuation/light_attenuation.html
  :width: 300
  :height: 300

Please insure you make the following observations about attenuation:

* Setting :code:`c1` to :code:`0.0` and :code:`c2` to :code:`1.0` is the attenuation
  for real world lighting: e.g., :code:`1/d^2`. However, this typically
  makes a CGI scene too dark.
* Setting :code:`c1` to :code:`0.1` and :code:`c2` to :code:`0.0` gives
  good visual results for the example scene above.

Fragment Shader
---------------

The following fragment shader program implements light attenuation.

.. Code-Block:: JavaScript
  :linenos:
  :emphasize-lines: 10, 40, 81, 82, 86

  // Fragment shader program
  precision mediump int;
  precision mediump float;

  // Light model
  uniform vec3  u_Light_position;
  uniform vec3  u_Light_color;
  uniform float u_Shininess;
  uniform vec3  u_Ambient_intensities;
  uniform float u_c1, u_c2;  // Attenuation constants: 1/(1 + c1*d + c2*d^2)

  // Data coming from the vertex shader
  varying vec3 v_Vertex;
  varying vec4 v_Color;
  varying vec3 v_Normal;

  void main() {

    vec3 ambient_color;
    vec3 specular_color;
    vec3 diffuse_color;
    vec3 to_light;
    float distance_from_light;
    vec3 fragment_normal;
    vec3 reflection;
    vec3 to_camera;
    float cos_angle;
    float attenuation;
    vec3 color;

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // AMBIENT calculations
    ambient_color = u_Ambient_intensities * vec3(v_Color);

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // General calculations needed for both specular and diffuse lighting

    // Calculate a vector from the fragment location to the light source
    to_light = u_Light_position - v_Vertex;
    distance_from_light = length( to_light);
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
    diffuse_color = vec3(v_Color) * u_Light_color * cos_angle;

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
    specular_color = u_Light_color * cos_angle;

    attenuation = 1.0/
      (1.0 + u_c1*distance_from_light + u_c2*pow(distance_from_light,2.0));

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // COMBINED light model
    color = ambient_color + attenuation*(diffuse_color + specular_color);
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, v_Color.a);
  }

+------------+--------------------------------------------------------------------------+
| Line(s)    | Description                                                              |
+============+==========================================================================+
| 10         | The constants for the attenuation function are declared as               |
|            | :code:`uniform` variables so they can be modified by the example WebGL   |
|            | program. Typically you would just hard code appropriate constants        |
|            | in the equation used in lines 81-82.                                     |
+------------+--------------------------------------------------------------------------+
| 40         | The length of the "to the light" vector gives the distance between the   |
|            | surface and the light source. The length must be calculated before the   |
|            | vector is normalized.                                                    |
+------------+--------------------------------------------------------------------------+
| 81-82      | The attenuation percentage is calculated.                                |
+------------+--------------------------------------------------------------------------+
| 86         | The color of the fragment is determined by adding the ambient, diffuse   |
|            | and specular colors. The ambient light comes from unknown light sources  |
|            | and since the distance to those light sources is not known, the          |
|            | ambient light should not be attenuated. Therefore, only the diffuse      |
|            | and specular light is attenuated.                                        |
+------------+--------------------------------------------------------------------------+

Summary
-------

Have you noticed that all lighting and color calculations are percentages!

Glossary
--------

.. glossary::

  attenuation
    The decrease in intensity of electromagnetic wave energy as it travels away
    from its generating source.

Self Assessment
---------------

.. mchoice:: 10.7.1
  :random:

  The visual effect of light attenuation is to make objects further
  from a light source to  ...

  - be darker.

    + Correct. Because the objects are receiving less light.

  - be brighter.

    - Incorrect. The exact opposite is true.

  - have more contrast.

    - Incorrect. They get less light, which decreases contrast.

  - have more detail.

    - Incorrect. They get less light, which decreases visual detail.

.. mchoice:: 10.7.2
  :random:

  In the real world, what is the formula for calculating light attenuation, where :code:`d`
  is the distance a surface is from a light source?

  - 1/(d^2)

    + Correct. One divided by the distance squared.

  - 1/d

    - Incorrect.

  - 1.0/(1 + d + d^2)

    - Incorrect.

  - 20/d

    - Incorrect.

.. mchoice:: 10.7.3
  :random:

  CGI scenes often get better results from which attenuation formula below?

  - proportional to 1/d

    + Correct. Proportional to one divided by the distance.

  - 1/(d^2)

    - Incorrect.

  - 1.0/(1 + d + d^2)

    - Incorrect.

  - 20/d

    - Incorrect.

.. mchoice:: 10.7.4
  :random:

  Using a combined light model, which of the following types of light
  should be attenuated? (Select all that apply.)

  - ambient light

    - Incorrect. Ambient light has no known source, so there is no "distance to the light"
      to allow for attenuation.

  - diffuse light from a point light source

    + Correct. The distance between the light source and the surface is known.

  - specular light from a point light source

    + Correct. The distance between the light source and the surface is known.

  - sun light

    - Incorrect. If the sun is being modeled, it is so far away from the scene
      that all objects whould have the same attenuation.


.. index:: attenuation

.. _light attenuation: https://en.wikipedia.org/wiki/Attenuation
