// Sketch 1: Mouse Painter (instance mode)
var mousePainterSketch = function (p) {
  p.setup = function () {
    var canvas = p.createCanvas(400, 400);
    canvas.parent('canvas-container-1');
    p.background(204, 138, 143);
  };

  p.draw = function () {
    if (p.mouseIsPressed === true) {
      p.fill(115, 137, 19);
    } else {
      p.fill(133, 47, 60);
    }
    // circles drawn at mouse position
    p.ellipse(p.mouseX, p.mouseY, 100);
    p.stroke(204, 138, 143);
  };
};

var myp5_1 = new p5(mousePainterSketch, 'canvas-container-1');
