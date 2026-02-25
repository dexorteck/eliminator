/* ===== ELIMINATOR - Decision Games Hub ===== */

// ===== GAME DEFINITIONS =====
const GAMES = [
  { id: 'eliminator', name: 'Eliminator', icon: '🗑️', desc: 'Eliminate until 1 remains', minOptions: 2 },
  { id: 'keeper', name: 'Keeper', icon: '💎', desc: 'Keep until 1 remains', minOptions: 2 },
  { id: 'wheel', name: 'Spin Wheel', icon: '🎡', desc: 'Let chance decide', minOptions: 2 },
  { id: 'coin', name: 'Coin Flip', icon: '🪙', desc: 'Heads or tails (2 options)', minOptions: 2, maxOptions: 2 },
  { id: 'dice', name: 'Dice', icon: '🎲', desc: 'Roll the dice (up to 6)', minOptions: 2, maxOptions: 6 },
  { id: 'random', name: 'Random Pick', icon: '🎯', desc: 'Instant choice', minOptions: 2 },
  { id: 'blind', name: 'Blind Shuffle', icon: '🃏', desc: 'Shuffle & pick a card', minOptions: 2 },
  { id: 'timer', name: '5 Seconds', icon: '⏱️', desc: 'Decide before time runs out', minOptions: 2 },
  { id: 'bracket', name: 'Battle Royale', icon: '🏆', desc: 'Tournament mode', minOptions: 2 },
  { id: 'blindDecision', name: 'Blind Decision', icon: '🙈', desc: 'Commit first, reveal after', minOptions: 2 }
];

// ===== XP & LEVELS =====
const XP_PER_DECISION = 10;
const XP_PER_GAME = 5;
const XP_STREAK_BONUS = 3;
const XP_QUEST_REWARD = 50;
const LEVELS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000]; // XP thresholds

// ===== UNLOCKABLE THEMES =====
const THEMES = [
  { id: 'dark', name: 'Dark', level: 0 },
  { id: 'light', name: 'Light', level: 1 },
  { id: 'ocean', name: 'Ocean', level: 3 },
  { id: 'sunset', name: 'Sunset', level: 5 },
  { id: 'forest', name: 'Forest', level: 7 },
  { id: 'midnight', name: 'Midnight Purple', level: 9 }
];

// ===== WEEKLY QUESTS =====
function getWeekKey() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().slice(0, 10);
}

function getQuestsForWeek() {
  const week = getWeekKey();
  return [
    { id: 'q1', desc: 'Make 5 decisions (annoy the Monster)', target: 5, type: 'decisions', progress: 0, xp: 50 },
    { id: 'q2', desc: 'Try 3 different games', target: 3, type: 'games', progress: 0, xp: 50 },
    { id: 'q3', desc: 'Streak 2+ days (Monster hates consistency)', target: 1, type: 'streak', progress: 0, xp: 75 }
  ];
}

// ===== CATEGORIES =====
const CATEGORIES = {
  custom: [],
  food: ['Pizza', 'Sushi', 'Hamburger', 'Tacos', 'Pasta', 'Salad', 'Ramen', 'BBQ'],
  watch: ['Netflix', 'YouTube', 'Movie theater', 'Documentary', 'TV show', 'Stand-up comedy'],
  do: ['Work out', 'Read', 'Sleep', 'Walk', 'Gaming', 'Drawing', 'Cooking', 'Meditation'],
  travel: ['Beach', 'Mountains', 'City', 'Countryside', 'Museum', 'Park', 'Café'],
  weekend: ['Brunch', 'Hike', 'Sleep in', 'Clean', 'Side project', 'Call family', 'Road trip']
};

// ===== PERSONALITY & HUMOR =====
const WIN_MESSAGES = [
  "Overthinking Monster: defeated. 🎯",
  "That took 12 seconds. Your record. 👏",
  "Decision made. Now actually do it. ✨",
  "One less thing to overthink. You're welcome.",
  "Done. The Monster is crying in a corner.",
  "Your future self just high-fived you. 🚀",
  "Boom. Decided. Living your best life.",
  "The Monster didn't see that coming.",
  "Analysis paralysis: avoided. Legend."
];

const MONSTER_MESSAGES = [
  "The Overthinking Monster hates when you decide fast. Let's annoy it.",
  "Every decision weakens the Monster. Keep going.",
  "The Monster is shaking. It thought you'd never pick.",
  "You're doing great. The Monster is getting nervous.",
  "One more decision and the Monster might just leave.",
  "The Monster can't believe you're still deciding. Good."
];

const QUICK_DECISIONS = [
  { label: "Yes or No?", options: ["Yes", "No"] },
  { label: "Pizza or Sushi?", options: ["Pizza", "Sushi"] },
  { label: "Netflix or Go out?", options: ["Netflix", "Go out"] },
  { label: "Coffee or Tea?", options: ["Coffee", "Tea"] },
  { label: "Nap or Exercise?", options: ["Nap", "Exercise"] },
  { label: "Cook or Order?", options: ["Cook", "Order"] },
  { label: "Early or Night owl?", options: ["Early bird", "Night owl"] },
  { label: "Save or Spend?", options: ["Save", "Spend"] },
  { label: "Text or Call?", options: ["Text", "Call"] }
];

