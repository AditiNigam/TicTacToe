
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const boardNote = document.getElementById("board-note");

const computerModeBtn = document.getElementById("computer-mode");
const twoPlayerModeBtn = document.getElementById("two-player-mode");
const restartBtn = document.getElementById("restart-btn");
const resetScoreBtn = document.getElementById("reset-score-btn");

const playerOneCard = document.getElementById("player-one-card");
const playerTwoCard = document.getElementById("player-two-card");

const playerOneName = document.getElementById("player-one-name");
const playerTwoName = document.getElementById("player-two-name");
const playerOneRole = document.getElementById("player-one-role");
const playerTwoRole = document.getElementById("player-two-role");
const playerOneTag = document.getElementById("player-one-tag");
const playerTwoTag = document.getElementById("player-two-tag");

const scoreOne = document.getElementById("score-one");
const scoreTwo = document.getElementById("score-two");
const scoreDraw = document.getElementById("score-draw");
const scoreOneLabel = document.getElementById("score-one-label");
const scoreTwoLabel = document.getElementById("score-two-label");
const scoreMode = document.getElementById("score-mode");

const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let mode = "computer";
let board = [];
let currentPlayer = "O";
let gameOver = false;
let computerTimer = null;

const scores = {
    computer: { O: 0, X: 0, draws: 0 },
    twoPlayer: { O: 0, X: 0, draws: 0 }
};

// Configure the selected game mode.
function changeMode(newMode) {
    clearTimeout(computerTimer);
    computerTimer = null;

    mode = newMode;

    computerModeBtn.classList.toggle(
        "selected", mode === "computer"
    );

    twoPlayerModeBtn.classList.toggle(
        "selected", mode === "twoPlayer"
    );

    if (mode === "computer") {
        playerOneName.textContent = "YOU";
        playerTwoName.textContent = "COMPUTER";

        playerOneRole.textContent = "Player 1";
        playerTwoRole.textContent = "Player 2";

        scoreOneLabel.textContent = "Your wins";
        scoreTwoLabel.textContent = "Computer wins";

        scoreMode.textContent = "VS COMPUTER";
        boardNote.style.visibility = "visible";
        boardNote.innerHTML =
            "<span>ⓘ</span> Computer starts in the center";
    } else {
        playerOneName.textContent = "PLAYER 1";
        playerTwoName.textContent = "PLAYER 2";

        playerOneRole.textContent = "Plays O";
        playerTwoRole.textContent = "Plays X";

        scoreOneLabel.textContent = "Player 1 wins";
        scoreTwoLabel.textContent = "Player 2 wins";

        scoreMode.textContent = "TWO PLAYERS";
        boardNote.style.visibility = "hidden";
    }

    updateScores();
    startGame();
}

// Begin a new round.
function startGame() {
    clearTimeout(computerTimer);
    computerTimer = null;

    board = Array(9).fill("");
    currentPlayer = "O";
    gameOver = false;

    // In solo mode, the computer occupies the center first.
    if (mode === "computer") {
        board[4] = "X";
    }

    cells.forEach((cell, index) => {
        cell.textContent = board[index];
        cell.className = "cell";
        cell.disabled = board[index] !== "";
    });

    if (mode === "computer") {
        cells[4].classList.add("x");
        statusText.textContent = "Your turn. Pick a square!";
    } else {
        statusText.textContent = "Player 1's turn. Play O!";
    }

    updateActivePlayer("O");
}

// Highlight the active player and update turn labels.
function updateActivePlayer(player) {
    playerOneCard.classList.toggle("active", player === "O");
    playerTwoCard.classList.toggle("active", player === "X");

    playerOneTag.textContent =
        player === "O" ? "YOUR TURN" : "WAITING";

    playerTwoTag.textContent =
        player === "X" ? "YOUR TURN" : "WAITING";

    if (mode === "twoPlayer") {
        playerOneTag.textContent =
            player === "O" ? "YOUR TURN" : "WAITING";

        playerTwoTag.textContent =
            player === "X" ? "YOUR TURN" : "WAITING";
    } else {
        playerOneTag.textContent =
            player === "O" ? "YOUR TURN" : "WAITING";

        playerTwoTag.textContent =
            player === "X" ? "THINKING..." : "WAITING";
    }
}

