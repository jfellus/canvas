$(()=> {

  for(var i=0; i<10; i++) new Element();

  $(document).on("keydown", (e) => {
    if(e.which===37) left();
    else if(e.which===39) right();
  })

});


function left() {
  var e = curCanvas.elements[0];
  e.move(-10, 0);
}

function right() {
  var e = curCanvas.elements[0];
  e.move(10, 0);
}