const FUNNY_TOASTS = {
  saved: ["Saved! The Monster can't steal it now.", "List saved. You're basically organized now.", "Saved. Future you says thanks."],
  quest: ["Quest done! The Monster is furious.", "Nice. The Monster didn't expect that.", "Another quest crushed. Legend."],
  firstTime: "First decision! The Monster didn't stand a chance. 🎉",
  levelUp: "Level up! The Monster is packing its bags. 🎉"
};

// ===== STATE =====
let state = {
  options: [],
  currentGame: null,
  stats: {
    decisions: 0,
    gamesPlayed: 0,
    optionsEliminated: 0,
    gamesUsedThisWeek: new Set()
  },
  history: [],
  achievements: {},
  lastDecisionDate: null,
  streak: 0,
  xp: 0,
  savedCategories: [],
  weeklyQuests: null,
  weeklyQuestsWeek: null,
  settings: {
    theme: 'dark',
    confetti: true
  }
};

// ===== DOM REFS =====
const views = {};
const getView = (id) => document.getElementById(`view-${id}`);
const showView = (id) => {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const view = getView(id);
  if (view) view.classList.add('active');
  const navBtn = document.querySelector(`[data-view="${id === 'eliminator' || id === 'keeper' ? 'setup' : id}"]`);
  if (navBtn) navBtn.classList.add('active');
};

// ===== STORAGE =====
function loadState() {
  try {
    const saved = localStorage.getItem('eliminator-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.stats = { ...state.stats, ...parsed.stats };
      state.stats.gamesUsedThisWeek = new Set(parsed.stats?.gamesUsedThisWeek || []);
      state.history = parsed.history || [];
      state.achievements = parsed.achievements || {};
      state.settings = { ...state.settings, ...parsed.settings };
      state.lastDecisionDate = parsed.lastDecisionDate || null;
      state.streak = parsed.streak || 0;
      state.xp = parsed.xp || 0;
      state.savedCategories = parsed.savedCategories || [];
      state.weeklyQuests = parsed.weeklyQuests || null;
      state.weeklyQuestsWeek = parsed.weeklyQuestsWeek || null;
    }
  } catch (e) {}
  if (!state.weeklyQuests || state.weeklyQuestsWeek !== getWeekKey()) {
    state.weeklyQuests = getQuestsForWeek();
    state.weeklyQuestsWeek = getWeekKey();
    state.stats.gamesUsedThisWeek = new Set();
  }
}

function saveState() {
  try {
    const toSave = { ...state.stats };
    toSave.gamesUsedThisWeek = [...(state.stats.gamesUsedThisWeek || [])];
    localStorage.setItem('eliminator-state', JSON.stringify({
      stats: toSave,
      history: state.history.slice(-50),
      achievements: state.achievements,
      settings: state.settings,
      lastDecisionDate: state.lastDecisionDate,
      streak: state.streak,
      xp: state.xp,
      savedCategories: state.savedCategories,
      weeklyQuests: state.weeklyQuests,
      weeklyQuestsWeek: state.weeklyQuestsWeek
    }));
  } catch (e) {}
}

// ===== XP & LEVEL =====
function addXP(amount, reason) {
  state.xp += amount;
  const prevLevel = getLevel(state.xp - amount);
  const newLevel = getLevel(state.xp);
  if (newLevel > prevLevel) toast(`Level ${newLevel}! ` + FUNNY_TOASTS.levelUp);
  updateXPBar();
}

function getLevel(xp) {
  let level = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i]) return i + 1;
  }
  return 1;
}

function getXPForNextLevel() {
  const lvl = getLevel(state.xp);
  return LEVELS[lvl] || LEVELS[LEVELS.length - 1] * 2;
}

function getXPProgress() {
  const lvl = getLevel(state.xp);
  const current = LEVELS[lvl - 1] || 0;
  const next = LEVELS[lvl] || current + 1000;
  return { current: state.xp - current, needed: next - current };
}

function updateXPBar() {
  const bar = document.getElementById('xpFill');
  const levelEl = document.getElementById('levelNum');
  const xpText = document.getElementById('xpText');
  const previewEl = document.getElementById('xpPreview');
  if (!bar) return;
  const lvl = getLevel(state.xp);
  levelEl.textContent = lvl;
  const { current, needed } = getXPProgress();
  const pct = Math.min(100, (current / needed) * 100);
  bar.style.width = pct + '%';
  xpText.textContent = `${state.xp} XP`;
  const nextTheme = THEMES.find(t => t.level > lvl);
  if (previewEl) {
    previewEl.textContent = nextTheme
      ? `Next: ${nextTheme.name} at Lv.${nextTheme.level}`
      : 'All themes unlocked!';
  }
}

// ===== STREAK =====
function updateStreak() {
  const today = new Date().toDateString();
  const last = state.lastDecisionDate;
  if (!last) {
    state.streak = 1;
  } else {
    const lastDate = new Date(last);
    const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return;
    if (diffDays === 1) state.streak++;
    else state.streak = 1;
  }
  state.lastDecisionDate = today;
}

// ===== TOAST =====
function toast(message, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = 'toast' + (isError ? ' error' : '');
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

// ===== CONFETTI (simple canvas) =====
function fireConfetti() {
  if (!state.settings.confetti) return;
  const container = document.getElementById('confetti');
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#ff6b4a', '#4ade80', '#fbbf24', '#60a5fa', '#a78bfa'];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.7) * 15,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.vx *= 0.98;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    frame++;
    if (frame < 120) requestAnimationFrame(animate);
    else canvas.remove();
  }
  animate();
}

