class UrlValidator {
  #playerUrlPattern = /^https:\/\/www\.khl\.ru\/players\/[A-Za-z0-9_-]+(?:\/.*)?$/i;

  validatePlayerUrl(rawUrl) {
    if (typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
      throw new Error('Введите ссылку на игрока.');
    }

    const normalizedUrl = rawUrl.trim();

    if (!this.#playerUrlPattern.test(normalizedUrl)) {
      throw new Error('Ссылка должна начинаться с https://www.khl.ru/players/.');
    }

    return normalizedUrl;
  }
}

export default UrlValidator;