// Process a click on the board.
function makeMove(index) {
    if (gameOver || board[index] !== "") {
        return;
    }

    // The human cannot move during the computer's turn.
    if (mode === "computer" && currentPlayer !== "O") {
        return;
    }

    board[index] = currentPlayer;
    drawCell(index);

    const result = getWinner();

    if (result) {
        endGame(result);
        return;
    }

    if (board.every(square => square !== "")) {
        endGame("draw");
        return;
    }

    if (mode === "computer") {
        currentPlayer = "X";
        updateActivePlayer("X");
        statusText.textContent = "Computer is thinking...";

        // Keep a reference so the timer can be cancelled.
        computerTimer = setTimeout(() => {
            computerTimer = null;
            computerMove();
        }, 450);
    } else {
        currentPlayer = currentPlayer === "O" ? "X" : "O";

        updateActivePlayer(currentPlayer);

        statusText.textContent =
            currentPlayer === "O"
                ? "Player 1's turn. Play O!"
                : "Player 2's turn. Play X!";
    }
}

// Let the computer choose an available square.
function computerMove() {
    if (gameOver || mode !== "computer") {
        return;
    }

    const available = [];

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            available.push(i);
        }
    }

    if (available.length === 0) {
        endGame("draw");
        return;
    }

    const choice =
        available[Math.floor(Math.random() * available.length)];

    board[choice] = "X";
    drawCell(choice);

    const result = getWinner();

    if (result) {
        endGame(result);
        return;
    }

    if (board.every(square => square !== "")) {
        endGame("draw");
        return;
    }

    currentPlayer = "O";
    updateActivePlayer("O");
    statusText.textContent = "Your turn. Pick a square!";
}

// Update the visual board.
function drawCell(index) {
    const cell = cells[index];

    cell.textContent = board[index];
    cell.classList.add(board[index] === "O" ? "o" : "x");
    cell.disabled = true;
}

// Return the winning symbol and winning line, if any.
function getWinner() {
    for (const line of winningLines) {
        const [a, b, c] = line;

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {
            return {
                symbol: board[a],
                line: line
            };
        }
    }

    return null;
}

// Finish the current round.
function endGame(result) {
    gameOver = true;

    clearTimeout(computerTimer);
    computerTimer = null;

    cells.forEach(cell => {
        cell.disabled = true;
    });

    const currentScores = scores[mode];

    if (result === "draw") {
        currentScores.draws++;
        statusText.textContent = "It's a draw! Well played.";
        updateActivePlayer("");
    } else {
        result.line.forEach(index => {
            cells[index].classList.add("winner");
        });

        currentScores[result.symbol]++;

        if (mode === "computer") {
            statusText.textContent =
                result.symbol === "O"
                    ? "You win! Amazing move!"
                    : "Computer wins! Try again.";
        } else {
            statusText.textContent =
                result.symbol === "O"
                    ? "Player 1 wins! Congratulations!"
                    : "Player 2 wins! Congratulations!";
        }

        updateActivePlayer(result.symbol);
    }

    updateScores();
}

// Display the score for the selected mode.
function updateScores() {
    const currentScores = scores[mode];

    scoreOne.textContent = currentScores.O;
    scoreTwo.textContent = currentScores.X;
    scoreDraw.textContent = currentScores.draws;
}

// Reset all scores in both modes.
function resetScores() {
    scores.computer = { O: 0, X: 0, draws: 0 };
    scores.twoPlayer = { O: 0, X: 0, draws: 0 };

    updateScores();
    startGame();
}

// Connect buttons.
cells.forEach((cell, index) => {
    cell.addEventListener("click", () => makeMove(index));
});

computerModeBtn.addEventListener("click", () => {
    changeMode("computer");
});

twoPlayerModeBtn.addEventListener("click", () => {
    changeMode("twoPlayer");
});

restartBtn.addEventListener("click", startGame);
resetScoreBtn.addEventListener("click", resetScores);

// Start the application.
changeMode("computer");
