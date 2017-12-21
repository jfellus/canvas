$(()=> {

  for(var i=0; i<100; i++) new Element();
  for(var i=0; i<100; i++) {
    var a = Math.floor(Math.random()*100);
    var b = Math.floor(Math.random()*100);
    new Link(curCanvas.elements[a], curCanvas.elements[b]);
  }
  for(var i=0; i<100; i++) {
    var x = Math.random()*1000;
    var y = Math.random()*1000;
    curCanvas.elements[i].move(x,y);
  }

  $(document).on("keydown", (e) => {
    if(e.which===37) left();
    else if(e.which===39) right();
  })

});


function left() {
  var e = curCanvas.elements[0];
  e.move_delta(-10, 0);
}

function right() {
  var e = curCanvas.elements[0];
  e.move_delta(10, 0);
}
