let img;
let points = [];
let currentPoint = 0;

function preload() {
  img = loadImage("images/test01 - mid.jpg"); // Replace with the correct path of your image
}

function setup() {
  createCanvas(img.width, img.height);
  canvas.parent('sketch-holder'); // Attach canvas to the div with ID 'sketch-holder'
  img.loadPixels();

  // Extract pixels and store them as point coordinates
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      let index = (x + y * img.width) * 4;
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];

      // Check brightness to define if the point will be added
      let brightness = (r + g + b) / 3;
      if (brightness < 200) { // Adjust threshold to control density
        points.push({ pos: createVector(x, y), color: color(r, g, b) }); // Store position and color
      }
    }
  }

  // Shuffle the points to randomize the order of drawing
  shuffle(points, true); 
  background(255);
}

function draw() {
  // Render points over time
  if (currentPoint < points.length) {
    for (let i = 0; i < 10; i++) { 
      if (currentPoint >= points.length) break;

      let pt = points[currentPoint];
      stroke(pt.color); // Set stroke color to the point's color
      strokeWeight(1);
      point(pt.pos.x, pt.pos.y); // Draw the point
      currentPoint++;
    }
  }
}
