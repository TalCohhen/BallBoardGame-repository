var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/glue.jpg" />';

var gBoard;
var gGamerPos;
var gCountBall;
var gCollectCountBall;
var gElGameover;
var gInterval;


function initGame() {
	gGamerPos = {
		i: 2,
		j: 9
	};
	gBoard = buildBoard();
	renderBoard(gBoard);
	gCountBall = 2;
	gCollectCountBall = 0;
	startBallIntrvl()
}


function startBallIntrvl() {
	gInterval = setInterval(addBall, 3000);
}


function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)


	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = {
				type: FLOOR,
				gameElement: null
			};

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	board[0][5].type = FLOOR;
	board[9][5].type = FLOOR;
	board[5][0].type = FLOOR;
	board[5][11].type = FLOOR;

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;



	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({
				i: i,
				j: j
			})

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}


// Move the player to a specific location
function moveTo(i, j) {

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		(jAbsDiff === 11 && iAbsDiff === 0) ||
		(jAbsDiff === 0 && iAbsDiff === 9)) {

		if (targetCell.gameElement === BALL) {
			gCollectCountBall++
			renderCollectedBall();
			playCollectSound();
			console.log('Collecting!');
			checkEndGame();
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}
console.log(isBoardClean());

function checkEndGame() {
	if (gCollectCountBall === gCountBall) gameOver();
	else return;

}

function gameOver() {
	clearInterval(gInterval);
	gElGameover = document.querySelector('.game-over');
	gElGameover.style.display = 'block';
}

function restartGame() {
	gElGameover.style.display = 'none';
	var elBallCounter = document.querySelector('.collected span');
	elBallCounter.innerText = '0';

	initGame();
}

function addBall() {

	var randomI = getRandomInt(1, gBoard.length - 2);
	var randomJ = getRandomInt(1, gBoard[0].length - 2);

	if (gBoard[randomI][randomJ].gameElement === null) {
		gBoard[randomI][randomJ].gameElement = BALL;
		var ballRandPos = {
			i: randomI,
			j: randomJ
		}
		console.log(ballRandPos);
		renderCell(ballRandPos, BALL_IMG)
	}
	gCountBall++
}

function renderCollectedBall() {
	var elCollected = document.querySelector('span');
	elCollected.innerText = `${gCollectCountBall}`;
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {

	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			if (i === 5 && j === 0) j = 12
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			if (i === 5 && j === 11) j = -1
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			if (i === 0 && j === 5) i = 10
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			if (i === 9 && j === 5) i = -1
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
	// cell-2-5
}