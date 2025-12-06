export default class ApiClient {
  async requestPlayerParsing(playerUrl) {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: playerUrl }),
    });

    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || 'Ошибка при обработке запроса');
    }

    return payload.data;
  }
}
