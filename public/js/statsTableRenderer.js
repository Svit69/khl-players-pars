export default class StatsTableRenderer {
  render(matchStatsList, position = '') {
    if (!Array.isArray(matchStatsList) || matchStatsList.length === 0) {
      return null;
    }

    const isGoalie =
      (position && position.toLowerCase().includes('врат')) ||
      matchStatsList[0]?.type === 'goalie' ||
      typeof matchStatsList[0]?.wins !== 'undefined';
    const headers = isGoalie ? this.#goalieHeaders() : this.#skaterHeaders();

    const wrapper = document.createElement('div');
    wrapper.className = 'stats-table-wrapper';

    const title = document.createElement('div');
    title.className = 'stats-table-title';
    title.textContent = 'Статистика матча (5 последних игр)';
    wrapper.appendChild(title);

    const table = document.createElement('table');
    table.className = `stats-table ${isGoalie ? 'stats-table--goalie' : 'stats-table--skater'}`;
    table.appendChild(this.#buildHeader(headers));

    matchStatsList.forEach((match) => {
      table.appendChild(this.#buildRow(match, headers));
    });

    wrapper.appendChild(table);
    return wrapper;
  }

  #buildHeader(headers) {
    const headerRow = document.createElement('tr');
    headers.forEach((h, idx) => {
      const th = document.createElement('th');
      th.textContent = h.label;
      if (h.title) th.title = h.title;
      if (idx === 0) th.classList.add('stats-table__fo');
      headerRow.appendChild(th);
    });
    return headerRow;
  }

  #buildRow(match, _headers) {
    const values =
      match.type === 'goalie'
        ? [
            match.fantasyScore ?? '—',
            match.date || '—',
            match.teams || '—',
            match.score || '—',
            match.number || '—',
            match.wins || '—',
            match.losses || '—',
            match.shots || '—',
            match.goalsAgainst || '—',
            match.saves || '—',
            match.savePercentage || '—',
            match.goalsAgainstAverage || '—',
            match.goals || '—',
            match.assists || '—',
            match.shutouts || '—',
            match.penaltyMinutes || '—',
            match.timeOnIce || '—',
          ]
        : [
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

    const row = document.createElement('tr');

    values.forEach((value, idx) => {
      const td = document.createElement('td');
      const span = document.createElement('span');
      span.className = 'stats-table__pill';
      span.textContent = value;
      if (idx === 0) td.classList.add('stats-table__fo');
      td.appendChild(span);
      row.appendChild(td);
    });

    return row;
  }

  #skaterHeaders() {
    return [
      { label: 'ФО', title: 'Фэнтези очки за матч' },
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
  }

  #goalieHeaders() {
    return [
      { label: 'ФО', title: 'Фэнтези очки за матч' },
      { label: 'Дата', title: '' },
      { label: 'Команды', title: '' },
      { label: 'Счет', title: '' },
      { label: '№', title: 'Номер игрока' },
      { label: 'В', title: 'Выигрыши' },
      { label: 'П', title: 'Поражения' },
      { label: 'Бр', title: 'Броски' },
      { label: 'ПШ', title: 'Пропущенные шайбы' },
      { label: 'ОБ', title: 'Отраженные броски' },
      { label: '%ОБ', title: 'Процент отраженных бросков' },
      { label: 'КН', title: 'Коэффициент надежности' },
      { label: 'Ш', title: 'Заброшенные шайбы' },
      { label: 'А', title: 'Голевые передачи' },
      { label: 'И"0"', title: 'Сухие игры' },
      { label: 'Штр', title: 'Штрафные минуты' },
      { label: 'ВП', title: 'Время на площадке' },
    ];
  }
}

