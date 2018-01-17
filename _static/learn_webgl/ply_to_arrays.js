/**
 * ply_to_arrays.js, By Wayne Brown, Fall 2017
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 C. Wayne Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

function PlyElement(name, number) {
  let self = this;
  self.name = name;
  self.number = number;
  self.properties = [];
}

function PlyElementProperty(name, datatype, is_list) {
  let self = this;
  self.name = name;
  self.datatype = datatype;
  self.is_list = is_list;
}

/** -------------------------------------------------------------------------
 * Given an PLY text model description, convert the data into 1D arrays
 * that can be rendered in WebGL.
 * @param filename {string} The model filename, without its file extension.
 * @param model_description {string} Contains the PLY model data as text.
 * @param out {ConsoleMessages} Displays output messages.
 * @return {object} An object containing 1 ModelArrays object accessible by name or index.
 */
function CreateModelFromPLY(filename, model_description, out) {

  // parsing data
  let lines;       // An array of strings; one per line in data file.
  let current_line_index; // Which line is next to be parsed?
  let current_element = null;
  let all_elements = [];

  // The current model being defined. An OBJ file can define more than one model.
  let the_model = new ModelArrays(filename);

  // The return value is an object; each property of the object is a unique
  // ModelArrays object. The property name comes from the model's name.
  let model_dictionary = {};

  // Arrays of values common to all the models in the model_description
  // All arrays have an empty entry in index 0 because OBJ indexes start at 1.
  let all_vertices = null;
  let all_colors = null;
  let all_normals = [[]];
  let avg_normals = null;
  let all_texture_coords = [[]];
  let all_triangles = null;

  // The active state.
  let smooth_shading = false;
  let material_name = null;
  let color_index = 0;

  // Scratch variables for collecting data
  let start_line_indexes = new Array(3);
  let end_line_indexes = new Array(3);
  let vector = new GlVector3();
  let vertex_indexes = new Array(3);

  // Line segments to render the normal vectors can be created
  let create_visible_normals = false;

  //-----------------------------------------------------------------------
  function _readHeader() {
    let line, values;

    // Line 0: First line must be "ply"
    if (lines[0] !== "ply") {
      out.displayError("CreateModelFromPLY did not find 'ply' on line 1 of the data file.");
      return false;
    }

    // Line 1: format ascii 1.0  { ascii/binary, format version number }
    let version = lines[1].split(" ");
    if (version[0].trim() !== "format" || version[1].trim() !== "ascii") {
      out.displayError("CreateModelFromPLY can only read ascii PLY data.");
      return false;
    }

    // Header keywords: "element", "property", "comment", "obj_info", "end_header"

    current_line_index = 2;
    while (current_line_index < lines.length &&
           lines[current_line_index].trim() !== "end_header") {
      line = lines[current_line_index].trim();
      values = line.split(" ");

      switch (values[0]) {
        case "comment": break;
        case "element":
          current_element = new PlyElement(values[1], parseInt(values[2]));
          all_elements.push(current_element);
          break;
        case "property":
          if (values[1] === 'list') {
            current_element.properties.push( new PlyElementProperty(values[4], values[3], true));
          } else {
            current_element.properties.push( new PlyElementProperty(values[2], values[1], false));
          }
          break;
        case "object_info": break;
        case "end_header" : break;
      }

      current_line_index += 1;
    }

    current_line_index += 1;
    return true;
  }

  //-----------------------------------------------------------------------
  function _readVertices(element) {

    let x_index, y_index, z_index;
    let nx_index, ny_index, nz_index;
    let red_index, green_index, blue_index;

    // Don't assume anything about what is in the vertex section of the definition.
    let has_coordinates = false;
    let has_normals = false;
    let has_colors = false;

    // Determine the correct indexes for extracting the values

    for (let j=0; j<element.properties.length; j+=1) {
      switch (element.properties[j].name) {
        case 'x': x_index = j; has_coordinates = true; break;
        case 'y': y_index = j; has_coordinates = true; break;
        case 'z': z_index = j; has_coordinates = true; break;
        case 'red'   : red_index = j;   has_colors = true; break;
        case 'green' : green_index = j; has_colors = true; break;
        case 'blue'  : blue_index = j;  has_colors = true; break;
        case 'nx' : nx_index = j; has_normals = true; break;
        case 'ny' : ny_index = j; has_normals = true; break;
        case 'nz' : nz_index = j; has_normals = true; break;
        default:
          out.displayInfo("CreateModelFromPLY did not recognize vertex property "
                          + element.properties[j].name);
          break;
      }
    }

    // Create an array large enough to hold all the vertices.
    if (has_coordinates) { all_vertices = new Array(element.number); }
    if (has_normals)     { all_normals  = new Array(element.number); }
    if (has_colors)      { all_colors   = new Array(element.number); }

    let line, values;
    let n = 0;
    for (let j=0; j<element.number; j+=1) {
      line = lines[current_line_index++].trim();
      values = line.split(" ");

      if (has_coordinates) {
        all_vertices[n] = [ parseFloat(values[x_index]),
                            parseFloat(values[y_index]),
                            parseFloat(values[z_index]) ];
      }
      if (has_normals) {
        all_normals[n] = [ parseFloat(values[nx_index]),
                           parseFloat(values[ny_index]),
                           parseFloat(values[nz_index]) ];
      }
      if (has_colors) {
        all_colors[n] = [ parseFloat(values[red_index])   / 255.0,
                          parseFloat(values[green_index]) / 255.0,
                          parseFloat(values[blue_index])  / 255.0];
      }
      n += 1;
    }

  }

  //-----------------------------------------------------------------------
  function _readFaces(element) {

    for (let j=0; j<element.properties.length; j+=1) {
      switch (element.properties[j].name) {
        case 'vertex_indices': break;
        default:
          out.displayInfo("CreateModelFromPLY did not recognize face property "
                          + element.properties[j].name);
          break;
      }
    }

    // Determine how many triangles.
    let line, values, num_indexes;
    let k = current_line_index;
    let number_triangles = 0;
    for (let j=0; j<element.number; j+=1) {
      line = lines[k++].trim();
      values = line.split(" ");
      number_triangles += parseInt(values[0]) - 2;
    }

    // Allocated an array to hold all the triangles.
    all_triangles = new Array(number_triangles);

    // Create a separate triangle for all the faces.
    let n = 0;
    for (let j=0; j<element.number; j+=1) {
      line = lines[current_line_index++].trim();
      values = line.split(" ");

      num_indexes = parseInt(values[0]);
      for (let k=2; k<num_indexes; k+=1) {
        all_triangles[n++] = [ parseInt(values[1]),
                               parseInt(values[k]),
                               parseInt(values[k+1]) ];
      }
    }
  }

  //-----------------------------------------------------------------------
  function _createTriangles() {
    let index, vertices, colors, has_colors;

    if (all_triangles.length > 0)
      the_model.triangles = new TrianglesData();
      let number_floats = all_triangles.length * 3 * 3;
      vertices = the_model.triangles.vertices = new Float32Array(number_floats);

      has_colors = false;
      if (all_colors && all_colors.length === all_vertices.length) {
        has_colors = true;
        colors = the_model.triangles.colors = new Float32Array(number_floats);
      }

      // Create the arrays for the triangles
      // FIX: Add normal vectors
      let n = 0;
      for (let j=0; j < all_triangles.length; j+=1) {
        for (let k=0; k<3; k++) {
          index = all_triangles[j][k];
          vertices[n]   = all_vertices[index][0]; // x
          vertices[n+1] = all_vertices[index][1]; // y
          vertices[n+2] = all_vertices[index][2]; // z

          if (has_colors) {
            colors[n]   = all_colors[index][0];  // red
            colors[n+1] = all_colors[index][1];  // green
            colors[n+2] = all_colors[index][2];  // blue
        }
        n += 3;
      }
    }
  }

  //-----------------------------------------------------------------------
  function _parsePoints(sp) {
    let index;

    if (current_model.points === null) {
      current_model.points = new PointsData();
      current_model.points.material = materials_dictionary[material_name];
    }

    current_model.points.vertices = [];
    current_model.points.colors = [];

    // Get the indexes of the vertices that define the point(s)
    index = sp.getWord();
    while (index) {
      // Add a point to the model definition
      current_model.points.vertices.push(index);
      current_model.points.colors.push(color_index);

      index = sp.getWord();
    }
  }

  //-----------------------------------------------------------------------
  function _parseLines(sp) {

    if (current_model.lines === null) {
      current_model.lines = new LinesData();
      current_model.lines.material = materials_dictionary[material_name];
    }

    current_model.lines.vertices = [];
    current_model.lines.colors = [];
    current_model.lines.textures = [];

    // Get the indexes of the vertices that define the point(s)
    sp.getIndexes(start_line_indexes);
    while (sp.getIndexes(end_line_indexes)) {
      // Add a line to the model definition
      current_model.lines.vertices.push(start_line_indexes[0]);
      current_model.lines.vertices.push(end_line_indexes[0]);
      current_model.lines.colors.push(color_index);
      current_model.lines.colors.push(color_index);
      if (start_line_indexes[1] !== null && start_line_indexes[1] >= 0) {
        current_model.lines.textures.push(start_line_indexes[1]);
        current_model.lines.textures.push(end_line_indexes[1]);
      }

      start_line_indexes[0] = end_line_indexes[0];
      start_line_indexes[1] = end_line_indexes[1];
    }
  }

  //-----------------------------------------------------------------------
  function _parseFaces(sp) {
    let index_list, numberTriangles, triangles, n, edge1, edge2,
      normal, normal_index;

    if (current_model.triangles === null) {
      current_model.triangles = new TrianglesData();
      current_model.triangles.material = materials_dictionary[material_name];
    }

    triangles = current_model.triangles;

    // Get the indexes of the vertices that define the face
    index_list = [];
    while (sp.getIndexes(vertex_indexes)) {
      index_list.push(vertex_indexes.slice());
    }

    // Create the face triangles.
    numberTriangles = index_list.length - 2;
    n = 1;
    while (n <= numberTriangles) {
      // Add a triangle to the model definition
      triangles.vertices.push(index_list[0][0]);
      triangles.vertices.push(index_list[n][0]);
      triangles.vertices.push(index_list[n + 1][0]);

      triangles.colors.push(color_index);
      triangles.colors.push(color_index);
      triangles.colors.push(color_index);

      if (index_list[0][1] > -1) {
        triangles.textures.push(index_list[0][1]);
        triangles.textures.push(index_list[n][1]);
        triangles.textures.push(index_list[n + 1][1]);
      }

      // How the normal vectors are set:
      // If normal vectors are included in the OBJ file: use the file data.
      // If normal vectors not in OBJ data:
      //   the flat_normal is set to the calculated face normal.
      //   the smooth_normals is set to an average normal if smoothing is on.
      if (index_list[0][2] === -1) {
        // There was no normal vector in the OBJ file; calculate a normal vector
        // using a counter-clockwise vertex winding.
        // Only calculate one normal for faces with more than 3 vertices
        if (n === 1) {
          edge1 = vector.createFrom2Points(all_vertices[index_list[0][0]], all_vertices[index_list[n][0]]);
          edge2 = vector.createFrom2Points(all_vertices[index_list[n][0]], all_vertices[index_list[n + 1][0]]);
          normal = new Float32Array(3);
          vector.crossProduct(normal, edge1, edge2);
          vector.normalize(normal);

          all_normals.push(normal);
          normal_index = all_normals.length - 1;
        }

        triangles.flat_normals.push(normal_index);
        triangles.flat_normals.push(normal_index);
        triangles.flat_normals.push(normal_index);

        if (smooth_shading) {
          // These indexes point to the vertex so the average normal vector
          // can be accessed later
          triangles.smooth_normals.push(-index_list[0][0]);
          triangles.smooth_normals.push(-index_list[n][0]);
          triangles.smooth_normals.push(-index_list[n + 1][0]);
        } else {
          triangles.smooth_normals.push(normal_index);
          triangles.smooth_normals.push(normal_index);
          triangles.smooth_normals.push(normal_index);
        }
      } else {
        // Use the normal vector from the OBJ file
        triangles.flat_normals.push(index_list[0][2]);
        triangles.flat_normals.push(index_list[n][2]);
        triangles.flat_normals.push(index_list[n + 1][2]);

        triangles.smooth_normals.push(index_list[0][2]);
        triangles.smooth_normals.push(index_list[n][2]);
        triangles.smooth_normals.push(index_list[n + 1][2]);
      }
      n += 1; // if there is more than one triangle
    }
  }

  //-----------------------------------------------------------------------
  function _calculateSmoothNormals() {
    let j, k, model, triangles;
    let count_normals, used, vertex_index, normal_index;

    if (model_dictionary.number_models > 0) {

      avg_normals = new Array(all_vertices.length);
      count_normals = new Array(all_vertices.length);
      used = new Array(all_vertices.length);

      for (j = 0; j < all_vertices.length; j += 1) {
        avg_normals[j] = new Float32Array([0, 0, 0]);
        count_normals[j] = 0;
        used[j] = [];
      }

      for (j = 0; j < model_dictionary.number_models; j += 1) {
        model = model_dictionary[j];

        if (model.triangles !== null) {
          triangles = model.triangles;

          // For every vertex, add all the normals for that vertex and count
          // the number of triangles. Only use a particular normal vector once.
          for (k = 0; k < triangles.vertices.length; k += 1) {
            vertex_index = triangles.vertices[k];
            normal_index = triangles.flat_normals[k];

            if ($.inArray(normal_index, used[vertex_index]) < 0) {
              used[vertex_index].push(normal_index);
              count_normals[vertex_index] += 1;
              avg_normals[vertex_index][0] += all_normals[normal_index][0];
              avg_normals[vertex_index][1] += all_normals[normal_index][1];
              avg_normals[vertex_index][2] += all_normals[normal_index][2];
            }
          }

          // Divide by the count values to get an average normal
          for (k = 0; k < avg_normals.length; k += 1) {
            if (count_normals[k] > 0) {
              avg_normals[k][0] /= count_normals[k];
              avg_normals[k][1] /= count_normals[k];
              avg_normals[k][2] /= count_normals[k];
              vector.normalize(avg_normals[k]);
           }
          }
        }
      }
    }

  }

  //-----------------------------------------------------------------------
  function _indexesToValues(indexes, source_data, n_per_value) {
    let j, k, n, array, size, index;

    if (source_data.length <= 0) {
      return null;
    } else {
      size = indexes.length * n_per_value;
      array = new Float32Array(size);
      n = 0;
      for (j = 0; j < indexes.length; j += 1) {
        index = indexes[j];

        for (k = 0; k < n_per_value; k += 1, n += 1) {
          array[n] = source_data[index][k];
        }
      }
      return array;
    }
  }

  //-----------------------------------------------------------------------
  function _smoothNormalIndexesToValues(indexes) {
    let j, k, n, array, size, index;

    if (indexes.length <= 0) {
      return null;
    } else {
      size = indexes.length * 3;
      array = new Float32Array(size);
      n = 0;
      for (j = 0; j < indexes.length; j += 1) {
        index = indexes[j];

        if (index >= 0) {
          for (k = 0; k < 3; k += 1, n += 1) {
            array[n] = all_normals[index][k];
          }
        } else {
          index = -index;
          for (k = 0; k < 3; k += 1, n += 1) {
            array[n] = avg_normals[index][k];
          }
        }
      }
      return array;
    }
  }

  //-----------------------------------------------------------------------
  function _convertIndexesIntoValues() {
    let j, model, points, lines, triangles;
    for (j = 0; j < model_dictionary.number_models; j += 1) {
      model = model_dictionary[j];

      if (model.points !== null) {
        points = model.points;
        points.vertices = _indexesToValues(points.vertices, all_vertices, 3);
        if (model.rgba) {
          points.colors = _indexesToValues(points.colors, all_colors, 4);
        } else {
          points.colors = _indexesToValues(points.colors, all_colors, 3);
        }
      }

      if (model.lines !== null) {
        lines = model.lines;
        lines.vertices = _indexesToValues(lines.vertices, all_vertices, 3);
        if (model.rgba) {
          lines.colors = _indexesToValues(lines.colors, all_colors, 4);
        } else {
          lines.colors = _indexesToValues(lines.colors, all_colors, 3);
        }
        lines.textures = _indexesToValues(lines.textures, all_texture_coords, 1);
      }

      if (model.triangles !== null) {
        triangles = model.triangles;
        triangles.vertices = _indexesToValues(triangles.vertices, all_vertices, 3);
        if (model.rgba) {
          triangles.colors = _indexesToValues(triangles.colors, all_colors, 4);
        } else {
          triangles.colors = _indexesToValues(triangles.colors, all_colors, 3);
        }
        triangles.flat_normals = _indexesToValues(triangles.flat_normals, all_normals, 3);
        triangles.smooth_normals = _smoothNormalIndexesToValues(triangles.smooth_normals);
        triangles.textures = _indexesToValues(triangles.textures, all_texture_coords, 2);
      }
    }
  }

  //-----------------------------------------------------------------------
  function _createVisibleNormals() {
    let j, n, model, v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z;
    let n1x, n1y, n1z, n2x, n2y, n2z, n3x, n3y, n3z;
    let number_triangles, vertices, flat_normals, normals;
    let number_vertices, smooth_normals, normals2;

    for (j = 0; j < model_dictionary.number_models; j += 1) {
      model = model_dictionary[j];

      if (model.triangles.flat_normals.length > 0) {
        // For every triangle, create one normal vector starting at the
        // center of the face.
        vertices = model.triangles.vertices;
        number_triangles = vertices.length / 3 / 3;
        flat_normals = model.triangles.flat_normals;
        normals = new Float32Array(number_triangles * 6);
        for (j = 0, n = 0; j < vertices.length; j += 9, n += 6) {
          v1x = vertices[j];
          v1y = vertices[j+1];
          v1z = vertices[j+2];

          v2x = vertices[j+3];
          v2y = vertices[j+4];
          v2z = vertices[j+5];

          v3x = vertices[j+6];
          v3y = vertices[j+7];
          v3z = vertices[j+8];

          normals[n  ] = (v1x + v2x + v3x) / 3;
          normals[n+1] = (v1y + v2y + v3y) / 3;
          normals[n+2] = (v1z + v2z + v3z) / 3;

          n1x = flat_normals[j];
          n1y = flat_normals[j+1];
          n1z = flat_normals[j+2];

          n2x = flat_normals[j+3];
          n2y = flat_normals[j+4];
          n2z = flat_normals[j+5];

          n3x = flat_normals[j+6];
          n3y = flat_normals[j+7];
          n3z = flat_normals[j+8];

          normals[n+3] = normals[n  ] + n1x;
          normals[n+4] = normals[n+1] + n1y;
          normals[n+5] = normals[n+2] + n1z;
        }

        model.triangles.render_flat_normals = normals;
      }

      if (model.triangles.smooth_normals.length > 0) {
        // For every vertex, create one normal vector starting at the vertex
        vertices = model.triangles.vertices;
        number_vertices = vertices.length / 3;
        smooth_normals = model.triangles.smooth_normals;
        normals2 = new Float32Array(number_vertices * 6);
        for (j = 0, n = 0; j < vertices.length; j += 3, n += 6) {
          normals2[n  ] = vertices[j];
          normals2[n+1] = vertices[j+1];
          normals2[n+2] = vertices[j+2];

          normals2[n+3] = vertices[j]   + smooth_normals[j];
          normals2[n+4] = vertices[j+1] + smooth_normals[j+1];
          normals2[n+5] = vertices[j+2] + smooth_normals[j+2];
        }

        model.triangles.render_smooth_normals = normals2;
      }
    }
  }

  //------------------------------------------------------------------------
  // body of CreateModelFromPLY()

  if (!model_description) {
    out.displayError('CreateModelFromPLY received an empty data file.');
    return null;
  }

  model_dictionary.number_models = 0;

  // Break up the input into individual lines of text.
  lines = model_description.split('\n');

  if (_readHeader()) {

    for (let elem=0; elem<all_elements.length; elem+=1) {
      switch (all_elements[elem].name) {
        case "vertex":
          _readVertices(all_elements[elem]);
          break;
        case "face":
          _readFaces(all_elements[elem]);
          break;
        case "edge":
          break;
        case "point":
          break;
        case "material":
          break;
      }
    }

    _createTriangles();
    //_createLines();
    //_create_points();

//    _calculateSmoothNormals();
//    _convertIndexesIntoValues();
//    if (create_visible_normals) {
//      _createVisibleNormals();
//    }

    model_dictionary.number_models = 1;
    model_dictionary[name] = the_model;
    model_dictionary[0] = the_model;

    // This can be comments out if you don't want the confirmation.
    out.displayInfo('Created PLY model: ' + model_dictionary[0].name);
  }

  return model_dictionary;
}
