let stars = [];
let flock = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('z-index', '-1');
  cnv.style('position', 'fixed');

  for (let i = 0; i < 150; i++) {
    stars.push(new Star());
  }

  for (let i = 0; i < 60; i++) {
    flock.push(new Boid());
  }
}

function draw() {
  let theme = getCurrentTheme();
  if (theme === "dark") {
    background(8, 8, 12, 60);
  } else {
    background(255, 255, 255, 60);
  }

  for (let star of stars) {
    star.update();
    star.show();
  }

  for (let boid of flock) {
    boid.flock(flock);
    boid.update();
    boid.show();
  }
}

function getCurrentTheme() {
  return localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 4;
    this.size = 5;
  }

  edges() {
    if (this.position.x > width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = height;
  }

  // The 3 Flocking Rules
  flock(boids) {
    let perceptionRadius = 50;
    let alignment = createVector();
    let cohesion = createVector();
    let separation = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other !== this && d < perceptionRadius) {
        alignment.add(other.velocity);
        cohesion.add(other.position);
        
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d); // Weight by distance
        separation.add(diff);
        
        total++;
      }
    }

    if (total > 0) {
      alignment.div(total).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
      cohesion.div(total).sub(this.position).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
      separation.div(total).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
    }

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation.mult(1.5)); // Keep them a bit more separated
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0); // Reset acceleration each frame
    this.edges();
  }

  show() {
    let theme = getCurrentTheme();
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());
    
    if (theme === "dark") {
      fill(100, 150, 255, 200);
    } else {
      fill(255, 100, 50, 200);
    }
    
    triangle(-this.size, -this.size/2, -this.size, this.size/2, this.size, 0);
    pop();
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.brightness = random(100, 255);
  }

  update() {
    this.brightness += sin(frameCount * 0.05) * 5;
  }

  show() {
    let theme = getCurrentTheme();
    noStroke();
    theme === "dark" ? fill(255, this.brightness) : fill(100, 120, 140, this.brightness * 0.5);
    ellipse(this.x, this.y, this.size);
  }
}