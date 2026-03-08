const appShell = document.getElementById('appShell');
const playGamesBtn = document.getElementById('playGamesBtn');
const backHomeBtn = document.getElementById('backHomeBtn');
const openRandomBtn = document.getElementById('openRandomBtn');

const homeFeatured = document.getElementById('homeFeatured');
const gamesGrid = document.getElementById('gamesGrid');
const countText = document.getElementById('countText');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');

const modal = document.getElementById('gameModal');
const modalFrame = document.getElementById('modalFrame');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalBackdrop = document.getElementById('closeModalBackdrop');

const state = {
  games: [],
  filtered: []
};

function sanitize(text = '') {
  return text.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function cardTemplate(game) {
  return `
    <article class="game-card" data-title="${sanitize(game.title)}">
      <img src="${sanitize(game.game_image_icon)}" alt="${sanitize(game.title)}" loading="lazy" />
      <div class="game-info">
        <h3>${sanitize(game.title)}</h3>
        <p>${sanitize(game.category || 'Arcade')}</p>
      </div>
    </article>
  `;
}

function renderHomeFeatured() {
  const picks = [...state.games].sort(() => Math.random() - 0.5).slice(0, 6);
  homeFeatured.innerHTML = picks.map(cardTemplate).join('');
  attachCardEvents(homeFeatured);
}

function renderGameGrid() {
  gamesGrid.innerHTML = state.filtered.map(cardTemplate).join('');
  countText.textContent = `${state.filtered.length} games`;
  attachCardEvents(gamesGrid);
}

function filterGames() {
  const q = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  state.filtered = state.games.filter((game) => {
    const matchesText = !q || game.title.toLowerCase().includes(q) || (game.description || '').toLowerCase().includes(q);
    const matchesCategory = !category || game.category === category;
    return matchesText && matchesCategory;
  });

  renderGameGrid();
}

function attachCardEvents(parent) {
  parent.querySelectorAll('.game-card').forEach((card) => {
    card.addEventListener('click', () => {
      openGame(card.dataset.title);
    });
  });
}

function openGame(title) {
  const game = state.games.find((entry) => entry.title === title);
  if (!game) return;
  modalTitle.textContent = game.title;
  modalFrame.innerHTML = `<iframe src="${game.url}" allowfullscreen></iframe>`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modalFrame.innerHTML = '';
}

function populateCategories() {
  const categories = [...new Set(state.games.map((g) => g.category).filter(Boolean))].sort();
  categorySelect.innerHTML = `<option value="">All categories</option>${categories
    .map((category) => `<option value="${sanitize(category)}">${sanitize(category)}</option>`)
    .join('')}`;
}

function launchRandom() {
  if (!state.games.length) return;
  const game = state.games[Math.floor(Math.random() * state.games.length)];
  openGame(game.title);
}

async function loadGames() {
  const res = await fetch('games.json');
  state.games = await res.json();
  state.filtered = [...state.games];
  populateCategories();
  renderHomeFeatured();
  renderGameGrid();
}

// Youtube API attempts autoplay with sound. Browser policy may still require user interaction.
let ytPlayer;
window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('bgVideo', {
    events: {
      onReady: (event) => {
        event.target.setVolume(100);
        event.target.unMute();
        event.target.playVideo();
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED) {
          event.target.playVideo();
        }
      }
    }
  });
};

playGamesBtn.addEventListener('click', () => {
  appShell.dataset.view = 'games';
  document.getElementById('gamesPage').setAttribute('aria-hidden', 'false');
});

backHomeBtn.addEventListener('click', () => {
  appShell.dataset.view = 'home';
  document.getElementById('gamesPage').setAttribute('aria-hidden', 'true');
});

openRandomBtn.addEventListener('click', launchRandom);
searchInput.addEventListener('input', filterGames);
categorySelect.addEventListener('change', filterGames);
closeModalBtn.addEventListener('click', closeModal);
closeModalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

loadGames();
