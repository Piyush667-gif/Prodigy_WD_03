// Game State
const gameState = {
  board: Array(9).fill(""),
  currentPlayer: "X",
  gameMode: "", // 'friend' or 'computer'
  gameActive: true,
  scores: {
    player1: 0,
    player2: 0,
  },
}

// Winning combinations
const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
]

// DOM Elements
const modeSelection = document.getElementById("mode-selection")
const gameScreen = document.getElementById("game-screen")
const gameModeTitle = document.getElementById("game-mode-title")
const currentTurnElement = document.getElementById("current-turn")
const player1Name = document.getElementById("player1-name")
const player2Name = document.getElementById("player2-name")
const player1Score = document.getElementById("player1-score")
const player2Score = document.getElementById("player2-score")
const gameBoard = document.getElementById("game-board")
const resultModal = document.getElementById("result-modal")
const resultMessage = document.getElementById("result-message")

// Start Game Function
function startGame(mode) {
  gameState.gameMode = mode
  gameState.board = Array(9).fill("")
  gameState.currentPlayer = "X"
  gameState.gameActive = true

  // Update UI based on mode
  if (mode === "friend") {
    gameModeTitle.textContent = "Player vs Player"
    player1Name.textContent = "Player 1 (X)"
    player2Name.textContent = "Player 2 (O)"
    currentTurnElement.textContent = "Player 1's Turn"
  } else {
    gameModeTitle.textContent = "Player vs Computer"
    player1Name.textContent = "You (X)"
    player2Name.textContent = "Computer (O)"
    currentTurnElement.textContent = "Your Turn"
  }

  // Show game screen
  modeSelection.classList.add("hidden")
  gameScreen.classList.remove("hidden")

  // Clear board
  clearBoard()
  updateScoreDisplay()
}

// Make Move Function
function makeMove(index) {
  if (!gameState.gameActive || gameState.board[index] !== "") {
    return
  }

  // Make player move
  gameState.board[index] = gameState.currentPlayer
  updateCell(index, gameState.currentPlayer)

  // Check for win or draw
  if (checkWin()) {
    handleGameEnd("win")
    return
  }

  if (checkDraw()) {
    handleGameEnd("draw")
    return
  }

  // Switch player
  gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X"
  updateTurnDisplay()

  // Computer move if in computer mode
  if (gameState.gameMode === "computer" && gameState.currentPlayer === "O" && gameState.gameActive) {
    setTimeout(makeComputerMove, 500) // Delay for better UX
  }
}

// Computer AI Move
function makeComputerMove() {
  if (!gameState.gameActive) return

  const bestMove = getBestMove()
  if (bestMove !== -1) {
    gameState.board[bestMove] = "O"
    updateCell(bestMove, "O")

    // Check for win or draw
    if (checkWin()) {
      handleGameEnd("win")
      return
    }

    if (checkDraw()) {
      handleGameEnd("draw")
      return
    }

    // Switch back to player
    gameState.currentPlayer = "X"
    updateTurnDisplay()
  }
}

// AI Strategy - Easy Mode
function getBestMove() {
  // 1. Try to win
  for (let i = 0; i < 9; i++) {
    if (gameState.board[i] === "") {
      gameState.board[i] = "O"
      if (checkWinForPlayer("O")) {
        gameState.board[i] = "" // Reset
        return i
      }
      gameState.board[i] = "" // Reset
    }
  }

  // 2. Block player from winning
  for (let i = 0; i < 9; i++) {
    if (gameState.board[i] === "") {
      gameState.board[i] = "X"
      if (checkWinForPlayer("X")) {
        gameState.board[i] = "" // Reset
        return i
      }
      gameState.board[i] = "" // Reset
    }
  }

  // 3. Take center if available
  if (gameState.board[4] === "") {
    return 4
  }

  // 4. Take corners
  const corners = [0, 2, 6, 8]
  const availableCorners = corners.filter((i) => gameState.board[i] === "")
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)]
  }

  // 5. Take any available spot
  const availableMoves = gameState.board
    .map((cell, index) => (cell === "" ? index : null))
    .filter((val) => val !== null)

  return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1
}

