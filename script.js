const gridEl = document.getElementById('gameGrid');
const featuredGrid = document.getElementById('featuredGrid');
const categorySelect = document.getElementById('categorySelect');
const searchInput = document.getElementById('searchInput');
const tagChips = document.getElementById('tagChips');
const onlyFeatured = document.getElementById('onlyFeatured');
const shuffleMode = document.getElementById('shuffleMode');
const featuredCount = document.getElementById('featuredCount');
const resultCount = document.getElementById('resultCount');
const statTotal = document.getElementById('statTotal');
const statCategories = document.getElementById('statCategories');
const statFeatured = document.getElementById('statFeatured');
const filtersSection = document.getElementById('filters');
const liveTicker = document.getElementById('liveTicker');
const quickList = document.getElementById('quickList');
const emptyState = document.getElementById('emptyState');
const clearFilters = document.getElementById('clearFilters');
const featureToggle = document.getElementById('featureToggle');
const randomPlay = document.getElementById('randomPlay');
const refreshFeatured = document.getElementById('refreshFeatured');
const startExploring = document.getElementById('startExploring');
const scrollToGrid = document.getElementById('scrollToGrid');
const modal = document.getElementById('gameModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalDescription = document.getElementById('modalDescription');
const modalTags = document.getElementById('modalTags');
const playNow = document.getElementById('playNow');
const openInFrame = document.getElementById('openInFrame');
const frameContainer = document.getElementById('frameContainer');

const state = {
  games: [],
  filtered: [],
  tags: [],
  categories: [],
  featured: [],
  lastOpened: []
};

async function loadGames() {
  const res = await fetch('games.json');
  const data = await res.json();
  state.games = data;
  state.categories = Array.from(new Set(data.map((g) => g.category).filter(Boolean))).sort();
  state.tags = Array.from(new Set(data.flatMap((g) => g.tags || []))).slice(0, 12);
  const curated = data.filter((g) => g.featured);
  state.featured = curated.length ? curated : [...data].sort(() => 0.5 - Math.random()).slice(0, 10);
  statTotal.textContent = data.length;
  statCategories.textContent = state.categories.length;
  statFeatured.textContent = state.featured.length;
  featuredCount.textContent = state.featured.length;
  populateFilters();
  renderFeatured();
  applyFilters();
}

function populateFilters() {
  categorySelect.innerHTML = '<option value="">All categories</option>' +
    state.categories.map((c) => `<option value="${c}">${c}</option>`).join('');

  tagChips.innerHTML = state.tags
    .map((tag) => `<button class="chip" data-tag="${tag}">${tag}</button>`)
    .join('');

  tagChips.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      applyFilters();
    });
  });
}

function cardTemplate(game) {
  const tags = (game.tags || []).slice(0, 3).map((t) => `<span>${t}</span>`).join('');
  return `<article class="card" tabindex="0" data-title="${game.title}" data-url="${game.url}">
    <img src="${game.game_image_icon}" alt="${game.title}" loading="lazy" />
    <div class="info">
      <div class="meta"><span class="badge">${game.category || 'Arcade'}</span>${game.featured ? '<span class="badge">Featured</span>' : ''}</div>
      <h3>${game.title}</h3>
      <p>${game.description || ''}</p>
      <div class="tags">${tags}</div>
    </div>
  </article>`;
}

function featuredTemplate(game) {
  return `<article class="feature-card" data-title="${game.title}" data-url="${game.url}">
      <img src="${game.game_image_icon}" alt="${game.title}" loading="lazy" />
      <div class="content">
        <span class="tagline">${game.category || 'Arcade'}</span>
        <h3>${game.title}</h3>
        <p>${game.description || ''}</p>
      </div>
    </article>`;
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const activeTags = Array.from(tagChips.querySelectorAll('.chip.active')).map((el) => el.dataset.tag);
  const filterFeatured = onlyFeatured.checked || featureToggle.classList.contains('active');

  let list = [...state.games];

  if (query) {
    list = list.filter((game) =>
      game.title.toLowerCase().includes(query) ||
      (game.description || '').toLowerCase().includes(query)
    );
  }

  if (category) {
    list = list.filter((game) => game.category === category);
  }

  if (activeTags.length) {
    list = list.filter((game) => (game.tags || []).some((tag) => activeTags.includes(tag)));
  }

  if (filterFeatured) {
    list = list.filter((game) => game.featured);
  }

  if (shuffleMode.checked) {
    list = list.sort(() => Math.random() - 0.5);
  }

  state.filtered = list;
  renderGrid();
}

