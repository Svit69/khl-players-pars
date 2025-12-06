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
    const name = text?.name || text;
    const position = text?.position ? ` — ${text.position}` : '';
    const allGames =
      text?.hasAllGamesBody !== undefined
        ? ` | tbody#table_all_games: ${text.hasAllGamesBody ? 'найден' : 'не найден'}`
        : '';

    this.#container.textContent = `Спарсили: ${name}${position}${allGames}`;

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
}