// ===== NAVIGATION =====
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    if (view === 'setup') {
      state.options = [];
      document.getElementById('optionsInput').value = '';
      document.querySelector('.category-tab.active')?.classList.remove('active');
      document.querySelector('[data-category="custom"]')?.classList.add('active');
    }
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    getView(view)?.classList.add('active');
    if (view === 'stats') { renderStats(); renderInsights(); }
    if (view === 'home') renderHome();
    if (view === 'quests') renderQuests();
    if (view === 'setup') renderSavedCategories();
    if (view === 'settings') { renderThemeSelect(); renderUnlockables(); }
  });
});

// ===== CATEGORIES =====
document.querySelectorAll('.category-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.category;
    const opts = CATEGORIES[cat];
    document.getElementById('optionsInput').value = opts.length ? opts.join('\n') : '';
  });
});

// ===== GAME PICKER =====
document.getElementById('startBtn').addEventListener('click', () => {
  const input = document.getElementById('optionsInput').value.trim();
  state.options = input.split('\n').map(o => o.trim()).filter(o => o);
  if (state.options.length < 2) {
    toast('Need at least 2 options. The Monster is not impressed.', true);
    return;
  }
  state.options = [...new Set(state.options)];
  document.getElementById('gamePicker').classList.remove('hidden');
  renderGamePicker();
});

document.getElementById('closePicker').addEventListener('click', () => {
  document.getElementById('gamePicker').classList.add('hidden');
});

function renderGamePicker() {
  const grid = document.getElementById('gamesPickerGrid');
  grid.innerHTML = GAMES.filter(g => {
    if (g.maxOptions && state.options.length > g.maxOptions) return false;
    return state.options.length >= g.minOptions;
  }).map(g => `
    <button class="game-picker-item" data-game="${g.id}">
      <span class="icon">${g.icon}</span>
      <div>
        <strong>${g.name}</strong>
        <div class="desc">${g.desc}</div>
      </div>
    </button>
  `).join('');
  grid.querySelectorAll('.game-picker-item').forEach(btn => {
    btn.addEventListener('click', () => {
      startGame(btn.dataset.game);
      document.getElementById('gamePicker').classList.add('hidden');
    });
  });
}

function startGame(gameId) {
  state.currentGame = gameId;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  getView(gameId)?.classList.add('active');
  initGame(gameId);
}

// ===== INIT GAMES =====
function initGame(gameId) {
  switch (gameId) {
    case 'eliminator': initEliminator(); break;
    case 'keeper': initKeeper(); break;
    case 'wheel': initWheel(); break;
    case 'coin': initCoin(); break;
    case 'dice': initDice(); break;
    case 'random': initRandom(); break;
    case 'blind': initBlind(); break;
    case 'timer': initTimer(); break;
    case 'bracket': initBracket(); break;
    case 'blindDecision': initBlindDecision(); break;
  }
}

// ===== ELIMINATOR =====
let elimOptions = [];
let lastEliminated = null;

function initEliminator() {
  elimOptions = [...state.options];
  lastEliminated = null;
  showEliminatorPair();
}

function showEliminatorPair() {
  const undoBtn = document.getElementById('undoElimBtn');
  if (undoBtn) undoBtn.style.visibility = lastEliminated ? 'visible' : 'hidden';
  if (elimOptions.length === 1) {
    endGame(elimOptions[0]);
    return;
  }
  const shuffled = [...elimOptions].sort(() => Math.random() - 0.5);
  const [a, b] = [shuffled[0], shuffled[1]];
  document.getElementById('roundInfo').textContent = `${elimOptions.length} left`;
  const btnA = document.getElementById('optionA');
  const btnB = document.getElementById('optionB');
  btnA.textContent = a;
  btnA.dataset.value = a;
  btnA.classList.remove('eliminated');
  btnB.textContent = b;
  btnB.dataset.value = b;
  btnB.classList.remove('eliminated');
}

document.getElementById('undoElimBtn')?.addEventListener('click', () => {
  if (lastEliminated) {
    elimOptions.push(lastEliminated);
    lastEliminated = null;
    state.stats.optionsEliminated--;
    showEliminatorPair();
    toast('Undone. Monster is confused.');
  }
});

document.getElementById('skipElimBtn')?.addEventListener('click', () => {
  showEliminatorPair();
  toast('New pair. Still can\'t decide? Press Skip again.');
});

function eliminateOption(v) {
  const btn = v === document.getElementById('optionA').dataset.value ? document.getElementById('optionA') : document.getElementById('optionB');
  if (!v || !btn) return;
  lastEliminated = v;
  btn.classList.add('eliminated');
  setTimeout(() => {
    elimOptions = elimOptions.filter(o => o !== v);
    state.stats.optionsEliminated++;
    showEliminatorPair();
  }, 400);
}

document.getElementById('optionA')?.addEventListener('click', () => eliminateOption(document.getElementById('optionA').dataset.value));
document.getElementById('optionB')?.addEventListener('click', () => eliminateOption(document.getElementById('optionB').dataset.value));

