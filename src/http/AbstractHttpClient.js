class AbstractHttpClient {
  async fetchHtml(_url) {
    throw new Error('fetchHtml must be implemented in a subclass');
  }
}

export default AbstractHttpClient;

