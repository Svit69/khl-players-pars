import fetch from 'node-fetch';
import AbstractHttpClient from './AbstractHttpClient.js';

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

      this.#updateCookieJar(response, (newCookies) => {
        cookieJar = cookieJar ? `${cookieJar}; ${newCookies}` : newCookies;
      });

      if (this.#isSuccess(response.status)) {
        return response.text();
      }

      if (this.#isRedirect(response.status)) {
        currentUrl = this.#resolveRedirect(currentUrl, response);
        continue;
      }

      throw new Error(`Ошибка при запросе страницы: ${response.status}`);
    }

    throw new Error('Превышено число попыток переходов по редиректам');
  }

  #updateCookieJar(response, setter) {
    const setCookie = response.headers.raw()['set-cookie'];
    if (setCookie?.length) {
      const newCookies = setCookie.map((c) => c.split(';')[0]).join('; ');
      setter(newCookies);
    }
  }

  #resolveRedirect(currentUrl, response) {
    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Редирект без заголовка Location');
    }
    return new URL(location, currentUrl).toString();
  }

  #isSuccess(status) {
    return status >= 200 && status < 300;
  }

  #isRedirect(status) {
    return status >= 300 && status < 400;
  }
}

export default BrowserHttpClient;
