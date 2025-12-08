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
    if (!name) {
      throw new Error('Не удалось извлечь имя игрока с этой страницы.');
    }

    const position = $(SELECTORS.position).text().trim() || 'Позиция не найдена';
    const clubLogo = $(SELECTORS.clubLogo).attr('src') || '/assets/default-logo.svg';
    const ageText = $(SELECTORS.age).text().trim();
    const nationality = $(SELECTORS.nationality).text().trim() || '—';
    const age = this.#parseAge(ageText);

    const statsBlock = $(SELECTORS.statsContainer).first();
    const preferredTab = statsBlock.find(SELECTORS.preferredTab).first();
    const thirdChild = statsBlock.length > 0 ? statsBlock.children().eq(2) : null;
    const matchesContainer = preferredTab.length > 0 ? preferredTab : thirdChild;

    const tableBody = this.#matchTableParser.findTableBody(matchesContainer, $);
    const hasAllGamesBody = Boolean(tableBody && tableBody.length > 0);
    const matchStats = this.#matchTableParser.parse(tableBody, $, position);

    return {
      name,
      position,
      clubLogo,
      age,
      nationality,
      hasAllGamesBody,
      matchStats,
    };
  }

  #parseAge(raw) {
    if (!raw) return 18;
    const num = parseInt(raw, 10);
    return Number.isFinite(num) ? num : 18;
  }
}

export default PlayerContentParser;