// ===== KEEPER =====
let keeperOptions = [];
function initKeeper() {
  keeperOptions = [...state.options];
  showKeeperPair();
}

function showKeeperPair() {
  if (keeperOptions.length === 1) {
    endGame(keeperOptions[0]);
    return;
  }
  const shuffled = [...keeperOptions].sort(() => Math.random() - 0.5);
  const [a, b] = [shuffled[0], shuffled[1]];
  document.getElementById('keeperRoundInfo').textContent = `${keeperOptions.length} left`;
  const btnA = document.getElementById('keeperA');
  const btnB = document.getElementById('keeperB');
  btnA.textContent = a;
  btnA.dataset.value = a;
  btnB.textContent = b;
  btnB.dataset.value = b;
}

document.getElementById('keeperA')?.addEventListener('click', () => {
  const keep = document.getElementById('keeperA').dataset.value;
  keeperOptions = [keep];
  showKeeperPair();
});
document.getElementById('keeperB')?.addEventListener('click', () => {
  const keep = document.getElementById('keeperB').dataset.value;
  keeperOptions = [keep];
  showKeeperPair();
});

document.getElementById('skipKeeperBtn')?.addEventListener('click', () => {
  showKeeperPair();
  toast('New pair. Take your time.');
});

// ===== WHEEL =====
const WHEEL_COLORS = ['#ff6b4a', '#4ade80', '#60a5fa', '#a78bfa', '#fbbf24', '#f472b6'];
let wheelSpinning = false;

function initWheel() {
  const canvas = document.getElementById('wheelCanvas');
  canvas.style.transform = 'rotate(0deg)';
  const ctx = canvas.getContext('2d');
  const opts = state.options;
  const n = opts.length;
  canvas.width = 280;
  canvas.height = 280;

  function draw() {
    ctx.clearRect(0, 0, 280, 280);
    const cx = 140, cy = 140, r = 130;
    const slice = (2 * Math.PI) / n;
    opts.forEach((opt, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, i * slice, (i + 1) * slice);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx + Math.cos(i * slice + slice / 2) * 90, cy + Math.sin(i * slice + slice / 2) * 90);
      ctx.rotate(i * slice + slice / 2);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Space Grotesk';
      ctx.fillText(opt.length > 12 ? opt.slice(0, 10) + '…' : opt, -40, 5);
      ctx.restore();
    });
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a24';
    ctx.fill();
  }
  draw();
  state.wheelDraw = draw;
}

document.getElementById('spinBtn')?.addEventListener('click', () => {
  if (wheelSpinning) return;
  wheelSpinning = true;
  const canvas = document.getElementById('wheelCanvas');
  const opts = state.options;
  const winnerIdx = Math.floor(Math.random() * opts.length);
  const slice = 360 / opts.length;
  const targetAngle = 360 * 5 + (360 - winnerIdx * slice - slice / 2);
  let current = 0;
  const duration = 4000;
  const start = performance.now();

  function spin(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    current = targetAngle * ease;
    canvas.style.transform = `rotate(${current}deg)`;
    if (progress < 1) requestAnimationFrame(spin);
    else {
      wheelSpinning = false;
      setTimeout(() => endGame(opts[winnerIdx]), 200);
    }
  }
  requestAnimationFrame(spin);
});

// ===== COIN =====
function initCoin() {
  if (state.options.length !== 2) {
    toast('Coin flip works with exactly 2 options!', true);
    startGame('eliminator');
    return;
  }
  document.getElementById('coinLabelA').textContent = state.options[0];
  document.getElementById('coinLabelB').textContent = state.options[1];
  document.getElementById('coin').classList.remove('flipping');
}

document.getElementById('flipBtn')?.addEventListener('click', () => {
  const coin = document.getElementById('coin');
  coin.classList.remove('flipping');
  void coin.offsetWidth;
  coin.classList.add('flipping');
  const winner = Math.random() < 0.5 ? state.options[0] : state.options[1];
  setTimeout(() => endGame(winner), 1000);
});

// ===== DICE =====
function initDice() {
  if (state.options.length > 6) {
    state.options = state.options.slice(0, 6);
  }
  document.getElementById('dice').textContent = '?';
}

document.getElementById('rollBtn')?.addEventListener('click', () => {
  const diceEl = document.getElementById('dice');
  diceEl.classList.add('rolling');
  const winner = state.options[Math.floor(Math.random() * state.options.length)];
  setTimeout(() => {
    diceEl.classList.remove('rolling');
    diceEl.textContent = state.options.indexOf(winner) + 1;
    setTimeout(() => endGame(winner), 500);
  }, 600);
});

// ===== RANDOM =====
function initRandom() {
  document.getElementById('randomResult').textContent = '?';
}

document.getElementById('pickBtn')?.addEventListener('click', () => {
  const el = document.getElementById('randomResult');
  const container = document.getElementById('randomShuffle');
  container.classList.add('shuffling');
  el.textContent = state.options[Math.floor(Math.random() * state.options.length)];
  let i = 0;
  const iv = setInterval(() => {
    el.textContent = state.options[Math.floor(Math.random() * state.options.length)];
    i++;
    if (i > 8) {
      clearInterval(iv);
      container.classList.remove('shuffling');
      const winner = el.textContent;
      setTimeout(() => endGame(winner), 300);
    }
  }, 100);
});

