export function extractPlayerId(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => p.toLowerCase() === 'players');
    if (idx === -1 || !parts[idx + 1]) return null;
    return parts[idx + 1];
  } catch {
    return null;
  }
}

export function validateParseRequest(body) {
  if (!body || typeof body.url !== 'string') {
    throw new Error('Нужно передать поле url строкой');
  }
  const url = body.url.trim();
  if (!url) {
    throw new Error('Ссылка не должна быть пустой');
  }
  const playerId = extractPlayerId(url);
  if (!playerId) {
    throw new Error('Некорректная ссылка на игрока');
  }
  return { url, playerId };
}
