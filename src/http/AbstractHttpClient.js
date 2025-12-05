class AbstractHttpClient {
  async fetchHtml(_url) {
    throw new Error('Метод fetchHtml должен быть реализован в наследнике');
  }
}

export default AbstractHttpClient;
