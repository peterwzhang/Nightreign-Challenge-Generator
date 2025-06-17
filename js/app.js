class ChallengeGenerator {
  constructor() {
    this.allModifiers = {
      restrictions: [
        "No healing allowed",
        "Only use melee weapons",
        "Only use ranged weapons",
        "No magic/ash of war allowed",
        "No character skills",
        "No ultimate art",
        "No downs",
        "No picking up runes after death",
        "No leveling",
        "No churches",
        "No wending grace",
        "No consumable items",
        "No stoneshard keys",
        "No relics",
        "Only 2 relics",
        "Only 1 relic",
        "Drop weapon at spawn",
        "No grouping (when possible)",
        "No field bosses",
        "No blacksmiths/merchants",
        "Starter weapon only",
        "Rare or below weapons only",
        "No spiritual spring or spectral hawk",
        "No surge sprint",
      ],
      objectives: [],
      modifiers: [],
    };

    this.exclusiveGroups = [
      {
        name: "relic_restrictions",
        items: ["No relics", "Only 2 relics", "Only 1 relic"],
      },
      {
        name: "item_restrictions",
        items: [
          "No consumable items",
          "No stoneshard keys",
          "No wending grace",
        ],
      },
      {
        name: "weapon_restrictions",
        items: ["Only use melee weapons", "Only use ranged weapons"],
      },
      {
        name: "down_related",
        items: ["No downs", "No picking up runes after death"],
      },
    ];

    this.characters = {
      names: [
        "Wylder",
        "Guardian",
        "Ironeye",
        "Duchess",
        "Raider",
        "Revenant",
        "Recluse",
        "Executor",
      ],
      icons: [
        "⚔️",
        "🏹",
        "🔮",
        "🛡️",
        "🗡️",
        "🏺",
        "⚡",
        "🌟",
        "🔥",
        "❄️",
        "🌙",
        "☀️",
      ],
    };

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const generateBtn = document.getElementById("generateBtn");
    const newChallengeBtn = document.getElementById("newChallengeBtn");

    generateBtn.addEventListener("click", () => this.generateChallenge());
    newChallengeBtn.addEventListener("click", () => this.generateChallenge());
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getAllModifiersFlat() {
    const allModifiers = [];

    this.allModifiers.restrictions.forEach((item) => {
      allModifiers.push({
        text: item,
        category: "🚫 Restriction",
        type: "restriction",
      });
    });

    this.allModifiers.objectives.forEach((item) => {
      allModifiers.push({
        text: item,
        category: "🎯 Objective",
        type: "objective",
      });
    });

    this.allModifiers.modifiers.forEach((item) => {
      allModifiers.push({
        text: item,
        category: "⚡ Modifier",
        type: "modifier",
      });
    });

    return allModifiers;
  }

  getRandomModifiers(count) {
    const allModifiers = this.getAllModifiersFlat();
    const selectedModifiers = [];
    const usedGroups = new Set();

    const maxCount = Math.min(count, allModifiers.length);

    while (selectedModifiers.length < maxCount) {
      const randomIndex = Math.floor(Math.random() * allModifiers.length);
      const candidateModifier = allModifiers[randomIndex];

      if (
        selectedModifiers.some(
          (selected) => selected.text === candidateModifier.text
        )
      ) {
        continue;
      }

      let hasConflict = false;
      for (const group of this.exclusiveGroups) {
        if (group.items.includes(candidateModifier.text)) {
          if (usedGroups.has(group.name)) {
            hasConflict = true;
            break;
          } else {
            usedGroups.add(group.name);
            break;
          }
        }
      }

      if (!hasConflict) {
        selectedModifiers.push(candidateModifier);
      }

      if (
        selectedModifiers.length === 0 &&
        selectedModifiers.length < maxCount &&
        this.getAllAvailableModifiers(usedGroups).length === 0
      ) {
        break;
      }
    }

    return selectedModifiers;
  }

  getAllAvailableModifiers(usedGroups) {
    const allModifiers = this.getAllModifiersFlat();
    return allModifiers.filter((modifier) => {
      for (const group of this.exclusiveGroups) {
        if (group.items.includes(modifier.text) && usedGroups.has(group.name)) {
          return false;
        }
      }
      return true;
    });
  }

  generateCharacter() {
    return {
      name: this.getRandomElement(this.characters.names),
      icon: this.getRandomElement(this.characters.icons),
    };
  }

  generateCharacters(isMultiplayer) {
    const characterCount = isMultiplayer ? 3 : 1;
    const characters = [];

    for (let i = 0; i < characterCount; i++) {
      characters.push(this.generateCharacter());
    }

    return characters;
  }

  renderCharacters(characters) {
    const charactersSection = document.getElementById("charactersSection");

    if (characters.length === 0) {
      charactersSection.innerHTML = "";
      return;
    }

    const title = characters.length > 1 ? "Your Team:" : "Your Character:";

    const charactersHTML = `
            <h4 style="margin-bottom: 15px; color: #333;">${title}</h4>
            <div class="characters-grid" data-count="${characters.length}">
                ${characters
                  .map(
                    (character) => `
                    <div class="character-card">
                        <div class="character-image">${character.icon}</div>
                        <div class="character-name">${character.name}</div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;

    charactersSection.innerHTML = charactersHTML;
  }

  generateChallenge() {
    const challengeResult = document.getElementById("challengeResult");
    const challengeContent = document.getElementById("challengeContent");
    const multiplayerToggle = document.getElementById("multiplayerToggle");
    const modifierCountSelect = document.getElementById("modifierCount");

    const isMultiplayer = multiplayerToggle.checked;
    const modifierCount = parseInt(modifierCountSelect.value);

    const characters = this.generateCharacters(isMultiplayer);
    this.renderCharacters(characters);

    const selectedModifiers = this.getRandomModifiers(modifierCount);

    const challengeHTML = `
            ${selectedModifiers
              .map(
                (modifier) => `
                <div class="challenge-item">
                    <strong>${modifier.category}:</strong> ${modifier.text}
                </div>
            `
              )
              .join("")}
        `;

    challengeContent.innerHTML = challengeHTML;
    challengeResult.classList.remove("hidden");

    challengeResult.scrollIntoView({ behavior: "smooth" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ChallengeGenerator();
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  container.style.opacity = "0";
  container.style.transform = "translateY(20px)";

  setTimeout(() => {
    container.style.transition = "all 0.6s ease";
    container.style.opacity = "1";
    container.style.transform = "translateY(0)";
  }, 100);
});
