class FantasyScoreCalculator {
  compute(position, stats) {
    const isGoalie = this.#isGoalie(position) || stats?.type === 'goalie';
    const isSkater = this.#isSkater(position) || stats?.type === 'skater';

    if (isGoalie) {
      return this.#computeGoalieScore(stats);
    }

    if (!isSkater) return null;

    return this.#computeSkaterScore(position, stats);
  }

  #computeSkaterScore(position, stats) {
    const normalized = this.#normalizeSkaterStats(stats);
    const weights = this.#weightsForSkater(position);

    let score = 0;

    if (normalized.points > 0) {
      score += 30 + (normalized.points - 1) * 10;
    }

    score += normalized.shotsOnGoal * weights.shotsOnGoal;
    score += normalized.plusMinus * weights.plusMinus;
    score += normalized.hits * weights.hits;
    score += normalized.blockedShots * weights.blockedShots;
    score += normalized.takeaways * weights.takeaways;
    score += normalized.interceptions * weights.interceptions;

    const timeMinutes = this.#parseTimeToMinutes(normalized.timeOnIce);
    score += (timeMinutes / 60) * weights.timeFactor;

    score += normalized.penaltyMinutes * weights.penalty;

    return this.#clamp(Math.round(score));
  }

  #computeGoalieScore(stats) {
    const toNum = (value) => {
      if (typeof value !== 'string') return Number(value) || 0;
      const normalized = value
        .replace('%', '')
        .replace(',', '.')
        .replace(/—/g, '-')
        .replace(/–/g, '-')
        .trim();
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const wins = toNum(stats.wins);
    const losses = toNum(stats.losses);
    const goalsAgainst = toNum(stats.goalsAgainst);
    const saves = toNum(stats.saves);
    const savePct = toNum(stats.savePercentage);
    const shutouts = toNum(stats.shutouts);
    const penalties = toNum(stats.penaltyMinutes);
    const goals = toNum(stats.goals);
    const assists = toNum(stats.assists);
    const timeOnIce = stats.timeOnIce || '';

    const timeMinutes = this.#parseTimeToMinutes(timeOnIce);
    if (timeMinutes === 0) {
      return null;
    }

    let score = 0;

    if (shutouts >= 1) score += 40;
    if (savePct > 90) score += 5;
    if (savePct > 94) score += 10;
    if (wins >= 1) score += 20;
    if (losses >= 1) score -= 8;

    score += goalsAgainst * -3.6;
    score += saves * 1;
    score += penalties * -2;
    score += (goals + assists) * 15;

    return this.#clamp(Math.round(score));
  }

  #normalizeSkaterStats(stats) {
    const toNum = (value) => {
      if (typeof value !== 'string') return Number(value) || 0;
      const normalized = value
        .replace(',', '.')
        .replace(/—/g, '-')
        .replace(/–/g, '-')
        .trim();
      if (normalized === '-' || normalized === '') return 0;
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return {
      points: toNum(stats.points),
      shotsOnGoal: toNum(stats.shotsOnGoal),
      plusMinus: toNum(stats.plusMinus),
      hits: toNum(stats.hits),
      blockedShots: toNum(stats.blockedShots),
      takeaways: toNum(stats.takeaways),
      interceptions: toNum(stats.interceptions),
      penaltyMinutes: toNum(stats.penaltyMinutes),
      timeOnIce: stats.timeOnIce || '',
    };
  }

  #weightsForSkater(position) {
    const isDefender = position && position.toLowerCase().includes('защит');

    if (isDefender) {
      return {
        shotsOnGoal: 2.5,
        plusMinus: 7,
        hits: 3.2,
        blockedShots: 4.3,
        takeaways: 4.4,
        interceptions: 4.4,
        timeFactor: 40,
        penalty: -3.2,
      };
    }

    return {
      shotsOnGoal: 2.2,
      plusMinus: 7,
      hits: 1.2,
      blockedShots: 1.3,
      takeaways: 1.4,
      interceptions: 1.4,
      timeFactor: 50,
      penalty: -4.2,
    };
  }

  #parseTimeToMinutes(value) {
    if (!value || typeof value !== 'string') return 0;
    const parts = value.split(':');
    if (parts.length !== 2) return 0;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0;
    return minutes + seconds / 60;
  }

  #clamp(score) {
    if (score > 100) return 100;
    if (score < -100) return -100;
    return score;
  }

  #isSkater(position) {
    return position && !this.#isGoalie(position);
  }

  #isGoalie(position) {
    return position && position.toLowerCase().includes('врат');
  }
}

export default FantasyScoreCalculator;