function renderGrid() {
  resultCount.textContent = `${state.filtered.length} games`;
  emptyState.hidden = state.filtered.length > 0;

  gridEl.innerHTML = state.filtered.map(cardTemplate).join('');
  gridEl.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.title));
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') openModal(card.dataset.title);
    });
  });
}

function renderFeatured() {
  const picks = state.featured.slice(0, 8);
  featuredGrid.innerHTML = picks.map(featuredTemplate).join('');
  featuredGrid.querySelectorAll('.feature-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.title));
  });
}

function updateTicker() {
  const shuffled = [...state.games].sort(() => Math.random() - 0.5).slice(0, 4);
  liveTicker.innerHTML = shuffled
    .map((game) => `<div class="ticker-item"><strong>${game.title}</strong><span>${game.category || 'Arcade'} • ${game.tags?.[0] || 'popular'}</span></div>`)
    .join('');

  quickList.innerHTML = shuffled
    .slice(0, 3)
    .map((game) => `<button class="chip" data-title="${game.title}">${game.title}</button>`)
    .join('');

  quickList.querySelectorAll('button').forEach((btn) =>
    btn.addEventListener('click', () => openModal(btn.dataset.title))
  );
}

function openModal(title) {
  const game = state.games.find((g) => g.title === title);
  if (!game) return;
  modalTitle.textContent = game.title;
  modalCategory.textContent = game.category || 'Arcade';
  modalDescription.textContent = game.description || 'Play instantly in your browser.';
  modalTags.innerHTML = (game.tags || []).map((tag) => `<span>${tag}</span>`).join('');
  playNow.href = game.url;
  frameContainer.innerHTML = '<div class="frame-placeholder">Select "Play here" to embed instantly.</div>';
  modal.dataset.url = game.url;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  state.lastOpened = [game.title, ...state.lastOpened.filter((t) => t !== game.title)].slice(0, 3);
}

function closeGameModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  frameContainer.innerHTML = '<div class="frame-placeholder">Select "Play here" to embed instantly.</div>';
}

function embedGame() {
  const url = modal.dataset.url;
  if (!url) return;
  frameContainer.innerHTML = `<iframe src="${url}" allowfullscreen></iframe>`;
}

function surpriseMe() {
  const list = state.filtered.length ? state.filtered : state.games;
  const random = list[Math.floor(Math.random() * list.length)];
  if (random) openModal(random.title);
}

function refreshFeaturedDeck() {
  state.featured = [...state.games].sort(() => 0.5 - Math.random()).slice(0, 10);
  statFeatured.textContent = state.featured.length;
  featuredCount.textContent = state.featured.length;
  renderFeatured();
}

function attachEvents() {
  searchInput.addEventListener('input', applyFilters);
  categorySelect.addEventListener('change', applyFilters);
  onlyFeatured.addEventListener('change', applyFilters);
  shuffleMode.addEventListener('change', applyFilters);
  featureToggle.addEventListener('click', () => {
    featureToggle.classList.toggle('active');
    applyFilters();
  });
  randomPlay.addEventListener('click', surpriseMe);
  refreshFeatured.addEventListener('click', refreshFeaturedDeck);
  startExploring.addEventListener('click', () => filtersSection.scrollIntoView({ behavior: 'smooth' }));
  scrollToGrid.addEventListener('click', () => gridEl.scrollIntoView({ behavior: 'smooth' }));
  clearFilters.addEventListener('click', () => {
    searchInput.value = '';
    categorySelect.value = '';
    onlyFeatured.checked = false;
    shuffleMode.checked = false;
    tagChips.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('active'));
    applyFilters();
  });
  modalOverlay.addEventListener('click', closeGameModal);
  closeModal.addEventListener('click', closeGameModal);
  openInFrame.addEventListener('click', embedGame);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGameModal();
  });
}

(async function init() {
  attachEvents();
  await loadGames();
  updateTicker();
  setInterval(updateTicker, 8000);
})();
