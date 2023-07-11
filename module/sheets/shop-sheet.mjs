import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {TITANGROUND} from "../helpers/config.mjs";
import {TITANGROUND_WEAPONS} from "../helpers/config-weapon-data.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class MonHunSysShopSheet extends ActorSheet {

  /**
   * The HTML template path used to render a complete Roll object to the chat log
   * @type {string}
   */
  static ATTACKROLL_TEMPLATE = "systems/monhunsys/templates/chat/AttackRoll.html";
  static ITEM_PURCHASE_TEMPLATE = "systems/monhunsys/templates/chat/PurchaseRequest.html";
  static ITEM_SALE_TEMPLATE = "systems/monhunsys/templates/chat/SaleCard.html";

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["monhunsys", "sheet", "actor"],
      template: "systems/monhunsys/templates/actor/actor-sheet.html",
      width: 800,
      height: 775,
      dragDrop: [{dragSelector: ".item-drag", dropSelector: null}],
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features"}]
    });
  }

  /** @override */
  get template() {
    return `systems/monhunsys/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      await this._prepareItems(context);
      this._prepareCharacterData(context);
    }
    
    // Prepare Shop Items
    if (actorData.type == 'shop') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.TITANGROUND.abilities[k]) ?? k;
      v.abbrLabel = game.i18n.localize(CONFIG.TITANGROUND.abilityAbbreviations[k]) ?? k;
      v.total = v.value + v.bonus + v.temp;
    }

    // Handle resistance scores.
    for (let [k, v] of Object.entries(context.system.resistances)) {
      v.label = game.i18n.localize(CONFIG.TITANGROUND.resistances[k]) ?? k;
      v.total = v.value + v.bonus + v.temp;
      v.img = "Icons/SheetIcons/" + v.label + ".png";
    }
    
    // Handle skill scores.
    for (let [k, v] of Object.entries(context.system.skills)) {
      v.label = game.i18n.localize(CONFIG.TITANGROUND.skills[k]) ?? k;
      v.total = v.value + v.bonus + v.temp;
      v.img = "Icons/SheetIcons/" + k + "skill.png";
    }
    
    // Handle Zoology scores.
    for (let [k, v] of Object.entries(context.system.Disciplines.Zoology)) {
      v.label = game.i18n.localize(CONFIG.TITANGROUND.disciplines[k]) ?? k;
      v.total = v.value + v.bonus + v.temp;
      //v.img = "Icons/SheetIcons/" + v.label + ".png";
    }

    // Handle Ecology scores.
    for (let [k, v] of Object.entries(context.system.Disciplines.Ecology)) {
      v.label = game.i18n.localize(CONFIG.TITANGROUND.disciplines[k]) ?? k;
      v.total = v.value + v.bonus + v.temp;
      //v.img = "Icons/SheetIcons/" + v.label + ".png";
    }

    context.system.sharpness.max = context.system.sharpness.base + context.system.sharpness.bonus + context.system.sharpness.temp;
    context.system.sharpness.value = Math.min(context.system.sharpness.value, context.system.sharpness.max);
    context.system.sharpness.color = this._getSharpnessColor(context.system.sharpness.value);
    context.system.sharpness.maxColor = this._getSharpnessColor(context.system.sharpness.max);
    context.system.stamina.max = context.system.abilities.con.value * context.system.stamina.mod;
    context.system.stamina.value = Math.min(context.system.stamina.value, context.system.stamina.max);
    context.system.health.max = context.system.health.base + context.system.health.bonus + context.system.health.temp;
    context.system.health.value = Math.min(context.system.health.value, context.system.health.max);

    context.abilityEditing = this.abilityEditing != undefined ? this.abilityEditing : false;
    context.resistanceEditing = this.resistanceEditing != undefined ? this.resistanceEditing : false;
    context.skillEditing = this.skillEditing != undefined ? this.skillEditing : false;
    context.zoologyEditing = this.zoologyEditing != undefined ? this.zoologyEditing : false;
    context.ecologyEditing = this.ecologyEditing != undefined ? this.ecologyEditing : false;
    context.healthEditing = this.healthEditing != undefined ? this.healthEditing : false;
    context.sharpEditing = this.sharpEditing != undefined ? this.sharpEditing : false;
  }
  
  async onReset() {
    console.log("resetting");


    // Use a safe clone of the actor data for further operations.
    const context = this.actor.toObject(false);
    var updates = {
      "system.sharpness.temp": 0,
      "system.health.value": 2000,
      "system.health.temp": 0,
      "system.clock": 0,
      "system.stamina.mod": 4,
      "system.stamina.value": 2000,
      "system.sharpness.value": 2000
    }

    for (let [k, v] of Object.entries(context.system.abilities)) {
      var key = 'system.abilities.' + k + '.temp';
      updates[key] = 0;
    }

    // Handle resistance scores.
    for (let [k, v] of Object.entries(context.system.resistances)) {
      var key = 'system.resistances.' + k + '.temp';
      updates[key] = 0;
    }

    // Handle skill scores.
    for (let [k, v] of Object.entries(context.system.skills)) {
      var key = 'system.skills.' + k + '.temp';
      updates[key] = 0;
    }

    // Handle Zoology scores.
    for (let [k, v] of Object.entries(context.system.Disciplines.Zoology)) {
      var key = 'system.Disciplines.Zoology.' + k + '.temp';
      updates[key] = 0;
    }

    // Handle Ecology scores.
    for (let [k, v] of Object.entries(context.system.Disciplines.Ecology)) {
      var key = 'system.Disciplines.Ecology.' + k + '.temp';
      updates[key] = 0;
    }
    
    this.abilityEditing = false;
    this.resistanceEditing = false;
    this.skillEditing = false;
    this.zoologyEditing = false;
    this.ecologyEditing = false;
    this.healthEditing = false;
    this.sharpEditing = false;
    
    await this.actor.update(updates);
    this.render(false);
  }

  /**
   * Get the sharpness color for the actor's current sharpness level
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _getSharpnessColor(sharpnessValue) {
    for (let [k, v] of Object.entries(TITANGROUND.sharpnessLevels)) {
      if (v.max >= sharpnessValue && v.min <= sharpnessValue) {
        return v.color;
      }
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  async _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };
    const weapons = [];
    const bag = [];
    const chest = [];
    const armorChest = [];
    let armor = {};
    
    const equippedWeapon = this.actor.getFlag('monhunsys', 'equippedWeapon');
    const expandedItem = this.actor.getFlag('monhunsys', 'expandedItem');
    const inTown = game.settings.get('monhunsys', 'bInTown');

    // clear our resistance values so armor can fill it.
    if (this.actor.type == 'character') {
      for (let [k, v] of Object.entries(context.system.resistances)) {
        v.value = 0;
      }
    }

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
        i.system.salePrice = Math.round(i.system.cost * 0.72315);
        if (i.system.inBag > 0)
          bag.push(i);
        if (i.system.inChest > 0)
          chest.push(i);

        if (i._id === expandedItem || this.expandBag) {
          i.expanded = true;
        }
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
      // Append to weapons.
      else if (i.system.type === 'weapon') {
        i.equipped = false;
        weapons.push(i);
        if (i._id === equippedWeapon) {
          i.equipped = true;
          context.activeWeapon = i;
          context.weaponSpeed = 30 + (5 * Number(i.system.speed));
          if (i.type === 'bow') {
            this.updateAmmoData(i);
            context.activeWeapon.activeAmmoCount = i.system.ammoTypes[i.system.ammo].inBag;
          }
          context.activeWeapon.attacks = await this.getWeaponAttacks(i);
        }
      }
      else if (i.type === 'armor') {
        i.equipped = false;
        armorChest.push(i);
        if (i._id == this.actor.getFlag('monhunsys', 'equipped' + i.system.slot)) {
          i.equipped = true;
          armor[i.system.slot] = i;
          for (let [k, v] of Object.entries(i.system.resistances)) {
            context.system.resistances[k].value += Number(v.value);
          }
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.bag = bag;
    context.bagSize = bag.length;
    context.chest = chest;
    context.features = features;
    context.spells = spells;
    context.weapons = weapons;
    context.armor = armor;
    context.armorChest = armorChest;
    context.user = game.user;
    context.biographyHTML = await TextEditor.enrichHTML(context.system.biography, {
      secrets: this.actor.isOwner,
      rollData: context.rollData,
      async: true,
      relativeTo: this.actor
    });
    
    context.inTown = inTown;
    context.expandBag = this.expandBag;
    
    this.actor.getArmorAbilityMods();
  }
  
  async updateAmmoData(weapon) {
    for (let [k,a] of Object.entries(weapon.system.ammoTypes)) {
      const ammo = this.actor.items.getName(k);
      if (!ammo) continue;
      
      if (ammo.system.inBag > 0)
        a.inBag = ammo.system.inBag;
    }
  }
  
  async getWeaponAttacks(weapon) {
    const json = await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute("systems/monhunsys/data/WeaponAttacks.json"));

    var attacks = json[weapon.type];
    
    var mappedAttacks = {};
    
    for (let [k, attack] of Object.entries(attacks)) {
      attack.stringified = JSON.stringify(attack);
      attack.ammo = weapon.system?.ammo || undefined;
      for (let [k2, damage] of Object.entries(attack.damage)) {
        damage.stringValues = JSON.stringify(damage);
      }
      
      mappedAttacks[attack.name] = attack;
    }

    let processFollowups = (attack, prevAttacks) => {
      
      var chainID = "";
      prevAttacks.forEach(({name}) => {chainID += '-' + name;});
      attack.chainID = chainID + '-' + attack.name + '-open';
      attack.chainFlag = this.actor.getFlag('monhunsys', attack.chainID);
      attack.expanded = this.actor.getFlag('monhunsys', attack.chainID + 'expanded');
      
      if (attack.followups != undefined && attack.followups.length > 0) {
        attack.chain = [];
        attack.followups.forEach((fu) => {
          let fuAttack = mappedAttacks[fu];
          if (fuAttack) {
            if (prevAttacks.includes(fuAttack) || fuAttack === attack) {
              attack.chain.push({name: 'repeat from ' + fu});
            } else {
              prevAttacks.push(attack);
              attack.chain.push(foundry.utils.deepClone(processFollowups(fuAttack, prevAttacks)));
              prevAttacks.pop();
            }
          }
        });
      }
      
      return attack;
    };
    
    var prevAttacks = [];
    var sortedAttacks = [];
    for (let [k, attack] of Object.entries(attacks)) {
      if (attack.opener) {
        sortedAttacks.push(processFollowups(foundry.utils.deepClone(attack), prevAttacks));
      }
    }
    
    return sortedAttacks;
  }
  
  statRoll = "2d10";

  weaponContextMenu = [
    {
      name: "Equip",
      icon: '<i class="fas fa-sword"></i>',
      callback: async element => {
        const bInTown = game.settings.get('monhunsys', 'bInTown');
        if (!bInTown)
          return;
        const item = this.actor.items.get(element.data("itemId"));
        var updates = {
          "system.sharpness.base": item.system.sharpness.max
        };
        await this.actor.update(updates);
        await this.actor.setFlag('monhunsys', 'equippedWeapon', item.id);
      }
    }
  ]
  
  armorContextMenu = [
    {
      name: "Equip",
      icon: '<i class="fas fa-sword"></i>',
      callback: async element => {
        const bInTown = game.settings.get('monhunsys', 'bInTown');
        if (!bInTown)
          return;
        const i = this.actor.items.get(element.data("itemId"));
        await this.actor.setFlag('monhunsys', 'equipped' + i.system.slot, i._id);

        // Update our ability levels
        let updates = {};
        await this.actor.unsetFlag('monhunsys', 'armorAbilityLevels');
        for (let i of this.actor.items) {
          if (i.type === 'armor') {
            i.equipped = false;
            if (i._id === this.actor.getFlag('monhunsys', 'equipped' + i.system.slot)) {
              i.equipped = true;
              for (let [k,a] of Object.entries(i.system.abilities)) {
                updates[a.name] = (updates[a.name] || 0) + Number(a.level);
              }
            }
          }
        }
        await this.actor.setFlag('monhunsys', 'armorAbilityLevels', updates);
      }
    },
    {
      name: "Delete",
      icon: '<i class="fas fa-trash"></i>',
      callback: async element => {
        Dialog.confirm({
          title: "Delete?",
          content: "Delete?",
          label: "Confirm",
          yes: async (html) => {
            const item = this.actor.items.get(element.data("itemId"));
            await item.delete();
          },
          no: (html) => {
          }
        });
      }
    }
  ]
  
  statContextMenu = [
    {
      name: "Strength",
      icon: '<i class="fas fa-dumbbell"></i>',
      callback: element => {
        let label = "Strength " + element.data("statName");
        let statTotal = Number(element.data("statTotal"));
        let roll = new Roll(this.statRoll.concat("+", statTotal, "+@str.total"), this.actor.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({actor: this.actor}),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }
    },
    {
      name: "Constitution",
      icon: '<i class="fas fa-shield-heart"></i>',
      callback: element => {
        let label = "Constitution " + element.data("statName");
        let statTotal = Number(element.data("statTotal"));
        let roll = new Roll(this.statRoll.concat("+", statTotal, "+@con.total"), this.actor.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({actor: this.actor}),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }
    },
    {
      name: "Spirit",
      icon: '<i class="fas fa-fire-flame-curved"></i>',
      callback: element => {
        let label = "Spirit " + element.data("statName");
        let statTotal = Number(element.data("statTotal"));
        let roll = new Roll(this.statRoll.concat("+", statTotal, "+@spr.total"), this.actor.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({actor: this.actor}),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }
    },
    {
      name: "Intelligence",
      icon: '<i class="fas fa-brain"></i>',
      callback: element => {
        let label = "Intelligence " + element.data("statName");
        let statTotal = Number(element.data("statTotal"));
        let roll = new Roll(this.statRoll.concat("+", statTotal, "+@int.total"), this.actor.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({actor: this.actor}),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }
    }
  ]

  itemBagContextMenu = [
    {
      name: "Move to Chest",
      icon: '<i class="fas fa-treasure-chest"></i>',
      callback: element => {
        const bInTown = game.settings.get('monhunsys', 'bInTown');
        if (!bInTown)
          return;
        const item = this.actor.items.get(element.data("itemId"));
        Dialog.prompt({
          title: "Move how many?",
          content: '<form><label for=\"quantity\">Num to Move </label><input id=\"quantity\" name=\"quantity\" type=\"number\" value="1" min=\"1\" max=\"item.system.inBag\" data-dtype="Number"></form>',
          label: "Confirm",
          callback: (html) => this.handleMoveToChest(html, item)
        });
      }
    },
    {
      name: "Edit",
      icon: '<i class="fas fa-edit"></i>',
      callback: element => {
        const item = this.actor.items.get(element.data("itemId"));
        item.sheet.render(true);
      }
    },
    {
      name: "delete All",
      icon: '<i class="fas fa-trash"></i>',
      callback: async element => {
        Dialog.confirm({
          title: "Delete All?",
          content: "Delete Entire Stack?",
          label: "Confirm",
          yes: async (html) => {
            const item = this.actor.items.get(element.data("itemId"));

            if (item.system.inChest <= 0) {
              await item.delete();
            } else {
              await item.update({"system.inBag": 0});
            }
          },
          no: (html) => {
          }
        });
      }
    },
    {
      name: "Remove 1",
      icon: '<i class="fas fa-trash"></i>',
      callback: async element => {
        Dialog.confirm({
          title: "Remove 1?",
          content: "Remove 1?",
          label: "Confirm",
          yes: async (html) => {
            const item = this.actor.items.get(element.data("itemId"));

            if (item.system.inBag <= 1 && item.system.inChest <= 0) {
              await item.delete();
            } else {
              await item.update({"system.inBag": item.system.inBag - 1});
            }
          },
          no: (html) => {
          }
        });
      }
    }
  ];

  itemChestContextMenu = [
    {
      name: "Move to Bag",
      icon: '<i class="fas fa-backpack"></i>',
      callback: element => {
        const bInTown = game.settings.get('monhunsys', 'bInTown');
        if (!bInTown)
          return;
        const item = this.actor.items.get(element.data("itemId"));
        Dialog.prompt({
          title: "Move how many?",
          content: '<form><label for=\"quantity\">Num to Move </label><input id=\"quantity\" name=\"quantity\" type=\"number\" value="1" min=\"1\" max=\"{{item.system.inBag}}\" data-dtype="Number"></form>',
          label: "Confirm",
          callback: (html) => this.handleMoveToBag(html, item)
        });
      }
    },
    {
      name: "Edit",
      icon: '<i class="fas fa-edit"></i>',
      callback: element => {
        const item = this.actor.items.get(element.data("itemId"));
        item.sheet.render(true);
      }
    },
    {
      name: "delete All",
      icon: '<i class="fas fa-trash"></i>',
      callback: async element => {
        Dialog.confirm({
          title: "Delete All?",
          content: "Delete Entire Stack?",
          label: "Confirm",
          yes: async (html) => {
            const item = this.actor.items.get(element.data("itemId"));

            if (item.system.inBag <= 0) {
              await item.delete();
            } else {
              await item.update({"system.inChest": 0});
            }
          },
          no: (html) => {
          }
        });
      }
    },
    {
      name: "Remove 1",
      icon: '<i class="fas fa-trash"></i>',
      callback: async element => {
        Dialog.confirm({
          title: "Remove 1?",
          content: "Remove 1?",
          label: "Confirm",
          yes: async (html) => {
            const item = this.actor.items.get(element.data("itemId"));

            if (item.system.inChest <= 1 && item.system.inBag <= 0) {
              await item.delete();
            } else {
              await item.update({"system.inChest": item.system.inChest - 1});
            }
          },
          no: (html) => {
          }
        });
      }
    }
  ];

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.actor.type != "shop" || game.user.isGM) {
      new ContextMenu(html, ".item-bag", this.itemBagContextMenu);
      new ContextMenu(html, ".item-chest", this.itemChestContextMenu);
      new ContextMenu(html, ".weapon-chest", this.weaponContextMenu);
      new ContextMenu(html, ".armor-chest", this.armorContextMenu);
    }
    new ContextMenu(html, ".stat-roll", this.statContextMenu);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
    
    html.find('.request-purchase').click(async ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));

      Dialog.prompt({
        title: "Buy How Many?",
        content: '<form><label for=\"quantity\">Num to Purchase </label><input id=\"quantity\" name=\"quantity\" type=\"number\" value="1" min=\"1\" max=\"{{item.system.inBag}}\" data-dtype="Number"></form>',
        label: "Confirm",
        callback: (html) => this.onRequestPurchase(html, item)
      });
    });

    html.find('.inline-edit').change(ev => {
      let element = ev.currentTarget;
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      let field = element.dataset.field;

      return item.update({[field]: element.value});
    })

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Allow sheet reset
    html.find('.reset-button').click(this.onReset.bind(this));
    
    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));
    
    // Toggle Attack card miniState
    html.find('.attack-name').click(this.onUpdateAttackCard.bind(this));
    
    html.find('.attack-chain').click(this.onUpdatAttackChainState.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));
    html.find(".ability-edit").click(async ev => {
      this.abilityEditing = !this.abilityEditing;
      this.render(false);
    });
    html.find(".resistance-edit").click(ev => {
      this.resistanceEditing = !this.resistanceEditing;
      this.render(false);
    });
    html.find(".skill-edit").click(ev => {
      this.skillEditing = !this.skillEditing;
      this.render(false);
    });
    html.find(".zoology-edit").click(ev => {
      this.zoologyEditing = !this.zoologyEditing;
      this.render(false);
    });
    html.find(".ecology-edit").click(ev => {
      this.ecologyEditing = !this.ecologyEditing;
      this.render(false);
    });
    html.find(".health-edit").click(ev => {
      this.healthEditing = !this.healthEditing;
      this.render(false);
    });
    html.find(".sharp-edit").click(ev => {
      this.sharpEditing = !this.sharpEditing;
      this.render(false);
    });
    html.find(".expand-bag").click(ev => {
      this.expandBag = !this.expandBag;
      this.render(false);
    });
    html.find(".item-expand").click(async ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (this.actor.getFlag('monhunsys', 'expandedItem') === item.id) {
        await this.actor.unsetFlag('monhunsys', 'expandedItem');
      }
      else {
        await this.actor.setFlag('monhunsys', 'expandedItem', item.id);
      }
      this.render(false);
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
    
    // Weapon Sheet Listeners
    // Rollable abilities.
    html.find('.attack-rollable').click(this._onRollBonus.bind(this));
    html.find('.attack-rollable-mini').click(this._onRollBonus.bind(this));

    // Roll handlers, click handlers, etc. would go here.

    // Add dynamic titles for attack tiles
    html.find('.a').prop('title', "full damage hex");
    html.find('.p').prop('title', "this is you");
    html.find('.m').prop('title', "optional movement to this hex");
    html.find('.b').prop('title', "full damage hex and optional movement to this hex");
    html.find('.h').prop('title', "half damage hex");
  }
  
  async onRequestPurchase(html, item) {
    var value = Math.min(html.find("input#quantity").val(), item.system.inBag);
    let chatData = {
      item: item,
      user: game.user,
      shop: this.actor,
      quantity: value,
      id: foundry.utils.randomID(16)
    }

    chatData.purchaseData = JSON.stringify(chatData);
    
    // whisper the DM.
    let itemData = await renderTemplate(this.constructor.ITEM_PURCHASE_TEMPLATE, chatData);
    const speaker = ChatMessage.getSpeaker({actor: this.actor});
    const message = await ChatMessage.create({
      flags: { "purchaseID": chatData.id},
      speaker: speaker,
      user: game.user.id,
      content: itemData,
      sound: CONFIG.sounds.notification,
      whisper: ChatMessage.getWhisperRecipients("gm")
    });
    
    message.update({_id: chatData.id});
  }

  async onUpdateAttackCard(ev) {
    const el = $(ev.currentTarget).parents(".attack-block");
    const chainID = el.data("chainId");
    const current = this.actor.getFlag('monhunsys', chainID + 'expanded');
    await this.actor.setFlag('monhunsys', chainID + 'expanded', !current);
    
    return false;
  }

  async onUpdatAttackChainState(ev) {
    const el = $(ev.currentTarget).parents(".attack-block");
    const chainID = el.data("chainId");
    const current = this.actor.getFlag('monhunsys', chainID);
    await this.actor.setFlag('monhunsys', chainID, !current);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
  
  async _updateObject(event, formData) {
    if ( !this.object.id ) return;
    const updateKeys = Object.keys(formData).sort();
    
    const equippedWeapon = this.actor.getFlag('monhunsys', 'equippedWeapon');
    let weaponID = undefined;
    for (let i of this.actor.items) {
      if (i.system.type === 'weapon') {
        if (i._id === equippedWeapon) {
          weaponID = i._id;
          break;
        }
      }
    }
    
    if (weaponID !== undefined) {
      for (let i = 0; i < updateKeys.length; ++i) {
        let key = updateKeys[i];
        if (key.startsWith('activeWeapon.')) {
          if (formData.items === undefined) formData['items'] = [];
          let dataKey = key.replace('activeWeapon.', '');
          formData.items.push({
            _id: weaponID,
            [dataKey]: formData[key]
          });
        }
      }
    }

    return this.object.update(formData);
  }
  
  async _onChangeInput(event) {
    // Do not fire change listeners for form inputs inside text editors.
    if ( event.currentTarget.closest(".editor") ) return;

    // Handle changes to specific input types
    const el = event.target;
    if ( (el.type === "color") && el.dataset.edit ) this._onChangeColorPicker(event);
    else if ( el.type === "range" ) this._onChangeRange(event);
    
    const preventRender = !el.classList.contains('render-update');
    
    // Maybe submit the form
    if ( this.options.submitOnChange ) {
      return this._onSubmit(event, {preventRender: preventRender});
    }
  }

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    if (this.actor.type == 'shop' && this.actor.uuid !== item.parent?.uuid) {
      if (itemData.type == "item") {
        const ItemHandled = await this._sellDropItem(event, item, itemData);
        if (ItemHandled) return false;
      }
      else return false; // can't sell non-item, so we don't want the shop creating any weird shit
    }

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    // Create the owned item
    return this._onDropItemCreate(itemData);
  }
  
  async _sellDropItem(event, item, itemData) {
    if (item.actor) {
      await item.actor.update({
        "system.money": item.actor.system.money + Math.round(item.system.cost * 0.72315),
        items: [{
          _id: item._id,
          "system.inBag": item.system.inBag - 1
        }]
      })
      
      let chatData = {
        item: item,
        value: Math.round(item.system.cost * 0.72315),
        user: game.user,
        shop: this.actor,
      }

      chatData.purchaseData = JSON.stringify(chatData);
      let itemData = await renderTemplate(this.constructor.ITEM_SALE_TEMPLATE, chatData);
      const speaker = ChatMessage.getSpeaker({actor: this.actor});
      const message = await ChatMessage.create({
        speaker: speaker,
        user: game.user.id,
        content: itemData,
        sound: CONFIG.sounds.notification,
        whisper: ChatMessage.getWhisperRecipients("gm")
      });
    }

    var bUpdatedItem = true;
    const actorItem = this.actor.items.getName(itemData.name);
    if (actorItem != null) {
      await actorItem.update({"system.inBag": actorItem.system.inBag + 1});
    } else {
      itemData.system.inBag = 1;
      itemData.system.inChest = 0;
      bUpdatedItem = false;
    }
    return bUpdatedItem;
  }

  handleMoveToChest(html, item) {
    var value = Math.min(html.find("input#quantity").val(), item.system.inBag);
    
    item.update({"system.inBag": item.system.inBag - value, "system.inChest": item.system.inChest + value});
  }

  async handleMoveToBag(html, item) {
    var value = Math.min(Math.min(Number(html.find("input#quantity").val()), item.system.inChest), item.system.stackSize);

    const contextData = await this.getData();
    if (contextData.bag.length > 23) {
      ui.notifications.info("Bag is Full");
      return;
    }
    
    item.update({"system.inBag": item.system.inBag + value, "system.inChest": item.system.inChest - value});
  }

  async _onRollBonus(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const damageData = JSON.parse(dataset.damageValues);
    
    const valueKeys = Object.keys(damageData.values).sort();
    if (valueKeys.length == 1) {
      dataset.attackDamage = damageData.values["hit1"];
      this.roll(dataset);
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
    await this.roll(dataset);
    if (valueIdx < valueKeys.length - 1) {
      Dialog.prompt({
        title: "Attack Multi-roll",
        content: "Continue attack rolls?",
        label: "next hit",
        callback: () => this._multiRoll(dataset, damageData, valueIdx + 1)
      });
    }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll(options ={}) {
    const context = await this.getData();
    const item = context.activeWeapon;
    const attackStringObj = JSON.parse(options.attackString);
    const ammoType = options.hasOwnProperty('ammoType') ? options.ammoType : undefined;

    // update the attack type with the ammo damage type if applicable
    options.attackType = TITANGROUND_WEAPONS.arrowTypes[ammoType]?.damageType || options?.attackType;
    
    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({actor: this.actor});
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // Retrieve roll data.
    const rollData = this.actor.getRollData();
    
    var formula = rollData.sharpness.formula.replace('X', item.system.die).concat("+", context.system.abilities.str.total, "+", item.system.bonus);
    if (options.hasOwnProperty('attackDamage')) formula = formula.concat("+", options.attackDamage);
    var elementFormula = item.system.element.type != "N/A" ? item.system.element.formula.concat("+", context.system.abilities.spr.total) : "0";
    const attackRoll = new Roll(formula, rollData);
    const hitRoll = new Roll('1d20', rollData);
    const elementRoll = new Roll(elementFormula, rollData);

    // If you need to store the value first, uncomment the next line.
    await attackRoll.roll({async: true});
    await hitRoll.roll({async: true});
    await elementRoll.roll({async: true});

    const applyDamageData = {
      "user": this.actor,
      "damageType": options.hasOwnProperty('attackType') ? options.attackType : "",
      "elementType": item.system.element.type,
      "rawDamage": Math.round(attackRoll.total * 100) / 100,
      "eleDamage": Math.round(elementRoll.total * 100) / 100
    };

    const chatData = {
      attackName: options.hasOwnProperty('attackName') ? options.attackName : "",
      attackType: options.hasOwnProperty('attackType') ? options.attackType : "",
      hitFormula: hitRoll.formula,
      damageFormula: attackRoll.formula,
      elementFormula: item.system.element.type === "N/A" ? "" : elementRoll.formula,
      elementType: item.system.element.type,
      user: game.user,
      hitTooltip: await hitRoll.getTooltip(),
      damageTooltip: await attackRoll.getTooltip(),
      elementTooltip: await elementRoll.getTooltip(),
      hitTotal: Math.round(hitRoll.total * 100) / 100,
      damageTotal: Math.round(attackRoll.total * 100) / 100,
      elementTotal: Math.round(elementRoll.total * 100) / 100,
      applyDamageData: JSON.stringify(applyDamageData),
      attackGrid: attackStringObj.attackGrid,
      attackGridSize: attackStringObj.attackGridSize,
      attackGridHeight: attackStringObj.attackGridHeight
    };

    let attackData = await renderTemplate(this.constructor.ATTACKROLL_TEMPLATE, chatData);

    const message = await ChatMessage.create({
      speaker: speaker,
      rollMode: rollData.rollMode,
      content: attackData,
      rolls: [hitRoll, attackRoll, elementRoll],
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    });

    return attackRoll;
  }
}