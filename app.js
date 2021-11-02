document.addEventListener('DOMContentLoaded', () => {
	const grid = document.querySelector('.grid');
	let squares = Array.from(document.querySelectorAll('.grid div'));
	const scoreDisplay = document.querySelector('#score');
	const startBtn = document.querySelector('#start-button');
	const width = 10;
	let nextRandom = 0;
	let timerId;
	let score = 0;
	const colors = ['orange', 'red', 'purple', 'green', 'blue'];

	// Tetrominios
	const lTetromino = [
		[1, width + 1, width * 2 + 1, 2],
		[width, width + 1, width + 2, width * 2 + 2],
		[1, width + 1, width * 2 + 1, width * 2],
		[width, width * 2, width * 2 + 1, width * 2 + 2]
	];

	const zTetromino = [
		[0, width, width + 1, width * 2 + 1],
		[width + 1, width + 2, width * 2, width * 2 + 1],
		[0, width, width + 1, width * 2 + 1],
		[width + 1, width + 2, width * 2, width * 2 + 1]
	];

	const tTetromino = [
		[1, width, width + 1, width + 2],
		[1, width + 1, width + 2, width * 2 + 1],
		[width, width + 1, width + 2, width * 2 + 1],
		[1, width, width + 1, width * 2 + 1]
	];

	const oTetromino = [
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1]
	];

	const iTetromino = [
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3],
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3]
	];

	const theTetrominoes = [
		lTetromino,
		zTetromino,
		tTetromino,
		oTetromino,
		iTetromino
	];

	let currentPosition = 4;
	let currentRotation = 0;

	console.log(theTetrominoes[0][0]);

	// Seleccionar al azar un Tetromino y su primera rotación
	let random = Math.floor(Math.random() * theTetrominoes.length);
	let current = theTetrominoes[random][currentRotation];

	// Dibujar el Tetrominio
	function draw() {
		current.forEach(index => {
			squares[currentPosition + index].classList.add('tetromino');
			squares[currentPosition + index].style.backgroundColor = colors[random];
		});
	}

	// Desenvolver el Tetromino
	function undraw() {
		current.forEach(index => {
			squares[currentPosition + index].classList.remove('tetromino');
			squares[currentPosition + index].style.backgroundColor = '';
		});
	}

	// Asignar funciones a keyCodes
	function control(e) {
		if (e.keyCode === 37) {
			moveLeft();
		} else if (e.keyCode === 38) {
			rotate();
		} else if (e.keyCode === 39) {
			moveRight();
		} else if (e.keyCode === 40) {
			moveDown();
		}
	}
	document.addEventListener('keyup', control);

	// Funcion de desplazamiento hacia abajo
	function moveDown() {
		undraw();
		currentPosition += width;
		draw();
		freeze();
	}

	// Funcion de congelacion
	function freeze() {
		if (
			current.some(index =>
				squares[currentPosition + index + width].classList.contains('taken')
			)
		) {
			current.forEach(index =>
				squares[currentPosition + index].classList.add('taken')
			);
			// Iniciar un nuevo Tetrominio cayendo
			random = nextRandom;
			nextRandom = Math.floor(Math.random() * theTetrominoes.length);
			current = theTetrominoes[random][currentRotation];
			currentPosition = 4;
			draw();
			displayShape();
			addScore();
			gameOver();
		}
	}

	// Mueve el Tetromino a la izquierda, a menos que esté en el borde o haya un bloqueo
	function moveLeft() {
		undraw();
		const isAtLeftEdge = current.some(
			index => (currentPosition + index) % width === 0
		);
		if (!isAtLeftEdge) currentPosition -= 1;
		if (
			current.some(index =>
				squares[currentPosition + index].classList.contains('taken')
			)
		) {
			currentPosition += 1;
		}
		draw();
	}

	// Mover el Tetromino a la derecha, a menos que este en el borde o haya un bloqueo
	function moveRight() {
		undraw();
		const isAtRightEdge = current.some(
			index => (currentPosition + index) % width === width - 1
		);
		if (!isAtRightEdge) currentPosition += 1;
		if (
			current.some(index =>
				squares[currentPosition + index].classList.contains('taken')
			)
		) {
			currentPosition -= 1;
		}
		draw();
	}

	///FIJAR LA ROTACIÓN DE LOS TETROMINOS A LA ARISTA
	function isAtRight() {
		return current.some(index => (currentPosition + index + 1) % width === 0);
	}

	function isAtLeft() {
		return current.some(index => (currentPosition + index) % width === 0);
	}

	function checkRotatedPosition(P) {
		P = P || currentPosition; //Obtener la posición actual.  A continuacion, comproba si la pieza está cerca del lado izquierdo
		if ((P + 1) % width < 4) {
			//añadir 1 porque el índice de posición puede ser 1 menos que donde está la pieza (con la forma en que están indexados)
			if (isAtRight()) {
				// Utilizar la posición real para comprobar si se ha volcado a la derecha
				currentPosition += 1; // Si es así, añade uno para envolverlo de nuevo
				checkRotatedPosition(P); // Comprobar de nuevo.  Pasar la posición desde el principio, ya que el bloque largo podría necesitar moverse más.
			}
		} else if (P % width > 5) {
			if (isAtLeft()) {
				currentPosition -= 1;
				checkRotatedPosition(P);
			}
		}
	}

	// Rotar el Tetromino
	function rotate() {
		undraw();
		currentRotation++;
		if (currentRotation === current.length) {
			//if the current rotation gets to 4, make it go back to 0
			currentRotation = 0;
		}
		current = theTetrominoes[random][currentRotation];
		checkRotatedPosition();
		draw();
	}
	/////////

	// Mostrar el siguiente tetrominó en la pantalla de la mini-red
	const displaySquares = document.querySelectorAll('.mini-grid div');
	const displayWidth = 4;
	const displayIndex = 0;

	// Los Tetrominos sin rotaciones
	const upNextTetrominoes = [
		[1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
		[0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
		[1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
		[0, 1, displayWidth, displayWidth + 1], //oTetromino
		[1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] //iTetromino
	];

	// Mostrar la forma en la pantalla de la minirred
	function displayShape() {
		//remove any trace of a tetromino form the entire grid
		displaySquares.forEach(square => {
			square.classList.remove('tetromino');
			square.style.backgroundColor = '';
		});
		upNextTetrominoes[nextRandom].forEach(index => {
			displaySquares[displayIndex + index].classList.add('tetromino');
			displaySquares[displayIndex + index].style.backgroundColor =
				colors[nextRandom];
		});
	}

	// Añadir funcionalidad al botón
	startBtn.addEventListener('click', () => {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		} else {
			draw();
			timerId = setInterval(moveDown, 1000);
			nextRandom = Math.floor(Math.random() * theTetrominoes.length);
			displayShape();
		}
	});

	// Añadir puntuación
	function addScore() {
		for (let i = 0; i < 199; i += width) {
			const row = [
				i,
				i + 1,
				i + 2,
				i + 3,
				i + 4,
				i + 5,
				i + 6,
				i + 7,
				i + 8,
				i + 9
			];

			if (row.every(index => squares[index].classList.contains('taken'))) {
				score += 10;
				scoreDisplay.innerHTML = score;
				row.forEach(index => {
					squares[index].classList.remove('taken');
					squares[index].classList.remove('tetromino');
					squares[index].style.backgroundColor = '';
				});
				const squaresRemoved = squares.splice(i, width);
				squares = squaresRemoved.concat(squares);
				squares.forEach(cell => grid.appendChild(cell));
			}
		}
	}

	// Se terminó el juego
	function gameOver() {
		if (
			current.some(index =>
				squares[currentPosition + index].classList.contains('taken')
			)
		) {
			scoreDisplay.innerHTML = 'end';
			clearInterval(timerId);
		}
	}
});
