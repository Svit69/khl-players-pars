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

export default PlayerParsingService;
