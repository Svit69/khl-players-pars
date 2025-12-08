import { formatDateRange, foClass } from './utils.js';

export default function renderTours(tours) {
  if (!Array.isArray(tours) || tours.length === 0) return null;
  const wrap = document.createElement('div');
  wrap.className = 'tours-digest';

  tours.slice(0, 8).forEach((tour) => {
    const item = document.createElement('div');
    item.className = 'tours-digest__item';

    const title = document.createElement('div');
    title.className = 'tours-digest__title';
    title.textContent = `${tour.tour} тур`;

    const date = document.createElement('div');
    date.className = 'tours-digest__date';
    date.textContent = formatDateRange(tour.start, tour.end);

    const val = document.createElement('div');
    val.className = `tours-digest__value ${foClass(tour.foAvg)}`;
    val.textContent = tour.foAvg ?? '—';

    item.appendChild(title);
    item.appendChild(date);
    item.appendChild(val);
    wrap.appendChild(item);
  });

  return wrap;
}
