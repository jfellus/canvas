function glInitGL(canvas) {
  var gl = canvas.getContext('webgl',  { antialias: false, preserveDrawingBuffer: true});
  // Vertex shader program
  const vsSource = `
  attribute vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  attribute vec2 aTextureCoord;
  varying highp vec2 vTextureCoord;
  void main() {
    gl_Position = uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
  }
  `;

  // Fragment shader program
  const fsSource = `
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;
  void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  const iModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
  gl.setModelViewMatrix = function(m) { gl.uniformMatrix4fv(iModelViewMatrix,false,m); };

  const iVertices = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.drawVertices = function(vertices, count) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.vertexAttribPointer(iVertices, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(iVertices);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, count);
  }

  const iTextureCoords = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  gl.setTexCoords = function(coords, count) {
    gl.bindBuffer(gl.ARRAY_BUFFER, coords);
    gl.vertexAttribPointer(iTextureCoords, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(iTextureCoords);
  }

  gl.createCoordsBuffer = function(array) {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
    return b;
  };

  var iSampler = gl.getUniformLocation(shaderProgram, 'uSampler');
  gl.setTexture = function(texture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(iSampler, 0);
  }
  var matrixStack = [];
  const modelViewMatrix = mat4.create();

  gl.resetMatrices = function() {
    matrixStack = [];
    mat4.identity(modelViewMatrix);
  }

  gl.pushMatrix = function() {
    const m = mat4.create(); mat4.copy(m, modelViewMatrix);
    matrixStack.push(m);
  }

  gl.popMatrix = function() {
    const m = matrixStack.pop();
    mat4.copy(modelViewMatrix, m);
  }

  gl.translate = function(x,y,z) {
    mat4.translate(modelViewMatrix, modelViewMatrix, [x,y,z]);
    gl.setModelViewMatrix(modelViewMatrix);
  }

  gl.scale = function(x,y,z) {
    mat4.scale(modelViewMatrix, modelViewMatrix, [x,y,z]);
    gl.setModelViewMatrix(modelViewMatrix);
  }

  gl.clearAlpha = function() {
    gl.clearColor(0.0,0.0,0.0,0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  gl.useProgram(shaderProgram);

  canvas.setAttribute("width", $(canvas.parentNode).width());
  canvas.setAttribute("height", $(canvas.parentNode).height());
  gl.viewport(0, 0, canvas.width, canvas.height);
  $(window).resize(()=> {
    canvas.setAttribute("width", $(canvas.parentNode).width());
    canvas.setAttribute("height", $(canvas.parentNode).height());
    gl.viewport(0, 0, canvas.width, canvas.height);
  })


  return gl;
}



/** RGBA bytes */
function glCreateTexture(gl, w,h, pixels) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  texture.update = function() { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels); }
  return texture;
}

function glCreateTextureFromImage(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const width = 1;
  const height = 1;
  const pixel = new Uint8Array([0, 0, 255, 255]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  };
  image.src = url;

  return texture;
}
