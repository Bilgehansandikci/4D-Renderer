let canvas, gl, program, txwLoc, txyLoc, txzLoc, tyzLoc, tywLoc, tzwLoc;
let txw = 0.0;
let txy = 0.0;
let txz = 0.0;
let tyz = 0.0;
let tyw = 0.0;
let tzw = 0.0;

let txwSpeed = 0.0;
let txySpeed = 0.0;
let txzSpeed = 0.0;
let tyzSpeed = 0.0;
let tywSpeed = 0.0;
let tzwSpeed = 0.0;

let spd = 0.1;

//tesseract
let points = new Float32Array([
  -0.5, -0.5, -0.5, -0.5,  // Vertex 0
   0.5, -0.5, -0.5, -0.5,  // Vertex 1
   0.5,  0.5, -0.5, -0.5,  // Vertex 2
  -0.5,  0.5, -0.5, -0.5,  // Vertex 3
  -0.5, -0.5,  0.5, -0.5,  // Vertex 4
   0.5, -0.5,  0.5, -0.5,  // Vertex 5
   0.5,  0.5,  0.5, -0.5,  // Vertex 6
  -0.5,  0.5,  0.5, -0.5,  // Vertex 7
  -0.5, -0.5, -0.5, 0.5,  // Vertex 8
   0.5, -0.5, -0.5, 0.5,  // Vertex 9
   0.5,  0.5, -0.5, 0.5,  // Vertex 10
  -0.5,  0.5, -0.5, 0.5,  // Vertex 11
  -0.5, -0.5,  0.5, 0.5,  // Vertex 12
   0.5, -0.5,  0.5, 0.5,  // Vertex 13
   0.5,  0.5,  0.5, 0.5,  // Vertex 14
  -0.5,  0.5,  0.5, 0.5   // Vertex 15
]);

let indices = new Uint16Array([
  0, 1, 1, 2, 2, 3, 3, 0,  // Front face
  4, 5, 5, 6, 6, 7, 7, 4,  // Back face
  0, 4, 1, 5, 2, 6, 3, 7,   // Connecting edges
  8, 9, 9, 10, 10, 11, 11, 8, 			//cube 2
  12, 13, 13, 14, 14, 15, 15, 12,
  8, 12, 9, 13, 10, 14, 11, 15,
  0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15	//connecting cubes
]);


window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl");

  if (!gl) {
    alert("WebGL isn't available");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  setupBuffers();
  gl.enable(gl.DEPTH_TEST);

  txwLoc = gl.getUniformLocation(program, "txw");
  txyLoc = gl.getUniformLocation(program, "txy");
  txzLoc = gl.getUniformLocation(program, "txz");
  tyzLoc = gl.getUniformLocation(program, "tyz");
  tywLoc = gl.getUniformLocation(program, "tyw");
  tzwLoc = gl.getUniformLocation(program, "tzw");

  // Add event listeners for the sliders
  document.getElementById("txw-change").addEventListener("input", (e) => {
    txw += parseFloat(e.target.value);
  });
  document.getElementById("txw-speed").addEventListener("input", (e) => {
    txwSpeed = parseFloat(e.target.value);
  });

  document.getElementById("txy-change").addEventListener("input", (e) => {
    txy += parseFloat(e.target.value);
  });
  document.getElementById("txy-speed").addEventListener("input", (e) => {
    txySpeed = parseFloat(e.target.value);
  });

  document.getElementById("txz-change").addEventListener("input", (e) => {
    txz += parseFloat(e.target.value);
  });
  document.getElementById("txz-speed").addEventListener("input", (e) => {
    txzSpeed = parseFloat(e.target.value);
  });

  document.getElementById("tyz-change").addEventListener("input", (e) => {
    tyz += parseFloat(e.target.value);
  });
  document.getElementById("tyz-speed").addEventListener("input", (e) => {
    tyzSpeed = parseFloat(e.target.value);
  });

  document.getElementById("tyw-change").addEventListener("input", (e) => {
    tyw += parseFloat(e.target.value);
  });
  document.getElementById("tyw-speed").addEventListener("input", (e) => {
    tywSpeed = parseFloat(e.target.value);
  });

  document.getElementById("tzw-change").addEventListener("input", (e) => {
    tzw += parseFloat(e.target.value);
  });
  document.getElementById("tzw-speed").addEventListener("input", (e) => {
    tzwSpeed = parseFloat(e.target.value);
  });
  
  document.getElementById("shape-selector").addEventListener("change", function() {
  var selectedShape = this.value;
  console.log(selectedShape);
  switch (selectedShape) {
    case "8cell":
      displayTesseract();
	  setupBuffers();
      break;
    case "16cell":
      display16Cell();
	  setupBuffers();
      break;
    case "5cell":
      display5Cell();
	  setupBuffers();
      break;
	case "600cell":
      display600Cell();
	  setupBuffers();
      break;
	case "24cell":
      display24Cell();
	  setupBuffers();
      break;
	case "120cell":
      display120Cell();
	  setupBuffers();
      break;
    default:
      console.log("Shape not recognized");
  }
});


  render();
};

