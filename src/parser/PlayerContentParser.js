import * as cheerio from 'cheerio';
import AbstractContentParser from './AbstractContentParser.js';

class PlayerContentParser extends AbstractContentParser {
  #nameSelector =
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-header > div:nth-child(1) > div > span:nth-child(1)';
  #positionSelector =
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-header > div:nth-child(3) > p.frameCard-header__detail-local.roboto.roboto-normal.roboto-xxl.color-black';
  #matchStatsSelector = 'div.players-detail__statTable, #table_all_games';

  parseContent(html) {
    const $ = cheerio.load(html);
    const name = $(this.#nameSelector).text().trim();
    const position = $(this.#positionSelector).text().trim();

    const statsBlock = $(this.#matchStatsSelector).first();
    const hasMatchStats =
      statsBlock.length > 0 &&
      (statsBlock.is('table')
        ? statsBlock.find('tbody tr').length > 0
        : statsBlock.find('table').length > 0);

    const preferredTab = statsBlock.find('div.statTable-tabContent.fade.tabs_hide').first();
    const thirdChild = statsBlock.length > 0 ? statsBlock.children().eq(2) : null;
    const matchesContainer = preferredTab.length > 0 ? preferredTab : thirdChild;

    const matchesTable =
      matchesContainer && matchesContainer.length > 0
        ? matchesContainer
            .find('div.matches_table, table.matches_table, #table_all_games, tbody#table_all_games')
            .first()
        : null;

    const tableBody =
      matchesTable && matchesTable.is('tbody')
        ? matchesTable
        : matchesTable && matchesTable.is('table')
          ? matchesTable.find('tbody#table_all_games, tbody').first()
          : $('tbody#table_all_games').first();

    const hasAllGamesBody = tableBody && tableBody.length > 0;

    const matchStats = this.#extractMatchRows(tableBody, $, position);

    console.log('[PlayerContentParser] selectors:', {
      nameSelector: this.#nameSelector,
      positionSelector: this.#positionSelector,
      matchStatsSelector: this.#matchStatsSelector,
      hasMatchStats,
      hasAllGamesBody,
    });

    if (!name) {
      throw new Error('Не удалось найти имя игрока по заданному селектору');
    }

    return {
      name,
      position: position || 'позиция не найдена',
      hasAllGamesBody,
      matchStats,
    };
  }

  #extractMatchRows(tableBody, $, position) {
    if (!tableBody || tableBody.length === 0) {
      return [];
    }

    const rows = tableBody.find('tr');
    if (!rows || rows.length < 2) {
      return [];
    }

    const slice = [];
    const limit = Math.min(rows.length - 1, 4); // берем первые 4 строки после первой
    for (let i = 1; i <= limit; i += 1) {
      const targetRow = rows.eq(i);
      const cells = targetRow.children('th,td');
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

      if (this.#isSkater(position)) {
        match.fantasyScore = this.#computeFantasyScore(position, match);
      }

      slice.push(match);
    }

    return slice;
  }

  #isSkater(position) {
    return position && position.toLowerCase() !== 'вратарь';
  }

  #computeFantasyScore(position, stats) {
    const toNum = (value) => {
      if (typeof value !== 'string') return Number(value) || 0;
      const normalized = value.replace(',', '.').replace('−', '-').trim();
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const points = toNum(stats.points);
    const shotsOnGoal = toNum(stats.shotsOnGoal);
    const plusMinus = toNum(stats.plusMinus);
    const hits = toNum(stats.hits);
    const blockedShots = toNum(stats.blockedShots);
    const takeaways = toNum(stats.takeaways);
    const interceptions = toNum(stats.interceptions);
    const penaltyMinutes = toNum(stats.penaltyMinutes);
    const timeOnIce = stats.timeOnIce || '';

    const isDefender = position && position.toLowerCase().includes('защит');

    const weights = isDefender
      ? {
          shotsOnGoal: 2.5,
          plusMinus: 7,
          hits: 3.2,
          blockedShots: 4.3,
          takeaways: 4.4,
          interceptions: 4.4,
          timeFactor: 40,
          penalty: -3.2,
        }
      : {
          shotsOnGoal: 2.2,
          plusMinus: 7,
          hits: 1.2,
          blockedShots: 1.3,
          takeaways: 1.4,
          interceptions: 1.4,
          timeFactor: 50,
          penalty: -4.2,
        };

    let score = 0;

    if (points > 0) {
      score += 30 + (points - 1) * 10;
    }

    score += shotsOnGoal * weights.shotsOnGoal;
    score += plusMinus * weights.plusMinus;
    score += hits * weights.hits;
    score += blockedShots * weights.blockedShots;
    score += takeaways * weights.takeaways;
    score += interceptions * weights.interceptions;

    const timeMinutes = this.#parseTimeToMinutes(timeOnIce);
    score += (timeMinutes / 60) * weights.timeFactor;

    score += penaltyMinutes * weights.penalty;

    const rounded = Math.round(score);
    if (rounded > 100) return 100;
    if (rounded < -100) return -100;
    return rounded;
  }

  #parseTimeToMinutes(value) {
    if (!value || typeof value !== 'string') return 0;
    const parts = value.split(':');
    if (parts.length !== 2) return 0;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0;
    return minutes + seconds / 60;
  }
}

export default PlayerContentParser;
