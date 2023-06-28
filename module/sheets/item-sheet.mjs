import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {TITANGROUND} from "../helpers/config.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class MonHunSysItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["monhunsys", "sheet", "item"],
      width: 520,
      height: 575,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attacks" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/monhunsys/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;
    
    if (itemData.system.type === "weapon")
      await this._prepareWeaponData(context);
    
    if (itemData.system.type === "armor")
      this._prepareArmorData(context);
    
    // Prepare active effects
    console.log(this);
    context.effects = prepareActiveEffectCategories(this.item.effects);

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;
    context.user = game.user;
    
    return context;
  }

   async _prepareWeaponData(context)
  {
    
    const json = await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute("systems/monhunsys/data/WeaponAttacks.json"));

    this.document.system.attacks = json[context.item.type];
    context.attacks = this.document.system.attacks;

    for (let [k, attack] of Object.entries(context.attacks)) {
      attack.stringified = JSON.stringify(attack);
      for (let [k2, damage] of Object.entries(attack.damage)) {
        damage.stringValues = JSON.stringify(damage);
      }
    }
  }
  
  _prepareArmorData(context) {
    
    // Handle resistance scores.
    for (let [k, v] of Object.entries(context.system.resistances)) {
      v.label = game.i18n.localize(CONFIG.TITANGROUND.resistances[k]) ?? k;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Rollable abilities.
    html.find('.attack-rollable').click(this._onRollBonus.bind(this));
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.item));

    // Roll handlers, click handlers, etc. would go here.
    
    // Add dynamic titles for attack tiles
    html.find('.a').prop('title', "full damage hex");
    html.find('.p').prop('title', "this is you");
    html.find('.m').prop('title', "optional movement to this hex");
    html.find('.b').prop('title', "full damage hex and optional movement to this hex");
    html.find('.h').prop('title', "half damage hex");
  }
  
  async _onRollBonus(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const damageData = JSON.parse(dataset.damageValues);
    
    const valueKeys = Object.keys(damageData.values).sort();
    if (valueKeys.length == 1) {
      const context = await this.getData();
      if (context.item) {
        dataset.attackDamage = damageData.values["hit1"];
        context.item.roll(dataset);
      }
    }
    else if (valueKeys.length > 1)
    {
      this._multiRoll(dataset, damageData);
    }
  }
  
  async _multiRoll(dataset, damageData, valueIdx = 0) {
    const context = await this.getData();
    const valueKeys = Object.keys(damageData.values).sort();
    if (valueIdx >= valueKeys.length)
      return;

    dataset.attackDamage = damageData.values[valueKeys[valueIdx]];
    await context.item.roll(dataset);
    if (valueIdx < valueKeys.length - 1) {
      Dialog.prompt({
        title: "Attack Multi-roll",
        content: "Continue attack rolls?",
        label: "next hit",
        callback: () => this._multiRoll(dataset, damageData, valueIdx + 1)
      });
    }
  }
}