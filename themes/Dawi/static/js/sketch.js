let stars = [];
let nodes = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('z-index', '-1');
  cnv.style('position', 'fixed');

  // Background stars (depth layer 1)
  for (let i = 0; i < 150; i++) {
    stars.push(new Star());
  }

  // Network nodes (depth layer 2)
  // Fewer nodes on small screens to prevent clutter
  let numNodes = windowWidth < 800 ? 30 : 60;
  for (let i = 0; i < numNodes; i++) {
    nodes.push(new Node());
  }
}

function draw() {
  // Deep dark background with motion blur trail effect
  // Color matches --card-bg: #0d1117 = rgb(13, 17, 23)
  background(13, 17, 23, 100);

  // Draw background stars
  for (let star of stars) {
    star.update();
    star.show();
  }

  // Draw node connections (constellation effect)
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].update();
    for (let j = i + 1; j < nodes.length; j++) {
      let d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
      let maxDist = 160;
      
      if (d < maxDist) {
        // Opacity inversely proportional to distance
        let alpha = map(d, 0, maxDist, 70, 0);
        // Accent color matching hsl(260, 75%, 68%) ~ rgb(150, 115, 230)
        stroke(150, 115, 230, alpha); 
        strokeWeight(1.2);
        line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
      }
    }
  }

  // Draw nodes on top of lines
  for (let node of nodes) {
    node.show();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Adjust node count on resize
  let targetNodes = windowWidth < 800 ? 30 : 60;
  while (nodes.length > targetNodes) nodes.pop();
  while (nodes.length < targetNodes) nodes.push(new Node());
}

class Node {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-0.25, 0.25);
    this.vy = random(-0.25, 0.25);
    this.size = random(1.5, 3.5);
  }

  update() {
    // Gentle mouse interaction (parallax)
    let dx = mouseX - width / 2;
    let dy = mouseY - height / 2;
    
    // Slow drift + mouse push
    this.x += this.vx - (dx * 0.00015);
    this.y += this.vy - (dy * 0.00015);

    // Wrap around screen gracefully
    if (this.x < -50) this.x = width + 50;
    if (this.x > width + 50) this.x = -50;
    if (this.y < -50) this.y = height + 50;
    if (this.y > height + 50) this.y = -50;
  }

  show() {
    noStroke();
    // Slightly brighter accent for nodes
    fill(170, 140, 240, 140); 
    ellipse(this.x, this.y, this.size);
    // Subtle glow core
    fill(255, 255, 255, 200);
    ellipse(this.x, this.y, this.size * 0.4);
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(0.5, 2);
    this.baseAlpha = random(20, 90);
    this.phase = random(TWO_PI);
  }

  update() {
    // Very subtle parallax drift for stars (farther away)
    let dx = mouseX - width / 2;
    let dy = mouseY - height / 2;
    this.x -= dx * 0.00005;
    this.y -= dy * 0.00005;
    
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  show() {
    // Twinkle effect
    let alpha = this.baseAlpha + sin(frameCount * 0.02 + this.phase) * 30;
    noStroke();
    // Muted off-white text color
    fill(230, 237, 243, alpha);
    ellipse(this.x, this.y, this.size);
  }
}