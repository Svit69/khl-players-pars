import { SELECTORS } from './constants.js';

class MatchTableParser {
  #fantasyCalculator;

  constructor(fantasyCalculator) {
    this.#fantasyCalculator = fantasyCalculator;
  }

  parse(tableBody, $, position) {
    if (!tableBody || tableBody.length === 0) return [];

    const rows = tableBody.find('tr');
    if (!rows || rows.length < 2) return [];

    const slice = [];
    const limit = Math.min(rows.length - 1, 4);

    for (let i = 1; i <= limit; i += 1) {
      const match = this.#mapRow(rows.eq(i), $, position);
      slice.push(match);
    }

    return slice;
  }

  #mapRow(row, $, position) {
    const cells = row.children('th,td');
    const readCell = (idx) =>
      cells && cells.eq(idx).length > 0 ? cells.eq(idx).text().trim() : '';
    const readScore = () => {
      if (!cells || cells.eq(2).length === 0) return '';
      const cell = cells.eq(2);
      const linkText = cell.find('a').text().trim();
      return linkText || cell.text().trim();
    };

    const match = {
      date: readCell(0),
      teams: readCell(1),
      score: readScore(),
      number: readCell(3),
      goals: readCell(4),
      assists: readCell(5),
      points: readCell(6),
      plusMinus: readCell(7),
      penaltyMinutes: readCell(10),
      shotsOnGoal: readCell(17),
      timeOnIce: readCell(22),
      hits: readCell(32),
      blockedShots: readCell(33),
      takeaways: readCell(35),
      interceptions: readCell(36),
    };

    if (this.#fantasyCalculator) {
      const fo = this.#fantasyCalculator.compute(position, match);
      match.fantasyScore = fo;
    }

    return match;
  }

  findTableBody(matchesContainer, $) {
    const table =
      matchesContainer && matchesContainer.length > 0
        ? matchesContainer.find(SELECTORS.matchesTable).first()
        : null;

    if (table && table.is('tbody')) {
      return table;
    }

    if (table && table.is('table')) {
      const body = table.find('tbody#table_all_games, tbody').first();
      if (body && body.length > 0) return body;
    }

    const fallback = $('tbody#table_all_games').first();
    return fallback && fallback.length > 0 ? fallback : null;
  }
}

export default MatchTableParser;
