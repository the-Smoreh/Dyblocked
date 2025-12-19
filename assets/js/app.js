const state = {
  games: [],
  filtered: [],
  featured: [],
  spotlight: null,
  selectedTag: null,
  page: 0,
  pageSize: 24,
};

const els = {
  search: document.getElementById('searchInput'),
  category: document.getElementById('categorySelect'),
  sort: document.getElementById('sortSelect'),
  featuredOnly: document.getElementById('featuredOnly'),
  grid: document.getElementById('gameGrid'),
  loadMore: document.getElementById('loadMore'),
  featuredTrack: document.getElementById('featuredTrack'),
  tagRow: document.getElementById('tagRow'),
  spotlight: document.getElementById('visualSpotlight'),
  playSpotlight: document.getElementById('playSpotlight'),
  randomPlay: document.getElementById('randomPlay'),
  ctaPlay: document.getElementById('ctaPlay'),
  refreshSpotlight: document.getElementById('refreshSpotlight'),
  openNewTab: document.getElementById('openNewTab'),
  featuredNav: document.querySelectorAll('.nav-buttons .icon-btn'),
  resetFilters: document.getElementById('resetFilters'),
  modal: document.getElementById('playerModal'),
  modalTitle: document.getElementById('modalTitle'),
  modalDesc: document.getElementById('modalDesc'),
  modalCategory: document.getElementById('modalCategory'),
  gameFrame: document.getElementById('gameFrame'),
  closeModal: document.getElementById('closeModal'),
  openExternal: document.getElementById('openExternal'),
  featuredToggle: document.getElementById('featuredToggle'),
  shuffle: document.getElementById('shuffleButton'),
  compactToggle: document.getElementById('compactToggle'),
  scrollTop: document.getElementById('scrollTop'),
  metricCount: document.getElementById('metricCount'),
  metricCategories: document.getElementById('metricCategories'),
  metricFeatured: document.getElementById('metricFeatured'),
  quickFeatured: document.getElementById('quickFeatured'),
  quickArcade: document.getElementById('quickArcade'),
  quickStrategy: document.getElementById('quickStrategy'),
  toast: document.getElementById('toast'),
};

const placeholderImage = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180" fill="none">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#6bf2d6" stop-opacity="0.8" offset="0%" />
        <stop stop-color="#6b8bff" stop-opacity="0.8" offset="100%" />
      </linearGradient>
    </defs>
    <rect width="300" height="180" rx="24" fill="#0a0c16" />
    <rect width="300" height="180" rx="24" fill="url(#g)" opacity="0.18" />
    <text x="50%" y="50%" fill="#cfd6ff" font-size="18" font-family="Inter, sans-serif" text-anchor="middle" dominant-baseline="middle">Instant Play</text>
  </svg>
`);

async function init() {
  attachGlobalHandlers();
  await loadGames();
  applyFilters();
}

async function loadGames() {
  try {
    const res = await fetch('games.json');
    const data = await res.json();
    state.games = data.map((game, index) => normalizeGame(game, index));
    state.featured = state.games.filter((g) => g.featured);
    if (state.featured.length === 0) {
      state.featured = state.games.slice(0, 12);
    }
    buildCategories();
    buildTags();
    updateSpotlight();
    renderFeaturedCarousel();
    updateMetrics();
  } catch (error) {
    showToast('Could not load games. Please refresh.');
    console.error(error);
  }
}

function normalizeGame(game, index) {
  return {
    ...game,
    id: index,
    title: game.title?.trim() || 'Untitled experience',
    description: game.description?.trim() || 'Drop in and start playing instantly.',
    category: game.category?.trim() || 'Arcade',
    tags: Array.isArray(game.tags) ? game.tags.filter(Boolean) : [],
    url: game.url,
    image: game.game_image_icon || placeholderImage,
    featured: Boolean(game.featured),
  };
}

function buildCategories() {
  const categories = Array.from(new Set(state.games.map((g) => g.category))).sort();
  els.category.innerHTML = `<option value="all">All categories</option>` +
    categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('');
}

function buildTags() {
  const tally = {};
  state.games.forEach((game) => {
    game.tags.forEach((tag) => {
      tally[tag] = (tally[tag] || 0) + 1;
    });
  });
  const popular = Object.entries(tally)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([tag]) => tag);

  els.tagRow.innerHTML = '';
  if (popular.length === 0) {
    const fallback = ['Arcade', 'Adventure', 'Action', 'Puzzle', 'Strategy', 'Retro'];
    fallback.forEach((tag) => createTagChip(tag));
    return;
  }
  popular.forEach((tag) => createTagChip(tag));
}

function createTagChip(tag) {
  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.textContent = `#${tag}`;
  chip.addEventListener('click', () => {
    if (state.selectedTag === tag) {
      state.selectedTag = null;
      chip.classList.remove('active');
    } else {
      state.selectedTag = tag;
      els.tagRow.querySelectorAll('.chip.active').forEach((node) => node.classList.remove('active'));
      chip.classList.add('active');
    }
    applyFilters();
  });
  els.tagRow.appendChild(chip);
}

