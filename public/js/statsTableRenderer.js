export default class StatsTableRenderer {
  #headers = [
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

  render(matchStatsList) {
    if (!Array.isArray(matchStatsList) || matchStatsList.length === 0) {
      return null;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'stats-table-wrapper';

    const title = document.createElement('div');
    title.className = 'stats-table-title';
    title.textContent = 'Статистика матча (первые строки таблицы)';
    wrapper.appendChild(title);

    const table = document.createElement('table');
    table.className = 'stats-table';
    table.appendChild(this.#buildHeader());

    matchStatsList.forEach((match) => {
      table.appendChild(this.#buildRow(match));
    });

    wrapper.appendChild(table);
    return wrapper;
  }

  #buildHeader() {
    const headerRow = document.createElement('tr');
    this.#headers.forEach((h, idx) => {
      const th = document.createElement('th');
      th.textContent = h.label;
      if (h.title) th.title = h.title;
      if (idx === 0) th.classList.add('stats-table__fo');
      headerRow.appendChild(th);
    });
    return headerRow;
  }

  #buildRow(match) {
    const row = document.createElement('tr');
    const values = [
      match.fantasyScore ?? '—',
      match.date || '—',
      match.teams || '—',
      match.score || '—',
      match.number || '—',
      match.goals || '—',
      match.assists || '—',
      match.points || '—',
      match.plusMinus || '—',
      match.penaltyMinutes || '—',
      match.shotsOnGoal || '—',
      match.timeOnIce || '—',
      match.hits || '—',
      match.blockedShots || '—',
      match.takeaways || '—',
      match.interceptions || '—',
    ];

    values.forEach((value, idx) => {
      const td = document.createElement('td');
      td.textContent = value;
      if (idx === 0) td.classList.add('stats-table__fo');
      row.appendChild(td);
    });

    return row;
  }
}
