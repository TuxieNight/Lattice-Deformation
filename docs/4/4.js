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
let init = [];
let expand = [];
// stores the direction of the animation
let animateFunction = expandPos;
// stores the current time of the animation
let currTime = 0;

// stores the DrawnPoints of the circular head
let head = [];
let circle = [];

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
function expandPos(timestamp) {
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
        animateFunction = returnToInitPos;
        currTime = 0;
        return;
    }

    // interpolate between current position and next position
    for (let i = 0; i < heartGrid.length; i++) {
        for (let j = 0; j < heartGrid[i].length; j++) {
            heartGrid[i][j].x = (1 - easedU) * init[i][j].x + easedU * expand[i][j].x;
            heartGrid[i][j].y = (1 - easedU) * init[i][j].y + easedU * expand[i][j].y;
        }
    }
}

/*
 * Animation function that returns the heart shape to its initial position over time
 * Once initial position is reached, the animation switches to expandPos
 * 
 * timestamp - the current time of the animation
 */
function returnToInitPos(timestamp) {
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
        animateFunction = expandPos;
        currTime = 0;
        return;
    }

    // interpolate between current position and next position
    for (let i = 0; i < heartGrid.length; i++) {
        for (let j = 0; j < heartGrid[i].length; j++) {
            heartGrid[i][j].x = (1 - easedU) * expand[i][j].x + easedU * init[i][j].x;
            heartGrid[i][j].y = (1 - easedU) * expand[i][j].y + easedU * init[i][j].y;
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
//const speedSlider = document.getElementById("speedSlider");
let speed = 1;//(Number)(speedSlider.value);

// speedSlider.addEventListener("input", () => {
//   speed = (Number)(speedSlider.value);
// });

// size slider --- determines size of heart (when expanded)
// const sizeSlider = document.getElementById("sizeSlider");
let shift = 1;//(Number)(sizeSlider.value);

// sizeSlider.addEventListener("input", () => {
//   shift = (Number)(sizeSlider.value);

//   // reset the control points to the initial position
//   for (let i = 0; i < GRID_ROWS; i++) {
//     expand[i] = [];
//     for (let j = 0; j < GRID_COLS; j++) {
//       expand[i][j] = {
//           x: PADDING + (j / (GRID_COLS - 1)) * GRID_WIDTH,
//           y: PADDING + (i / (GRID_ROWS - 1)) * GRID_HEIGHT
//       };
//     }
//   }
  
//   // apply shift
//   for(let i = 0; i < GRID_ROWS; i++) {
//       expand[i][0].x -= shift;
//       expand[i][GRID_COLS - 1].x += shift;
  
//       expand[0][i].y -= shift;
//       expand[GRID_ROWS - 1][i].y += shift;
//   }

// });

// set up grid dimensions
const GRID_ROWS = 4;
const GRID_COLS = 4;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDING = 50;
const GRID_WIDTH = WIDTH - 2 * PADDING;
const GRID_HEIGHT = HEIGHT - 2 * PADDING;

let heartGrid = [];
let heartUserGrid = [];
let headGrid = [];
let headUserGrid = [];
let grids = [heartGrid, headGrid];
let userGrids = [heartUserGrid, headUserGrid];

function setControlPoints(controlPoints, userPoints, 
  padding = PADDING, width = GRID_WIDTH, height = GRID_HEIGHT, rows = GRID_ROWS, cols = GRID_COLS) {

    // set up grid control points
    for (let i = 0; i < rows; i++) {
    controlPoints[i] = [];
    init[i] = [];
    expand[i] = [];
    for (let j = 0; j < cols; j++) {
        controlPoints[i][j] = {
            // the undeformed position evenly spaces the control points across the grid dimensions
            x: padding + (j / (cols - 1)) * width,
            y: padding + (i / (rows - 1)) * height
        };
        init[i][j] = {
            x: padding + (j / (cols - 1)) * width,
            y: padding + (i / (rows - 1)) * height
        };
        expand[i][j] = {
            x: padding + (j / (cols - 1)) * width,
            y: padding + (i / (rows - 1)) * height
        };
    }
    }

    for(let i = 0; i < rows; i++) {
        expand[i][0].x -= shift;
        expand[i][cols - 1].x += shift;

        expand[0][i].y -= shift;
        expand[rows - 1][i].y += shift;
    }

    // set up user points
    for (let i = 0; i < rows; i++) {
      userPoints[i] = [];

      for (let j = 0; j < cols; j++) {
          if ( j === cols - 1 || i === rows - 1) {
              continue;
          }

          // get control point at (i,j) and (i+1,j+1)
          const p1 = controlPoints[i][j];
          const p2 = controlPoints[i + 1][j + 1];
          // get the midpoint of the two control points
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          // set the user point to the midpoint of the two control points
          userPoints[i][j] = {
              x: midX,
              y: midY
          };
      }
  }

}

// whether a point is currently being dragged
let dragging = null;

// Heart curve in parametric space [0, 1] x [0, 1]
function getHeartPoints(res = 200, shapePoints) {

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
    shapePoints.push(new DrawnPoint(updatedX, updatedY, gridCell[0], gridCell[1]));
  }
}

function getCirclePoints(res = 200, radius = 5, shapePoints) {
    
    for (let t = 0; t < 2 * Math.PI; t += 2 * Math.PI / res) {
        // compute the heart shape using the parametric equations
        const x = radius * Math.cos(t);
        const y = radius * Math.sin(t);
    
        // center the heart - add 0.5; normalize to [0,1] - the max value of x and y is 34
        let updatedX = 0.5 + x / 34;
        let updatedY = 0.5 - y / 34;
        // get the indices of the upper-left corner of the point's grid cell
        let gridCell = getCellIndices(updatedX, updatedY);
        // add the point to the heart array
        shapePoints.push(new DrawnPoint(updatedX, updatedY, gridCell[0], gridCell[1]));
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
function bilinearInterp(x, y, gridCell, controlPoints) {
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
function drawGrid(controlPoints, strokeStyle = "#999", fillStyle = "#333") {
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;
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

function drawUserPoints(userPoints, fillStyle = "blue") {
  ctx.fillStyle = fillStyle;

  for (let i = 0; i < userPoints.length; i++) {
      for (let j = 0; j < userPoints[i].length; j++) {
          const p = userPoints[i][j];

          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
          ctx.fill();
      }
  }
}

/**
 * Draw a shape using the boundary points given in an array
 * @param {DrawnPoint[]} shape 
 * @param {*} fillStyle 
 * @param {*} strokeStyle 
 * @param {*} controlPoints
 */
function drawShape(shape, fillStyle = "red", strokeStyle = "#660000", controlPoints) {
    // start drawing
    ctx.beginPath();
  
    // draw every heart point in its updated position
    for (let k = 0; k < shape.length; k++) {
      const drawnPt = shape[k];
      const p = bilinearInterp(drawnPt.x, drawnPt.y, [drawnPt.gridX, drawnPt.gridY], controlPoints);
      if (k === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
  
    // end and fill the heart shape
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}

// check if the mouse clicked on a control point
canvas.addEventListener("mousedown", (e) => {
    // get mouse position
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // compare mouse's position to every control point
    for (let k = 0; k < grids.length; k++) {
      for (let i = 0; i < GRID_ROWS; i++) {
        for (let j = 0; j < GRID_COLS; j++) {
          const p = grids[k][i][j];
        // if the distance is close enough, set the dragging variable to the control point's indices
          if (Math.hypot(mx - p.x, my - p.y) < 10) {
            dragging = { k, i, j, isControl: true };
          }
        }
      }
    }

    for (let k = 0; k < userGrids.length; k++) {
      for (let i = 0; i < userGrids[k].length; i++) {
        for (let j = 0; j < userGrids[k][i].length; j++) {
            const p = userGrids[k][i][j];
    
            // if the distance is close enough, set the dragging variable to the control point's indices
            if (Math.hypot(mx - p.x, my - p.y) < 10) {
                dragging = { k, i, j, isControl: false };
            }
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
      if (dragging.isControl) {
        grids[dragging.k][dragging.i][dragging.j].x = mx;
        grids[dragging.k][dragging.i][dragging.j].y = my;
      } else {

        // get previous user point location
        const prevX = userGrids[dragging.k][dragging.i][dragging.j].x;
        const prevY = userGrids[dragging.k][dragging.i][dragging.j].y;
        // get new user point location
        userGrids[dragging.k][dragging.i][dragging.j].x = mx;
        userGrids[dragging.k][dragging.i][dragging.j].y = my;

        // get change
        const dx = mx - prevX;
        const dy = my - prevY;
        // update the control points surrounding it based on the change in user point location
        grids[dragging.k][dragging.i][dragging.j].x += dx;
        grids[dragging.k][dragging.i][dragging.j].y += dy;
        grids[dragging.k][dragging.i + 1][dragging.j].x += dx;
        grids[dragging.k][dragging.i + 1][dragging.j].y += dy;
        grids[dragging.k][dragging.i][dragging.j + 1].x += dx;
        grids[dragging.k][dragging.i][dragging.j + 1].y += dy;
        grids[dragging.k][dragging.i + 1][dragging.j + 1].x += dx;
        grids[dragging.k][dragging.i + 1][dragging.j + 1].y += dy;
      }
    }
  });
  
  // if the mouse is released or leaves the canvas, stop dragging
  canvas.addEventListener("mouseup", () => dragging = null);
  canvas.addEventListener("mouseleave", () => dragging = null);

/*
 * Re-draws the heart and grid overtime
 */
function animate(timestamp) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawShape(heart, "red", "#660000", heartGrid);
  drawShape(circle, "darkblue", "#000066", heartGrid);
  drawShape(head, "black", "#000000", headGrid);

  if(isVisible) {
    drawGrid(heartGrid, "#C99", "#633");
    drawUserPoints(heartUserGrid, "#855");
    drawGrid(headGrid, "#CCF", "#335");
    drawUserPoints(headUserGrid, "#228");
  }

  // Update control points for animation
  //animateFunction(timestamp);

  window.requestAnimationFrame(animate);
}

setControlPoints(heartGrid, heartUserGrid, PADDING*6, GRID_WIDTH/2, GRID_HEIGHT/2);
setControlPoints(headGrid, headUserGrid, 10, GRID_WIDTH/2, GRID_HEIGHT/2);

// Precompute heart points
getHeartPoints(200, heart);

// Precompute head points
getCirclePoints(200, 15, head);

// Precompute circle points
getCirclePoints(200, 5, circle);

// first draw
window.requestAnimationFrame(animate);