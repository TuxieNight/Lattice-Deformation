/**
 * Stores a point's (x,y) position in the undeformed grid and a point's upper-left grid cell indices
 * 
 * @typedef {Object} DrawnPoint
 * @property {number} x - x coordinate in parametric space [0, 1]
 * @property {number} y - y coordinate in parametric space [0, 1]
 * @property {number} gridX - x coordinate of the upper-left corner of the grid cell containing the point
 * @property {number} gridY - y coordinate of the upper-left corner of the grid cell containing the point
 */
class DrawnPoint {
    constructor(x, y, gridX, gridY) {
        this.x = x;
        this.y = y;
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

/**
 * Stores a point's (x,y) position in the undeformed grid and a point's index of the dependent grid
 * @property {number} x - x coordinate in parametric space [0, 1]
 * @property {number} y - y coordinate in parametric space [0, 1]
 * @property {} indicesOfDependentGrid - the index used in userGrids and grids; determines if another grid is "attached" to this point; intended for user points
 */
class ControlPoint {
    constructor(point, indicesOfDependentGrid = []) {
        this.x = point.x;
        this.y = point.y;
        this.indicesOfDependentGrid = indicesOfDependentGrid;
    }
}

// DrawnPoints of the body component
let heart = [];
let stomach = [];

// DrawnPoints of the head component
let head = [];
let eyeR = [];
let eyeL = [];
let mouth = [];

// DrawnPoints of the arms
let armL = [];
let armR = [];

// stores the initial and expanded control points
let init_body = [];
let expand_body = [];
let init_head = [];
let expand_head = [];
let init_armL = [];
let expand_armL = [];
let init_armR = [];
let expand_armR = [];

// stores the initial and expanded UI points
let init_user_body = [];
let expand_user_body = [];
let init_user_head = [];
let expand_user_head = [];
let init_user_armL = [];
let expand_user_armL = [];
let init_user_armR = [];
let expand_user_armR = [];

let initGrids = [init_body, init_head, init_armL, init_armR];
let expandGrids = [expand_body, expand_head, expand_armL, expand_armR];

let userInitGrids = [init_user_body, init_user_head, init_user_armL, init_user_armR];
let userExpandGrids = [expand_user_body, expand_user_head, expand_user_armL, expand_user_armR];

// stores the direction of the animation
let animateFunction = expandPos;
// stores the start time of the animation
let startTime = 0;
// stores difference between the current time and the start time of the animation
// ensures the animation continues from the same point in time when the animation is paused and resumed
let timeDiff = 0;

// stores whether the animation is running or not
const animationButton = document.getElementById("animating");
// begin unchecked
animationButton.checked = false;
let isAnimating = false;

animationButton.addEventListener("click", () => {
    isAnimating = !isAnimating;
    if (isAnimating) {
        window.requestAnimationFrame(animate);
    } else {
        timeDiff = -timeDiff;
    }
});

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
    if (startTime == 0) {
        startTime = timestamp;
    }
    else if (timeDiff < 0) {
        // if the animation is not running, set the start time at the same point relative to the current time
        startTime = timestamp + timeDiff;
    }

    timeDiff = timestamp - startTime;

    // calculate how far along the animation should be based
    // start of animation occurs at u = 0, end of animation occurs at u = 1
    let u = (timeDiff) / 1000 * speed;
    let easedU = easeInOutCubic(Math.min(u, 1)); // Clamp to max 1

    // animation step is complete if u > 1; switch animation function
    if (u > 1) {
        animateFunction = returnToInitPos;
        startTime = 0;
        return;
    }

    // interpolate between current position and next position
    for (let k = 0; k < grids.length; k++) {
        // control
        for (let i = 0; i < grids[k].length; i++) {
            for (let j = 0; j < grids[k][i].length; j++) {
                grids[k][i][j].x = (1 - easedU) * initGrids[k][i][j].x + easedU * expandGrids[k][i][j].x;
                grids[k][i][j].y = (1 - easedU) * initGrids[k][i][j].y + easedU * expandGrids[k][i][j].y;
            }
        }
        // user
        for (let i = 0; i < userGrids[k].length; i++) {
            for (let j = 0; j < userGrids[k][i].length; j++) {
                let newX = (1 - easedU) * userInitGrids[k][i][j].x + easedU * userExpandGrids[k][i][j].x;
                let newY = (1 - easedU) * userInitGrids[k][i][j].y + easedU * userExpandGrids[k][i][j].y;

                changeControlWithUser(newX, newY, userGrids[k][i][j].x, userGrids[k][i][j].y, k == 2 || k == 3, k, i, j,
                    userGrids[k][i][j].indicesOfDependentGrid);
            }
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
    if (startTime == 0) {
        startTime = timestamp;
    }
    else if (timeDiff < 0) {
        // if the animation is not running, set the start time at the same point relative to the current time
        startTime = timestamp + timeDiff;
    }

    timeDiff = timestamp - startTime;

    // calculate how far along the animation should be based
    // start of animation occurs at u = 0, end of animation occurs at u = 1
    let u = (timeDiff) / 1000 * speed;
    let easedU = easeInOutCubic(Math.min(u, 1)); // Clamp to max 1

    // animation step is complete if u > 1; switch animation function
    if (u > 1) {
        animateFunction = expandPos;
        startTime = 0;
        return;
    }

    // interpolate between current position and next position
    for (let k = 0; k < grids.length; k++) {
        // control
        for (let i = 0; i < grids[k].length; i++) {
            for (let j = 0; j < grids[k][i].length; j++) {
                grids[k][i][j].x = (1 - easedU) * expandGrids[k][i][j].x + easedU * initGrids[k][i][j].x;
                grids[k][i][j].y = (1 - easedU) * expandGrids[k][i][j].y + easedU * initGrids[k][i][j].y;
            }
        }
        // user
        for (let i = 0; i < userGrids[k].length; i++) {
            for (let j = 0; j < userGrids[k][i].length; j++) {
                let newX = (1 - easedU) * userExpandGrids[k][i][j].x + easedU * userInitGrids[k][i][j].x;
                let newY = (1 - easedU) * userExpandGrids[k][i][j].y + easedU * userInitGrids[k][i][j].y;

                changeControlWithUser(newX, newY, userGrids[k][i][j].x, userGrids[k][i][j].y, k == 2 || k == 3, k, i, j,
                    userGrids[k][i][j].indicesOfDependentGrid);
            }
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

const headVisibilityButton = document.getElementById("headVisibility");
let isHeadVisible = true;

headVisibilityButton.addEventListener("click", () => {
    isHeadVisible = !isHeadVisible;
});

const bodyVisibilityButton = document.getElementById("bodyVisibility");
let isBodyVisible = true;

bodyVisibilityButton.addEventListener("click", () => {
    isBodyVisible = !isBodyVisible;
});

const leftArmVisibilityButton = document.getElementById("leftArmVisibility");
let isLeftArmVisible = true;

leftArmVisibilityButton.addEventListener("click", () => {
    isLeftArmVisible = !isLeftArmVisible;
});

const rightArmVisibilityButton = document.getElementById("rightArmVisibility");
let isRightArmVisible = true;

rightArmVisibilityButton.addEventListener("click", () => {
    isRightArmVisible = !isRightArmVisible;
});

// speed slider --- determines speed of animation
//const speedSlider = document.getElementById("speedSlider");
let speed = 1;//(Number)(speedSlider.value);

// speedSlider.addEventListener("input", () => {
//   speed = (Number)(speedSlider.value);
// });

// size slider --- determines size of heart (when expanded)
// const sizeSlider = document.getElementById("sizeSlider");
let shift = 5;//(Number)(sizeSlider.value);

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

let armLGrid = [];
let armLUserGrid = [];

let armRGrid = [];
let armRUserGrid = [];

let grids = [heartGrid, headGrid, armLGrid, armRGrid];
let userGrids = [heartUserGrid, headUserGrid, armLUserGrid, armRUserGrid];

function setControlPoints(controlPoints, userPoints, init, expand, init_user, expand_user,
  paddingX = PADDING, paddingY = PADDING, width = GRID_WIDTH, height = GRID_HEIGHT, 
  rows = GRID_ROWS, cols = GRID_COLS) {

    // set up grid control points
    for (let i = 0; i < rows; i++) {
        controlPoints[i] = [];
        init[i] = [];
        expand[i] = [];
        for (let j = 0; j < cols; j++) {
            controlPoints[i][j] = new ControlPoint({
                // the undeformed position evenly spaces the control points across the grid dimensions
                x: paddingX + (j / (cols - 1)) * width,
                y: paddingY + (i / (rows - 1)) * height
            });
            init[i][j] = new ControlPoint({
                x: paddingX + (j / (cols - 1)) * width,
                y: paddingY + (i / (rows - 1)) * height
            });
            expand[i][j] = new ControlPoint({
                x: paddingX + (j / (cols - 1)) * width,
                y: paddingY + (i / (rows - 1)) * height
            });
        }
    }

    // set up user points
    for (let i = 0; i < rows - 1; i++) {
      userPoints[i] = [];

      init_user[i] = [];
      expand_user[i] = [];

      for (let j = 0; j < cols - 1; j++) {

          // get control point at (i,j) and (i+1,j+1)
          const p1 = controlPoints[i][j];
          const p2 = controlPoints[i + 1][j + 1];
          // get the midpoint of the two control points
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          // set the user point to the midpoint of the two control points
          userPoints[i][j] = new ControlPoint({
              x: midX,
              y: midY
          });
          init_user[i][j] = new ControlPoint({
              x: midX,
              y: midY
          });
          expand_user[i][j] = new ControlPoint({
              x: midX,
              y: midY
          });
      }
  }

}

function giveWalk(init, expand, init_user, expand_user, rows = GRID_ROWS, cols = GRID_COLS) {
    // add breathing
    for(let i = 0; i < rows; i++) {
        expand[i][0].x -= shift;
        expand[i][cols - 1].x += shift;

        expand[0][i].y -= shift/2;
        expand[rows - 1][i].y += shift/2;
    }

    // for walking - move feet
    let walkSize = 40;
    init[0][0].y += walkSize;
    expand[0][cols - 1].y += walkSize;

    // move whole self up and down
    let bodyShift = 5;
    for(let i = 0; i < rows - 1; i++) {
        for(let j = 0; j < cols - 1; j++) {
            init_user[i][j].y -= bodyShift;
            expand_user[i][j].y += bodyShift;
        }
    }
}

function giveNod(init_user, expand_user, rows = GRID_ROWS, cols = GRID_COLS) {
    // move middle UI control point up and down (which has 1 less col and row than the grid)
    let midCols = Math.floor((cols - 1) / 2);
    let midRows = Math.floor((rows - 1) / 2);

    let nodSize = 5;

    init_user[midRows][midCols].y -= nodSize;
    expand_user[midRows][midCols].y += nodSize;
}

function setLeftArmMotion(init, expand, init_user, expand_user, rows = GRID_ROWS, cols = GRID_COLS) {
    // UI
    armLUserGrid[0][0].x = 117;
    armLUserGrid[0][0].y = 415;
    // point 1 (not draggable)
    armLGrid[0][0].x = 291;
    armLGrid[0][0].y = 245;
    // point 2 (not draggable)
    armLGrid[0][1].x = 280;
    armLGrid[0][1].y = 298;
    // point 3
    armLGrid[1][0].x = 52;
    armLGrid[1][0].y = 353;
    // point 4
    armLGrid[1][1].x = 131;
    armLGrid[1][1].y = 512;

    // update init and expand position
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            init[i][j].x = armLGrid[i][j].x;
            init[i][j].y = armLGrid[i][j].y;

            expand[i][j].x = armLGrid[i][j].x;
            expand[i][j].y = armLGrid[i][j].y;
        }
    }

    // update init and expand user position
    for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < cols - 1; j++) {
            init_user[i][j].x = armLUserGrid[i][j].x;
            init_user[i][j].y = armLUserGrid[i][j].y;

            expand_user[i][j].x = armLUserGrid[i][j].x;
            expand_user[i][j].y = armLUserGrid[i][j].y;
        }
    }

    // move middle UI control point up and down (which has 1 less col and row than the grid)
    let midCols = Math.floor((cols - 1) / 2);
    let midRows = Math.floor((rows - 1) / 2);

    let ySize = 15;
    let xSize = 3;

    init_user[midRows][midCols].y += ySize;
    expand_user[midRows][midCols].y -= ySize;

    init_user[midRows][midCols].x -= xSize;
    expand_user[midRows][midCols].x += xSize;
}

function setRightArmMotion(init, expand, init_user, expand_user, rows = GRID_ROWS, cols = GRID_COLS) {
    // UI
    armRUserGrid[0][0].x = 486;
    armRUserGrid[0][0].y = 432;
    // point 1 (not draggable)
    armRGrid[0][0].x = 305;
    armRGrid[0][0].y = 298;
    // point 2 (not draggable)
    armRGrid[0][1].x = 293;
    armRGrid[0][1].y = 247;
    // point 3
    armRGrid[1][0].x = 478;
    armRGrid[1][0].y = 528;
    // point 4
    armRGrid[1][1].x = 555;
    armRGrid[1][1].y = 376;

    // update init position
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            init[i][j].x = armRGrid[i][j].x;
            init[i][j].y = armRGrid[i][j].y;

            expand[i][j].x = armRGrid[i][j].x;
            expand[i][j].y = armRGrid[i][j].y;
        }
    }

