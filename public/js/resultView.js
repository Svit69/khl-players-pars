export default class ResultView {
  #container;
  #statsRenderer;

  constructor(element, statsRenderer) {
    this.#container = element;
    this.#statsRenderer = statsRenderer;
  }

  showLoading() {
    this.#container.classList.remove('result--success', 'result--error');
    this.#container.innerHTML = '<span class="result__placeholder">Загружаем...</span>';
  }

  showSuccess(text) {
    this.#container.classList.remove('result--error');
    this.#container.classList.add('result--success');
    this.#container.textContent = '';

    const profile = this.#renderProfile(text);
    if (profile) this.#container.appendChild(profile);

    if (Array.isArray(text?.matchStats?.rows) && text.matchStats.rows.length) {
      const digest = this.#renderDigest(text.matchStats);
      if (digest) {
        this.#container.appendChild(digest);
      }
      const table = this.#statsRenderer.render(text.matchStats.rows, text?.position || '');
      if (table) {
        this.#container.appendChild(table);
      }
    }
  }

  showError(message) {
    this.#container.classList.remove('result--success');
    this.#container.classList.add('result--error');
    this.#container.textContent = message;
  }

  #renderProfile(data) {
    const wrap = document.createElement('div');
    wrap.className = 'profile';

    const logoBox = document.createElement('div');
    logoBox.className = 'profile__logo';
    const logoImg = document.createElement('img');
    logoImg.src = data?.clubLogo || '/assets/default-logo.svg';
    logoImg.alt = 'Лого клуба';
    logoBox.appendChild(logoImg);
    wrap.appendChild(logoBox);

    const info = document.createElement('div');
    info.className = 'profile__info';

    const nameEl = document.createElement('h2');
    nameEl.className = 'profile__name';
    nameEl.textContent = data?.name || '—';
    info.appendChild(nameEl);

    const meta = document.createElement('div');
    meta.className = 'profile__meta';

    const posEl = document.createElement('span');
    posEl.textContent = data?.position || '—';
    meta.appendChild(posEl);

    const ageEl = document.createElement('span');
    const ageVal = typeof data?.age === 'number' ? data.age : 18;
    ageEl.textContent = `${ageVal} ${this.#ageSuffix(ageVal)}`;
    meta.appendChild(ageEl);

    const nationWrap = document.createElement('span');
    const flagImg = document.createElement('img');
    flagImg.className = 'profile__flag';
    flagImg.alt = data?.nationality || 'национальность';
    flagImg.src = this.#resolveFlagSrc(data?.nationality);
    nationWrap.appendChild(flagImg);
    const nationText = document.createElement('span');
    nationText.textContent = data?.nationality || '—';
    nationWrap.appendChild(nationText);
    meta.appendChild(nationWrap);

    info.appendChild(meta);
    wrap.appendChild(info);
    return wrap;
  }

  #renderSummary(matchStats) {
    // Deprecated
    return null;
  }

  #resolveFlagSrc(nationality) {
    if (!nationality) return '/flags/default.svg';
    const slug = nationality.trim().toLowerCase().replace(/\s+/g, '-');
    const codeMap = {
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
    const key = codeMap[slug] || codeMap[nationality.toLowerCase()] || slug;
    return `/assets/flags/icon-${key}.png`;
  }

  #ageSuffix(age) {
    const mod10 = age % 10;
    const mod100 = age % 100;
    if (mod10 === 1 && mod100 !== 11) return 'год';
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'года';
    return 'лет';
  }

  #renderDigest(matchStats) {
    const { lastFiveFoAvg, lastFifteenFoAvg, seasonFoAvg } = matchStats;
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
      val.className = 'stats-digest__value';
      val.textContent = item.value;

      box.appendChild(label);
      box.appendChild(val);
      wrap.appendChild(box);
    });

    return wrap;
  }
}
