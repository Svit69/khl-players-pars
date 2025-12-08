import {
  BrowserHttpClient,
  PlayerContentParser,
  PlayerParsingService,
  UrlValidator,
} from '../src/index.js';
import PlayerCache from '../src/cache/PlayerCache.js';
import { validateParseRequest } from '../src/validation/requestValidator.js';

const validator = new UrlValidator();
const httpClient = new BrowserHttpClient();
const parser = new PlayerContentParser();
const parsingService = new PlayerParsingService(validator, httpClient, parser);
const cache = new PlayerCache(60, 60); // TTL 60s, cleanup 60s

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const payload = await readJsonBody(req);
    const { url, playerId } = validateParseRequest(payload);

    const cached = cache.get(playerId);
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }

    const result = await parsingService.extractPlayerInfo(url);

    if (result) {
      cache.set(playerId, result);
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message?.toLowerCase().includes('ссылка') ? 400 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Неизвестная ошибка',
    });
  }
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(raw);
}
