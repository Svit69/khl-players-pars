class ApiClient {
  async requestPlayerParsing(playerUrl) {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: playerUrl }),
    });

    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || 'Неизвестная ошибка');
    }

    return payload.data;
  }
}

class ResultView {
  #container;

  constructor(element) {
    this.#container = element;
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
    const stats =
      text?.hasMatchStats !== undefined
        ? ` | Статистика матчей: ${text.hasMatchStats ? 'найдена' : 'не найдена'}`
        : '';
    const statsChildren =
      typeof text?.statsChildrenCount === 'number'
        ? ` | Дочерних элементов у блока статистики: ${text.statsChildrenCount}`
        : '';
    const matchesTable =
      text?.hasMatchesTable !== undefined
        ? ` | matches_table в 3-м дочернем: ${text.hasMatchesTable ? 'найден' : 'не найден'}`
        : '';
    const thirdInfo =
      text?.thirdChildInfo !== undefined
        ? ` | 3-й дочерний: ${text.thirdChildInfo}`
        : '';
    this.#container.textContent = `Спарсили: ${name}${position}${stats}${statsChildren}${matchesTable}${thirdInfo}`;
  }

  showError(message) {
    this.#container.classList.remove('result--success');
    this.#container.classList.add('result--error');
    this.#container.textContent = message;
  }
}

class ParsingFormController {
  #formElement;
  #inputElement;
  #submitButton;
  #apiClient;
  #resultView;

  constructor(formElement, resultView, apiClient) {
    this.#formElement = formElement;
    this.#inputElement = formElement.querySelector('input[type="url"]');
    this.#submitButton = formElement.querySelector('button[type="submit"]');
    this.#resultView = resultView;
    this.#apiClient = apiClient;
    this.registerEvents();
  }

  registerEvents() {
    this.#formElement.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmit();
    });
  }

  async handleSubmit() {
    const url = this.#inputElement.value.trim();
    if (!url) {
      this.#resultView.showError('Введите ссылку на игрока');
      return;
    }

    try {
      this.#toggleSubmitState(true);
      this.#resultView.showLoading();
      const parsedText = await this.#apiClient.requestPlayerParsing(url);
      this.#resultView.showSuccess(parsedText);
    } catch (error) {
      this.#resultView.showError(error.message || 'Ошибка при обработке запроса');
    } finally {
      this.#toggleSubmitState(false);
    }
  }

  #toggleSubmitState(isDisabled) {
    this.#submitButton.disabled = isDisabled;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const formElement = document.getElementById('parser-form');
  const resultElement = document.getElementById('result');
  const apiClient = new ApiClient();
  const resultView = new ResultView(resultElement);

  new ParsingFormController(formElement, resultView, apiClient);
});