// ===== BLIND =====
function initBlind() {
  const container = document.getElementById('blindCards');
  container.innerHTML = state.options.map((opt, i) =>
    `<div class="blind-card" data-index="${i}" data-value="${opt.replace(/"/g, '&quot;')}">?</div>`
  ).join('');
  container.querySelectorAll('.blind-card').forEach(card => {
    card.addEventListener('click', () => {
      const val = card.dataset.value;
      card.classList.add('revealed');
      card.textContent = val;
      setTimeout(() => endGame(val), 300);
    });
  });
}

document.getElementById('shuffleBlindBtn')?.addEventListener('click', () => {
  const container = document.getElementById('blindCards');
  const cards = [...container.querySelectorAll('.blind-card')];
  cards.forEach((c, i) => {
    c.classList.remove('revealed');
    c.textContent = '?';
    c.style.setProperty('--shuf-x', (i % 3) - 1);
    c.style.setProperty('--shuf-r', i % 2 === 0 ? 1 : -1);
  });
  container.classList.add('blind-shuffling');
  const shuffled = fisherYatesShuffle([...state.options]);
  setTimeout(() => {
    container.classList.remove('blind-shuffling');
    container.innerHTML = '';
    shuffled.forEach((opt) => {
      const card = document.createElement('div');
      card.className = 'blind-card';
      card.dataset.value = opt;
      card.textContent = '?';
      card.addEventListener('click', () => {
        card.classList.add('revealed');
        card.textContent = opt;
        setTimeout(() => endGame(opt), 300);
      });
      container.appendChild(card);
    });
  }, 500);
});

function fisherYatesShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== TIMER =====
let timerOptions = [];
let timerInterval;
let timeLeft = 5;

function initTimer() {
  timerOptions = [...state.options];
  document.getElementById('startTimerBtn').style.display = 'block';
  document.querySelector('.options-row').style.display = 'none';
  document.getElementById('timerDisplay').textContent = '5';
  document.getElementById('timerDisplay').classList.remove('urgent');
}

document.getElementById('startTimerBtn')?.addEventListener('click', () => {
  document.getElementById('startTimerBtn').style.display = 'none';
  document.querySelector('.options-row').style.display = 'flex';
  showTimerPair();
  timeLeft = 5;
  const disp = document.getElementById('timerDisplay');
  disp.textContent = '5';
  disp.classList.remove('urgent');
  timerInterval = setInterval(() => {
    timeLeft--;
    disp.textContent = timeLeft;
    if (timeLeft <= 2) disp.classList.add('urgent');
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      const winner = timerOptions[Math.floor(Math.random() * timerOptions.length)];
      endGame(winner);
    }
  }, 1000);
});

function showTimerPair() {
  if (timerOptions.length === 1) {
    clearInterval(timerInterval);
    endGame(timerOptions[0]);
    return;
  }
  const [a, b] = [...timerOptions].sort(() => Math.random() - 0.5).slice(0, 2);
  const btnA = document.getElementById('timerA');
  const btnB = document.getElementById('timerB');
  btnA.textContent = a;
  btnA.dataset.value = a;
  btnB.textContent = b;
  btnB.dataset.value = b;
}

document.getElementById('timerA')?.addEventListener('click', () => {
  clearInterval(timerInterval);
  const v = document.getElementById('timerA').dataset.value;
  timerOptions = timerOptions.filter(o => o !== v);
  showTimerPair();
  timeLeft = 5;
  document.getElementById('timerDisplay').textContent = '5';
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timerDisplay').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      const winner = timerOptions[Math.floor(Math.random() * timerOptions.length)];
      endGame(winner);
    }
  }, 1000);
});
document.getElementById('timerB')?.addEventListener('click', () => {
  clearInterval(timerInterval);
  const v = document.getElementById('timerB').dataset.value;
  timerOptions = timerOptions.filter(o => o !== v);
  showTimerPair();
  timeLeft = 5;
  document.getElementById('timerDisplay').textContent = '5';
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timerDisplay').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      const winner = timerOptions[Math.floor(Math.random() * timerOptions.length)];
      endGame(winner);
    }
  }, 1000);
});

// ===== BLIND DECISION =====
function initBlindDecision() {
  document.getElementById('blindDecisionCommit').classList.remove('hidden');
  document.getElementById('blindDecisionResult').classList.add('hidden');
}

document.getElementById('blindDecisionCommitBtn')?.addEventListener('click', () => {
  const winner = state.options[Math.floor(Math.random() * state.options.length)];
  document.getElementById('blindDecisionCommit').classList.add('hidden');
  document.getElementById('blindDecisionResult').classList.remove('hidden');
  document.getElementById('blindDecisionWinner').textContent = winner;
});

document.getElementById('blindDecisionAcceptBtn')?.addEventListener('click', () => {
  const winner = document.getElementById('blindDecisionWinner').textContent;
  endGame(winner);
});

// ===== BRACKET =====
let bracketWinners = [];

function initBracket() {
  bracketWinners = [...state.options].sort(() => Math.random() - 0.5);
  showBracketPair();
}

