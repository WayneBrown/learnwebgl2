..  Copyright (C)  Wayne Brown
    Permission is granted to copy, distribute
    and/or modify this document under the terms of the GNU Free Documentation
    License, Version 1.3 or any later version published by the Free Software
    Foundation; with Invariant Sections being Forward, Prefaces, and
    Contributor List, no Front-Cover Texts, and no Back-Cover Texts.  A copy of
    the license is included in the section entitled "GNU Free Documentation
    License".

4.3 - OBJ Data Format
:::::::::::::::::::::

Most modeling software stores its model data in proprietary
file formats using binary data to minimize the size of the files.
A cross-platform data format is needed if data is to be shared
between modeling programs.
One such cross-platform data format is the OBJ file format
that was created by `Wavefront`_. Blender can export and import OBJ data
files. We will use the OBJ format for defining
models for our WebGL programs because:

* HyperText Transmission Protocols (HTTP), which are used to transmit
  data between web servers and web clients, are text based. (Sharing
  binary data requires MIME encodings.) OBJ files are plain text.

* A plain text format removes any binary incompatibilities between
  the web server and various client browsers.

* Most web servers will not serve files that have non-recognized file extensions.
  It is best to use files that have commonly recognized file extensions.

Exporting OBJ Data from Blender
-------------------------------

As you create Blender models, always save them in the native Blender format
which uses a :code:`.blend` file extension. This guarantees that all
attributes of your models can be retrieved if you open and edit the models
at a later time. (Files with extensions of :code:`.blend1`, :code:`.blend2`,
:code:`.blend3`, etc. are backup files that contain previous versions of your
work.)

When you are ready to use a model in a WebGL program, do the following:

1. Make sure that each model has an appropriate and descriptive name.
   (Use variable naming conventions when you name things!)
   For models, you need to name the geometry object, not the model object.
   (Use the *Outliner Editor* and expand the object to see the geometry.)
2. Select the :code:`File` menu, :code:`Export` command, and the :code:`Wavefront (.obj)` sub-command.
3. Enter an appropriate file name. (Don't include any spaces in your file name
   and use all lower cases letters.)
4. In the lower left corner there is a set of options for the export. You may
   have to drag and expand the panel to see all of the options. Set the options
   as follows:

   +--------------------------------+--------------------+---------------------------------------------------+
   | Option:                        | Value:             | Reason:                                           |
   +================================+====================+===================================================+
   | :code:`Forward`                | -Z Forward         | Changes to WebGL orientation.                     |
   +--------------------------------+--------------------+---------------------------------------------------+
   | :code:`Up`                     | Y up               | Changes to WebGL orientation.                     |
   +--------------------------------+--------------------+---------------------------------------------------+
   | :code:`Write Normals`          | unchecked          | Minimizes the file's size.                        |
   +--------------------------------+--------------------+---------------------------------------------------+
   | :code:`Include UV's`           | unchecked/checked  | Checked if texture mapped; otherwise unchecked.   |
   +--------------------------------+--------------------+---------------------------------------------------+
   | :code:`Write Materials`        | checked            | Creates a :code:`.mtl` materials file.            |
   +--------------------------------+--------------------+---------------------------------------------------+
   | :code:`Triangulate Faces`      | checked            | Because WebGL only renders triangles.             |
   +--------------------------------+--------------------+---------------------------------------------------+
   | :code:`Objects as OBJ Objects` | checked            | Includes the names of the models.                 |
   +--------------------------------+--------------------+---------------------------------------------------+

   An example of the export settings can be seen in the following image:

   .. image:: figures/obj_export_options.png

5. Select the "Export OBJ" button in the upper-right corner.

As a reminder, the export settings above change the orientation of a model so that it matches
the WebGL world view (i.e, the z-axis coming out of the screen and y-axis up.)

.. webgldemo:: W1
  :htmlprogram: _static/04_blender_orientation/blender_orientation.html
  :width: 300
  :height: 300

Note: If you want your model to be exported exactly as it was designed, with
no change in orientation, then set :code:`Forward` to :code:`Y forward` and :code:`Up`
to :code:`Z up`.

OBJ Data File Format
--------------------

The example OBJ file below defines a simple cube. The first character or keyword
on each line identifies the format and type of data on that line. The following
gives the meaning of each "keyword" in the example.

+--------------------------+------------------------------------------------------------------------+
| Beginning keyword:       | Description of data line:                                              |
+==========================+========================================================================+
| :code:`#`                | Comments. The entire line is ignored.                                  |
+--------------------------+------------------------------------------------------------------------+
| :code:`mtllib`           | The filename of a materials definition file.                           |
+--------------------------+------------------------------------------------------------------------+
| :code:`o`                | Gives the name of a model. All data between this line and the next     |
|                          | :code:`o` line is a single model.                                      |
+--------------------------+------------------------------------------------------------------------+
| :code:`v`                | Defines the x, y, and z values of a single vertex. A series of         |
|                          | :code:`v` lines defines an array of vertices, the first being          |
|                          | vertex 1. Vertex indexes always increase by 1, even when a new object  |
|                          | is started.                                                            |
+--------------------------+------------------------------------------------------------------------+
| :code:`usemtl`           | Use a specific color and material definition for the polygons          |
|                          | defined from this point forward.                                       |
+--------------------------+------------------------------------------------------------------------+
| :code:`s`                | Turn *smooth shading* :code:`off` or :code:`on`; *flat shading* is     |
|                          | used when *smooth shading* is off.                                     |
+--------------------------+------------------------------------------------------------------------+
| :code:`f`                | Define the vertices that compose a polygon face. Note that faces can   |
|                          | have more than 3 vertices. In this example the faces have four         |
|                          | vertices which define :code:`quad` polygons. These must be divided     |
|                          | into triangles before WebGL rendering.                                 |
+--------------------------+------------------------------------------------------------------------+