    // update init and expand user position
    for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < cols - 1; j++) {
            init_user[i][j].x = armRUserGrid[i][j].x;
            init_user[i][j].y = armRUserGrid[i][j].y;

            expand_user[i][j].x = armRUserGrid[i][j].x;
            expand_user[i][j].y = armRUserGrid[i][j].y;
        }
    }

    // move middle UI control point up and down (which has 1 less col and row than the grid)
    let midCols = Math.floor((cols - 1) / 2);
    let midRows = Math.floor((rows - 1) / 2);

    let ySize = 15;
    let xSize = 3;

    init_user[midRows][midCols].y += ySize;
    expand_user[midRows][midCols].y -= ySize;

    init_user[midRows][midCols].x += xSize;
    expand_user[midRows][midCols].x -= xSize;
}

function makeUpsideDown(controlPoints, userPoints, init, expand, init_user, expand_user) {

    let length = controlPoints.length - 1;
    let length2 = controlPoints[0].length - 1;
    let x1 = controlPoints[0][0].x;
    let y1 = controlPoints[0][0].y;
    let x2 = controlPoints[length][length2].x;
    let y2 = controlPoints[length][length2].y;

    let midX = (x1 + x2) / 2;
    let midY = (y1 + y2) / 2;

    for (let i = 0; i < controlPoints.length; i++) {
        for (let j = 0; j < controlPoints[i].length; j++) {
            // negate the x and y coordinates of the control points
            controlPoints[i][j].x = controlPoints[i][j].x - midX;
            controlPoints[i][j].y = controlPoints[i][j].y - midY;
            controlPoints[i][j].x = -controlPoints[i][j].x;
            controlPoints[i][j].y = -controlPoints[i][j].y;
            controlPoints[i][j].x = controlPoints[i][j].x + midX;
            controlPoints[i][j].y = controlPoints[i][j].y + midY;
        }
    }
    for (let i = 0; i < userPoints.length; i++) {
        for (let j = 0; j < userPoints[i].length; j++) {
            // negate the x and y coordinates of the user points
            userPoints[i][j].x = userPoints[i][j].x - midX;
            userPoints[i][j].y = userPoints[i][j].y - midY;
            userPoints[i][j].x = -userPoints[i][j].x;
            userPoints[i][j].y = -userPoints[i][j].y;
            userPoints[i][j].x = userPoints[i][j].x + midX;
            userPoints[i][j].y = userPoints[i][j].y + midY;
        }
    }
    for (let i = 0; i < init.length; i++) {
        for (let j = 0; j < init[i].length; j++) {
            // negate the x and y coordinates of the user points
            init[i][j].x = init[i][j].x - midX;
            init[i][j].y = init[i][j].y - midY;
            init[i][j].x = -init[i][j].x;
            init[i][j].y = -init[i][j].y;
            init[i][j].x = init[i][j].x + midX;
            init[i][j].y = init[i][j].y + midY;
        }
    }
    for (let i = 0; i < expand.length; i++) {
        for (let j = 0; j < expand[i].length; j++) {
            // negate the x and y coordinates of the user points
            expand[i][j].x = expand[i][j].x - midX;
            expand[i][j].y = expand[i][j].y - midY;
            expand[i][j].x = -expand[i][j].x;
            expand[i][j].y = -expand[i][j].y;
            expand[i][j].x = expand[i][j].x + midX;
            expand[i][j].y = expand[i][j].y + midY;
        }
    }
    for (let i = 0; i < init_user.length; i++) {
        for (let j = 0; j < init_user[i].length; j++) {
            // negate the x and y coordinates of the user points
            init_user[i][j].x = init_user[i][j].x - midX;
            init_user[i][j].y = init_user[i][j].y - midY;
            init_user[i][j].x = -init_user[i][j].x;
            init_user[i][j].y = -init_user[i][j].y;
            init_user[i][j].x = init_user[i][j].x + midX;
            init_user[i][j].y = init_user[i][j].y + midY;
        }
    }
    for (let i = 0; i < expand_user.length; i++) {
        for (let j = 0; j < expand_user[i].length; j++) {
            // negate the x and y coordinates of the user points
            expand_user[i][j].x = expand_user[i][j].x - midX;
            expand_user[i][j].y = expand_user[i][j].y - midY;
            expand_user[i][j].x = -expand_user[i][j].x;
            expand_user[i][j].y = -expand_user[i][j].y;
            expand_user[i][j].x = expand_user[i][j].x + midX;
            expand_user[i][j].y = expand_user[i][j].y + midY;
        }
    }
}