function attachGlobalHandlers() {
  els.search.addEventListener('input', debounce(applyFilters, 120));
  els.category.addEventListener('change', applyFilters);
  els.sort.addEventListener('change', applyFilters);
  els.featuredOnly.addEventListener('change', applyFilters);
  els.loadMore.addEventListener('click', () => {
    state.page += 1;
    renderGrid();
  });
  els.playSpotlight.addEventListener('click', () => state.spotlight && openModal(state.spotlight));
  els.randomPlay.addEventListener('click', () => playRandom());
  els.ctaPlay.addEventListener('click', () => state.spotlight && openModal(state.spotlight));
  els.refreshSpotlight.addEventListener('click', updateSpotlight);
  els.openNewTab.addEventListener('click', () => {
    if (state.spotlight?.url) window.open(state.spotlight.url, '_blank');
  });
  els.resetFilters.addEventListener('click', resetFilters);
  els.closeModal.addEventListener('click', closeModal);
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) closeModal();
  });
  els.openExternal.addEventListener('click', () => {
    if (state.activeGame?.url) window.open(state.activeGame.url, '_blank');
  });
  els.featuredNav.forEach((btn) =>
    btn.addEventListener('click', (e) => shiftFeatured(Number(e.currentTarget.dataset.direction)))
  );
  els.featuredToggle.addEventListener('click', () => {
    const active = els.featuredToggle.getAttribute('aria-pressed') === 'true';
    els.featuredToggle.setAttribute('aria-pressed', !active);
    els.featuredOnly.checked = !active;
    applyFilters();
  });
  els.shuffle.addEventListener('click', () => {
    els.sort.value = 'random';
    applyFilters();
  });
  els.compactToggle.addEventListener('click', () => {
    const active = document.body.classList.toggle('compact');
    els.compactToggle.setAttribute('aria-pressed', active);
  });
  els.scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  els.quickFeatured.addEventListener('click', () => {
    els.featuredOnly.checked = true;
    applyFilters();
  });
  els.quickArcade.addEventListener('click', () => {
    els.category.value = 'Arcade';
    applyFilters();
  });
  els.quickStrategy.addEventListener('click', () => {
    els.category.value = 'Strategy';
    applyFilters();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modal.classList.contains('hidden')) closeModal();
  });
}

function applyFilters() {
  const query = els.search.value.trim().toLowerCase();
  const category = els.category.value;
  const onlyFeatured = els.featuredOnly.checked;

  const filtered = state.games.filter((game) => {
    const matchesQuery = query
      ? [game.title, game.description, game.category, ...game.tags]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query))
      : true;
    const matchesCategory = category === 'all' ? true : game.category === category;
    const matchesFeatured = onlyFeatured ? game.featured : true;
    const matchesTag = state.selectedTag ? game.tags.includes(state.selectedTag) || game.category === state.selectedTag : true;
    return matchesQuery && matchesCategory && matchesFeatured && matchesTag;
  });

  state.filtered = sortGames(filtered, els.sort.value);
  state.page = 0;
  renderGrid();
  updateMetrics(filtered);
}

function sortGames(games, sort) {
  const sorted = [...games];
  switch (sort) {
    case 'az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'za':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    case 'random':
      return sorted.sort(() => Math.random() - 0.5);
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title));
  }
}

function renderGrid() {
  els.grid.innerHTML = '';
  const visible = state.filtered.slice(0, (state.page + 1) * state.pageSize);
  visible.forEach((game) => els.grid.appendChild(createCard(game)));
  els.loadMore.style.display = visible.length < state.filtered.length ? 'inline-flex' : 'none';
  if (visible.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'muted';
    empty.textContent = 'No games match your filters. Try adjusting search or toggles.';
    els.grid.appendChild(empty);
  }
}

