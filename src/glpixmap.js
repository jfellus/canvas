
class GLPixmap {
  constructor(elt, w, h) {
    var gl = this.gl = elt.canvas.gl;
    this.elt = elt;
    this.w = w;
    this.h = h;
    this.x = 0;
    this.y = 0;
    this.sx = this.sy = 1;
    this.texture = glCreateTexture(gl, w, h, this.elt.data = new Uint8Array(w*h*4));
    this.texCoords = gl.createCoordsBuffer([1,1,   0,1,    1,0,    0,0  ]);
    this.verticesBuffer = gl.createCoordsBuffer([   w/2,  h/2,   -w/2,  h/2,   w/2, -h/2,   -w/2, -h/2  ]);
  }

  setOffset(x,y) { this.x = x; this.y = y;}
  setScale(sx,sy) { this.sx = sx; this.sy = sy;}
  setSize(w,h) { this.sx = w/this.w; this.sy = h/this.h;}

  render() {
    this.gl.pushMatrix()
    this.gl.translate(this.elt.x + this.x, this.elt.y + this.y, 0);
    this.gl.scale(this.sx, this.sy, 1);
    this.gl.setTexture(this.texture);
    this.gl.setTexCoords(this.texCoords, 4);
    this.gl.drawVertices(this.verticesBuffer, 4);
    this.gl.popMatrix();
  }

}