// whether a point is currently being dragged
let dragging = null;

// Heart curve in parametric space [0, 1] x [0, 1]
function getHeartPoints(res = 200, shapePoints, controlPoints, xOffset = 0, yOffset = 0) {

  for (let t = 0; t < 2 * Math.PI; t += 2 * Math.PI / res) {
    // compute the heart shape using the parametric equations
	const x = 16 * Math.pow(Math.sin(t), 3) + xOffset;
	const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + yOffset;

    // center the heart - add 0.5; normalize to [0,1] - the max value of x and y is 34
    let updatedX = 0.5 + x / 34;
    let updatedY = 0.5 - y / 34;
    // get the indices of the upper-left corner of the point's grid cell
    let gridCell = getCellIndices(updatedX, updatedY, controlPoints);
    // add the point to the heart array
    shapePoints.push(new DrawnPoint(updatedX, updatedY, gridCell[0], gridCell[1]));
  }
}

function getUpsideDownHeartPoints(res = 200, shapePoints) {

    for (let t = 0; t < 2 * Math.PI; t += 2 * Math.PI / res) {
      // compute the heart shape using the parametric equations
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  
      // center the heart - add 0.5; normalize to [0,1] - the max value of x and y is 34
      let updatedX = 0.5 + x / 34;
      let updatedY = 0.5 - y / 34;
      // get the indices of the upper-left corner of the point's grid cell
      let gridCell = getCellIndices(-updatedX, -updatedY);
      // add the point to the heart array
      shapePoints.push(new DrawnPoint(-updatedX, -updatedY, gridCell[0], gridCell[1]));
    }
  }

