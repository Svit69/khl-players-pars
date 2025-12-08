export function resolveFlagSrc(nationality) {
  if (!nationality) return '/assets/flags/default.svg';
  const slug = nationality.trim().toLowerCase();
  const map = {
    россия: 'russia',
    рф: 'russia',
    canada: 'canada',
    канада: 'canada',
    usa: 'usa',
    сша: 'usa',
    финляндия: 'finland',
    finland: 'finland',
    sweden: 'sweden',
    швеция: 'sweden',
    латвия: 'latvia',
    latvia: 'latvia',
    беларусь: 'belarus',
    belarus: 'belarus',
    чехия: 'czech',
    slovakia: 'slovakia',
    словакия: 'slovakia',
    germany: 'germany',
    германия: 'germany',
    kazakhstan: 'kazakhstan',
    казахстан: 'kazakhstan',
    switzerland: 'switzerland',
    швейцария: 'switzerland',
    norway: 'norway',
    норвегия: 'norway',
    denmark: 'denmark',
    дания: 'denmark',
    france: 'france',
    франция: 'france',
    austria: 'austria',
    австрия: 'austria',
    china: 'china',
    китай: 'china',
    slovenia: 'slovenia',
    croatia: 'croatia',
  };
  const key = map[slug] || slug.replace(/\s+/g, '-');
  return `/assets/flags/icon-${key}.png`;
}

export function ageSuffix(age) {
  const mod10 = age % 10;
  const mod100 = age % 100;
  if (mod10 === 1 && mod100 !== 11) return 'год';
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'года';
  return 'лет';
}

export function foClass(value) {
  if (typeof value !== 'number') return '';
  if (value < 20) return 'stats-digest__value--low';
  if (value < 30) return 'stats-digest__value--orange';
  if (value < 40) return 'stats-digest__value--yellow';
  if (value < 50) return 'stats-digest__value--mid';
  if (value < 60) return 'stats-digest__value--emerald';
  if (value < 70) return 'stats-digest__value--aqua';
  if (value <= 100) return 'stats-digest__value--ultra';
  return '';
}
