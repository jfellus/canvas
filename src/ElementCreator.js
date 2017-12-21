class ElementCreator {
  constructor() {
    this.e = new Element();
    this.e.move(this.e.canvas.toScreenX(this.e.canvas.oldX), this.e.canvas.toScreenY(this.e.canvas.oldY));
  }

  cancel() {
    if(this.e) this.e.remove();
  }

  onClick(e) {
  }

  onMousedown(e) {
    this.e.canvas.creator = null;
  }

  onMousemove(x,y) {
    if(this.e) {
      this.e.move(x,y);
    }
  }

  onDrag(dx, dy) {

  }
}
