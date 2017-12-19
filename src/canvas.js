
var curCanvas = null;

class Canvas {
  constructor(elt) {
    this.vx = this.vy = 0;
    this.vs = 1;
    this.elements = [];
    this.elt = $(elt)
      .append(this.svg = $("<svg width=100% height=100%></svg>").append(this.svgg = $SVG("g")))
      .append(this.canvas = $("<canvas width=100% height=100%></canvas>").css("pointer-events", "none"));
    $(elt).on('selectstart dragstart', function(evt){ evt.preventDefault(); return false; });
    this.gl = glInitGL(this.canvas[0]);
    curCanvas = this;

    // Drag & Zoom

    this.svg.mousedown((e)=> { if(e.which===2) { this.bNavigating = true; this.oldX = e.offsetX; this.oldY = e.offsetY; e.preventDefault(); e.stopPropagation(); return false; } });
    this.svg.mouseup((e)=> { this.bNavigating = false; this.bDragging = false;});
    this.svg.mousemove((e)=> {
      var dx = e.offsetX-this.oldX;
      var dy = e.offsetY-this.oldY;
      if(this.bNavigating) {
        this.pan(dx, dy);
      } else if(this.bDragging && this.selection) {
        this.selection.move(dx/this.vs, dy/this.vs);
      }
      this.oldX = e.offsetX; this.oldY = e.offsetY;
    });
    this.svg[0].addEventListener("wheel", (e)=>{
    //   if(!e.ctrlKey) return;
      var a = -e.deltaY * 0.001; if(a<-1) a=0; this.zoom(e.x, e.y, a);
      e.preventDefault(); e.stopPropagation();
      return false;
    });

    this.svg.on("contextmenu",function(e){return false;});
  }

// Navigation

  pan(dx,dy) {
    this.vx += dx;
    this.vy += dy;
    this.redraw();
  }

  zoom(x,y,a) {
    this.vx += (this.vx-x)*a;
    this.vy += (this.vy-y)*a;
    this.vs *= 1+a;
    if(this.vs < 0.001) this.vs = 0.001;
    this.redraw();
  }


// Painting

  redraw() {
    this.svgg.attr("transform", "translate("+this.vx+","+this.vy+") scale("+this.vs+")");
    this.gl.clearAlpha();
    this.doGlTransform();
    this.elements.forEach((e) => {
      if(e.gl) e.gl.render();
    });
  }

  doGlTransform() {
    this.gl.resetMatrices();
    this.gl.translate(-1,1,0);
    this.gl.scale(1.0/this.canvas[0].width*2, -1.0/this.canvas[0].height*2,1);
    this.gl.translate(this.vx,this.vy,0);
    this.gl.scale(this.vs,this.vs,1);
  }

  redrawOnly(e) {
    if(!e.gl) return;
    this.doGlTransform();
    e.gl.render();
  }

  add(x) {
    x.canvas = this;
    this.elements.push(x);
    this.svgg.append(x.elt);
  }

  hit(x,y) {
    var mind = -1;
    var mine = null;
    elements.forEach((e) => {
      var d = e.hit(x,y);
      if(mine===null || d<mind) {
        mind = d;
        mine = e;
      }
    });
    if(mind>-1) return mine;
    return null;
  }

  cur() {
    curCanvas = this;
  }
}


class Element {
  constructor() {
    this.x = this.y = 0;
    this.elt = $SVG("g");
    curCanvas.add(this);
    this.createGL();
    this.createSVG();
  }

  createGL() {
    this.gl = new Shape(this, 0,0);
    window.setInterval(() => {
      this.gl.animate();
    }, 40);
  }

  redraw() { this.canvas.redrawOnly(this); }

  createSVG() {
    this.elt.append($SVG("circle").attr("r", 20));
    this.elt.append($SVG("text").attr("text-anchor", "middle").attr("y", 30).html("prout"));
    this.elt.mousedown((e)=> { this.canvas.selection = this; this.canvas.bDragging = true; });
  }

  move(dx,dy) {
    this.x += dx;
    this.y += dy;
    this.elt.attr("transform", "translate(" + this.x + "," + this.y + ")");
    this.canvas.redraw();
  }

  updateKDcode() {
    // TODO @return a base4 code with recursive square division for bounding shape
    // euclidean distance with tolerance is allowed here
    this.KDcode = 3;
  }

  hit(x,y) {
    // TODO compute KDcode for (x,y)
    var KDcode = 0;
    // if(KDcode doesn't match)
    return -1;
    return dist(x,y);
  }

  dist(x,y) {
    // @return euclidean distance with tolerance to shape
  }

}

$(()=> {  $(".canvas").each((i,o) => { new Canvas(o); }) })