function setupBuffers() {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  const vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Update rotations based on base speed and change
  txw += txwSpeed * spd;
  txy += txySpeed * spd;
  txz += txzSpeed * spd;
  tyz += tyzSpeed * spd;
  tyw += tywSpeed * spd;
  tzw += tzwSpeed * spd;

  gl.uniform1f(txwLoc, txw);
  gl.uniform1f(txyLoc, txy);
  gl.uniform1f(txzLoc, txz);
  gl.uniform1f(tyzLoc, tyz);
  gl.uniform1f(tywLoc, tyw);
  gl.uniform1f(tzwLoc, tzw);
  
  gl.uniform4f(gl.getUniformLocation(program, "uColor"), 0.0, 0.0, 0.0, 1.0);  // Set wireframe color to black
  gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
  gl.drawArrays( gl.POINTS, 0, points.length );

  requestAnimationFrame(render);
}

function displayTesseract() {
	points = new Float32Array([
	  -0.5, -0.5, -0.5, -0.5,  // Vertex 0
	   0.5, -0.5, -0.5, -0.5,  // Vertex 1
	   0.5,  0.5, -0.5, -0.5,  // Vertex 2
	  -0.5,  0.5, -0.5, -0.5,  // Vertex 3
	  -0.5, -0.5,  0.5, -0.5,  // Vertex 4
	   0.5, -0.5,  0.5, -0.5,  // Vertex 5
	   0.5,  0.5,  0.5, -0.5,  // Vertex 6
	  -0.5,  0.5,  0.5, -0.5,  // Vertex 7
	  -0.5, -0.5, -0.5, 0.5,  // Vertex 8
	   0.5, -0.5, -0.5, 0.5,  // Vertex 9
	   0.5,  0.5, -0.5, 0.5,  // Vertex 10
	  -0.5,  0.5, -0.5, 0.5,  // Vertex 11
	  -0.5, -0.5,  0.5, 0.5,  // Vertex 12
	   0.5, -0.5,  0.5, 0.5,  // Vertex 13
	   0.5,  0.5,  0.5, 0.5,  // Vertex 14
	  -0.5,  0.5,  0.5, 0.5   // Vertex 15
	]);

	indices = new Uint16Array([
	  0, 1, 1, 2, 2, 3, 3, 0,  // Front face
	  4, 5, 5, 6, 6, 7, 7, 4,  // Back face
	  0, 4, 1, 5, 2, 6, 3, 7,   // Connecting edges
	  8, 9, 9, 10, 10, 11, 11, 8, 			//cube 2
	  12, 13, 13, 14, 14, 15, 15, 12,
	  8, 12, 9, 13, 10, 14, 11, 15,
	  0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15	//connecting cubes
	]);

}

function display16Cell() {
	points = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0,
		-1.0, 0.0, 0.0, 0.0,
		0.0, -1.0, 0.0, 0.0,
		0.0, 0.0, -1.0, 0.0,
		0.0, 0.0, 0.0, -1.0,
	]);
//1 2 3 5 6 7
	indices = new Uint16Array([
	  1,2,1,3,1,6,1,7,2,3,2,5,2,7,3,5,3,6,5,6,6,7,7,5, //middle octahedron
	  0,1,0,2,0,3,0,5,0,6,0,7,
	  4,1,4,2,4,3,4,5,4,6,4,7
	]);
}

let phi = 1.6180339887;
let sqrt5 = 2.2360679775;
let sqrt1o5 = 0.4472135955;

function display5Cell() {
  // Original coordinates
  let vertices = [
    [1.0, 1.0, 1.0, -sqrt1o5],
    [1.0, -1.0, -1.0, -sqrt1o5],
    [-1.0, 1.0, -1.0, -sqrt1o5],
    [-1.0, -1.0, 1.0, -sqrt1o5],
    [0.0, 0.0, 0.0, -4.0 * sqrt1o5]
  ];

  // Calculate centroid
  let centroid = [0, 0, 0, 0];
  vertices.forEach(v => {
    centroid[0] += v[0];
    centroid[1] += v[1];
    centroid[2] += v[2];
    centroid[3] += v[3];
  });
  centroid = centroid.map(c => c / vertices.length);

  // Adjust vertices to center them around origin
  vertices = vertices.map(v => v.map((val, i) => (val - centroid[i]) * 0.5));

  // Flatten vertex array for WebGL
  points = new Float32Array(vertices.flat());

  // Indices for edges
  indices = new Uint16Array([
    0, 1, 0, 2, 0, 3, 0, 4, 
    1, 2, 1, 3, 1, 4, 
    2, 3, 2, 4, 3, 4
  ]);

}

