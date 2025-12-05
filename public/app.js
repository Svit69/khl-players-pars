class ApiClient {
  async requestPlayerParsing(playerUrl) {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: playerUrl }),
    });

    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || 'Ошибка при обработке запроса');
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
    const allGames =
      text?.hasAllGamesBody !== undefined
        ? ` | tbody#table_all_games: ${text.hasAllGamesBody ? 'найден' : 'не найден'}`
        : '';

    this.#container.textContent = `Спарсили: ${name}${position}${allGames}`;

    if (text?.matchStats) {
      this.#renderStatsTable(text.matchStats);
    }
  }

  showError(message) {
    this.#container.classList.remove('result--success');
    this.#container.classList.add('result--error');
    this.#container.textContent = message;
  }

  #renderStatsTable(matchStats) {
    const table = document.createElement('table');
    table.className = 'stats-table';

    const headerRow = document.createElement('tr');
    const headers = [
      { label: 'ФО', title: 'Фэнтези очки (для полевых)' },
      { label: 'Дата', title: '' },
      { label: 'Команды', title: '' },
      { label: 'Счет', title: '' },
      { label: '№', title: 'Номер игрока' },
      { label: 'Ш', title: 'Заброшенные шайбы' },
      { label: 'А', title: 'Голевые передачи' },
      { label: 'О', title: 'Очки' },
      { label: '+/-', title: 'Показатель полезности' },
      { label: 'Штр', title: 'Штрафные минуты' },
      { label: 'БВ', title: 'Броски по воротам' },
      { label: 'ВП', title: 'Время на площадке' },
      { label: 'СПр', title: 'Силовые приемы' },
      { label: 'БлБ', title: 'Блокированные броски' },
      { label: 'ОТБ', title: 'Отборы' },
      { label: 'ПХТ', title: 'Перехваты' },
    ];

    headers.forEach((h) => {
      const th = document.createElement('th');
      th.textContent = h.label;
      if (h.title) th.title = h.title;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const dataRow = document.createElement('tr');
    const values = [
      matchStats.fantasyScore ?? '—',
      matchStats.date || '—',
      matchStats.teams || '—',
      matchStats.score || '—',
      matchStats.number || '—',
      matchStats.goals || '—',
      matchStats.assists || '—',
      matchStats.points || '—',
      matchStats.plusMinus || '—',
      matchStats.penaltyMinutes || '—',
      matchStats.shotsOnGoal || '—',
      matchStats.timeOnIce || '—',
      matchStats.hits || '—',
      matchStats.blockedShots || '—',
      matchStats.takeaways || '—',
      matchStats.interceptions || '—',
    ];

    values.forEach((v) => {
      const td = document.createElement('td');
      td.textContent = v;
      dataRow.appendChild(td);
    });

    table.appendChild(dataRow);

    const wrapper = document.createElement('div');
    wrapper.className = 'stats-table-wrapper';
    const title = document.createElement('div');
    title.className = 'stats-table-title';
    title.textContent = 'Статистика матча (2-я строка таблицы)';
    wrapper.appendChild(title);
    wrapper.appendChild(table);

    this.#container.appendChild(wrapper);
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
