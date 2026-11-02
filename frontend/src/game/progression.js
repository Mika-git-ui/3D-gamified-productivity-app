
const state = {
  stars: 0,
  xp: 0,
  level: 1,

  quests: [
    {
      id: 1,
      title: 'Little Explorer',
      description: 'Collect 5 magical stars',
      target: 5,
      reward: 50,
      completed: false
    },
    {
      id: 2,
      title: 'Star Collector',
      description: 'Collect 10 magical stars',
      target: 10,
      reward: 100,
      completed: false
    }
  ]
};

function updateLevel() {
  const previousLevel = state.level;
  state.level = Math.floor(state.xp / 100) + 1;

  return state.level > previousLevel;
}

export function collectStar() {
  state.stars += 1;
  state.xp += 20;

  const completedQuests = [];

  state.quests.forEach(quest => {
    if (!quest.completed && state.stars >= quest.target) {
      quest.completed = true;
      state.xp += quest.reward;
      completedQuests.push(quest.title);
    }
  });

  const levelUp = updateLevel();

  return {
    ...getProgress(),
    completedQuests,
    levelUp
  };
}

export function awardXP(amount) {
  state.xp += amount;

  const levelUp = updateLevel();

  return {
    ...getProgress(),
    levelUp
  };
}

export function getProgress() {
  const xpIntoLevel = state.xp % 100;

  return {
    stars: state.stars,
    xp: state.xp,
    level: state.level,
    xpIntoLevel,
    xpNeeded: 100,
    xpPercentage: xpIntoLevel,
    quests: state.quests.map(quest => ({
      ...quest,
      progress: Math.min(state.stars, quest.target)
    }))
  };
}
