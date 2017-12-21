
function $SVG(tagname) {
  return $(document.createElementNS("http://www.w3.org/2000/svg", tagname));
}

Array.prototype.remove = function(value) {
var idx = this.indexOf(value);
if (idx != -1) {
    return this.splice(idx, 1); // The second parameter is the number of elements to remove.
}
return false;
}
