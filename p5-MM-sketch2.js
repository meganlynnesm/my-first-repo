// Sketch 2: Blooming Flowers (instance mode)
var bloomingFlowersSketch = function (p) {
  var c1, c2;
  var flowers = [];
  var flowerColor1, flowerColor2;

  p.setup = function () {
    var canvas = p.createCanvas(400, 400);
    canvas.parent('canvas-container-2');
    c1 = p.color(115, 137, 19);
    c2 = p.color(225, 227, 175);
    flowerColor1 = p.color(146, 47, 60);
    flowerColor2 = p.color(204, 138, 143);
  };

  function drawBackground() {
    for (var y = 0; y < p.height; y++) {
      var n = p.map(y, 0, p.height, 0, 1);
      var newc = p.lerpColor(c1, c2, n);
      p.stroke(newc);
      p.line(0, y, p.width, y);
    }
  }

  function createFlower() {
    return {
      x: p.random(50, 380),
      y: p.random(20, 380),
      size: p.random(20, 75),
      lifespan: p.random(255, 300),
      color: p.random([flowerColor1, flowerColor2])
    };
  }

  function drawFlower(flower) {
    p.noStroke();
    p.fill(flower.color);
    p.ellipse(flower.x, flower.y, flower.size / 2, flower.size);
    p.ellipse(flower.x, flower.y, flower.size, flower.size / 2);
    p.fill(246, 202, 125);
    p.circle(flower.x, flower.y, flower.size / 2);
  }

  p.draw = function () {
    // Repaint the background every frame so wilted flowers don't leave ghosts behind.
    drawBackground();

    if (p.random() < 0.05) {
      flowers.push(createFlower());
    }

    for (var i = flowers.length - 1; i >= 0; i--) {
      var flower = flowers[i];
      drawFlower(flower);

      flower.size *= 0.99;
      flower.lifespan -= 1;

      if (flower.lifespan <= 0) {
        flowers.splice(i, 1);
      }
    }
  };
};

var myp5_2 = new p5(bloomingFlowersSketch, 'canvas-container-2');
