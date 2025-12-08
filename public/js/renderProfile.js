import { resolveFlagSrc, ageSuffix } from './utils.js';

export default function renderProfile(data) {
  const wrap = document.createElement('div');
  wrap.className = 'profile';

  const logoBox = document.createElement('div');
  logoBox.className = 'profile__logo';
  const logoImg = document.createElement('img');
  logoImg.src = data?.clubLogo || '/assets/default-logo.svg';
  logoImg.alt = 'Логотип клуба';
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
  ageEl.textContent = `${ageVal} ${ageSuffix(ageVal)}`;
  meta.appendChild(ageEl);

  const nationWrap = document.createElement('span');
  const flagImg = document.createElement('img');
  flagImg.className = 'profile__flag';
  flagImg.alt = data?.nationality || 'Нация';
  flagImg.src = resolveFlagSrc(data?.nationality);
  nationWrap.appendChild(flagImg);
  const nationText = document.createElement('span');
  nationText.textContent = data?.nationality || '—';
  nationWrap.appendChild(nationText);
  meta.appendChild(nationWrap);

  info.appendChild(meta);
  wrap.appendChild(info);
  return wrap;
}