function display24Cell() {
  points = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
    -1.0, 0.0, 0.0, 0.0,
    0.0, -1.0, 0.0, 0.0,
    0.0, 0.0, -1.0, 0.0,
    0.0, 0.0, 0.0, -1.0,
    -0.5, -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5, -0.5,
    0.5,  0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5, -0.5,
    0.5, -0.5,  0.5, -0.5,
    0.5,  0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5, 0.5,
    0.5,  0.5, -0.5, 0.5,
    -0.5,  0.5, -0.5, 0.5,
    -0.5, -0.5,  0.5, 0.5,
    0.5, -0.5,  0.5, 0.5,
    0.5,  0.5,  0.5, 0.5,
    -0.5,  0.5,  0.5, 0.5
  ]);

  // Constructing wireframe connections (indices)
  let epsilon = 1e-6;  // Tolerance to avoid floating-point precision issues
  let edges = new Set();

  // Looping through the points and calculating distances
  for (let i = 0; i < points.length / 4 - 1; i++) {
    for (let j = i + 1; j < points.length / 4; j++) {
      let distanceSquared = squaredDistance(
        points.slice(i * 4, (i + 1) * 4), // Get the i-th point (4 components)
        points.slice(j * 4, (j + 1) * 4)  // Get the j-th point (4 components)
      );
      if (Math.abs(distanceSquared - 1) < epsilon) {  // Edge length is √1 in this normalized setup
        edges.add(`${i}-${j}`);
      }
    }
  }

  indices = new Uint16Array(Array.from(edges).flatMap(edge => edge.split('-').map(Number)));
  console.log(`Vertices: ${points.length / 4}, Edges: ${indices.length / 2}`);
}


function display600Cell() {
  let phi = (1 + Math.sqrt(5)) / 2;  // Golden ratio
  let vertices = [];

  // Type 1: Permutations of (±0.5, ±0.5, ±0.5, ±0.5)
  [-0.5, 0.5].forEach(x =>
    [-0.5, 0.5].forEach(y =>
      [-0.5, 0.5].forEach(z =>
        [-0.5, 0.5].forEach(w => vertices.push([x, y, z, w]))
      )
    )
  );

  // Type 2: Even permutations of (±1, 0, 0, 0)
  let perm2 = [1, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    let p = [...perm2];
    vertices.push(p.map(v => v));  // Positive
    vertices.push(p.map(v => -v));  // Negative
    perm2.unshift(perm2.pop());    // Rotate permutation
  }

  // Type 3: Even permutations of (±φ/2, ±1/(2φ), ±0.5, 0)
  let a = phi / 2;
  let b = 1 / (2 * phi);
  let basePerm3 = [
    [a, b, 0.5, 0], [a, -b, 0.5, 0], 
    [-a, b, 0.5, 0], [-a, -b, 0.5, 0],
    [a, b, -0.5, 0], [a, -b, -0.5, 0], 
    [-a, b, -0.5, 0], [-a, -b, -0.5, 0]
  ];
  basePerm3.forEach(([p1, p2, p3, p4]) => {
    let permutations = [
      [p1, p2, p3, p4], [p1, p2, p4, p3], [p1, p3, p2, p4],
      [p1, p3, p4, p2], [p1, p4, p2, p3], [p1, p4, p3, p2],
      [p2, p1, p3, p4], [p2, p1, p4, p3], [p2, p3, p1, p4],
      [p2, p3, p4, p1], [p2, p4, p1, p3], [p2, p4, p3, p1]
    ];
    permutations.forEach(permutation => {
      vertices.push(permutation);        // Positive permutation
    });
  });

  points = new Float32Array(vertices.flat());

  // Constructing wireframe connections (indices)
  let epsilon = 1e-6;  // Tolerance to avoid floating-point precision issues
  let edges = new Set();
  for (let i = 0; i < vertices.length - 1; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      let distanceSquared = squaredDistance(vertices[i], vertices[j]);
      if (Math.abs(distanceSquared - 1) < epsilon) {  // Edge length is √1 in this normalized setup
        edges.add(`${i}-${j}`);
      }
    }
  }

  indices = new Uint16Array(Array.from(edges).flatMap(edge => edge.split('-').map(Number)));
    console.log(`Vertices: ${vertices.length}, Edges: ${indices.length / 2}`);

}

function display120Cell() {
	
  vertices = generate120Cell();
  points = new Float32Array(vertices.flat());

  // Constructing wireframe connections (indices)
  let epsilon = 1e-6;  // Tolerance to avoid floating-point precision issues
  let edges = new Set();
  for (let i = 0; i < vertices.length - 1; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      let distanceSquared = squaredDistance(vertices[i], vertices[j]);
      if (Math.abs(distanceSquared - 1) < epsilon) {  // Edge length is √1 in this normalized setup
        edges.add(`${i}-${j}`);
      }
    }
  }

  indices = new Uint16Array(Array.from(edges).flatMap(edge => edge.split('-').map(Number)));
    console.log(`Vertices: ${vertices.length}, Edges: ${indices.length / 2}`);

}

function squaredDistance(v1, v2) {
  let dx = v1[0] - v2[0];
  let dy = v1[1] - v2[1];
  let dz = v1[2] - v2[2];
  let dw = v1[3] - v2[3];
  return dx * dx + dy * dy + dz * dz + dw * dw;
}