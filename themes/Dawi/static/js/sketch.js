let stars = [];

function setup() {
  let cnv = createCanvas(windowWidth , windowHeight);
  cnv.position(0, 0); // Pin canvas to top-left corner
  cnv.style('z-index', '-1');
  cnv.style('position', 'fixed'); // Prevent scrolling

  angleMode(DEGREES);
  background(15);

  if (toggleIcon.classList[1] === THEME_TO_ICON_CLASS.dark) {
    background(5)

  } else if (toggleIcon.classList[1] === THEME_TO_ICON_CLASS.light) {
    background(120)
    print("WHITE")
  }

  for (let i = 0; i < 100; i++) {
    let x = random(width);
    let xSpeed = random(-2, 2);  // Small movement to avoid them going too fast
    let y = random(height);
    let ySpeed = random(-2, 2);
    stars.push(new Star(x, y, xSpeed, ySpeed));
  }

}
function draw() {
  // resizeCanvas(Document.width, Document.height);
  noStroke();
  let scrollY = window.scrollY * 0.2; // Slow parallax effect

  // darkThemeCss = document.getElementById("dark-theme");
  // const savedTheme = localStorage.getItem(THEME_PREF_STORAGE_KEY) ||
  //     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  // setTheme(savedTheme, darkThemeToggles);
  // const darkThemeToggles = document.querySelectorAll('.dark-theme-toggle');
  // darkThemeToggles.forEach(el => el.addEventListener('click', change_background, { capture: true }))

  for (let star of stars) {
    console.log(star.x)
    console.log(star.y)
    star.update();  // Move stars
    star.show();    // Draw stars
  }
}

function change_background(event) {
  toggleIcon = event.currentTarget.querySelector("a svg.feather");
  if (toggleIcon.classList[1] === THEME_TO_ICON_CLASS.dark) {
    background(15)

  } else if (toggleIcon.classList[1] === THEME_TO_ICON_CLASS.light) {
    background(120)
    print("WHITE")
  }
}

function windowResized() {
  resizeCanvas(Document.width, Document.height);
}

class Star {
  constructor(x, y, xSpeed, ySpeed) {
    this.x = x; 
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
  }
  update(scrollOffset) {
    this.y = this.baseY + scrollOffset * this.speed;

    // Wrap around screen edges
    if (this.y > height) this.y = 0;
    if (this.y < 0) this.y = height;
  }
  update() {
    // Move the star
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // Wrap around the screen edges
    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
    if (this.y > height) this.y = 0;
    if (this.y < 0) this.y = height;
  }
  show() {
    fill(40);
    ellipse(this.x, this.y, 5, 5);
  }
}
