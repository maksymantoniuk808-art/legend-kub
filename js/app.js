const NAV_ITEMS = [
  { href: "index.html", label: "Головна" },
  { href: "anarchy.html", label: "Анархія" },
  { href: "survival.html", label: "Виживання" },
  { href: "minigames.html", label: "Мініігри" }
];

const REVIEWS_KEY = "legend_kub_reviews";
const currentPage = location.pathname.split("/").pop() || "index.html";
let activeReviewServer = null;

// --- Робота з localStorage для відгуків ---
function getAllReviews() {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAllReviews(data) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(data));
}

function getServerReviews(serverIp) {
  const all = getAllReviews();
  return all[serverIp] || [];
}

// Захист від вставки HTML-тегів у відгуках (XSS)
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// --- 1. Спільна шапка ---
function renderHeader() {
  const headerEl = document.getElementById("site-header");
  if (!headerEl) return;

  const navLinks = NAV_ITEMS.map((item) => {
    const isActive = currentPage === item.href ? 'class="active"' : "";
    return `<a href="${item.href}" ${isActive}>${item.label}</a>`;
  }).join("");

  headerEl.innerHTML = `
    <div class="header-inner">
      <a href="index.html" class="brand">
        <svg class="logo-block" width="38" height="38" viewBox="0 0 32 32" aria-hidden="true">
          <polygon points="16,2 30,9 16,16 2,9" fill="#8cf03c"/>
          <polygon points="2,9 16,16 16,30 2,23" fill="#6b442a"/>
          <polygon points="2,9 16,16 16,20 11,17.5 11,19 7,17 7,15.5 2,13" fill="#65bd27"/>
          <polygon points="16,16 30,9 30,23 16,30" fill="#4e311e"/>
          <polygon points="16,16 30,9 30,13 25,15.5 25,17 21,19 21,17.5 16,20" fill="#4d941c"/>
        </svg>
        <div>
          <b>Легенди кубічного світу</b>
          <span>Твій світ. Твої правила.</span>
        </div>
      </a>
      <nav class="main-nav">${navLinks}</nav>
    </div>
  `;
}

// --- 2. Спільний підвал ---
function renderFooter() {
  const footerEl = document.getElementById("site-footer");
  if (!footerEl) return;

  footerEl.innerHTML = `
    <div class="footer-inner">
      <div>
        <b>Легенди кубічного світу</b>
        <p>Незалежний моніторинг та каталог українських Minecraft-серверів.</p>
      </div>

      <div class="footer-links">
        ${NAV_ITEMS.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
      </div>

      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Легенди кубічного світу. Усі права захищено.</span>
        <a href="https://github.com/maksymantoniuk808-art" class="dev-github" target="_blank" rel="noopener noreferrer" aria-label="GitHub розробника">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>Розробник: maksymantoniuk808-art</span>
        </a>
      </div>
    </div>
  `;
}

// --- 3. Рендер карток серверів ---
function createServerCard(server) {
  const reviews = getServerReviews(server.ip);
  const siteLink = server.website
    ? `<a href="${server.website}" class="site-btn" target="_blank" rel="noopener noreferrer" title="Перейти на сайт сервера" aria-label="Сайт ${server.name}">
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
           <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
           <polyline points="15 3 21 3 21 9"/>
           <line x1="10" y1="14" x2="21" y2="3"/>
         </svg>
         <span>Сайт</span>
       </a>`
    : "";

  return `
    <div class="card">
      <div class="card-top">
        <div class="tag">${server.categoryName || "Сервер"}</div>
        <button class="reviews-btn" data-ip="${server.ip}" data-name="${server.name}">
          💬 Відгуки (<span class="rev-count">${reviews.length}</span>)
        </button>
      </div>
      <h3>${server.name}</h3>
      <p>${server.description}</p>
      <div class="card-actions">
        <button class="ip" data-ip="${server.ip}">
          <b>${server.ip}</b>
          <span>${server.platform}</span>
        </button>
        ${siteLink}
      </div>
    </div>
  `;
}

function renderServers() {
  const grid = document.getElementById("servers-grid");
  if (!grid) return;

  const category = grid.dataset.category;
  const filtered = category === "all"
    ? SERVERS
    : SERVERS.filter((s) => s.category === category);

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="sub">У цій категорії поки що немає серверів.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(createServerCard).join("");
}