function showBracketPair() {
  if (bracketWinners.length === 1) {
    endGame(bracketWinners[0]);
    return;
  }
  const [a, b] = bracketWinners.slice(0, 2);
  const btnA = document.getElementById('bracketA');
  const btnB = document.getElementById('bracketB');
  btnA.textContent = a;
  btnA.dataset.value = a;
  btnB.textContent = b;
  btnB.dataset.value = b;
}

function pickBracketWinner(winner) {
  const loser = winner === document.getElementById('bracketA').dataset.value
    ? document.getElementById('bracketB').dataset.value
    : document.getElementById('bracketA').dataset.value;
  bracketWinners = bracketWinners.filter(o => o !== loser);
  showBracketPair();
}

document.getElementById('bracketA')?.addEventListener('click', () => pickBracketWinner(document.getElementById('bracketA').dataset.value));
document.getElementById('bracketB')?.addEventListener('click', () => pickBracketWinner(document.getElementById('bracketB').dataset.value));

// ===== END GAME =====
function endGame(winner) {
  state.stats.decisions++;
  state.stats.gamesPlayed++;
  if (state.stats.gamesUsedThisWeek) state.stats.gamesUsedThisWeek.add(state.currentGame);
  updateStreak();

  let xpEarned = XP_PER_DECISION + XP_PER_GAME;
  if (state.streak > 1) xpEarned += XP_STREAK_BONUS;
  addXP(xpEarned);

  state.history.unshift({
    winner,
    mode: state.currentGame,
    date: new Date().toISOString(),
    optionsCount: state.options.length
  });
  checkAchievements();
  updateQuests();
  saveState();
  document.getElementById('winnerText').textContent = winner;
  document.getElementById('winnerMode').textContent = GAMES.find(g => g.id === state.currentGame)?.name || '';
  document.getElementById('winnerMotivation').textContent = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
  if (state.stats.decisions === 1) toast(FUNNY_TOASTS.firstTime);
  fireConfetti();
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  getView('winner').classList.add('active');
}

// ===== ACHIEVEMENTS =====
const ACHIEVEMENTS = [
  { id: 'first', name: 'First Blood', icon: '🎉', check: () => state.stats.decisions >= 1 },
  { id: 'ten', name: 'Monster Slayer', icon: '🔥', check: () => state.stats.decisions >= 10 },
  { id: 'fifty', name: 'Decision Machine', icon: '⭐', check: () => state.stats.decisions >= 50 },
  { id: 'variety', name: 'Explorer', icon: '🌍', check: () => {
    const modes = new Set(state.history.slice(0, 20).map(h => h.mode));
    return modes.size >= 5;
  }},
  { id: 'eliminator', name: 'Elimination Master', icon: '🗑️', check: () => state.stats.optionsEliminated >= 20 },
  { id: 'streak3', name: 'On Fire', icon: '📅', check: () => state.streak >= 3 },
  { id: 'streak7', name: 'Unstoppable', icon: '💪', check: () => state.streak >= 7 }
];

function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (!state.achievements[a.id] && a.check()) state.achievements[a.id] = true;
  });
}

// ===== QUESTS =====
function updateQuests() {
  if (!state.weeklyQuests) state.weeklyQuests = getQuestsForWeek();
  const weekStart = new Date(state.weeklyQuestsWeek || getWeekKey());
  weekStart.setHours(0, 0, 0, 0);
  state.weeklyQuests.forEach(q => {
    if (q.completed) return;
    if (q.type === 'decisions') {
      const count = state.history.filter(h => new Date(h.date) >= weekStart).length;
      q.progress = Math.min(count, q.target);
      if (q.progress >= q.target) { q.completed = true; addXP(q.xp); toast(FUNNY_TOASTS.quest[Math.floor(Math.random() * FUNNY_TOASTS.quest.length)] + ` +${q.xp} XP`); return; }
    } else if (q.type === 'games') {
      const count = state.stats.gamesUsedThisWeek?.size || 0;
      q.progress = Math.min(count, q.target);
      if (q.progress >= q.target) { q.completed = true; addXP(q.xp); toast(FUNNY_TOASTS.quest[Math.floor(Math.random() * FUNNY_TOASTS.quest.length)] + ` +${q.xp} XP`); return; }
    } else if (q.type === 'streak') {
      q.progress = state.streak >= 2 ? 1 : 0;
      if (q.progress >= q.target) { q.completed = true; addXP(q.xp); toast(FUNNY_TOASTS.quest[Math.floor(Math.random() * FUNNY_TOASTS.quest.length)] + ` +${q.xp} XP`); return; }
    }
  });
  saveState();
}

// ===== SHARE =====
document.getElementById('shareBtn')?.addEventListener('click', () => {
  const text = `I just decided: ${document.getElementById('winnerText').textContent}! 🙈 Try Eliminator - beats overthinking every time`;
  if (navigator.share) {
    navigator.share({
      title: 'Eliminator',
      text
    }).catch(() => {});
  }
  navigator.clipboard?.writeText(text).then(() => toast('Copied. Go annoy your friends.'));
});

document.getElementById('playAgainBtn')?.addEventListener('click', () => {
  startGame(state.currentGame);
});

document.getElementById('newGameBtn')?.addEventListener('click', () => {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-view="setup"]').classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  getView('setup').classList.add('active');
  document.getElementById('optionsInput').value = state.options.join('\n');
  renderSavedCategories();
});