// Check Win Function
function checkWin() {
  return checkWinForPlayer(gameState.currentPlayer)
}

function checkWinForPlayer(player) {
  return winningCombinations.some((combination) => {
    return combination.every((index) => gameState.board[index] === player)
  })
}

// Check Draw Function
function checkDraw() {
  return gameState.board.every((cell) => cell !== "") && !checkWin()
}

// Handle Game End
function handleGameEnd(result) {
  gameState.gameActive = false

  if (result === "win") {
    const winner = gameState.currentPlayer
    highlightWinningCells()

    if (gameState.gameMode === "friend") {
      const winnerName = winner === "X" ? "Player 1" : "Player 2"
      resultMessage.textContent = `🎉 ${winnerName} Wins!`

      if (winner === "X") {
        gameState.scores.player1++
      } else {
        gameState.scores.player2++
      }
    } else {
      if (winner === "X") {
        resultMessage.textContent = "🎉 You Win!"
        gameState.scores.player1++
      } else {
        resultMessage.textContent = "🤖 Computer Wins!"
        gameState.scores.player2++
      }
    }
  } else {
    resultMessage.textContent = "🤝 It's a Draw!"
  }

  updateScoreDisplay()
  setTimeout(() => {
    resultModal.classList.remove("hidden")
  }, 500)
}

// Highlight Winning Cells
function highlightWinningCells() {
  winningCombinations.forEach((combination) => {
    if (combination.every((index) => gameState.board[index] === gameState.currentPlayer)) {
      combination.forEach((index) => {
        const cell = document.querySelector(`[data-index="${index}"]`)
        cell.classList.add("winning")
      })
    }
  })
}

// Update Cell Display
function updateCell(index, player) {
  const cell = document.querySelector(`[data-index="${index}"]`)
  cell.textContent = player
  cell.classList.add(player.toLowerCase())
}

// Update Turn Display
function updateTurnDisplay() {
  if (gameState.gameMode === "friend") {
    const playerName = gameState.currentPlayer === "X" ? "Player 1" : "Player 2"
    currentTurnElement.textContent = `${playerName}'s Turn`
  } else {
    const turnText = gameState.currentPlayer === "X" ? "Your Turn" : "Computer's Turn"
    currentTurnElement.textContent = turnText
  }
}

// Update Score Display
function updateScoreDisplay() {
  player1Score.textContent = gameState.scores.player1
  player2Score.textContent = gameState.scores.player2
}

// Clear Board
function clearBoard() {
  const cells = document.querySelectorAll(".cell")
  cells.forEach((cell) => {
    cell.textContent = ""
    cell.classList.remove("x", "o", "winning")
  })
}

// Reset Board Function
function resetBoard() {
  gameState.board = Array(9).fill("")
  gameState.currentPlayer = "X"
  gameState.gameActive = true

  clearBoard()
  updateTurnDisplay()
  resultModal.classList.add("hidden")
}

// New Game Function
function newGame() {
  gameState.scores.player1 = 0
  gameState.scores.player2 = 0
  resetBoard()
  updateScoreDisplay()
}

// Back to Menu Function
function backToMenu() {
  gameScreen.classList.add("hidden")
  modeSelection.classList.remove("hidden")
  resultModal.classList.add("hidden")

  // Reset scores
  gameState.scores.player1 = 0
  gameState.scores.player2 = 0
}

// Close modal when clicking outside
resultModal.addEventListener("click", (e) => {
  if (e.target === resultModal) {
    resultModal.classList.add("hidden")
  }
})

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!resultModal.classList.contains("hidden")) {
      resultModal.classList.add("hidden")
    }
  }

  // Number keys 1-9 for quick moves
  if (e.key >= "1" && e.key <= "9") {
    const index = Number.parseInt(e.key) - 1
    if (gameState.gameActive && !gameScreen.classList.contains("hidden")) {
      makeMove(index)
    }
  }
})

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
  // Game is ready
  console.log("Tic Tac Toe Game Loaded! 🎮")
})

