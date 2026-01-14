let stars = [];
let particles = [];
let time = 0;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('z-index', '-1');
  cnv.style('position', 'fixed');

  for (let i = 0; i < 100; i++) {
    stars.push(new Star());
  }

  // Create flowing particles
  for (let i = 0; i < 40; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  let theme = getCurrentTheme();
  if (theme === "dark") {
    background(8, 8, 12, 50);
  } else {
    background(255, 255, 255, 50);
  }

  time += 0.01;

  for (let star of stars) {
    star.update();
    star.show();
  }

  for (let particle of particles) {
    particle.update();
    particle.show();
  }
}

function getCurrentTheme() {
  return localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Particle {
  constructor() {
    this.reset();
    this.y = random(height);
    this.offsetX = random(1000);
    this.offsetY = random(1000);
  }

  reset() {
    this.x = random(width);
    this.y = -20;
    this.size = random(2, 4);
    this.speed = random(0.3, 0.8);
    this.offsetX = random(1000);
    this.offsetY = random(1000);
  }

  update() {
    // Gentle flowing motion using Perlin noise
    let noiseX = noise(this.offsetX + time) * 2 - 1;
    let noiseY = noise(this.offsetY + time) * 2 - 1;
    
    this.x += noiseX * 0.5;
    this.y += this.speed + noiseY * 0.3;
    
    this.offsetX += 0.01;
    this.offsetY += 0.01;

    // Wrap around
    if (this.y > height + 20) {
      this.reset();
    }
    if (this.x < -20) this.x = width + 20;
    if (this.x > width + 20) this.x = -20;
  }

  show() {
    let theme = getCurrentTheme();
    noStroke();
    
    if (theme === "dark") {
      fill(100, 150, 200, 60);
    } else {
      fill(150, 180, 200, 60);
    }
    
    ellipse(this.x, this.y, this.size);
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 2);
    this.brightness = random(50, 150);
  }

  update() {
    this.brightness += sin(frameCount * 0.05) * 2;
  }

  show() {
    let theme = getCurrentTheme();
    noStroke();
    theme === "dark" ? fill(255, this.brightness) : fill(100, 120, 140, this.brightness * 0.5);
    ellipse(this.x, this.y, this.size);
  }
}