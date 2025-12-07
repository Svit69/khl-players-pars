export default class ResultView {
  #container;
  #statsRenderer;

  constructor(element, statsRenderer) {
    this.#container = element;
    this.#statsRenderer = statsRenderer;
  }

  showLoading() {
    this.#container.classList.remove('result--success', 'result--error');
    this.#container.innerHTML = '<span class="result__placeholder">Загружаем...</span>';
  }

  showSuccess(text) {
    this.#container.classList.remove('result--error');
    this.#container.classList.add('result--success');
    this.#container.textContent = '';

    const profile = this.#renderProfile(text);
    if (profile) this.#container.appendChild(profile);

    const name = text?.name || text;
    const position = text?.position ? ` — ${text.position}` : '';
    const allGames =
      text?.hasAllGamesBody !== undefined
        ? ` | tbody#table_all_games: ${text.hasAllGamesBody ? 'найден' : 'не найден'}`
        : '';

    const summaryTop = document.createElement('div');
    summaryTop.className = 'result__summary';
    summaryTop.textContent = `Спарсили: ${name}${position}${allGames}`;
    this.#container.appendChild(summaryTop);

    if (Array.isArray(text?.matchStats?.rows) && text.matchStats.rows.length) {
      const table = this.#statsRenderer.render(text.matchStats.rows, text?.position || '');
      if (table) {
        this.#container.appendChild(table);
      }
      const summary = this.#renderSummary(text.matchStats);
      if (summary) {
        this.#container.appendChild(summary);
      }
    }
  }

  showError(message) {
    this.#container.classList.remove('result--success');
    this.#container.classList.add('result--error');
    this.#container.textContent = message;
  }

  #renderProfile(data) {
    const wrap = document.createElement('div');
    wrap.className = 'profile';

    const logoBox = document.createElement('div');
    logoBox.className = 'profile__logo';
    const logoImg = document.createElement('img');
    logoImg.src = data?.clubLogo || '/assets/default-logo.svg';
    logoImg.alt = 'Лого клуба';
    logoBox.appendChild(logoImg);
    wrap.appendChild(logoBox);

    const info = document.createElement('div');
    info.className = 'profile__info';

    const nameEl = document.createElement('h2');
    nameEl.className = 'profile__name';
    nameEl.textContent = data?.name || '—';
    info.appendChild(nameEl);

    const meta = document.createElement('div');
    meta.className = 'profile__meta';

    const posEl = document.createElement('span');
    posEl.textContent = data?.position || '—';
    meta.appendChild(posEl);

    const ageEl = document.createElement('span');
    const ageVal = typeof data?.age === 'number' ? data.age : 18;
    ageEl.textContent = `${ageVal} ${this.#ageSuffix(ageVal)}`;
    meta.appendChild(ageEl);

    const nationWrap = document.createElement('span');
    const flagImg = document.createElement('img');
    flagImg.className = 'profile__flag';
    flagImg.alt = data?.nationality || 'национальность';
    flagImg.src = this.#resolveFlagSrc(data?.nationality);
    nationWrap.appendChild(flagImg);
    const nationText = document.createElement('span');
    nationText.textContent = data?.nationality || '—';
    nationWrap.appendChild(nationText);
    meta.appendChild(nationWrap);

    info.appendChild(meta);
    wrap.appendChild(info);
    return wrap;
  }

  #renderSummary(matchStats) {
    const { seasonFoAvg, lastFiveFoAvg } = matchStats;
    if (seasonFoAvg === null && lastFiveFoAvg === null) return null;
    const wrap = document.createElement('div');
    wrap.className = 'stats-summary';
    const items = [];
    if (lastFiveFoAvg !== null) {
      items.push(`Среднее ФО за последние 5 матчей: ${lastFiveFoAvg}`);
    }
    if (seasonFoAvg !== null) {
      items.push(`Среднее ФО за сезон: ${seasonFoAvg}`);
    }
    wrap.textContent = items.join(' | ');
    return wrap;
  }

  #resolveFlagSrc(nationality) {
    if (!nationality) return '/flags/default.svg';
    const slug = nationality.trim().toLowerCase().replace(/\s+/g, '-');
    return `/flags/${slug}.svg`;
  }

  #ageSuffix(age) {
    const mod10 = age % 10;
    const mod100 = age % 100;
    if (mod10 === 1 && mod100 !== 11) return 'год';
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'года';
    return 'лет';
  }
}
