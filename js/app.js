class Character {
  constructor(name, icon, image = null) {
    this.name = name;
    this.icon = icon;
    this.image = image;
  }

  getDisplayImage() {
    return this.image || this.icon;
  }

  hasCustomImage() {
    return this.image !== null;
  }
}

class ChallengeItem {
  constructor(description, type, weight = 1, requirements = {}) {
    this.description = description;
    this.type = type;
    this.weight = weight;
    this.requirements = requirements;
    this.category = this.getCategoryDisplay();
  }

  getCategoryDisplay() {
    const categoryMap = {
      restriction: "🚫 Restriction",
      objective: "🎯 Objective",
      modifier: "⚡ Modifier",
    };
    return categoryMap[this.type] || "❓ Unknown";
  }

  canBeSelected(selectedItems, context = {}) {
    if (this.requirements.exclusiveGroup) {
      const conflictingItems = selectedItems.filter(
        (item) => item.requirements.exclusiveGroup === this.requirements.exclusiveGroup
      );
      if (conflictingItems.length > 0) {
        return false;
      }
    }

    if (this.requirements.prerequisite) {
      const hasPrereq = selectedItems.some((item) =>
        this.requirements.prerequisite.includes(item.description)
      );
      if (!hasPrereq) {
        return false;
      }
    }

    if (this.requirements.conflicts) {
      const hasConflict = selectedItems.some((item) =>
        this.requirements.conflicts.includes(item.description)
      );
      if (hasConflict) {
        return false;
      }
    }

    return true;
  }

  getWeightedChance() {
    return this.weight;
  }
}

class Boss {
  constructor(nightlord, icon, expedition) {
    this.nightlord = nightlord;
    this.icon = icon;
    this.expedition = expedition;
  }

  getDisplayName() {
    return this.expedition;
  }

  getDescription() {
    return this.nightlord;
  }

  getDisplayIcon() {
    return this.icon;
  }
}

class ChallengeGenerator {
  constructor() {
    this.challengeItems = this.initializeChallengeItems();
    this.characters = this.initializeCharacters();
    this.bosses = this.initializeBosses();
    this.initializeEventListeners();
  }

  initializeCharacters() {
    return [
      new Character("Wylder", "⚔️"),
      new Character("Guardian", "🛡️"),
      new Character("Ironeye", "🏹"),
      new Character("Duchess", "🗡️"),
      new Character("Raider", "🔨"),
      new Character("Revenant", "🏺"),
      new Character("Recluse", "⚡"),
      new Character("Executor", "🌟"),
    ];
  }

