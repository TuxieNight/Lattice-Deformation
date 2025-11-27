/*
 * Stores a point's (x,y) position in the undeformed grid and a point's upper-left grid cell indices
 */
class DrawnPoint {
    constructor(x, y, gridX, gridY) {
        this.x = x;
        this.y = y;
        this.gridX = gridX;
        this.gridY = gridY;
    }
}
// stores the DrawnPoints of a heart shape
let heart = [];

// set up canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// point slider --- determines speed of animation
const pointSlider = document.getElementById("pointSlider");
let size = (Number)(pointSlider.value);

pointSlider.addEventListener("input", () => {
  size = (Number)(pointSlider.value);

  // reset size
  GRID_ROWS = size;
  GRID_COLS = size;

  // reset control points to the initial position
  setControlPoints();
  // reset heart
  getHeartPoints(200);
  // re-draw the heart and grid
  draw();
});

// visibility button --- determines if grid is visible
const visiblityButton = document.getElementById("visibilityButton");
let isVisible = true;

visiblityButton.addEventListener("click", () => {
  isVisible = !isVisible;
  draw();
});

// set up grid dimensions
let GRID_ROWS = size;
let GRID_COLS = size;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDING = 50;
const GRID_WIDTH = WIDTH - 2 * PADDING;
const GRID_HEIGHT = HEIGHT - 2 * PADDING;

// holds control points
let controlPoints = [];

function setControlPoints() {
    // set up grid control points
    for (let i = 0; i < GRID_ROWS; i++) {
        controlPoints[i] = [];
        for (let j = 0; j < GRID_COLS; j++) {
            controlPoints[i][j] = {
                // the undeformed position evenly spaces the control points across the grid dimensions
                x: PADDING + (j / (GRID_COLS - 1)) * GRID_WIDTH,
                y: PADDING + (i / (GRID_ROWS - 1)) * GRID_HEIGHT
            };
        }
    }
}


// whether a point is currently being dragged
let dragging = null;

/* Get points for heart curve in parametric space [0, 1] x [0, 1] into global heart array
 * res - number of points the heart curve is sampled at
 */
function getHeartPoints(res = 200) {
  // clear the heart array
  heart = [];

  for (let t = 0; t < 2 * Math.PI; t += 2 * Math.PI / res) {
    // compute the heart shape using the parametric equations
	const x = 16 * Math.pow(Math.sin(t), 3);
	const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    // center the heart - add 0.5; normalize to [0,1] - the max value of x and y is 34
    let updatedX = 0.5 + x / 34;
    let updatedY = 0.5 - y / 34;
    // get the indices of the upper-left corner of the point's grid cell
    let gridCell = getCellIndices(updatedX, updatedY);
    // add the point to the heart array
    heart.push(new DrawnPoint(updatedX, updatedY, gridCell[0], gridCell[1]));
  }
}

/*
 * Determines where a point should be based on its undeformed position in its cell
 *
 * x - x coordinate in parametric space [0, 1]
 * y - y coordinate in parametric space [0, 1]
 * gridCell - the upper-left corner of the grid cell containing the point
 * 
 * Returns the interpolated point using bilinear interpolation
 */
function bilinearInterp(x, y, gridCell) {
  // get the indices of the upper-left corner of the grid cell containing the point
  const [i, j] = gridCell;

  // upper-left corner of the grid cell
  const x0 = controlPoints[i][j];
  // upper-right corner of the grid cell
  const x1 = controlPoints[i][j + 1];
  // lower-left corner of the grid cell
  const x2 = controlPoints[i + 1][j];
  // lower-right corner of the grid cell
  const x3 = controlPoints[i + 1][j + 1];

  // get the fraction within the grid cell
  const u = x * (GRID_COLS - 1) - j;
  const v = y * (GRID_ROWS - 1) - i;

  // upper-left is more powerful if v and u are closer to 0
  // upper-right is more powerful if v is closer to 0 and u is closer to 1
  // lower-left is more powerful if v is closer to 1 and u is closer to 0
  // lower-right is more powerful if v and u are closer to 1
  const p = {
	x: (1 - u) * (1 - v) * x0.x + u * (1 - v) * x1.x +
   	(1 - u) * v * x2.x + u * v * x3.x,
	y: (1 - u) * (1 - v) * x0.y + u * (1 - v) * x1.y +
   	(1 - u) * v * x2.y + u * v * x3.y
  };

  // return the interpolated point
  return p;
}

