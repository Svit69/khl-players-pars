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

export default UrlValidator;
