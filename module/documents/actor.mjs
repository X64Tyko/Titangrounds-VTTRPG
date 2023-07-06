import {TITANGROUND} from "../helpers/config.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class MonHunSysActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.monhunsys || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  async _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = ability.value;//Math.floor((ability.value - 10) / 2);
    }

    // Loop through resistance scores, and add their modifiers to our sheet output.
    for (let [key, resistance] of Object.entries(systemData.resistances)) {
      // Calculate the modifier using d20 rules.
      resistance.mod = -resistance.value;//Math.floor((ability.value - 10) / 2);
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    
    for (let [k, part] of Object.entries(systemData.parts)) {
      part.staggerLimit = Math.round(systemData.health.max * part.staggerPercent * 0.01);
      part.breakLimit = Math.round(systemData.health.max * part.breakPercent * 0.01);
      
      if (!part.hasOwnProperty("staggerDamage")) { part.staggerDamage = 0;}
      if (!part.hasOwnProperty("staggerNum")) {part.staggerNum = 0;}
      if (!part.hasOwnProperty("breakDamage")) {part.breakDamage = 0;}
      if (!part.hasOwnProperty("breakNum")) {part.breakNum = 0;}
    }
    
    for (let [k, status] of Object.entries(systemData.statusData)) {
      if (!status.hasOwnProperty("value")) {
        status.value = 0;
        status.currentLimit = 50 * status.initialRes;
        status.num = 0;
        status.roundsRemaining = 0;
      }
    }
    
    if (systemData.damageLog !== undefined) {
      for (let [k, log] of Object.entries(systemData.damageLog)) {
        let total = 0;
        log.values.forEach(damage => {
          total += damage;
        });
        log.total = total;
      }
    }
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
        data[k].total = data[k].value + data[k].bonus + data[k].temp;
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }

    // Add the sharpness formula for ease of access
    for (let [k, v] of Object.entries(TITANGROUND.sharpnessLevels)) {
      if (v.max >= data.sharpness.value && v.min <= data.sharpness.value) {
        data.sharpness.formula = v.formula;
      }
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }
  
  async createEmbeddedDocuments(embeddedName, data, context) {
    let removeEntries = [];
    let itemUpdates = [];
    
    if (this.type === "character") {
      if (embeddedName === "Item") {
        for (let [k, item] of Object.entries(data)) {
          let itemID = item?._id;
          if (!itemID) continue;

          let ownedItem = this.items.getName(item?.name);
          if (!ownedItem) {
            item.system.inBag = Math.max(1, item.system.inBag);
            continue;
          }

          if (ownedItem.type === "item") {
            removeEntries.push(k);
            itemUpdates.push({
              _id: ownedItem._id,
              "system.inBag": ownedItem.system.inBag + 1
            });
          }
        }
      }
    }
    
    if (itemUpdates.length > 0) {
      const update = {
        items: itemUpdates
      }
      this.update(update);
    }
    
    if (removeEntries.length > 0)
      return;
    
    super.createEmbeddedDocuments(embeddedName, data, context);
  }

}