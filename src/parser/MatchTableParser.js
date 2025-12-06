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
    const goalieMode =
      this.#isGoalie(position) || this.#looksLikeGoalieRow(rows.eq(1));
    const limit = Math.min(rows.length - 1, 4);

    for (let i = 1; i <= limit; i += 1) {
      const match = goalieMode
        ? this.#mapGoalieRow(rows.eq(i), $)
        : this.#mapSkaterRow(rows.eq(i), $);
      if (this.#fantasyCalculator) {
        const fo = this.#fantasyCalculator.compute(position, match);
        match.fantasyScore = fo;
      }
      slice.push(match);
    }

    return slice;
  }

  #mapSkaterRow(row, $) {
    const cells = row.children('th,td');
    const readCell = (idx) =>
      cells && cells.eq(idx).length > 0 ? cells.eq(idx).text().trim() : '';
    const readScore = () => {
      if (!cells || cells.eq(2).length === 0) return '';
      const cell = cells.eq(2);
      const linkText = cell.find('a').text().trim();
      return linkText || cell.text().trim();
    };
    return {
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
      type: 'skater',
    };
  }

  #mapGoalieRow(row, $) {
    const cells = row.children('th,td');
    const readCell = (idx) =>
      cells && cells.eq(idx).length > 0 ? cells.eq(idx).text().trim() : '';
    const readScore = () => {
      if (!cells || cells.eq(2).length === 0) return '';
      const cell = cells.eq(2);
      const linkText = cell.find('a').text().trim();
      return linkText || cell.text().trim();
    };

    return {
      date: readCell(0),
      teams: readCell(1),
      score: readScore(),
      number: readCell(3),
      wins: readCell(4),
      losses: readCell(5),
      shots: readCell(7),
      goalsAgainst: readCell(8),
      saves: readCell(9),
      savePercentage: readCell(10),
      goalsAgainstAverage: readCell(11),
      goals: readCell(12),
      assists: readCell(13),
      shutouts: readCell(14),
      penaltyMinutes: readCell(15),
      timeOnIce: readCell(16),
      type: 'goalie',
    };
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

  #isGoalie(position) {
    return position && position.toLowerCase().includes('вратар');
  }

  #looksLikeGoalieRow(row) {
    const cells = row.children('th,td');
    if (!cells || cells.length === 0) return false;
    const count = cells.length;
    return count >= 15 && count <= 25;
  }
}

export default MatchTableParser;
