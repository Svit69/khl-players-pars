import * as cheerio from 'cheerio';
import AbstractContentParser from './AbstractContentParser.js';

class PlayerContentParser extends AbstractContentParser {
  #nameSelector =
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-header > div:nth-child(1) > div > span:nth-child(1)';
  #positionSelector =
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-header > div:nth-child(3) > p.frameCard-header__detail-local.roboto.roboto-normal.roboto-xxl.color-black';
  #matchStatsSelector =
    '#wrapper section:nth-child(2) > div.statTable.players-detail__statTable, #wrapper > div.players > div > div > section:nth-child(2) > div.statTable.players-detail__statTable';

  parseContent(html) {
    const $ = cheerio.load(html);
    const name = $(this.#nameSelector).text().trim();
    const position = $(this.#positionSelector).text().trim();
    const hasMatchStats = $(this.#matchStatsSelector).first().length > 0;

    if (!name) {
      throw new Error('Не удалось найти имя игрока по заданному селектору');
    }

    return {
      name,
      position: position || 'позиция не найдена',
      hasMatchStats,
    };
  }
}

export default PlayerContentParser;