// --- 4. Модальне вікно відгуків ---
function initReviewModal() {
  if (document.getElementById("review-modal")) return;

  const modalHTML = `
    <div id="review-modal" class="modal-backdrop" hidden>
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-head">
          <div>
            <span class="tag">Відгуки гравців</span>
            <h3 id="modal-title">Сервер</h3>
          </div>
          <button type="button" class="modal-close" aria-label="Закрити вікно">✕</button>
        </div>

        <div id="reviews-list" class="reviews-list"></div>

        <form id="review-form" class="review-form" novalidate>
          <div class="form-row">
            <input type="text" id="rev-author" placeholder="Твій нік у Minecraft" maxlength="24" required>
            <select id="rev-rating" aria-label="Оцінка">
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
          </div>
          <textarea id="rev-text" rows="3" placeholder="Напиши свої враження про сервер..." maxlength="300" required></textarea>
          <div id="rev-error" class="form-error"></div>
          <button type="submit" class="submit-btn">Опублікувати відгук</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modal = document.getElementById("review-modal");
  const form = document.getElementById("review-form");

  // Закриття по хрестику або кліку поза вікном
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".modal-close")) {
      closeReviewModal();
    }
  });

  // Закриття по клавіші Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeReviewModal();
  });

  // Відправка форми нового відгуку
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!activeReviewServer) return;

    const authorInput = document.getElementById("rev-author");
    const ratingInput = document.getElementById("rev-rating");
    const textInput = document.getElementById("rev-text");
    const errorEl = document.getElementById("rev-error");

    const author = authorInput.value.trim();
    const text = textInput.value.trim();
    const rating = Number(ratingInput.value);

    // Валідація введених даних
    if (author.length < 2) {
      errorEl.textContent = "Вкажи нікнейм (мінімум 2 символи).";
      return;
    }
    if (text.length < 5) {
      errorEl.textContent = "Відгук занадто короткий (мінімум 5 символів).";
      return;
    }

    errorEl.textContent = "";

    const all = getAllReviews();
    if (!all[activeReviewServer.ip]) all[activeReviewServer.ip] = [];

    all[activeReviewServer.ip].unshift({
      id: Date.now(),
      author,
      rating,
      text,
      date: new Date().toLocaleDateString("uk-UA")
    });

    saveAllReviews(all);
    form.reset();
    renderModalReviews();
    updateCardCounter(activeReviewServer.ip);
  });
}

function openReviewModal(ip, name) {
  initReviewModal();
  activeReviewServer = { ip, name };
  document.getElementById("modal-title").textContent = name;
  document.getElementById("rev-error").textContent = "";
  renderModalReviews();
  document.getElementById("review-modal").hidden = false;
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  if (modal) modal.hidden = true;
  activeReviewServer = null;
}

function renderModalReviews() {
  const listEl = document.getElementById("reviews-list");
  if (!listEl || !activeReviewServer) return;

  const reviews = getServerReviews(activeReviewServer.ip);

  if (reviews.length === 0) {
    listEl.innerHTML = `<p class="empty-reviews">Поки що немає відгуків. Будь першим, хто оцінить ${escapeHTML(activeReviewServer.name)}!</p>`;
    return;
  }

  listEl.innerHTML = reviews.map((rev) => `
    <div class="review-item">
      <div class="review-meta">
        <div>
          <b>${escapeHTML(rev.author)}</b>
          <span class="stars">${"★".repeat(rev.rating)}${"☆".repeat(5 - rev.rating)}</span>
        </div>
        <div class="review-right">
          <small>${rev.date}</small>
          <button type="button" class="del-rev" data-id="${rev.id}" title="Видалити відгук" aria-label="Видалити відгук">✕</button>
        </div>
      </div>
      <p>${escapeHTML(rev.text)}</p>
    </div>
  `).join("");
}

function updateCardCounter(ip) {
  const count = getServerReviews(ip).length;
  document.querySelectorAll(`.reviews-btn[data-ip="${ip}"] .rev-count`).forEach((el) => {
    el.textContent = count;
  });
}

// --- 5. Делегування кліків (IP, відкриття відгуків, видалення відгуку) ---
document.addEventListener("click", async (e) => {
  // Копіювання IP
  const ipBtn = e.target.closest(".ip");
  if (ipBtn) {
    const label = ipBtn.querySelector("span");
    const origText = label.dataset.orig || label.textContent;
    label.dataset.orig = origText;

    try {
      await navigator.clipboard.writeText(ipBtn.dataset.ip);
      label.textContent = "IP скопійовано ✓";
      ipBtn.classList.add("copied");
    } catch {
      label.textContent = "Скопіюй вручну: " + ipBtn.dataset.ip;
    }

    clearTimeout(ipBtn._timer);
    ipBtn._timer = setTimeout(() => {
      label.textContent = origText;
      ipBtn.classList.remove("copied");
    }, 1500);
    return;
  }

  // Відкриття вікна відгуків
  const revBtn = e.target.closest(".reviews-btn");
  if (revBtn) {
    openReviewModal(revBtn.dataset.ip, revBtn.dataset.name);
    return;
  }

  // Видалення відгуку
  const delBtn = e.target.closest(".del-rev");
  if (delBtn && activeReviewServer) {
    const id = Number(delBtn.dataset.id);
    const all = getAllReviews();
    all[activeReviewServer.ip] = (all[activeReviewServer.ip] || []).filter((r) => r.id !== id);
    saveAllReviews(all);
    renderModalReviews();
    updateCardCounter(activeReviewServer.ip);
  }
});

renderHeader();
renderServers();
renderFooter();