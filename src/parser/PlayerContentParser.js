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

    const matchStats = this.#extractSecondRowStats(tableBody, $);

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

  #extractSecondRowStats(tableBody, $) {
    if (!tableBody || tableBody.length === 0) {
      return null;
    }

    const rows = tableBody.find('tr');
    if (!rows || rows.length < 2) {
      return null;
    }

    const targetRow = rows.eq(1);
    const cells = targetRow.children('th,td');
    const rawCells = cells.map((_, el) => $(el).text().trim()).get();

    const readCell = (idx) =>
      cells && cells.eq(idx).length > 0 ? cells.eq(idx).text().trim() : '';

    const readScore = () => {
      if (!cells || cells.eq(2).length === 0) return '';
      const cell = cells.eq(2);
      const linkText = cell.find('a').text().trim();
      return linkText || cell.text().trim();
    };

    console.log('[PlayerContentParser] table row stats:', {
      cellsCount: cells.length,
      rawCells,
    });

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
    };
  }
}

export default PlayerContentParser;
