import { foClass } from './utils.js';

export default function renderDigest(matchStats) {
  const { lastFiveFoAvg, lastFifteenFoAvg, seasonFoAvg } = matchStats || {};
  const items = [
    { label: 'Посл. 5', value: lastFiveFoAvg },
    { label: 'Посл. 15', value: lastFifteenFoAvg },
    { label: 'Сезон', value: seasonFoAvg },
  ].filter((i) => i.value !== null && typeof i.value !== 'undefined');

  if (!items.length) return null;

  const wrap = document.createElement('div');
  wrap.className = 'stats-digest';

  items.forEach((item) => {
    const box = document.createElement('div');
    box.className = 'stats-digest__item';

    const label = document.createElement('span');
    label.className = 'stats-digest__label';
    label.textContent = item.label;

    const val = document.createElement('span');
    val.className = `stats-digest__value ${foClass(item.value)}`;
    val.textContent = item.value;

    box.appendChild(label);
    box.appendChild(val);
    wrap.appendChild(box);
  });

  return wrap;
}