function getCirclePoints(res = 200, radius = 5, shapePoints, controlPoints, xOffset = 0, yOffset = 0) {
    
    for (let t = 0; t < 2 * Math.PI; t += 2 * Math.PI / res) {
        // compute the heart shape using the parametric equations
        const x = radius * Math.cos(t) + xOffset;
        const y = radius * Math.sin(t) + yOffset;
    
        // center the heart - add 0.5; normalize to [0,1] - the max value of x and y is 34
        let updatedX = 0.5 + x / 34;
        let updatedY = 0.5 - y / 34;
        // get the indices of the upper-left corner of the point's grid cell
        let gridCell = getCellIndices(updatedX, updatedY, controlPoints);
        // add the point to the heart array
        shapePoints.push(new DrawnPoint(updatedX, updatedY, gridCell[0], gridCell[1]));
    }
}

function getEllipsePoints(res = 200, width = 5, height = 5, shapePoints, controlPoints, xOffset = 0, yOffset = 0) {
    for (let t = 0; t < 2 * Math.PI; t += 2 * Math.PI / res) {
        // compute the heart shape using the parametric equations
        const x = width * Math.cos(t) + xOffset;
        const y = height * Math.sin(t) + yOffset;
    
        // center the heart - add 0.5; normalize to [0,1] - the max value of x and y is 34
        let updatedX = 0.5 + x / 34;
        let updatedY = 0.5 - y / 34;
        // get the indices of the upper-left corner of the point's grid cell
        let gridCell = getCellIndices(updatedX, updatedY, controlPoints);
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

    let rows = controlPoints.length;
    let cols = controlPoints[0].length;
  
    // upper-left corner of the grid cell
    const x0 = controlPoints[i][j];
    // upper-right corner of the grid cell
    const x1 = controlPoints[i][j + 1];
    // lower-left corner of the grid cell
    const x2 = controlPoints[i + 1][j];
    // lower-right corner of the grid cell
    const x3 = controlPoints[i + 1][j + 1];
  
    // get the fraction within the grid cell
    const u = x * (cols - 1) - j;
    const v = y * (rows - 1) - i;
  
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
function getCellIndices(x, y, controlPoints) {

    let rows = controlPoints.length;
    let cols = controlPoints[0].length;

    const i = Math.floor(y * (rows - 1));
    const j = Math.floor(x * (cols - 1));
    return [Math.min(i, rows - 2), Math.min(j, cols - 2)];
}

/*
 * Draw the grid lines and control points
 */
function drawGrid(controlPoints, strokeStyle = "#999", fillStyle = "#333") {
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;

  let rows = controlPoints.length;
  let cols = controlPoints[0].length;

  for (let i = 0; i < rows; i++) {
	for (let j = 0; j < cols; j++) {
  	const p = controlPoints[i][j];

    // draw grid lines
  	ctx.beginPath();
  	if (j < cols - 1) {
    	const right = controlPoints[i][j + 1];
    	ctx.moveTo(p.x, p.y);
    	ctx.lineTo(right.x, right.y);
  	}
  	if (i < rows - 1) {
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

function changeControlWithUser(newX, newY, oldX, oldY, isElbow, movedk, movedi, movedj, dependentGrids) {
    // get change
    const dx = newX - oldX;
    const dy = newY - oldY;

    // update the user control point itself
    userGrids[movedk][movedi][movedj].x = newX;
    userGrids[movedk][movedi][movedj].y = newY;

    // do not change the elbow points of the arm grids
    if (!isElbow) {
        grids[movedk][movedi][movedj].x += dx;
        grids[movedk][movedi][movedj].y += dy;
        grids[movedk][movedi][movedj + 1].x += dx;
        grids[movedk][movedi][movedj + 1].y += dy;
    }

    grids[movedk][movedi + 1][movedj].x += dx;
    grids[movedk][movedi + 1][movedj].y += dy;

    grids[movedk][movedi + 1][movedj + 1].x += dx;
    grids[movedk][movedi + 1][movedj + 1].y += dy;

    if (!isElbow) {
        initGrids[movedk][movedi][movedj].x += dx;
        initGrids[movedk][movedi][movedj].y += dy;
        initGrids[movedk][movedi][movedj + 1].x += dx;
        initGrids[movedk][movedi][movedj + 1].y += dy;
    }

    initGrids[movedk][movedi + 1][movedj].x += dx;
    initGrids[movedk][movedi + 1][movedj].y += dy;
    initGrids[movedk][movedi + 1][movedj + 1].x += dx;
    initGrids[movedk][movedi + 1][movedj + 1].y += dy;

    if (!isElbow) {
        expandGrids[movedk][movedi][movedj].x += dx;
        expandGrids[movedk][movedi][movedj].y += dy;
        expandGrids[movedk][movedi][movedj + 1].x += dx;
        expandGrids[movedk][movedi][movedj + 1].y += dy;
    }

    expandGrids[movedk][movedi + 1][movedj].x += dx;
    expandGrids[movedk][movedi + 1][movedj].y += dy;
    expandGrids[movedk][movedi + 1][movedj + 1].x += dx;
    expandGrids[movedk][movedi + 1][movedj + 1].y += dy;

    // drag the dependent grid if it exists
    if (dependentGrids.length > 0) {

        for (let k = 0; k < dependentGrids.length; k++) {

            let dependentGrid = dependentGrids[k];

            for (let i = 0; i < userGrids[dependentGrid].length; i++) {
                for (let j = 0; j < userGrids[dependentGrid][i].length; j++) {
                    userGrids[dependentGrid][i][j].x += dx;
                    userGrids[dependentGrid][i][j].y += dy;
                }
            }

            for (let i = 0; i < grids[dependentGrid].length; i++) {
                for (let j = 0; j < grids[dependentGrid][i].length; j++) {
                    grids[dependentGrid][i][j].x += dx;
                    grids[dependentGrid][i][j].y += dy;
                }
            }

            for (let i = 0; i < initGrids[dependentGrid].length; i++) {
                for (let j = 0; j < initGrids[dependentGrid][i].length; j++) {
                    initGrids[dependentGrid][i][j].x += dx;
                    initGrids[dependentGrid][i][j].y += dy;
                }
            }

            for (let i = 0; i < expandGrids[dependentGrid].length; i++) {
                for (let j = 0; j < expandGrids[dependentGrid][i].length; j++) {
                    expandGrids[dependentGrid][i][j].x += dx;
                    expandGrids[dependentGrid][i][j].y += dy;
                }
            }

            for (let i = 0; i < userInitGrids[dependentGrid].length; i++) {
                for (let j = 0; j < userInitGrids[dependentGrid][i].length; j++) {
                    userInitGrids[dependentGrid][i][j].x += dx;
                    userInitGrids[dependentGrid][i][j].y += dy;
                }
            }

            for (let i = 0; i < userExpandGrids[dependentGrid].length; i++) {
                for (let j = 0; j < userExpandGrids[dependentGrid][i].length; j++) {
                    userExpandGrids[dependentGrid][i][j].x += dx;
                    userExpandGrids[dependentGrid][i][j].y += dy;
                }
            }
        }
        
    } 
}

// check if the mouse clicked on a control point
canvas.addEventListener("mousedown", (e) => {

    // can only start dragging if the animation is not running
    if (!isAnimating) {
        // get mouse position
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        // compare mouse's position to every control point
        for (let k = 0; k < grids.length; k++) {
        for (let i = 0; i < grids[k].length; i++) {
            for (let j = 0; j < grids[k][i].length; j++) {
            const p = grids[k][i][j];
            // if the distance is close enough, set the dragging variable to the control point's indices
            if (Math.hypot(mx - p.x, my - p.y) < 10) {
                dragging = { k, i, j, isControl: true, dependentGrid: grids[k][i][j].indicesOfDependentGrid };
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
                    dragging = { k, i, j, isControl: false, dependentGrid: userGrids[k][i][j].indicesOfDependentGrid };
                }
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

        // if the grid is an arm grid, ensure it is not the elbow points
        if ( dragging.k == 2 || dragging.k == 3) {
            // the elbow points are the first two points ([0][0] and [0][1])
            if ( dragging.i == 0) {
                return;
            }
        }

        grids[dragging.k][dragging.i][dragging.j].x = mx;
        grids[dragging.k][dragging.i][dragging.j].y = my;
        // Okay-ish code for allowing dragging to affect the animation
        // initGrids[dragging.k][dragging.i][dragging.j].x = mx;
        // initGrids[dragging.k][dragging.i][dragging.j].y = my;
        // expandGrids[dragging.k][dragging.i][dragging.j].x = mx;
        // expandGrids[dragging.k][dragging.i][dragging.j].y = my;
        // if(dragging.j == 0) {
        //     expandGrids[dragging.k][dragging.i][dragging.j].x -= shift;
        // }
        // else if (dragging.j == grids[dragging.k][dragging.i].length - 1) {
        //     expandGrids[dragging.k][dragging.i][dragging.j].x += shift;
        // }
        // if(dragging.i == 0) {
        //     expandGrids[dragging.k][dragging.i][dragging.j].y -= shift/2;
        // }
        // else if (dragging.i == grids[dragging.k].length - 1) {
        //     expandGrids[dragging.k][dragging.i][dragging.j].y += shift/2;
        // }
      } else {
        // get old positions
        const oldX = userGrids[dragging.k][dragging.i][dragging.j].x;
        const oldY = userGrids[dragging.k][dragging.i][dragging.j].y;

        // change control points based on the user point's position
        changeControlWithUser(mx, my, oldX, oldY, dragging.k == 2 || dragging.k == 3,
            dragging.k, dragging.i, dragging.j,
            dragging.dependentGrid);

        // get dx and dy
        let dx = mx - oldX;
        let dy = my - oldY;

        // if the body is moved, update all expand and init position
        if (dragging.dependentGrid.length > 0) {
            for(let i = 0; i < userInitGrids[dragging.k].length; i++) {
                for(let j = 0; j < userInitGrids[dragging.k][i].length; j++) {
                    if (userGrids[dragging.k][i][j].indicesOfDependentGrid.length <= 0) {
                        break;
                    }
                    userInitGrids[dragging.k][i][j].x += dx;
                    userExpandGrids[dragging.k][i][j].x += dx;
                    userInitGrids[dragging.k][i][j].y += dy;
                    userExpandGrids[dragging.k][i][j].y += dy;
                }
            }
        }
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

    if (isAnimating) {
        animateFunction(timestamp);
    }

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Body component
    drawShape(heart, "red", "#660000", heartGrid);
    drawShape(stomach, "darkblue", "#000066", heartGrid);

    // Head component
    drawShape(head, "lightblue", "#000000", headGrid);
    drawShape(eyeR, "black", "#000000", headGrid);
    drawShape(eyeL, "black", "#000000", headGrid);
    drawShape(mouth, "black", "#000000", headGrid);

    // Arm components
    drawShape(armL, "green", "#00066", armLGrid);
    drawShape(armR, "blue", "#000066", armRGrid);

    if(isVisible) {

        if (isBodyVisible) {
            drawGrid(heartGrid, "#C99", "#633");
            drawUserPoints(heartUserGrid, "#A7A");
        }

        if (isHeadVisible) {
            drawGrid(headGrid, "#CCF", "#335");
            drawUserPoints(headUserGrid, "#228");
        }

        if (isLeftArmVisible) {
            drawGrid(armLGrid, "#CCF", "#999");
            drawUserPoints(armLUserGrid, "#C33");
        }

        if (isRightArmVisible) {
            drawGrid(armRGrid, "#CCF", "#999");
            drawUserPoints(armRUserGrid, "#C33");
        }
    }

    // Update control points for animation
    //animateFunction(timestamp);

    window.requestAnimationFrame(animate);
}

setControlPoints(heartGrid, heartUserGrid, init_body, expand_body, init_user_body, expand_user_body, GRID_WIDTH/3, PADDING*4, GRID_WIDTH/2, GRID_HEIGHT*8/10, 2, 2);
giveWalk(init_body, expand_body, init_user_body, expand_user_body, 2, 2);

setControlPoints(headGrid, headUserGrid, init_head, expand_head, init_user_head, expand_user_head, GRID_WIDTH/3, 10, GRID_WIDTH/2, GRID_HEIGHT/2);
giveNod(init_user_head, expand_user_head);

// create the arm grids and change the coordinates to the desired values
setControlPoints(armLGrid, armLUserGrid, init_armL, expand_armL, init_user_armL, expand_user_armL, GRID_WIDTH*2/3, PADDING*6, 90, 150, 2, 2);
setLeftArmMotion(init_armL, expand_armL, init_user_armL, expand_user_armL, 2, 2);

setControlPoints(armRGrid, armRUserGrid, init_armR, expand_armR, init_user_armR, expand_user_armR, GRID_WIDTH/3, PADDING*6, 90, 150, 2, 2);
setRightArmMotion(init_armR, expand_armR, init_user_armR, expand_user_armR, 2, 2);


// Precompute points for the body component
// heart shape
getHeartPoints(200, heart, heartGrid);
makeUpsideDown(heartGrid, heartUserGrid, init_body, expand_body, init_user_body, expand_user_body);
heartUserGrid[heartUserGrid.length - 1][0].indicesOfDependentGrid = [1,2,3]; // make the user point at the point of the heart influence the head and arms
// stomach shape
getEllipsePoints(200, 5, 10, stomach, heartGrid);

// Precompute points for the head component
getCirclePoints(200, 15, head, headGrid, 0, 0); // head
getCirclePoints(200, 2, eyeR, headGrid, -5, 0); // right eye
getCirclePoints(200, 2, eyeL, headGrid, 5, 0); // left eye
getEllipsePoints(200, 5, 2, mouth, headGrid, 0, -10); // mouth

// Precompute points for the arms
getEllipsePoints(200, 8, 14, armL, armLGrid, 0, 0); // left arm
getEllipsePoints(200, 8, 14, armR, armRGrid, 0, 0); // right arm

// first draw
window.requestAnimationFrame(animate);