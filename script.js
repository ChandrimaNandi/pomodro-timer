let time = 25 * 60;
let timer;
let isRunning = false;
let isBreak = false;

const timerDisplay = document.getElementById("timer");
const statusText = document.getElementById("status");

function updateDisplay() {
  const minutes = String(Math.floor(time / 60)).padStart(2, "0");
  const seconds = String(time % 60).padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timer = setInterval(() => {
    if (time > 0) {
      time--;
      updateDisplay();
    } else {
      clearInterval(timer);
      isRunning = false;
      isBreak = !isBreak;
      time = isBreak ? 5 * 60 : 25 * 60;
      statusText.textContent = isBreak ? "Break Time!" : "Focus Time!";
      updateDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isBreak = false;
  time = 25 * 60;
  statusText.textContent = "Focus Time";
  updateDisplay();
}

updateDisplay();
