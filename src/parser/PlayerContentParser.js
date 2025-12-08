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
    const clubLogo = $(SELECTORS.clubLogo).attr('src') || '/assets/default-logo.svg';
    const ageText = $(SELECTORS.age).text().trim();
    const nationality = $(SELECTORS.nationality).text().trim();
    const age = this.#parseAge(ageText);

    const statsBlock = $(SELECTORS.statsContainer).first();
    const preferredTab = statsBlock.find(SELECTORS.preferredTab).first();
    const thirdChild = statsBlock.length > 0 ? statsBlock.children().eq(2) : null;
    const matchesContainer = preferredTab.length > 0 ? preferredTab : thirdChild;

    const tableBody = this.#matchTableParser.findTableBody(matchesContainer, $);
    const hasAllGamesBody = tableBody && tableBody.length > 0;
    const matchStats = this.#matchTableParser.parse(tableBody, $, position);

    if (!name) {
      throw new Error('Не удалось найти имя игрока по заданному селектору');
    }

    return {
      name,
      position: position || 'позиция не найдена',
      clubLogo,
      age,
      nationality: nationality || '—',
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

  #parseAge(raw) {
    if (!raw) return 18;
    const num = parseInt(raw, 10);
    return Number.isFinite(num) ? num : 18;
  }
}

export default PlayerContentParser;