.. Code-block:: python

   # Blender v2.69 (sub 0) OBJ File: ''
   # www.blender.org
   mtllib model_cube01.mtl
   o Cube
   v  0.250000 -0.250000 -0.250000
   v  0.250000 -0.250000  0.250000
   v -0.250000 -0.250000  0.250000
   v -0.250000 -0.250000 -0.250000
   v  0.250000  0.250000 -0.250000
   v  0.250000  0.250000  0.250000
   v -0.250000  0.250000  0.250000
   v -0.250000  0.250000 -0.250000
   usemtl Red
   s off
   f 1 2 3 4
   f 5 8 7 6
   f 1 5 6 2
   f 2 6 7 3
   f 3 7 8 4
   f 5 1 4 8

File Format Details
-------------------

All of the details for an OBJ file are beyond the scope of this textbook.
If you are interested in more details, http://paulbourke.net/dataformats/obj/
is an excellent reference for OBJ files, and http://paulbourke.net/dataformats/mtl/
describes the material's properties file format, :code:`*.mtl`.

Using OBJ models in a WebGL Program
-----------------------------------

This textbook provides a JavaScript function that reads an OBJ data file and converts it
into arrays of type :code:`Float32Array` ready for GPU rendering buffers. The function is
called :code:`CreateModelsFromOBJ` and it returns an array of models. Each model
is composed of points, lines, and triangles. The JavaScript definition it uses for a
3D graphics "model" is shown below. Each individual 3D model is stored in a separate
:code:`ModelArrays` JavaScript object.

.. Code-block:: JavaScript

    /**------------------------------------------------------------------------
     * Defines one model. A model can contain points, lines, and triangles.
     * @constructor
     */
    function ModelArrays(name) {
      var self = this;
      self.name      = name;  // {string} The name of this model
      self.points    = null;  // {PointsData} if the model contains points
      self.lines     = null;  // {LinesData} if the model contains lines
      self.triangles = null;  // {TrianglesData} if the model contains triangles
      self.rgba      = false; // {boolean} if true, the colors arrays holds 4 components per color
    }

Each unique type of data in a :code:`ModelArrays` object has the following object definition:

.. Code-block:: JavaScript

    /**------------------------------------------------------------------------
     * Defines a set of points, suitable for rendering using gl.POINTS mode.
     * @constructor
     */
    function PointsData() {
      var self = this;
      self.vertices = [];   // {Float32Array} 3 components per vertex (x,y,z)
      self.colors   = [];   // {Float32Array} 3 or 4 components per vertex RGB or RGBA
      self.material = null; // {ModelMaterial}
    }

    /**------------------------------------------------------------------------
     * Defines a set of lines, suitable for rendering using gl.LINES mode.
     * @constructor
     */
    function LinesData() {
      var self = this;
      self.vertices = [];   // {Float32Array} 3 components per vertex (x,y,z)
      self.colors   = [];   // {Float32Array} 3 or 4 components per vertex RGB or RGBA
      self.textures = [];   // {Float32Array} 1 component per vertex
      self.material = null; // {ModelMaterial}
    }

    /**------------------------------------------------------------------------
     * Defines a set of triangles, suitable for rendering using gl.TRIANGLES mode.
     * @constructor
     */
    function TrianglesData() {
      var self = this;
      self.vertices       = [];   // {Float32Array} 3 components per vertex (x,y,z)
      self.colors         = [];   // {Float32Array} 3 or 4 components per vertex RGB or RGBA
      self.flat_normals   = [];   // {Float32Array} 3 components per vertex <dx,dy,dz>
      self.smooth_normals = [];   // {Float32Array} 3 components per vertex <dx,dy,dz>
      self.textures       = [];   // {Float32Array} 2 components per vertex (s,t)
      self.material       = null; // {ModelMaterial}
    }


Glossary
--------

.. glossary::

   OBJ file format
      A cross-platform, text based file format for the exchange of geometry modeling data.

   MTL file format
      A cross-platform, text based file format for the exchange of color and material properties data.

Self-Assessment
---------------

Using Blender, export a model to an OBJ file. Then use a text editor to open the OBJ file
and examine its contents. Change one or more things about your model in Blender and
export it to a new OBJ file. Compare and contrast the two OBJ files to see what changed.


.. index:: OBJ file format, MTL file format

.. _Wavefront:  https://en.wikipedia.org/wiki/Wavefront_Technologies
