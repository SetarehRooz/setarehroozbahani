let img;
let points = [];
let currentPoint = 0;

function preload() {
  img = loadImage("images/test01.jpg"); // Replace with the correct path of your image
}

function setup() {
  createCanvas(img.width, img.height);
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
        points.push(createVector(x, y));
      }
    }
  }
  background(255);
}

function draw() {
  // Render points over time
  if (currentPoint < points.length) {
    for (let i = 0; i < 100; i++) { // Draw 100 points per frame for speed
      if (currentPoint >= points.length) break;

      let pt = points[currentPoint];
      stroke(0);
      strokeWeight(1);
      point(pt.x, pt.y);
      currentPoint++;
    }
  }
}