  initializeBosses() {
    return [
      new Boss("Tricephalos", "🐲", "Gladius, Beast of Night"),
      new Boss("Gaping Jaw", "🦈", "Adel, Baron of Night"),
      new Boss("Sentient Pest", "🪲", "Gnoster, Wisdom of Night"),
      new Boss("Augur", "🦉", "Maris, Fathom of Night"),
      new Boss("Equilibrious Beast", "⚖️", "Libra, Creature of Night"),
      new Boss("Darkdrift Knight", "🗡️", "Fulghor, Champion of Nightglow"),
      new Boss("Fissure in the Fog", "🌫️", "Caligo, Miasma of Night"),
      new Boss("Night Aspect", "🌑", "Heolstor the Nightlord")
    ];
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

  weightedRandomSelection(items, count) {
    const selectedItems = [];
    const availableItems = [...items];
    
    while (selectedItems.length < count && availableItems.length > 0) {
      const eligibleItems = availableItems.filter(item => 
        item.canBeSelected(selectedItems)
      );
      
      if (eligibleItems.length === 0) {
        break;
      }
      
      const totalWeight = eligibleItems.reduce((sum, item) => sum + item.getWeightedChance(), 0);
      let randomNum = Math.random() * totalWeight;
      
      let selectedItem = null;
      for (const item of eligibleItems) {
        randomNum -= item.getWeightedChance();
        if (randomNum <= 0) {
          selectedItem = item;
          break;
        }
      }
      
      if (selectedItem) {
        selectedItems.push(selectedItem);
        const index = availableItems.indexOf(selectedItem);
        availableItems.splice(index, 1);
      }
    }
    
    return selectedItems;
  }

  getRandomModifiers(count) {
    return this.weightedRandomSelection(this.challengeItems, count);
  }

  generateCharacter() {
    return this.getRandomElement(this.characters);
  }

  generateCharacters(isMultiplayer) {
    const characterCount = isMultiplayer ? 3 : 1;
    const characters = [];

    for (let i = 0; i < characterCount; i++) {
      characters.push(this.generateCharacter());
    }

    return characters;
  }

  generateBoss() {
    return this.getRandomElement(this.bosses);
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
                        <div class="character-image ${character.hasCustomImage() ? 'has-custom-image' : ''}">${character.hasCustomImage() ? `<img src="${character.image}" alt="${character.name}" />` : character.getDisplayImage()}</div>
                        <div class="character-name">${character.name}</div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;

    charactersSection.innerHTML = charactersHTML;
  }

  renderBoss(boss) {
    const bossSection = document.getElementById("bossSection");

    const bossHTML = `
            <h4 style="margin-bottom: 15px; color: #333;">Your Target Boss:</h4>
            <div class="boss-card">
                <div class="boss-image">${boss.getDisplayIcon()}</div>
                <div class="boss-info">
                    <div class="boss-name">${boss.getDisplayName()}</div>
                    <div class="boss-description">${boss.getDescription()}</div>
                </div>
            </div>
        `;

    bossSection.innerHTML = bossHTML;
  }

  initializeChallengeItems() {
    return [
      new ChallengeItem("No healing allowed", "restriction", 1),
      new ChallengeItem("Only use melee weapons", "restriction", 1, {
        exclusiveGroup: "weapon_type",
        conflicts: ["Only use ranged weapons"]
      }),
      new ChallengeItem("Only use ranged weapons", "restriction", 1, {
        exclusiveGroup: "weapon_type", 
        conflicts: ["Only use melee weapons"]
      }),
      new ChallengeItem("No magic/ash of war allowed", "restriction", 1),
      new ChallengeItem("No character skills", "restriction", 1),
      new ChallengeItem("No ultimate art", "restriction", 1),
      new ChallengeItem("No downs", "restriction", 1, {
        exclusiveGroup: "death_penalty",
        conflicts: ["No picking up runes after death"]
      }),
      new ChallengeItem("No picking up runes after death", "restriction", 1, {
        exclusiveGroup: "death_penalty",
        conflicts: ["No downs"]
      }),
      new ChallengeItem("No leveling", "restriction", 0.2, {
        exclusiveGroup: "level_restrictions"
      }),
      new ChallengeItem("No churches", "restriction", 1),
      new ChallengeItem("No wending grace", "restriction", 1, {
        exclusiveGroup: "navigation_items",
        conflicts: ["No consumable items", "No stoneshard keys"]
      }),
      new ChallengeItem("No consumable items", "restriction", 1, {
        exclusiveGroup: "navigation_items",
        conflicts: ["No wending grace", "No stoneshard keys"]
      }),
      new ChallengeItem("No stoneshard keys", "restriction", 1, {
        exclusiveGroup: "navigation_items", 
        conflicts: ["No wending grace", "No consumable items"]
      }),
      new ChallengeItem("No relics", "restriction", 1, {
        exclusiveGroup: "relic_restrictions"
      }),
      new ChallengeItem("Only 2 relics", "restriction", 1, {
        exclusiveGroup: "relic_restrictions"
      }),
      new ChallengeItem("Only 1 relic", "restriction", 1, {
        exclusiveGroup: "relic_restrictions"
      }),
      new ChallengeItem("Drop weapon at spawn", "restriction", 1),
      new ChallengeItem("No grouping (when possible)", "restriction", 1),
      new ChallengeItem("No field bosses", "restriction", 1),
      new ChallengeItem("No blacksmiths/merchants", "restriction", 1),
      new ChallengeItem("Starter weapon only", "restriction", 1, {
        conflicts: ["Rare or below weapons only"]
      }),
      new ChallengeItem("Rare or below weapons only", "restriction", 1, {
        conflicts: ["Starter weapon only"]
      }),
      new ChallengeItem("No spiritual spring or spectral hawk", "restriction", 1),
      new ChallengeItem("No surge sprint", "restriction", 1),
      new ChallengeItem("No blacksmith", "restriction", 1),
      new ChallengeItem("No flask upgrades", "restriction", 1),
      new ChallengeItem("Defeat the Nightlord within 40 minutes", "objective", 1),
      new ChallengeItem("No dodge rolling (blocking allowed)", "restriction", 0.8),
      new ChallengeItem("Stay below level 10", "restriction", 0.8, {
        exclusiveGroup: "level_restrictions"
      }),
      new ChallengeItem("Stay below level 5", "restriction", 0.4, {
        exclusiveGroup: "level_restrictions"
      }),
    ];
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

    const boss = this.generateBoss();
    this.renderBoss(boss);

    const selectedModifiers = this.getRandomModifiers(modifierCount);

    const challengeHTML = `
            ${selectedModifiers
              .map(
                (item) => `
                <div class="challenge-item">
                    <strong>${item.category}:</strong> ${item.description}
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
