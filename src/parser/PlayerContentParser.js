import * as cheerio from 'cheerio';
import AbstractContentParser from './AbstractContentParser.js';
import { SELECTORS } from './constants.js';
import MatchTableParser from './MatchTableParser.js';
import FantasyScoreCalculator from './FantasyScoreCalculator.js';

class PlayerContentParser extends AbstractContentParser {
  #matchTableParser;

  constructor() {
    super();
    this.#matchTableParser = new MatchTableParser(new FantasyScoreCalculator());
  }

  parseContent(html) {
    const $ = cheerio.load(html);
    const name = $(SELECTORS.name).text().trim();
    const position = $(SELECTORS.position).text().trim();

    const statsBlock = $(SELECTORS.statsContainer).first();
    const preferredTab = statsBlock.find(SELECTORS.preferredTab).first();
    const thirdChild = statsBlock.length > 0 ? statsBlock.children().eq(2) : null;
    const matchesContainer = preferredTab.length > 0 ? preferredTab : thirdChild;

    const tableBody = this.#matchTableParser.findTableBody(matchesContainer, $);
    const hasAllGamesBody = tableBody && tableBody.length > 0;
    const matchStats = this.#matchTableParser.parse(tableBody, $, position);

    this.#logSelectors({ hasAllGamesBody, matchCount: matchStats.length });

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

  #logSelectors({ hasAllGamesBody, matchCount }) {
    console.log('[PlayerContentParser] selectors:', {
      nameSelector: SELECTORS.name,
      positionSelector: SELECTORS.position,
      matchStatsSelector: SELECTORS.statsContainer,
      hasAllGamesBody,
      matchCount,
    });
  }
}

export default PlayerContentParser;
