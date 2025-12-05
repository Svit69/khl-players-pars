import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

class AbstractHttpClient {
  async fetchHtml(_url) {
    throw new Error('Метод fetchHtml должен быть реализован в наследнике');
  }
}

class BrowserHttpClient extends AbstractHttpClient {
  #defaultHeaders;

  constructor() {
    super();
    this.#defaultHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Upgrade-Insecure-Requests': '1',
      Referer: 'https://www.khl.ru/',
      Connection: 'keep-alive',
    };
  }

  async fetchHtml(url) {
    let currentUrl = url;
    let cookieJar = '';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await fetch(currentUrl, {
        headers: {
          ...this.#defaultHeaders,
          ...(cookieJar ? { Cookie: cookieJar } : {}),
        },
        redirect: 'manual',
      });

      const setCookie = response.headers.raw()['set-cookie'];
      if (setCookie?.length) {
        const newCookies = setCookie.map((c) => c.split(';')[0]).join('; ');
        cookieJar = cookieJar ? `${cookieJar}; ${newCookies}` : newCookies;
      }

      if (response.status >= 200 && response.status < 300) {
        return response.text();
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error('Редирект без заголовка Location');
        }
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      throw new Error(`Ошибка при запросе страницы: ${response.status}`);
    }

    throw new Error('Превышено число попыток переходов по редиректам');
  }
}

class UrlValidator {
  #playerUrlPattern =
    /^https:\/\/www\.khl\.ru\/players\/[A-Za-z0-9_-]+(?:\/.*)?$/i;

  validatePlayerUrl(rawUrl) {
    if (typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
      throw new Error('Ссылка не должна быть пустой');
    }

    const normalizedUrl = rawUrl.trim();

    if (!this.#playerUrlPattern.test(normalizedUrl)) {
      throw new Error('Нужно указать ссылку формата https://www.khl.ru/players/');
    }

    return normalizedUrl;
  }
}

class AbstractContentParser {
  parseContent(_html) {
    throw new Error('Метод parseContent должен быть реализован в наследнике');
  }
}

class PlayerContentParser extends AbstractContentParser {
  #targetSelector =
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-header > div:nth-child(1) > div > span:nth-child(1)';
  #positionSelector =
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-header > div:nth-child(3) > p.frameCard-header__detail-local.roboto.roboto-normal.roboto-xxl.color-black';
  #statsTabSelector =
    '#wrapper > div.players > div > div > section:nth-child(2) > div > div.statTable-tabContent.fade.tabs_hide';
  #statsTableSelector = '#table_all_games';

  parseContent(html) {
    const $ = cheerio.load(html);
    const name = $(this.#targetSelector).text().trim();
    const position = $(this.#positionSelector).text().trim();
    const statsTab = $(this.#statsTabSelector);
    const hasStatsSection = statsTab.length > 0;
    const hasStatsTable =
      hasStatsSection && statsTab.find(this.#statsTableSelector).length > 0;

    if (!name) {
      throw new Error('Не удалось найти данные по указанному селектору');
    }

    return {
      name,
      position: position || 'позиция не найдена',
      hasStatsTable,
    };
  }
}

class PlayerParsingService {
  #validator;
  #httpClient;
  #parser;

  constructor(validator, httpClient, parser) {
    this.#validator = validator;
    this.#httpClient = httpClient;
    this.#parser = parser;
  }

  async extractPlayerInfo(url) {
    const validUrl = this.#validator.validatePlayerUrl(url);
    const html = await this.#httpClient.fetchHtml(validUrl);
    return this.#parser.parseContent(html);
  }
}

export {
  BrowserHttpClient,
  PlayerContentParser,
  PlayerParsingService,
  UrlValidator,
};
