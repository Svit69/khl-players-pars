import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const firstResponse = await fetch(url, {
      headers: this.#defaultHeaders,
      redirect: 'manual',
    });

    const cookies =
      firstResponse.headers.raw()['set-cookie']?.map((c) => c.split(';')[0]).join('; ') ||
      '';

    if (this.#isRedirect(firstResponse.status)) {
      const location = firstResponse.headers.get('location') || url;
      const followResponse = await fetch(location, {
        headers: {
          ...this.#defaultHeaders,
          ...(cookies ? { Cookie: cookies } : {}),
        },
        redirect: 'follow',
      });

      if (!followResponse.ok) {
        throw new Error(`Ошибка при запросе страницы: ${followResponse.status}`);
      }

      return followResponse.text();
    }

    if (!firstResponse.ok) {
      throw new Error(`Ошибка при запросе страницы: ${firstResponse.status}`);
    }

    return firstResponse.text();
  }

  #isRedirect(status) {
    return status >= 300 && status < 400;
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

  parseContent(html) {
    const $ = cheerio.load(html);
    const text = $(this.#targetSelector).text().trim();

    if (!text) {
      throw new Error('Не удалось найти данные по указанному селектору');
    }

    return text;
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

class ApplicationServer {
  #app;
  #parserService;
  #port;

  constructor(parserService, port = 3000) {
    this.#app = express();
    this.#parserService = parserService;
    this.#port = port;
    this.configureMiddleware();
    this.configureRoutes();
  }

  configureMiddleware() {
    this.#app.use(express.json());
    this.#app.use(express.static(path.join(__dirname, 'public')));
  }

  configureRoutes() {
    this.#app.post('/api/parse', async (req, res) => {
      try {
        const { url } = req.body;
        const result = await this.#parserService.extractPlayerInfo(url);
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message || 'Неизвестная ошибка',
        });
      }
    });
  }

  launch() {
    this.#app.listen(this.#port, () => {
      console.log(`Сервер запущен: http://localhost:${this.#port}`);
    });
  }
}

const validator = new UrlValidator();
const httpClient = new BrowserHttpClient();
const parser = new PlayerContentParser();
const parsingService = new PlayerParsingService(validator, httpClient, parser);
const server = new ApplicationServer(parsingService, process.env.PORT || 3000);

server.launch();
