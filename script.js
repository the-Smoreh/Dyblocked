const canvas = document.getElementById('blackholeCanvas');
const ctx = canvas.getContext('2d');
const gameRail = document.getElementById('gameRail');
const instantFrame = document.getElementById('instantFrame');
const libraryInput = document.getElementById('libraryInput');
const loadLibrary = document.getElementById('loadLibrary');
const enterPortal = document.getElementById('enterPortal');
const focusLibrary = document.getElementById('focusLibrary');
const onlineCount = document.getElementById('onlineCount');

const state = {
  stars: [],
  games: []
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function seedStars() {
  const count = Math.floor((canvas.width * canvas.height) / 6200);
  state.stars = Array.from({ length: count }, () => ({
    r: Math.random() * Math.min(canvas.width, canvas.height) * 0.48,
    a: Math.random() * Math.PI * 2,
    size: Math.random() * 1.8 + 0.35,
    speed: Math.random() * 0.004 + 0.0008,
    drift: Math.random() * 0.22 + 0.07
  }));
}

function drawBlackHole() {
  const cx = canvas.width * 0.58;
  const cy = canvas.height * 0.45;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.min(canvas.width, canvas.height) * 0.55);
  glow.addColorStop(0, 'rgba(188, 217, 255, 0.40)');
  glow.addColorStop(0.45, 'rgba(69, 105, 170, 0.23)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const star of state.stars) {
    star.a += star.speed;
    star.r -= star.drift;
    if (star.r < 45) {
      star.r = Math.random() * Math.min(canvas.width, canvas.height) * 0.48 + 80;
      star.a = Math.random() * Math.PI * 2;
    }

    const x = cx + Math.cos(star.a) * star.r;
    const y = cy + Math.sin(star.a * 1.1) * star.r * 0.58;

    ctx.fillStyle = `rgba(223, 237, 255, ${Math.min(1, 0.28 + (1 - star.r / 500))})`;
    ctx.beginPath();
    ctx.arc(x, y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.ellipse(cx, cy, 72, 56, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#02040a';
  ctx.fill();

  requestAnimationFrame(drawBlackHole);
}

function validUrl(url) {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
}

function launchUrl(url) {
  if (!validUrl(url)) return;
  instantFrame.src = url;
  libraryInput.value = url;
  localStorage.setItem('dyblocked.libraryUrl', url);
}

function createGameChip(game) {
  const btn = document.createElement('button');
  btn.className = 'game-chip';
  btn.innerHTML = `
    <img src="${game.game_image_icon}" alt="${game.title}" loading="lazy">
    <div>
      <strong>${game.title}</strong>
      <span>${game.category || 'Arcade'}</span>
    </div>`;

  btn.addEventListener('click', () => launchUrl(game.url));
  return btn;
}

async function loadGames() {
  const res = await fetch('games.json');
  const games = await res.json();
  state.games = games;

  gameRail.innerHTML = '';
  games.slice(0, 8).forEach((game) => gameRail.appendChild(createGameChip(game)));

  onlineCount.textContent = `${Math.max(1200, games.length * 47)} players online`;

  const saved = localStorage.getItem('dyblocked.libraryUrl');
  const defaultUrl = saved || games[0]?.url || 'https://example.com';
  launchUrl(defaultUrl);
}

function attachEvents() {
  loadLibrary.addEventListener('click', () => launchUrl(libraryInput.value.trim()));
  libraryInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      launchUrl(libraryInput.value.trim());
    }
  });

  enterPortal.addEventListener('click', () => {
    document.getElementById('librarySection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    libraryInput.focus();
  });

  focusLibrary.addEventListener('click', () => {
    document.getElementById('librarySection').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
    seedStars();
  });
}

(async function init() {
  resizeCanvas();
  seedStars();
  drawBlackHole();
  attachEvents();
  await loadGames();
})();
