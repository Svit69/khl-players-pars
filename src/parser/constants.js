export const SELECTORS = {
  name: '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-header > div:nth-child(1) > div > span:nth-child(1)',
  position:
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-header > div:nth-child(3) > p.frameCard-header__detail-local.roboto.roboto-normal.roboto-xxl.color-black',
  clubLogo:
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__person > div > div.frameCard-header__person-logoClub > picture > img',
  age:
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-body > div:nth-child(2) > p.roboto.roboto-bold.roboto-lg.roboto-lg__lg-bigger.color-black',
  nationality:
    '#wrapper > div.players > div > div > section:nth-child(1) > div > div > div.frameCard-header__detail > div.frameCard-header__detail-body > div:nth-child(4) > p.roboto.roboto-bold.roboto-lg.roboto-lg__lg-bigger.color-black',
  statsContainer: 'div.players-detail__statTable, #table_all_games',
  preferredTab: 'div.statTable-tabContent.fade.tabs_hide',
  matchesTable: 'div.matches_table, table.matches_table, #table_all_games, tbody#table_all_games',
};

export const SEASON_START_UTC = Date.UTC(2025, 8, 5); // 5 сентября 2025
