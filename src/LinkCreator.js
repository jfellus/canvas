class LinkCreator {
  constructor() {
    this.a = null;
    this.b = null;
  }

  cancel() {
    if(this.elt) this.elt.remove();
  }

  onClick(e) {
  }

  onMousedown(e) {
    if(!this.a) {
      this.canvas = e.canvas;
      this.elt = $SVG("line").attr("class", "creator");
      e.canvas.svgg.append(this.elt);
      this.a = e;
      this.elt.attr("x1", e.x);
      this.elt.attr("y1", e.y);
      this.elt.attr("x2", e.x);
      this.elt.attr("y2", e.y);
    }
    else {
      this.b = e;
      new Link(this.a, this.b);
      this.elt.remove();
      this.canvas.creator = null;
    }
  }

  onMousemove(x,y) {
    if(this.elt) {
      this.elt.attr("x2", x);
      this.elt.attr("y2", y);
    }
  }

  onDrag(dx, dy) {

  }
}
