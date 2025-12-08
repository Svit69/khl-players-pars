export default class ParsingFormController {
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
      this.#resultView.showError('Введите ссылку на игрока.');
      return;
    }

    try {
      this.#toggleSubmitState(true);
      this.#resultView.showLoading();
      const parsed = await this.#apiClient.requestPlayerParsing(url);
      this.#resultView.showSuccess(parsed);
    } catch (error) {
      this.#resultView.showError(error.message || 'Не удалось выполнить запрос.');
    } finally {
      this.#toggleSubmitState(false);
    }
  }

  #toggleSubmitState(isDisabled) {
    this.#submitButton.disabled = isDisabled;
  }
}

