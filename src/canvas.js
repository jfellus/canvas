
var curCanvas = null;

class Canvas {
  constructor(elt) {
    this.vx = this.vy = 0;
    this.vs = 1;
    this.elements = []; this.links = [];
    this.elt = $(elt)
      .append(this.svg = $("<svg width=100% height=100%></svg>").append(this.svgg = $SVG("g")))
      .append(this.canvas = $("<canvas width=100% height=100%></canvas>").css("pointer-events", "none"));
    $(elt).on('selectstart dragstart', function(evt){ evt.preventDefault(); return false; });
    this.gl = glInitGL(this.canvas[0]);
    curCanvas = this;
    this.minX = 0; this.minY = 0;
    this.maxX = this.svg.width(); this.maxY = this.svg.height();

    this.creator = null;

    // Drag & Zoom

    $(document).on("keydown", (e) => { this.onKeydown(e);  });
    this.svg.mousedown((e)=> { if(e.which===2) { this.bNavigating = true; this.oldX = e.offsetX; this.oldY = e.offsetY; e.preventDefault(); e.stopPropagation(); return false; } });
    this.svg.mouseup((e)=> { this.bNavigating = false; this.bDragging = false;});
    this.svg.mousemove((e)=> {
      var dx = e.offsetX-this.oldX;
      var dy = e.offsetY-this.oldY;
      if(this.bNavigating) {
        this.pan(dx, dy);
      } else if(this.bDragging) this.onDrag(dx, dy);
      else this.onMousemove(this.toScreenX(e.offsetX), this.toScreenY(e.offsetY), dx, dy);
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

  cancel() {
    if(this.creator) { this.creator.cancel(); this.creator = null; }
  }

  setCreator(c) {
    if(this.creator) this.creator.cancel();
    this.creator = c;
  }

  deleteSelection() {
    if(this.selection) this.selection.remove();
  }

  onKeydown(e) {
    if(e.which === 27) { this.cancel(); }
    else if(e.which === 46) { this.deleteSelection(); }
    var k = e.key.toUpperCase();
    if(k === 'C') { this.setCreator(new LinkCreator()); }
    if(k === 'X') { this.setCreator(new ElementCreator()); }
  }

  onMousemove(x,y, dx, dy) {
    if(!this.creator) {}
    else if(this.creator.onMousemove) this.creator.onMousemove(x,y,dx,dy);
  }

  onMousedown(e) {
    if(!this.creator) this.selection = e;
    else if(this.creator.onClick) this.creator.onMousedown(e);
    this.bDragging = true;
  }

  onClick(e) {
    if(!this.creator) {}
    else if(this.creator.onClick) this.creator.onClick(e);
  }

  onDrag(dx, dy) {
     if(!this.creator) {
       if(this.selection) this.selection.move_delta(dx/this.vs, dy/this.vs);
     }
     else if(this.creator.onDrag) this.creator.onDrag(dx, dy);
  }

// Navigation

  pan(dx,dy) {
    this.vx += dx;
    this.vy += dy;
    this.maxX -= dx; this.minX -= dx;
    this.maxY -= dy; this.minY -= dy;
    this.redraw();
  }

  zoom(x,y,a) {
    this.vx += (this.vx-x)*a;
    this.vy += (this.vy-y)*a;
    this.vs *= 1+a;
    // TODO : minX minY maxX maxY
    if(this.vs < 0.001) this.vs = 0.001;
    this.redraw();
  }

  toScreenX(x) { return  ((x-this.vx)/this.vs); }
  toScreenY(y) { return  ((y-this.vy)/this.vs); }


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

  addLink(x) {
    x.canvas = this;
    this.links.push(x);
    this.svgg.prepend(x.elt);
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
    this.ins = []; this.outs = [];
    this.elt = $SVG("g");
    curCanvas.add(this);
//    this.createGL();
    this.createSVG();
  }

  createGL() {
    this.gl = new GLPixmap(this, 100, 100);
    this.gl.setSize(15,15);
    window.setInterval(() => {  this.test_animate(); }, 40);
  }

  redraw() { this.canvas.redrawOnly(this); }

  createSVG() {
    this.elt.append($SVG("circle").attr("r", 20));
    this.elt.append($SVG("text").attr("text-anchor", "middle").attr("y", 30).html("prout"));
    this.elt.mousedown((e)=> { this.canvas.onMousedown(this); });
    this.elt.click((e)=> { this.canvas.onClick(this); });
    this.updateBoundingBox();
  }

  updateData() {
    if(this.gl) this.gl.texture.update();
    this.redraw();
  }

  updateBoundingBox() {
    this.bb = this.elt[0].getBBox();
    this.bb.x += this.x; this.bb.y += this.y;
  }

  isVisible() {
    if(!this.bb) this.updateBoundingBox();
    return !(this.bb.x >= this.canvas.maxX || this.bb.y >= this.canvas.maxY || this.bb.x+this.bb.width < this.canvas.minX || this.bb.y+this.bb.height < this.canvas.minY);
  }

  test_animate() {
    for(var i=0;i<100*100; i++) {
      this.data[i*4] = Math.floor(Math.random()*2)*255;
      this.data[i*4+3] = 255;
    }
    this.updateData();
  }

  move_delta(dx, dy) { this.move(this.x + dx, this.y + dy);  }
  move(x,y) {
    this.x = x;
    this.y = y;
    this.elt.attr("transform", "translate(" + this.x + "," + this.y + ")");
    this.ins.forEach((l)=>{l.update();});
    this.outs.forEach((l)=>{l.update();});
    this.canvas.redraw();
    this.updateBoundingBox();
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

  addOut(l) {
    this.outs.push(l);
  }

  addIn(l) {
    this.ins.push(l);
  }

  remove() {
    this.ins.forEach((l) => { l.remove(); });
    this.outs.forEach((l) => { l.remove(); });
    this.canvas.elements.remove(this);
    this.elt.remove();
  }
}

class Link {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.a.addOut(this);
    this.b.addIn(this);
    this.createSVG();
    a.canvas.addLink(this);
  }

  createSVG() {
    this.elt = $SVG("line");
    this.update();
  }

  update() {
    this.elt.attr("x1", this.a.x).attr("y1", this.a.y)
      .attr("x2", this.b.x).attr("y2", this.b.y);
  }

  remove() {
    this.canvas.links.remove(this);
    this.elt.remove();
  }
}


$(()=> {  $(".canvas").each((i,o) => { new Canvas(o); }) })
