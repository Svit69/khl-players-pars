import { foClass, formatDateRange } from './utils.js';

export default function renderTours(tours = []) {
  if (!Array.isArray(tours) || tours.length === 0) return null;

  const wrap = document.createElement('div');
  wrap.className = 'tour-digest';

  const head = document.createElement('div');
  head.className = 'tour-digest__head';
  const title = document.createElement('h3');
  title.className = 'tour-digest__title';
  title.textContent = 'Туры (с 5 сентября 2025)';
  head.appendChild(title);
  wrap.appendChild(head);

  const list = document.createElement('div');
  list.className = 'tour-digest__list';

  tours.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'tour-card';

    const label = document.createElement('div');
    label.className = 'tour-card__label';
    label.textContent = `Тур ${item.tour}`;

    const value = document.createElement('div');
    value.className = `tour-card__value ${foClass(item.avg)}`;
    value.textContent = typeof item.avg === 'number' ? item.avg : '—';

    const meta = document.createElement('div');
    meta.className = 'tour-card__meta';
    meta.textContent = `Матчей: ${item.matches ?? 0}`;

    const range = document.createElement('div');
    range.className = 'tour-card__range';
    range.textContent = formatDateRange(item.from, item.to);

    card.appendChild(label);
    card.appendChild(value);
    card.appendChild(meta);
    card.appendChild(range);
    list.appendChild(card);
  });

  wrap.appendChild(list);
  return wrap;
}
