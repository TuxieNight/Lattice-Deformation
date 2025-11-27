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
// stores the initial and expanded control points
let state1 = [];
let state2 = [];
// stores the direction of the animation
let animateFunction = toState2;
// stores the current time of the animation
let currTime = 0;

/*
 * Easing function for the animation
 */
function easeInOutCubic(u) {
    return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

/*
 * Animation function that expands the heart shape over time
 * Once expanded position is reached, the animation switches to returnToInitPos
 * 
 * timestamp - the current time of the animation
 */
function toState2(timestamp) {
    // if the animation has not started, set the current time to the timestamp
    if (currTime == 0) {
        currTime = timestamp;
    }

    // calculate how far along the animation should be based
    // start of animation occurs at u = 0, end of animation occurs at u = 1
    let u = (timestamp - currTime) / 1000 * speed;
    let easedU = easeInOutCubic(Math.min(u, 1)); // Clamp to max 1

    // animation step is complete if u > 1; switch animation function
    if (u > 1) {
        animateFunction = toState1;
        currTime = 0;
        return;
    }

    // interpolate between current position and next position
    for (let i = 0; i < controlPoints.length; i++) {
        for (let j = 0; j < controlPoints[i].length; j++) {
            controlPoints[i][j].x = (1 - easedU) * state1[i][j].x + easedU * state2[i][j].x;
            controlPoints[i][j].y = (1 - easedU) * state1[i][j].y + easedU * state2[i][j].y;
        }
    }
}

/*
 * Animation function that returns the heart shape to its initial position over time
 * Once initial position is reached, the animation switches to expandPos
 * 
 * timestamp - the current time of the animation
 */
function toState1(timestamp) {
    // if the animation has not started, set the current time to the timestamp
    if (currTime == 0) {
        currTime = timestamp;
    }

    // calculate how far along the animation should be based
    // start of animation occurs at u = 0, end of animation occurs at u = 1
    let u = (timestamp - currTime) / 1000 * speed;
    let easedU = easeInOutCubic(Math.min(u, 1)); // Clamp to max 1

    // animation step is complete if u > 1; switch animation function
    if (u > 1) {
        animateFunction = toState2;
        currTime = 0;
        return;
    }

    // interpolate between current position and next position
    for (let i = 0; i < controlPoints.length; i++) {
        for (let j = 0; j < controlPoints[i].length; j++) {
            controlPoints[i][j].x = (1 - easedU) * state2[i][j].x + easedU * state1[i][j].x;
            controlPoints[i][j].y = (1 - easedU) * state2[i][j].y + easedU * state1[i][j].y;
        }
    }
}

// set up canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// visibility button --- determines if grid is visible
const visiblityButton = document.getElementById("visibilityButton");
let isVisible = true;

visiblityButton.addEventListener("click", () => {
  isVisible = !isVisible;
});

// speed slider --- determines speed of animation
const speedSlider = document.getElementById("speedSlider");
let speed = (Number)(speedSlider.value);

speedSlider.addEventListener("input", () => {
  speed = (Number)(speedSlider.value);
});

// size slider --- determines size of heart (when expanded)
const sizeSlider = document.getElementById("sizeSlider");
let shift = (Number)(sizeSlider.value);

sizeSlider.addEventListener("input", () => {
  shift = (Number)(sizeSlider.value);

  // reset the control points to the initial position
  for (let i = 0; i < GRID_ROWS; i++) {
    state2[i] = [];
    for (let j = 0; j < GRID_COLS; j++) {
      state2[i][j] = {
          x: PADDING + (j / (GRID_COLS - 1)) * GRID_WIDTH,
          y: PADDING + (i / (GRID_ROWS - 1)) * GRID_HEIGHT
      };
    }
  }
  
  // apply shift
  for(let i = 0; i < GRID_ROWS; i++) {
      state2[i][0].x -= shift;
      state2[i][GRID_COLS - 1].x += shift;
  
      state2[0][i].y -= shift;
      state2[GRID_ROWS - 1][i].y += shift;
  }

});

// set up grid dimensions
const GRID_ROWS = 4;
const GRID_COLS = 4;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDING = 50;
const GRID_WIDTH = WIDTH - 2 * PADDING;
const GRID_HEIGHT = HEIGHT - 2 * PADDING;

// set up grid control points
let controlPoints = [];
for (let i = 0; i < GRID_ROWS; i++) {
  controlPoints[i] = [];
  state1[i] = [];
  state2[i] = [];
  for (let j = 0; j < GRID_COLS; j++) {
	controlPoints[i][j] = {
        // the undeformed position evenly spaces the control points across the grid dimensions
        x: PADDING + (j / (GRID_COLS - 1)) * GRID_WIDTH,
        y: PADDING + (i / (GRID_ROWS - 1)) * GRID_HEIGHT
	};
    state1[i][j] = {
        x: PADDING + (j / (GRID_COLS - 1)) * GRID_WIDTH,
        y: PADDING + (i / (GRID_ROWS - 1)) * GRID_HEIGHT
    };
    state2[i][j] = {
        x: PADDING + (j / (GRID_COLS - 1)) * GRID_WIDTH,
        y: PADDING + (i / (GRID_ROWS - 1)) * GRID_HEIGHT
    };
  }
}

for(let i = 0; i < GRID_ROWS; i++) {
    state2[i][0].x -= shift;
    state2[i][GRID_COLS - 1].x += shift;

    state2[0][i].y -= shift;
    state2[GRID_ROWS - 1][i].y += shift;
}

// Heart curve in parametric space [0, 1] x [0, 1]
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
function drawHeart() {
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
 * Re-draws the heart and grid overtime
 */
function animate(timestamp) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawHeart();

  if(isVisible) {
    drawGrid();
  }

  // Update control points for animation
  animateFunction(timestamp);

  window.requestAnimationFrame(animate);
}

// Precompute heart points
getHeartPoints(200);
// first draw
window.requestAnimationFrame(animate);