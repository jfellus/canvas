function tttex(w,h) {
  var b = new Uint8Array(w*h*4);
  var z = 0;
  for(var i=0; i<w*h; i++) {
    b[i*4] = z;
    b[i*4+3] = 255;
    z++;
    if(z>=255) z = 0;
  }
  return b;
}

class Shape {
  constructor(elt, dx,dy) {
    var gl = this.gl = elt.canvas.gl;
    this.elt = elt;
    this.x = dx;
    this.y = dy;
    this.texture = glCreateTexture(gl, 100,100, this.data = tttex(100,100));
    this.texCoords = gl.createCoordsBuffer([1,1,   0,1,    1,0,    0,0  ]);
    this.verticesBuffer = gl.createCoordsBuffer([   10.0,  10.0,   -10.0,  10.0,   10.0, -10.0,   -10.0, -10.0  ]);
  }

  render() {
    this.gl.pushMatrix()
    this.gl.translate(this.elt.x + this.x, this.elt.y + this.y, 0);
    this.gl.setTexture(this.texture);
    this.gl.setTexCoords(this.texCoords, 4);
    this.gl.drawVertices(this.verticesBuffer, 4);
    this.gl.popMatrix();
  }

  animate() {
    for(var i=0;i<100*100; i++) {
      this.data[i*4] = this.data[i*4]+1;
    }
    this.texture.update();
    this.elt.redraw();
  }

}
