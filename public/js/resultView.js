import renderProfile from './renderProfile.js';
import renderDigest from './renderDigest.js';
import renderTours from './renderTours.js';

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

  showSuccess(data) {
    this.#container.classList.remove('result--error');
    this.#container.classList.add('result--success');
    this.#container.textContent = '';

    const profile = renderProfile(data);
    if (profile) this.#container.appendChild(profile);

    if (Array.isArray(data?.matchStats?.rows) && data.matchStats.rows.length) {
      const digest = renderDigest(data.matchStats);
      if (digest) this.#container.appendChild(digest);

      const tours = renderTours(data.matchStats.tours);
      if (tours) this.#container.appendChild(tours);

      const table = this.#statsRenderer.render(data.matchStats.rows, data?.position || '');
      if (table) this.#container.appendChild(table);
    }
  }

  showError(message) {
    this.#container.classList.remove('result--success');
    this.#container.classList.add('result--error');
    this.#container.textContent = message;
  }
}
