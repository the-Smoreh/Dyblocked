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
const topbar = document.getElementById('topbar');
const openSettings = document.getElementById('openSettings');
const closeSettings = document.getElementById('closeSettings');
const settingsPanel = document.getElementById('settingsPanel');
const layoutMode = document.getElementById('layoutMode');
const iconStyle = document.getElementById('iconStyle');
const iconGradient = document.getElementById('iconGradient');
const themeMode = document.getElementById('themeMode');

const modal = document.getElementById('gameModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const immersiveFullscreen = document.getElementById('immersiveFullscreen');
const frameContainer = document.getElementById('frameContainer');

const themePresets = {
  nebula: { primary: '#8f6bff', secondary: '#49d2ff', accent: '#4af4c7' },
  ember: { primary: '#ff7b4a', secondary: '#ffc14a', accent: '#ffd56f' },
  mint: { primary: '#4ecdc4', secondary: '#9dfca7', accent: '#88fff2' },
  royal: { primary: '#4d86ff', secondary: '#7cc4ff', accent: '#6be4ff' }
};

const state = {
  games: [],
  filtered: [],
  tags: [],
  categories: [],
  featured: [],
  settings: {
    layout: 'cozy',
    iconStyle: 'default',
    iconGradient: 'sunset',
    theme: 'nebula'
  }
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

function iconShell(game) {
  if (state.settings.iconStyle === 'gradient') {
    return `<div class="card-gradient gradient-${state.settings.iconGradient}"><span>${game.title.slice(0, 2).toUpperCase()}</span></div>`;
  }
  return `<img src="${game.game_image_icon}" alt="${game.title}" loading="lazy" />`;
}

function cardTemplate(game) {
  const tags = (game.tags || []).slice(0, 3).map((t) => `<span>${t}</span>`).join('');
  return `<article class="card" tabindex="0" data-title="${game.title}">
    <div class="card-media">${iconShell(game)}</div>
    <div class="info">
      <div class="meta"><span class="badge">${game.category || 'Arcade'}</span>${game.featured ? '<span class="badge">Featured</span>' : ''}</div>
      <h3>${game.title}</h3>
      <p>${game.description || ''}</p>
      <div class="tags">${tags}</div>
    </div>
  </article>`;
}

function featuredTemplate(game) {
  return `<article class="feature-card" data-title="${game.title}">
      <div class="card-media">${iconShell(game)}</div>
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
  frameContainer.innerHTML = `<iframe src="${game.url}" allowfullscreen></iframe>`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeGameModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  frameContainer.innerHTML = '';
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
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

function applyTheme() {
  const preset = themePresets[state.settings.theme];
  document.documentElement.style.setProperty('--primary', preset.primary);
  document.documentElement.style.setProperty('--primary-2', preset.secondary);
  document.documentElement.style.setProperty('--accent', preset.accent);
}

function applyPresentationSettings() {
  document.body.dataset.layout = state.settings.layout;
  document.body.dataset.iconStyle = state.settings.iconStyle;
  renderGrid();
  renderFeatured();
}

function updateTopbarHeight() {
  document.documentElement.style.setProperty('--topbar-height', `${topbar.offsetHeight}px`);
}

function toggleSettings(open) {
  settingsPanel.classList.toggle('open', open);
  settingsPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
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
  openSettings.addEventListener('click', () => toggleSettings(true));
  closeSettings.addEventListener('click', () => toggleSettings(false));
  modalOverlay.addEventListener('click', closeGameModal);
  closeModal.addEventListener('click', closeGameModal);
  immersiveFullscreen.addEventListener('click', async () => {
    const modalCard = modal.querySelector('.modal-card');
    if (!document.fullscreenElement) {
      await modalCard.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  });

  layoutMode.addEventListener('change', () => {
    state.settings.layout = layoutMode.value;
    applyPresentationSettings();
  });

  iconStyle.addEventListener('change', () => {
    state.settings.iconStyle = iconStyle.value;
    applyPresentationSettings();
  });

  iconGradient.addEventListener('change', () => {
    state.settings.iconGradient = iconGradient.value;
    applyPresentationSettings();
  });

  themeMode.addEventListener('change', () => {
    state.settings.theme = themeMode.value;
    applyTheme();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeGameModal();
      toggleSettings(false);
    }
  });

  window.addEventListener('resize', updateTopbarHeight);
}

(async function init() {
  attachEvents();
  await loadGames();
  applyTheme();
  applyPresentationSettings();
  updateTicker();
  updateTopbarHeight();
  setInterval(updateTicker, 8000);
})();
