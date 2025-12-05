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
        ? matchesContainer.find('div.matches_table, table.matches_table, #table_all_games')
        : null;
    const hasMatchesTable =
      matchesTable && matchesTable.length > 0
        ? true
        : matchesContainer && matchesContainer.is('div.matches_table');

    const hasAllGamesBody =
      matchesTable && matchesTable.length > 0
        ? matchesTable.find('tbody#table_all_games').length > 0 ||
          matchesTable.filter('tbody#table_all_games').length > 0
        : false;

    console.log('[PlayerContentParser] selectors:', {
      nameSelector: this.#nameSelector,
      positionSelector: this.#positionSelector,
      matchStatsSelector: this.#matchStatsSelector,
      hasMatchStats,
      hasMatchesTable,
      hasAllGamesBody,
    });

    if (!name) {
      throw new Error('Не удалось найти имя игрока по заданному селектору');
    }

    return {
      name,
      position: position || 'позиция не найдена',
      hasAllGamesBody,
    };
  }
}

export default PlayerContentParser;
