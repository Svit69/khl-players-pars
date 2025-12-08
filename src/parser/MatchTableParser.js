import { SELECTORS, SEASON_START_UTC } from './constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;

class MatchTableParser {
  #fantasyCalculator;

  constructor(fantasyCalculator) {
    this.#fantasyCalculator = fantasyCalculator;
  }

  parse(tableBody, $, position) {
    if (!tableBody || tableBody.length === 0) {
      return { rows: [], seasonFoAvg: null, lastFiveFoAvg: null, lastFifteenFoAvg: null, tours: [] };
    }

    const rows = tableBody.find('tr');
    if (!rows || rows.length < 2) {
      return { rows: [], seasonFoAvg: null, lastFiveFoAvg: null, lastFifteenFoAvg: null, tours: [] };
    }

    const goalieMode = this.#isGoalie(position) || this.#looksLikeGoalieRow(rows.eq(1));

    const slice = [];
    let seasonSum = 0;
    let seasonCount = 0;
    let lastFiveSum = 0;
    let lastFiveCount = 0;
    let lastFifteenSum = 0;
    let lastFifteenCount = 0;
    const tourBuckets = new Map();

    for (let i = 1; i < rows.length; i += 1) {
      const match = goalieMode ? this.#mapGoalieRow(rows.eq(i)) : this.#mapSkaterRow(rows.eq(i));

      if (this.#fantasyCalculator) {
        const fo = this.#fantasyCalculator.compute(position, match);
        match.fantasyScore = fo;
      }

      const matchDate = this.#parseDateUtc(match.date);
      const validFo = typeof match.fantasyScore === 'number' && !match.hasDash;

      if (matchDate && matchDate >= SEASON_START_UTC && validFo) {
        seasonSum += match.fantasyScore;
        seasonCount += 1;

        const tourIndex = this.#tourIndex(matchDate);
        if (tourIndex >= 1) {
          const bucket = tourBuckets.get(tourIndex) || { sum: 0, count: 0 };
          bucket.sum += match.fantasyScore;
          bucket.count += 1;
          tourBuckets.set(tourIndex, bucket);
        }
      }

      if (i <= 5 && validFo) {
        lastFiveSum += match.fantasyScore;
        lastFiveCount += 1;
      }

      if (i <= 15 && validFo) {
        lastFifteenSum += match.fantasyScore;
        lastFifteenCount += 1;
      }

      if (i <= 5) {
        slice.push(match);
      }
    }

    const seasonFoAvg = seasonCount ? Math.round(seasonSum / seasonCount) : null;
    const lastFiveFoAvg = lastFiveCount ? Math.round(lastFiveSum / lastFiveCount) : null;
    const lastFifteenFoAvg = lastFifteenCount ? Math.round(lastFifteenSum / lastFifteenCount) : null;

    const tours = Array.from(tourBuckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([tour, bucket]) => {
        const start = SEASON_START_UTC + (tour - 1) * 7 * DAY_MS;
        const end = start + 6 * DAY_MS;
        return {
          tour,
          from: new Date(start).toISOString(),
          to: new Date(end).toISOString(),
          avg: bucket.count ? Math.round(bucket.sum / bucket.count) : null,
          matches: bucket.count,
        };
      });

    return {
      rows: slice,
      seasonFoAvg,
      lastFiveFoAvg,
      lastFifteenFoAvg,
      tours,
    };
  }

  #mapSkaterRow(row) {
    const cells = row.children('th,td');
    const readCell = (idx) => (cells && cells.eq(idx).length > 0 ? cells.eq(idx).text().trim() : '');
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
      hasDash: this.#rowHasDash(cells),
    };
  }

  #mapGoalieRow(row) {
    const cells = row.children('th,td');
    const readCell = (idx) => (cells && cells.eq(idx).length > 0 ? cells.eq(idx).text().trim() : '');
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
      // skip 6
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
      hasDash: this.#rowHasDash(cells),
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
    return position && position.toLowerCase().includes('врат');
  }

  #looksLikeGoalieRow(row) {
    const cells = row.children('th,td');
    if (!cells || cells.length === 0) return false;
    const count = cells.length;
    return count >= 15 && count <= 25;
  }

  #rowHasDash(cells) {
    return cells
      .map((_, el) => (el && el.children ? el.children[0]?.data || '' : ''))
      .get()
      .some((txt) => {
        const trimmed = String(txt).trim();
        return trimmed === '-' || trimmed === '—';
      });
  }

  #parseDateUtc(value) {
    if (!value || typeof value !== 'string') return null;
    const parts = value.trim().split(' ');
    if (parts.length < 3) return null;
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);
    const monthMap = {
      янв: 0,
      фев: 1,
      мар: 2,
      апр: 3,
      мая: 4,
      май: 4,
      июн: 5,
      июл: 6,
      авг: 7,
      сен: 8,
      сент: 8,
      окт: 9,
      ноя: 10,
      дек: 11,
    };
    const mkey = monthName.slice(0, 3);
    const month = monthMap[mkey];
    if (!Number.isFinite(day) || !Number.isFinite(year) || typeof month === 'undefined') return null;
    return Date.UTC(year, month, day);
  }

  #tourIndex(matchDateUtc) {
    if (matchDateUtc < SEASON_START_UTC) return -1;
    return Math.floor((matchDateUtc - SEASON_START_UTC) / (7 * DAY_MS)) + 1;
  }
}

export default MatchTableParser;