// ===== SAVED CATEGORIES =====
function renderSavedCategories() {
  const el = document.getElementById('savedCategories');
  if (!el) return;
  if (!state.savedCategories?.length) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `
    <div class="saved-cats-label">Saved lists:</div>
    <div class="saved-cats-list">
      ${state.savedCategories.map((c, i) => `
        <button class="saved-cat-btn" data-index="${i}">${c.name}</button>
      `).join('')}
    </div>
  `;
  el.querySelectorAll('.saved-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = state.savedCategories[parseInt(btn.dataset.index)];
      document.getElementById('optionsInput').value = cat.options.join('\n');
    });
  });
}

document.getElementById('saveCategoryBtn')?.addEventListener('click', () => {
  const input = document.getElementById('optionsInput').value.trim();
  const opts = input.split('\n').map(o => o.trim()).filter(o => o);
  if (opts.length < 2) {
    toast('2+ options needed. Even the Monster knows that.', true);
    return;
  }
  const name = prompt('Category name:', 'My list');
  if (!name?.trim()) return;
  state.savedCategories = state.savedCategories || [];
  state.savedCategories.push({ name: name.trim(), options: opts });
  saveState();
  renderSavedCategories();
  toast(FUNNY_TOASTS.saved[Math.floor(Math.random() * FUNNY_TOASTS.saved.length)]);
});

// ===== QUESTS RENDER =====
function renderQuests() {
  const el = document.getElementById('questsList');
  if (!el) return;
  if (!state.weeklyQuests) state.weeklyQuests = getQuestsForWeek();
  updateQuests();
  el.innerHTML = state.weeklyQuests.map(q => `
    <div class="quest-item ${q.completed ? 'completed' : ''}">
      <div class="quest-desc">${q.desc}</div>
      <div class="quest-progress">
        <div class="quest-bar"><div class="quest-fill" style="width: ${(q.progress / q.target) * 100}%"></div></div>
        <span>${q.progress}/${q.target}</span>
      </div>
      <span class="quest-xp">+${q.xp} XP</span>
    </div>
  `).join('');
}

// ===== INSIGHTS =====
function renderInsights() {
  const byDay = [0,0,0,0,0,0,0];
  const byGame = {};
  state.history.forEach(h => {
    const d = new Date(h.date);
    byDay[d.getDay()]++;
    byGame[h.mode] = (byGame[h.mode] || 0) + 1;
  });
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const maxDay = Math.max(...byDay, 1);
  document.getElementById('insightByDay').innerHTML = `
    <h4>Decisions by day</h4>
    <div class="chart-bars">
      ${byDay.map((v, i) => `
        <div class="chart-bar-wrap">
          <div class="chart-bar" style="height: ${(v / maxDay) * 100}%"></div>
          <span class="chart-label">${dayNames[i]}</span>
          <span class="chart-value">${v}</span>
        </div>
      `).join('')}
    </div>
  `;
  const gameEntries = Object.entries(byGame).sort((a,b) => b[1] - a[1]);
  const maxGame = Math.max(...gameEntries.map(([,v]) => v), 1);
  document.getElementById('insightByGame').innerHTML = `
    <h4>Top games</h4>
    <div class="chart-list">
      ${gameEntries.slice(0, 5).map(([mode, count]) => `
        <div class="chart-row">
          <span>${GAMES.find(g => g.id === mode)?.name || mode}</span>
          <div class="chart-bar-h"><div style="width: ${(count / maxGame) * 100}%"></div></div>
          <span>${count}</span>
        </div>
      `).join('') || '<p class="empty-hint">No data yet. Decisions = insights. Go decide something.</p>'}
    </div>
  `;
}

// ===== THEMES (unlockable) =====
function renderThemeSelect() {
  const sel = document.getElementById('themeSelect');
  if (!sel) return;
  const level = getLevel(state.xp);
  const opts = ['<option value="system"' + (state.settings.theme === 'system' ? ' selected' : '') + '>System (auto)</option>'];
  opts.push(...THEMES.filter(t => level >= t.level).map(t => `
    <option value="${t.id}" ${state.settings.theme === t.id ? 'selected' : ''}>${t.name}${t.level > 1 ? ' (Lv.' + t.level + ')' : ''}</option>
  `));
  sel.innerHTML = opts.join('');
}

function applyTheme(themeId) {
  const effective = themeId === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : themeId;
  document.documentElement.dataset.theme = effective;
}

function renderUnlockables() {
  const el = document.getElementById('unlockablesList');
  if (!el) return;
  const lvl = getLevel(state.xp);
  el.innerHTML = THEMES.map(t => `
    <div class="unlockable-item ${lvl >= t.level ? 'unlocked' : 'locked'}">
      <span class="unlockable-icon">${lvl >= t.level ? '✓' : '🔒'}</span>
      <span class="unlockable-name">${t.name}</span>
      <span class="unlockable-level">Lv.${t.level}${t.level === 0 ? ' (free)' : ''}</span>
    </div>
  `).join('');
}

function initThemeSelect() {
  const sel = document.getElementById('themeSelect');
  if (!sel) return;
  sel.addEventListener('change', (e) => {
    state.settings.theme = e.target.value;
    applyTheme(e.target.value);
    saveState();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.settings.theme === 'system') applyTheme('system');
  });
}

