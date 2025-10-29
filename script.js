// script.js — practice page logic
// This script is designed for the practice.html page.
// It handles beginner-friendly question generation (1–9), enter-to-check, timer, speed, pause/resume, and logging.

(() => {
  // Elements on practice page
  const questionEl = document.getElementById('q-text');
  const answerInput = document.getElementById('q-answer');
  const resultEl = document.getElementById('q-result');
  const btnAdd = document.getElementById('op-add');
  const btnSub = document.getElementById('op-sub');
  const btnMul = document.getElementById('op-mul');
  const btnDiv = document.getElementById('op-div');
  const btnCheck = document.getElementById('btn-check');
  const btnPause = document.getElementById('btn-pause');
  const timerEl = document.getElementById('stat-time');
  const correctEl = document.getElementById('stat-correct');
  const speedEl = document.getElementById('stat-speed');

  let currentOp = null;
  let currentAnswer = null;
  let started = false;
  let startTime = null;
  let timerInterval = null;
  let correctCount = 0;
  let totalCount = 0;
  let paused = false;
  let pauseRemaining = null;

  // beginner range: 1-9 unless changed
  const MIN = 1, MAX = 9;

  function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function genQuestion(op) {
    currentOp = op;
    if (!started) startSession();
    answerInput.value = '';
    resultEl.textContent = '';
    // generate easy numbers for beginners
    let a = rand(MIN, MAX);
    let b = rand(MIN, MAX);
    // simple adjustments:
    if (op === 'sub' && b > a) [a,b] = [b,a]; // keep non-negative
    if (op === 'div') {
      // make divisible sometimes, otherwise allow decimal but keep small
      b = rand(1, 9);
      a = b * rand(1, 4);
    }
    // set currentAnswer
    switch(op){
      case 'add': currentAnswer = a + b; break;
      case 'sub': currentAnswer = a - b; break;
      case 'mul': currentAnswer = a * b; break;
      case 'div':
        // keep one or two decimals for division
        currentAnswer = (a / b);
        // keep to 2 decimals but if it's integer show integer
        currentAnswer = Number.isInteger(currentAnswer) ? currentAnswer : Number(currentAnswer.toFixed(2));
        break;
    }
    questionEl.innerText = `${a} ${opSymbol(op)} ${b} = ?`;
    totalCount++;
  }

  function opSymbol(op){
    if (op==='add') return '+';
    if (op==='sub') return '−';
    if (op==='mul') return '×';
    if (op==='div') return '÷';
    return '?';
  }

  function startSession(){
    started = true;
    startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
  }

  function updateTimer(){
    if (!started || paused) return;
    const secs = Math.floor((Date.now() - startTime)/1000);
    timerEl.innerText = `${secs}s`;
    const speed = secs > 0 ? ((correctCount / secs) * 60).toFixed(1) : '0.0';
    speedEl.innerText = `${speed} Q/min`;
  }

  function checkAnswer(){
    const val = answerInput.value.trim();
    if (val === '') return;
    let user = Number(val);
    // Accept short float inputs for division if needed
    if (isNaN(user)) {
      resultEl.innerText = 'Please enter a valid number';
      resultEl.style.color = '#b91c1c';
      return;
    }
    // Compare with tolerance for floats
    let correct = false;
    if (typeof currentAnswer === 'number' && !Number.isInteger(currentAnswer)) {
      correct = Math.abs(user - currentAnswer) < 0.03; // tolerance
    } else {
      correct = user === currentAnswer;
    }
    if (correct) {
      correctCount++;
      resultEl.innerText = '✅ Correct';
      resultEl.style.color = '#0b6b3a';
    } else {
      resultEl.innerText = `❌ Wrong — correct: ${currentAnswer}`;
      resultEl.style.color = '#b91c1c';
    }
    correctEl.innerText = `${correctCount}/${totalCount}`;
    // prepare next question immediately for speed practice
    setTimeout(()=> {
      genQuestion(currentOp);
      answerInput.focus();
    }, 250);
  }

  function pauseToggle(){
    if (!started) return;
    if (!paused) {
      paused = true;
      btnPause.innerText = 'Resume';
      // freeze timer
      if (timerInterval) clearInterval(timerInterval);
      pauseRemaining = Date.now() - startTime;
    } else {
      paused = false;
      btnPause.innerText = 'Pause';
      // resume
      startTime = Date.now() - (pauseRemaining || 0);
      pauseRemaining = null;
      timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
    }
  }

  // keyboard: enter to check
  answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswer();
    }
  });

  // attach buttons
  btnAdd.addEventListener('click', ()=>genQuestion('add'));
  btnSub.addEventListener('click', ()=>genQuestion('sub'));
  btnMul.addEventListener('click', ()=>genQuestion('mul'));
  btnDiv.addEventListener('click', ()=>genQuestion('div'));
  btnCheck.addEventListener('click', checkAnswer);
  btnPause.addEventListener('click', pauseToggle);

  // Expose for console debugging (optional)
  window.practice = { genQuestion, checkAnswer, pauseToggle };

  // initialize UI (show a neutral welcome question)
  questionEl.innerText = 'Pick a mode (Addition, Subtraction, ...)';
})();
