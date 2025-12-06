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

    if (Array.isArray(text?.matchStats) && text.matchStats.length) {
      const table = this.#statsRenderer.render(text.matchStats, text?.position || '');
      if (table) {
        this.#container.appendChild(table);
      }
    }
  }

  showError(message) {
    this.#container.classList.remove('result--success');
    this.#container.classList.add('result--error');
    this.#container.textContent = message;
  }
}
