$(()=> {

  for(var i=0; i<1000; i++) new Element();

  $(document).on("keydown", (e) => {
    if(e.which===37) left();
    else if(e.which===39) right();
  })

});


function left() {
  var e = curCanvas.elements[0];
  e.move(e.x - 10, e.y);
}

function right() {
  var e = curCanvas.elements[0];
  e.move(e.x + 10, e.y);
}
