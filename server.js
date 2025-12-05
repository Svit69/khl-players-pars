import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BrowserHttpClient,
  PlayerContentParser,
  PlayerParsingService,
  UrlValidator,
} from './src/playerParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validator = new UrlValidator();
const httpClient = new BrowserHttpClient();
const parser = new PlayerContentParser();
const parsingService = new PlayerParsingService(validator, httpClient, parser);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/parse', async (req, res) => {
  try {
    const { url } = req.body;
    const result = await parsingService.extractPlayerInfo(url);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Неизвестная ошибка',
    });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