// ===== STATS (renderStats) =====
function renderStats() {
  document.getElementById('statCards').innerHTML = `
    <div class="stat-card"><div class="value">${state.stats.decisions}</div><div class="label">Decisions</div></div>
    <div class="stat-card"><div class="value">${state.stats.gamesPlayed}</div><div class="label">Games played</div></div>
    <div class="stat-card"><div class="value">${state.stats.optionsEliminated}</div><div class="label">Eliminated</div></div>
  `;
  document.getElementById('streakCard').innerHTML = state.streak > 0 ? `
    <div class="streak-display">
      <span class="streak-fire">🔥</span>
      <span><strong>${state.streak}</strong> day streak — Keep deciding!</span>
    </div>
  ` : `
    <div class="streak-display streak-empty">Make a decision today to start your streak!</div>
  `;
  document.getElementById('achievements').innerHTML = `
    <h3>Achievements</h3>
    ${ACHIEVEMENTS.map(a => `
      <div class="achievement ${state.achievements[a.id] ? '' : 'locked'}">
        <span class="icon">${a.icon}</span>
        <span>${a.name} ${state.achievements[a.id] ? '✓' : ''}</span>
      </div>
    `).join('')}
  `;
  document.getElementById('historyList').innerHTML = state.history.slice(0, 15).map(h => `
    <li>
      <span><strong>${h.winner}</strong><span class="mode">${GAMES.find(g => g.id === h.mode)?.name || h.mode}</span></span>
    </li>
  `).join('') || '<li class="empty-hint">No decisions yet. The Monster is winning. Do something about it.</li>';
}

// ===== HOME =====
function renderHome() {
  const monsterText = document.getElementById('monsterText');
  if (monsterText) {
    const idx = Math.min(Math.floor(state.stats.decisions / 5), MONSTER_MESSAGES.length - 1);
    monsterText.textContent = MONSTER_MESSAGES[idx];
  }
  const quickEl = document.getElementById('quickButtons');
  if (quickEl) {
    quickEl.innerHTML = QUICK_DECISIONS.map((q, i) => `
      <button class="quick-btn" data-idx="${i}">${q.label}</button>
    `).join('');
    quickEl.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = QUICK_DECISIONS[parseInt(btn.dataset.idx)];
        state.options = q.options;
        document.getElementById('gamePicker').classList.remove('hidden');
        renderGamePicker();
      });
    });
  }
  const streakEl = document.getElementById('dailyStreak');
  streakEl.innerHTML = state.streak > 0 ? `
    <div class="streak-banner">
      <span class="streak-icon">🔥</span>
      <span><strong>${state.streak}</strong> day streak — decide today to keep the Monster crying!</span>
    </div>
  ` : state.stats.decisions > 0 ? `
    <div class="streak-banner streak-call">
      <span>Start a streak — annoy the Monster daily!</span>
    </div>
  ` : '';
  document.getElementById('statsPreview').innerHTML = `
    <div class="stat-mini"><div class="value">${state.stats.decisions}</div><div class="label">Decisions</div></div>
    <div class="stat-mini"><div class="value">${Object.keys(state.achievements).length}</div><div class="label">Achievements</div></div>
    ${state.streak > 0 ? `<div class="stat-mini streak-mini"><div class="value">${state.streak}🔥</div><div class="label">Day streak</div></div>` : ''}
  `;
  document.getElementById('gamesGrid').innerHTML = GAMES.map(g => `
    <button class="game-card" data-goto="${g.id}">
      <div class="icon">${g.icon}</div>
      <div class="name">${g.name}</div>
      <div class="desc">${g.desc}</div>
    </button>
  `).join('');
  document.querySelectorAll('#gamesGrid .game-card').forEach(card => {
    card.addEventListener('click', () => {
      showView('setup');
      document.querySelector('[data-view="setup"]').classList.add('active');
    });
  });
}

// ===== SETTINGS =====
document.getElementById('confettiToggle').checked = state.settings.confetti;
document.getElementById('confettiToggle').addEventListener('change', (e) => {
  state.settings.confetti = e.target.checked;
  saveState();
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  if (e.key !== '1' && e.key !== '2') return;
  const activeView = document.querySelector('.view.active');
  if (!activeView) return;
  const viewId = activeView.id;
  if (viewId === 'view-eliminator') {
    const btn = e.key === '1' ? document.getElementById('optionA') : document.getElementById('optionB');
    if (btn?.dataset.value && !btn.classList.contains('eliminated')) eliminateOption(btn.dataset.value);
  } else if (viewId === 'view-keeper') {
    const btn = e.key === '1' ? document.getElementById('keeperA') : document.getElementById('keeperB');
    if (btn?.dataset.value) btn.click();
  } else if (viewId === 'view-bracket') {
    const btn = e.key === '1' ? document.getElementById('bracketA') : document.getElementById('bracketB');
    if (btn?.dataset.value) btn.click();
  } else if (viewId === 'view-timer') {
    const btn = e.key === '1' ? document.getElementById('timerA') : document.getElementById('timerB');
    if (btn?.dataset.value && document.getElementById('startTimerBtn')?.style.display === 'none') btn.click();
  }
});

// ===== INIT =====
loadState();
applyTheme(state.settings.theme || 'dark');
updateXPBar();
renderThemeSelect();
initThemeSelect();
renderHome();
