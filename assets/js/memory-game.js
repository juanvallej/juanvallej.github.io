document.addEventListener("DOMContentLoaded", function () {
  // ----- Data source: at least 6 unique items (here: 12 emojis) -----
  const MG_ICONS = [
    "🍕", "🍔", "🍟", "🌭", "🍣", "🍩",
    "🍎", "🍌", "🍇", "🍓", "🥑", "🥐"
  ];

  // ----- DOM elements -----
  const boardEl = document.getElementById("mg-board");
  const movesEl = document.getElementById("mg-moves");
  const matchesEl = document.getElementById("mg-matches");
  const timerEl = document.getElementById("mg-timer");
  const difficultySelect = document.getElementById("mg-difficulty");
  const startBtn = document.getElementById("mg-start-btn");
  const restartBtn = document.getElementById("mg-restart-btn");
  const winMessageEl = document.getElementById("mg-win-message");
  const statusEl = document.getElementById("mg-status");
  const bestEasyEl = document.getElementById("mg-best-easy");
  const bestHardEl = document.getElementById("mg-best-hard");

  // ----- Game state -----
  let difficulty = "easy";         // "easy" or "hard"
  let flippedCards = [];           // currently flipped cards (max 2)
  let lockBoard = false;
  let moves = 0;
  let matches = 0;
  let totalPairs = 0;
  let gameStarted = false;

  // Timer
  let timerInterval = null;
  let secondsElapsed = 0;

  // Best results (per difficulty, by moves)
  const BEST_KEY_EASY = "mgBest_easy";
  const BEST_KEY_HARD = "mgBest_hard";
  let bestEasy = null;
  let bestHard = null;

  // ----- Init -----
  loadBestResults();
  updateBestDisplay();
  initBoard(); // crea el tablero según dificultad seleccionada
  updateStats();
  setStatus("Select difficulty and press Start to play.");

  // ----- Event listeners -----
  difficultySelect.addEventListener("change", function () {
    difficulty = difficultySelect.value;
    stopTimer();
    secondsElapsed = 0;
    gameStarted = false;
    restartBtn.disabled = true;
    updateStats();
    initBoard();
    setStatus("Difficulty changed. Press Start to begin a new game.");
  });

  startBtn.addEventListener("click", function () {
    startGame();
  });

  restartBtn.addEventListener("click", function () {
    restartGame();
  });

  // ----- Core game functions -----

  function startGame() {
    stopTimer();
    secondsElapsed = 0;
    moves = 0;
    matches = 0;
    gameStarted = true;
    restartBtn.disabled = false;
    initBoard();
    updateStats();
    startTimer();
    setStatus("Game started. Find all the pairs!");
  }

  function restartGame() {
    if (!gameStarted) {
      // Si no estaba empezado, trátalo como un start
      startGame();
      return;
    }
    stopTimer();
    secondsElapsed = 0;
    moves = 0;
    matches = 0;
    gameStarted = true;
    initBoard();
    updateStats();
    startTimer();
    setStatus("Game restarted. Good luck!");
  }

  function initBoard() {
    // Determine number of pairs per difficulty
    const pairsNeeded = difficulty === "easy" ? 6 : 12; // easy=6 pairs (12 cards), hard=12 pairs (24 cards)
    totalPairs = pairsNeeded;

    // Prepare icon set
    const iconsForGame = MG_ICONS.slice(0, pairsNeeded);

    // Create duplicated array and shuffle
    let deck = [];
    iconsForGame.forEach(function (icon, index) {
      deck.push({ id: index + "-a", icon: icon });
      deck.push({ id: index + "-b", icon: icon });
    });

    deck = shuffleArray(deck);

    // Reset board UI
    boardEl.innerHTML = "";
    boardEl.classList.remove("easy", "hard");
    boardEl.classList.add(difficulty === "easy" ? "easy" : "hard");
    winMessageEl.textContent = "";
    flippedCards = [];
    lockBoard = false;

    // Create cards dynamically
    deck.forEach(function (cardData) {
      const cardBtn = document.createElement("button");
      cardBtn.type = "button";
      cardBtn.className = "mg-card";
      cardBtn.dataset.icon = cardData.icon;
      cardBtn.dataset.id = cardData.id;
      cardBtn.setAttribute("aria-label", "Memory card");
      cardBtn.setAttribute("aria-disabled", "false");

      const inner = document.createElement("div");
      inner.className = "mg-card-inner";

      const front = document.createElement("div");
      front.className = "mg-card-front";
      front.textContent = "?";

      const back = document.createElement("div");
      back.className = "mg-card-back";
      back.textContent = cardData.icon;

      inner.appendChild(front);
      inner.appendChild(back);
      cardBtn.appendChild(inner);

      cardBtn.addEventListener("click", function () {
        handleCardClick(cardBtn);
      });

      boardEl.appendChild(cardBtn);
    });
  }

  function handleCardClick(cardEl) {
    if (!gameStarted) {
      return; // Solo se puede jugar tras pulsar Start
    }
    if (lockBoard) {
      return;
    }
    if (cardEl.classList.contains("flipped") || cardEl.classList.contains("matched")) {
      return;
    }

    cardEl.classList.add("flipped");
    flippedCards.push(cardEl);

    if (flippedCards.length === 1) {
      return;
    }

    // 2 cartas giradas
    if (flippedCards.length === 2) {
      moves++;
      updateStats();

      const first = flippedCards[0];
      const second = flippedCards[1];

      const isMatch = first.dataset.icon === second.dataset.icon;

      if (isMatch) {
        // Match!
        first.classList.add("matched");
        second.classList.add("matched");
        first.setAttribute("aria-disabled", "true");
        second.setAttribute("aria-disabled", "true");
        flippedCards = [];
        matches++;
        updateStats();

        if (matches === totalPairs) {
          handleWin();
        }
      } else {
        // No match -> flip back after delay
        lockBoard = true;
        setTimeout(function () {
          first.classList.remove("flipped");
          second.classList.remove("flipped");
          flippedCards = [];
          lockBoard = false;
        }, 1000);
      }
    }
  }

  function handleWin() {
    gameStarted = false;
    stopTimer();

    const timeString = formatTime(secondsElapsed);
    const message =
      "You win! 🎉 Moves: " + moves + " | Time: " + timeString;
    winMessageEl.textContent = message;

    // Check & update best result for this difficulty (fewer moves is better)
    if (difficulty === "easy") {
      if (bestEasy === null || moves < bestEasy) {
        bestEasy = moves;
        localStorage.setItem(BEST_KEY_EASY, String(moves));
        setStatus("New best score on Easy!");
      } else {
        setStatus("Well done! Try again to beat your best score.");
      }
    } else {
      if (bestHard === null || moves < bestHard) {
        bestHard = moves;
        localStorage.setItem(BEST_KEY_HARD, String(moves));
        setStatus("New best score on Hard!");
      } else {
        setStatus("Great! Try again to beat your best score.");
      }
    }

    updateBestDisplay();
  }

  // ----- Stats, timer, helpers -----

  function updateStats() {
    movesEl.textContent = String(moves);
    matchesEl.textContent = String(matches);
    timerEl.textContent = formatTime(secondsElapsed);
  }

  function startTimer() {
    stopTimer();
    timerInterval = window.setInterval(function () {
      secondsElapsed++;
      timerEl.textContent = formatTime(secondsElapsed);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval !== null) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = minutes < 10 ? "0" + minutes : String(minutes);
    const ss = seconds < 10 ? "0" + seconds : String(seconds);
    return mm + ":" + ss;
  }

  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function setStatus(text) {
    if (statusEl) {
      statusEl.textContent = text;
    }
  }

  function loadBestResults() {
    const be = localStorage.getItem(BEST_KEY_EASY);
    const bh = localStorage.getItem(BEST_KEY_HARD);

    if (be !== null && !isNaN(parseInt(be, 10))) {
      bestEasy = parseInt(be, 10);
    }
    if (bh !== null && !isNaN(parseInt(bh, 10))) {
      bestHard = parseInt(bh, 10);
    }
  }

  function updateBestDisplay() {
    bestEasyEl.textContent = bestEasy !== null ? bestEasy + " moves" : "–";
    bestHardEl.textContent = bestHard !== null ? bestHard + " moves" : "–";
  }
});
