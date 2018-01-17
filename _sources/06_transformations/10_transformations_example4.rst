..  Copyright (C)  Wayne Brown
  Permission is granted to copy, distribute
  and/or modify this document under the terms of the GNU Free Documentation
  License, Version 1.3 or any later version published by the Free Software
  Foundation; with Invariant Sections being Forward, Prefaces, and
  Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
  the license is included in the section entitled "GNU Free Documentation
  License".

6.10 - Chaining Transformations (Summary)
:::::::::::::::::::::::::::::::::::::::::

The previous lesson created a robot arm with two linkages.
This demonstrated how matrix transformations are chained together
to create complex motion. The creation of the rendering transformations
were created explicitly to make it clear how the transformations
are created. Here is a summary of the transforms and the code that created
them:

.. matrixeq:: Eq1

  [M6: baseTransform] = [M1: baseRotation]

.. matrixeq:: Eq2

  [M6: forearmTransform] = [M1: baseRotation]*[M2: translateToPin]*[M3: rotateForearm]

.. matrixeq:: Eq3

  [M6: upperArmTransform] = [M1: baseRotation]*[M2: translateToPin]*[M3: rotateForearm]*[M4: translateToForearmEnd]*[M5: rotateUpperarm]

.. Code-Block:: JavaScript

  // Transformation of the base.
  matrix.multiplySeries(transform, projection, camera, base_y_rotate);

  // Transformation of the forearm.
  matrix.multiplySeries(transform, projection, camera, base_y_rotate,
                        forearm_translate, forearm_rotate);

  // Transformation of the upper arm.
  matrix.multiplySeries(transform, projection, camera, base_y_rotate,
                        forearm_translate, forearm_rotate,
                        upperarm_translate, upperarm_rotate);


Reusing Transformations
-----------------------

Matrix multiplication is an expensive operation. Multiplying two 4-by-4 matrices
requires 64 multiplies and 48 additions. We would like
to avoid duplicate matrix multiplications whenever possible. For the robot
arm, there is no need to repeat the same matrix multiplications over and over
again. We can reuse the previous transform and simply post-multiply the
additional transforms. The creation of each transform in the code could be
done like this:

.. Code-Block:: JavaScript

  // For rendering the base
  matrix.multiplySeries(transform, projection, camera, base_y_rotate);

  // For rendering the forearm
  matrix.multiplySeries(transform, transform, forearm_translate, forearm_rotate);

  // For rendering the upper arm
  matrix.multiplySeries(transform, transform, upperarm_translate, upperarm_rotate);


Notice that in the 2\ :sup:`nd` and 3\ :sup:`rd` function calls the second
parameter is the value of :code:`transform` from the previous calculation.
The WebGL program below contains theses simplified calculations.

Reusing transform calculations is important for complex renderings, but you
should not collapse your transformation calculations until you are completely
clear on how to build complex chains of transformations. First, get a WebGL program
to work correctly. Then you can make efficiency optimizations if
slow rendering is an issue.

.. webglinteractive:: W1
  :htmlprogram: _static/06_robot4/robot_upperarm.html
  :editlist: _static/06_robot4/robot_upperarm_scene.js
  :hideoutput:
  :width: 300
  :height: 300