function createCard(game) {
  const card = document.createElement('article');
  card.className = 'game-card';

  const cover = document.createElement('div');
  cover.className = 'game-cover';
  const img = document.createElement('img');
  img.src = game.image;
  img.alt = `${game.title} cover`;
  img.loading = 'lazy';
  img.onerror = () => (img.src = placeholderImage);
  cover.appendChild(img);

  const chip = document.createElement('span');
  chip.className = 'game-chip';
  chip.textContent = game.category;
  cover.appendChild(chip);

  const body = document.createElement('div');
  body.className = 'game-body';
  const title = document.createElement('h3');
  title.textContent = game.title;
  const desc = document.createElement('p');
  desc.textContent = truncate(game.description, 120);
  body.append(title, desc);

  const tags = document.createElement('div');
  tags.className = 'tag-wrap';
  const tagList = game.tags.length ? game.tags : [game.category];
  tagList.slice(0, 3).forEach((tag) => {
    const t = document.createElement('span');
    t.className = 'tag';
    t.textContent = tag;
    tags.appendChild(t);
  });
  body.appendChild(tags);

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const playBtn = document.createElement('button');
  playBtn.className = 'btn btn-primary';
  playBtn.textContent = 'Play';
  playBtn.addEventListener('click', () => openModal(game));
  const detailsBtn = document.createElement('button');
  detailsBtn.className = 'btn btn-ghost';
  detailsBtn.textContent = 'Details';
  detailsBtn.addEventListener('click', () => updateSpotlight(game));
  actions.append(playBtn, detailsBtn);
  body.appendChild(actions);

  card.append(cover, body);
  card.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    openModal(game);
  });

  return card;
}

function renderFeaturedCarousel() {
  els.featuredTrack.innerHTML = '';
  state.featured.slice(0, 8).forEach((game) => {
    const card = document.createElement('div');
    card.className = 'featured-card';
    const img = document.createElement('img');
    img.src = game.image;
    img.alt = `${game.title} key art`;
    img.loading = 'lazy';
    img.onerror = () => (img.src = placeholderImage);
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const title = document.createElement('h4');
    title.textContent = game.title;
    const desc = document.createElement('p');
    desc.textContent = truncate(game.description, 90);
    overlay.append(title, desc);
    card.append(img, overlay);
    card.addEventListener('click', () => openModal(game));
    els.featuredTrack.appendChild(card);
  });
}

function updateSpotlight(source) {
  const game = source || getRandomItem(state.featured.length ? state.featured : state.games);
  if (!game) return;
  state.spotlight = game;
  els.spotlight.innerHTML = '';

  const img = document.createElement('img');
  img.src = game.image;
  img.alt = `${game.title} hero art`;
  img.onerror = () => (img.src = placeholderImage);

  const overlay = document.createElement('div');
  overlay.className = 'visual-overlay';
  const title = document.createElement('h4');
  title.textContent = game.title;
  const desc = document.createElement('p');
  desc.textContent = truncate(game.description, 140);
  const pill = document.createElement('span');
  pill.className = 'pill pill-soft';
  pill.textContent = game.category;
  overlay.append(pill, title, desc);

  const play = document.createElement('button');
  play.className = 'btn btn-primary';
  play.textContent = 'Play spotlight';
  play.addEventListener('click', () => openModal(game));
  overlay.appendChild(play);

  els.spotlight.append(img, overlay);
}

function shiftFeatured(direction) {
  if (!state.featured.length) return;
  const currentIndex = state.featured.indexOf(state.spotlight);
  const newIndex = (currentIndex + direction + state.featured.length) % state.featured.length;
  updateSpotlight(state.featured[newIndex]);
}

function openModal(game) {
  state.activeGame = game;
  els.modalTitle.textContent = game.title;
  els.modalDesc.textContent = game.description;
  els.modalCategory.textContent = game.category;
  els.gameFrame.src = game.url;
  els.modal.classList.remove('hidden');
}

function closeModal() {
  els.gameFrame.src = '';
  els.modal.classList.add('hidden');
}

function playRandom() {
  const game = getRandomItem(state.filtered.length ? state.filtered : state.games);
  if (game) openModal(game);
}

function updateMetrics(filtered = state.games) {
  els.metricCount.textContent = filtered.length;
  const categories = new Set(filtered.map((g) => g.category));
  els.metricCategories.textContent = categories.size;
  els.metricFeatured.textContent = filtered.filter((g) => g.featured).length;
}

function resetFilters() {
  els.search.value = '';
  els.category.value = 'all';
  els.sort.value = 'curated';
  els.featuredOnly.checked = false;
  state.selectedTag = null;
  els.tagRow.querySelectorAll('.chip.active').forEach((node) => node.classList.remove('active'));
  applyFilters();
}

function truncate(text, limit) {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function getRandomItem(arr) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function debounce(fn, wait = 150) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(null, args), wait);
  };
}

function showToast(message, duration = 2200) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  setTimeout(() => els.toast.classList.add('hidden'), duration);
}

init();
