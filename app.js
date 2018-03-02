// CONSTANTS

/* Base angle of rotation per iteration. */
const BASE_ANGLE = 0.03;
/* Number of iterations per animation frame. */
const DRAW_SPEED = 4;

// CLASSES

class Point {
  constructor(x, y) {
    this.setPosition(x, y);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  deltaTo(p2) {
    return {
      x: p2.x - this.x,
      y: p2.y - this.y,
    }
  }

  distanceTo(p2) {
    const delta = this.deltaTo(p2);
    return Math.sqrt(delta.x ** 2 + delta.y ** 2);
  }

  angleTo(p2) {
    const delta = this.deltaTo(p2);
    let angle = (Math.atan(delta.x / delta.y) + Math.PI) % Math.PI;
    if (delta.x < 0 || delta.x === 0 && delta.y < 0) angle += Math.PI;
    return angle;
  }

  rotateAbout(p2, rad) {
    const distance = this.distanceTo(p2);
    let angle = p2.angleTo(this);
    angle += rad;
    this.x = p2.x + distance * Math.sin(angle);
    this.y = p2.y + distance * Math.cos(angle);
    return this;
  }
}

// FUNCTIONS

const toggleDrawing = function toggleDrawing(state) {
  if (state) {
    if (state === allowDrawing) return;
    allowDrawing = state;
  } else {
    allowDrawing = !allowDrawing;
  }

  if (allowDrawing) {
    requestAnimationFrame(drawSegment);
  }
  elPauseIndicator.style.display = allowDrawing ? 'none' : 'block';
};

const clickHandler = function clickHandler(event) {
  event.preventDefault();

  if (event.screenX < window.innerWidth / 2) {
    // Left half of screen.
    toggleDrawing();
  } else {
    // Right half of screen.
    toggleDrawing(true);
    generate();
  }

};

const drawSegment = function drawSegment() {
  ctx.beginPath();
  ctx.moveTo(penTip.x, penTip.y);
  for (let i = 0; i < DRAW_SPEED; i++) {
    iterate();
    ctx.lineTo(penTip.x, penTip.y);
  }
  ctx.strokeStyle = '#fff';
  //ctx.strokeWidth = 1.4;
  ctx.stroke();

  if (allowDrawing) requestAnimationFrame(drawSegment);
}

const iterate = function iterate() {
  secondaryCentre.rotateAbout(centre, BASE_ANGLE);
  penTip.rotateAbout(centre, BASE_ANGLE);
  penTip.rotateAbout(secondaryCentre, BASE_ANGLE * circleRatio);
};

const generate = function generate() {
  primaryRadius = dimension * 0.5 * (0.4 + 0.5 * Math.random());
  secondaryRadius = dimension * 0.5 * (0.1 + 0.5 * Math.random());
  circleRatio = primaryRadius / secondaryRadius;

  secondaryCentre.setPosition(centre.x, centre.y - (primaryRadius - secondaryRadius));
  penTip.setPosition(centre.x, centre.y - primaryRadius);
  initialPenTip.setPosition(penTip.x, penTip.y);

  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
};

// DO THINGS

const elCanvas = document.querySelector('canvas');
const ctx = elCanvas.getContext('2d');

const elPauseIndicator = document.querySelector('.pause-indicator');
const elTutorial = document.querySelector('.tutorial');

setTimeout(() => {
  elTutorial.parentElement.removeChild(elTutorial);
}, 2000);

const dimension =
  window.devicePixelRatio * Math.min(window.innerWidth, window.innerHeight);
elCanvas.width = dimension;
elCanvas.height = dimension;

const centre = new Point(dimension / 2, dimension / 2)

let primaryRadius;
let secondaryRadius;
let circleRatio;

const secondaryCentre = new Point(0, 0);
const penTip = new Point(0, 0);
const initialPenTip = new Point(0, 0);

let allowDrawing = true;
generate();
requestAnimationFrame(drawSegment);
document.body.addEventListener('click', clickHandler);