/*
 * Get the indices of the upper-left corner of the grid cell containing the point
 * x - x coordinate in parametric space [0, 1]
 * y - y coordinate in parametric space [0, 1]
 */
function getCellIndices(x, y) {
  const i = Math.floor(y * (GRID_ROWS - 1));
  const j = Math.floor(x * (GRID_COLS - 1));
  return [Math.min(i, GRID_ROWS - 2), Math.min(j, GRID_COLS - 2)];
}

/*
 * Draw the grid lines and control points
 */
function drawGrid() {
  ctx.strokeStyle = "#999";
  ctx.fillStyle = "#333";
  for (let i = 0; i < GRID_ROWS; i++) {
	for (let j = 0; j < GRID_COLS; j++) {
  	const p = controlPoints[i][j];

    // draw grid lines
  	ctx.beginPath();
  	if (j < GRID_COLS - 1) {
    	const right = controlPoints[i][j + 1];
    	ctx.moveTo(p.x, p.y);
    	ctx.lineTo(right.x, right.y);
  	}
  	if (i < GRID_ROWS - 1) {
    	const down = controlPoints[i + 1][j];
    	ctx.moveTo(p.x, p.y);
    	ctx.lineTo(down.x, down.y);
  	}
  	ctx.stroke();

    // draw control points
    ctx.beginPath();
  	ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
  	ctx.fill();
	}
  }
}

/*
 * Draw the heart shape using the points in the heart array
 */
function drawShape() {
  // start drawing
  ctx.beginPath();

  // draw every heart point in its updated position
  for (let k = 0; k < heart.length; k++) {
	const drawnPt = heart[k];
	const p = bilinearInterp(drawnPt.x, drawnPt.y, [drawnPt.gridX, drawnPt.gridY]);
	if (k === 0) ctx.moveTo(p.x, p.y);
	else ctx.lineTo(p.x, p.y);
  }

  // end and fill the heart shape
  ctx.closePath();
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.strokeStyle = "#660000";
  ctx.stroke();
}

/*
 * Re-draws the heart and grid
 */
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawShape();

  if (isVisible) {
    drawGrid();
  }
}

// check if the mouse clicked on a control point
canvas.addEventListener("mousedown", (e) => {
  // get mouse position
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  // compare mouse's position to every control point
  for (let i = 0; i < GRID_ROWS; i++) {
	for (let j = 0; j < GRID_COLS; j++) {
  	const p = controlPoints[i][j];
    // if the distance is close enough, set the dragging variable to the control point's indices
  	if (Math.hypot(mx - p.x, my - p.y) < 10) {
    	dragging = { i, j };
  	}
	}
  }
});

// check if the mouse is dragging a point (is not null) when the mouse moves
canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    // get the mouse position
	const rect = canvas.getBoundingClientRect();
	const mx = e.clientX - rect.left;
	const my = e.clientY - rect.top;

    // put the control point at the mouse position
	controlPoints[dragging.i][dragging.j].x = mx;
	controlPoints[dragging.i][dragging.j].y = my;

    // re-draw the heart and grid
	draw();
  }
});

// if the mouse is released or leaves the canvas, stop dragging
canvas.addEventListener("mouseup", () => dragging = null);
canvas.addEventListener("mouseleave", () => dragging = null);

// set up control points
setControlPoints();
// Precompute heart points before first draw
getHeartPoints(200);
// first draw
draw();