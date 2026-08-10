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
        
        // Average pulse of the two connected nodes
        let avgPulse = (nodes[i].pulse + nodes[j].pulse) / 2;
        
        // Subtle color shift
        let r = lerp(150, 110, avgPulse);
        let g = lerp(115, 150, avgPulse);
        let b = lerp(230, 240, avgPulse);
        
        stroke(r, g, b, alpha + avgPulse * 15); 
        strokeWeight(1.2 + avgPulse * 0.4);
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
    this.pulse = 0;
  }

  update() {
    // Gentle mouse interaction (parallax)
    let dx = mouseX - width / 2;
    let dy = mouseY - height / 2;
    
    // Mouse hover repel / click attract
    let dMouse = dist(mouseX, mouseY, this.x, this.y);
    let interactX = 0;
    let interactY = 0;
    
    if (dMouse < 150) {
      let forceMag = mouseIsPressed ? -1.5 : 2.0;
      let force = map(dMouse, 0, 150, forceMag, 0);
      if (dMouse > 0.1) {
        interactX = (this.x - mouseX) / dMouse * force;
        interactY = (this.y - mouseY) / dMouse * force;
      }
      
      // Localized pulse effect when pressed
      if (mouseIsPressed) {
        let targetPulse = map(dMouse, 0, 150, 1, 0);
        this.pulse = lerp(this.pulse, targetPulse, 0.15);
      } else {
        this.pulse = lerp(this.pulse, 0, 0.05);
      }
    } else {
      this.pulse = lerp(this.pulse, 0, 0.05);
    }
    
    // Slow drift + mouse push + interaction
    this.x += this.vx - (dx * 0.00015) + interactX;
    this.y += this.vy - (dy * 0.00015) + interactY;

    // Wrap around screen gracefully
    if (this.x < -50) this.x = width + 50;
    if (this.x > width + 50) this.x = -50;
    if (this.y < -50) this.y = height + 50;
    if (this.y > height + 50) this.y = -50;
  }

  show() {
    noStroke();
    // Subtle localized color shift
    let r = lerp(170, 130, this.pulse);
    let g = lerp(140, 170, this.pulse);
    let b = lerp(240, 250, this.pulse);
    
    fill(r, g, b, 140 + this.pulse * 25); 
    let currentSize = this.size + this.pulse * 1.0;
    ellipse(this.x, this.y, currentSize);
    
    // Subtle glow core
    fill(255, 255, 255, 200 + this.pulse * 30);
    ellipse(this.x, this.y, currentSize * 0.4);
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