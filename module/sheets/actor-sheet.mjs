import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {TITANGROUND} from "../helpers/config.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class MonHunSysActorSheet extends ActorSheet {

  /**
   * The HTML template path used to render a complete Roll object to the chat log
   * @type {string}
   */
  static ATTACKROLL_TEMPLATE = "systems/monhunsys/templates/chat/AttackRoll.html";

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["monhunsys", "sheet", "actor"],
      template: "systems/monhunsys/templates/actor/actor-sheet.html",
      width: 600,
      height: 775,
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

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
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
      v.img = "Icons/SheetIcons/" + k + ".png";
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
    
    console.log(updates);
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
        if (i.system.inBag <= 0 && i.system.inChest <= 0 && this.actor.type !='npc') {
          await this.actor.deleteEmbeddedDocuments("Item", [i._id]);
          continue;
        }
        
        gear.push(i);
        i.system.salePrice = Math.round(i.system.cost * 0.72315);
        if (i.system.inBag > 0)
          bag.push(i);
        if (i.system.inChest > 0)
          chest.push(i);
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
        weapons.push(i);
        if (i.system.equipped) {
          this.actor.system.activeWeaponID = i._id;
          context.activeWeapon = i;
          context.activeWeapon.attacks = await this.getWeaponAttacks(i);
          context.weaponSpeed = 30 + (5 * Number(i.system.speed));
        }
      }
      else if (i.type === 'armor') {
        armorChest.push(i);
        if (i.system.equipped) {
          if (i.system.slot === 'head') {
            armor.head = i;
            this.actor.system.armorHeadID = i._id;
            for (let [k, v] of Object.entries(i.system.resistances)) {
              context.system.resistances[k].value += Number(v.value);
            }
          }
          if (i.system.slot === 'chest') {
            armor.chest = i;
            this.actor.system.armorChestID = i._id;
            for (let [k, v] of Object.entries(i.system.resistances)) {
              context.system.resistances[k].value += Number(v.value);
            }
          }
          if (i.system.slot === 'hands') {
            armor.hands = i;
            this.actor.system.armorHandsID = i._id;
            for (let [k, v] of Object.entries(i.system.resistances)) {
              context.system.resistances[k].value += Number(v.value);
            }
          }
          if (i.system.slot === 'waist') {
            armor.waist = i;
            this.actor.system.armorWaistID = i._id;
            for (let [k, v] of Object.entries(i.system.resistances)) {
              context.system.resistances[k].value += Number(v.value);
            }
          }
          if (i.system.slot === 'legs') {
            armor.legs = i;
            this.actor.system.armorLegsID = i._id;
            for (let [k, v] of Object.entries(i.system.resistances)) {
              context.system.resistances[k].value += Number(v.value);
            }
          }
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.bag = bag;
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
    
    context.inTown = game.settings.get('monhunsys', 'bInTown');
  }
  
  async getWeaponAttacks(weapon) {
    const json = await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute("systems/monhunsys/data/WeaponAttacks.json"));

    var attacks = json[weapon.type];
    
    var mappedAttacks = {};
    
    for (let [k, attack] of Object.entries(attacks)) {
      attack.stringified = JSON.stringify(attack);
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
        let weaponItem = this.actor.items.get(this.actor.system.activeWeaponID);
        var updates = {
          "system.sharpness.base": item.system.sharpness.max,
          items: [{
            _id: item._id,
            "system.equipped": true
          }]
        };
        if (weaponItem) {
          updates.items.push ({
            _id: this.actor.system.activeWeaponID,
            "system.equipped": false
          });
        }
        console.log(updates);
        await this.actor.update(updates);
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
        var updates = {
          items: [{
            _id: i._id,
            "system.equipped": true
          }]
        };
        if (i.system.slot === 'head') {
          const oldI = this.actor.items.get(this.actor.system.armorHeadID);
          if (oldI) {
            updates.items.push({
              _id: this.actor.system.armorHeadID,
              "system.equipped": false
            });
          }
        }
        if (i.system.slot === 'chest') {
          const oldI = this.actor.items.get(this.actor.system.armorChestID);
          if (oldI) {
            updates.items.push({
              _id: this.actor.system.armorHeadID,
              "system.equipped": false
            });
          }
        }
        if (i.system.slot === 'hands') {
          const oldI = this.actor.items.get(this.actor.system.armorHandsID);
          if (oldI) {
            updates.items.push({
              _id: this.actor.system.armorHeadID,
              "system.equipped": false
            });
          }
        }
        if (i.system.slot === 'waist') {
          const oldI = this.actor.items.get(this.actor.system.armorWaistID);
          if (oldI) {
            updates.items.push({
              _id: this.actor.system.armorHeadID,
              "system.equipped": false
            });
          }
        }
        if (i.system.slot === 'legs') {
          const oldI = this.actor.items.get(this.actor.system.armorLegsID);
          if (oldI) {
            updates.items.push({
              _id: this.actor.system.armorHeadID,
              "system.equipped": false
            });
          }
        }
        await this.actor.update(updates);
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
        let roll = new Roll(this.statRoll.concat("+", statTotal, "+@abilities.str.total"), this.actor.getRollData());
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
        let roll = new Roll(this.statRoll.concat("+", statTotal, "+@abilities.con.total"), this.actor.getRollData());
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
        let roll = new Roll(this.statRoll.concat("+", statTotal, "+@abilities.spr.total"), this.actor.getRollData());
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
        let roll = new Roll(this.statRoll.concat("+", statTotal, "+@abilities.int.total"), this.actor.getRollData());
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

    // Add Titan Part
    html.find('.part-create').click(this._onPartCreate.bind(this));

    // Update statuses and shit
    html.find('.combat-round').click(this._onUpdateRoundChange.bind(this));
    
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

    html.find('.part-delete').click(async (ev) => {
      const li = $(ev.currentTarget).parents(".part");
      const idx = li.data("partId");
      const updateString = 'system.parts.-=' + idx;
      this.actor.update({[updateString]: null});
      this.render(false);
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

  onUpdateAttackCard(ev) {
    const el = $(ev.currentTarget).parents(".attack-block");
    const chainID = el.data("chainId");
    const current = this.actor.getFlag('monhunsys', chainID + 'expanded');
    this.actor.setFlag('monhunsys', chainID + 'expanded', !current);
    
    return false;
  }

  onUpdatAttackChainState(ev) {
    const el = $(ev.currentTarget).parents(".attack-block");
    const chainID = el.data("chainId");
    const current = this.actor.getFlag('monhunsys', chainID);
    this.actor.setFlag('monhunsys', chainID, !current);
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

    let weaponID = undefined;
    for (let i of this.actor.items) {
      if (i.system.type === 'weapon') {
        if (i.system.equipped) {
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

    if (this.actor.type == "character") {
      if (itemData.system.type == "weapon") {
        let weaponItem = this.actor.items.get(this.actor.system.activeWeaponID);
        var updates = {
          "system.sharpness.base": itemData.system.sharpness.max
        };
        if (weaponItem) {
          updates['items'] = [{
            _id: this.actor.system.activeWeaponID,
            "system.equipped": false
          }]
        }
        console.log(updates);
        await this.actor.update(updates);
        itemData.system.equipped = true;
      }
      if (itemData.type == "item") {
        const ItemHandled = await this._onDroppedItem(event, item, itemData);
        if (ItemHandled) {
          return;
        }
      }
      if (itemData.type == "armor") {
        const slot = itemData.system.slot;
        if (itemData.system.slot === 'head') {
          let armorItem = this.actor.items.get(this.actor.system.armorHeadID);
          if (armorItem) {
            var updates = {
              items: [{
                _id: this.actor.system.armorHeadID,
                "system.equipped": false
              }]
            };
            await this.actor.update(updates);
          }
        }
        if (itemData.system.slot === 'chest') {
          let armorItem = this.actor.items.get(this.actor.system.armorChestID);
          if (armorItem) {
            var updates = {
              items: [{
                _id: this.actor.system.armorChestID,
                "system.equipped": false
              }]
            };
            await this.actor.update(updates);
          }
        }
        if (itemData.system.slot === 'hands') {
          let armorItem = this.actor.items.get(this.actor.system.armorHandsID);
          if (armorItem) {
            var updates = {
              items: [{
                _id: this.actor.system.armorHandsID,
                "system.equipped": false
              }]
            };
            await this.actor.update(updates);
          }
        }
        if (itemData.system.slot === 'waist') {
          let armorItem = this.actor.items.get(this.actor.system.armorWaistID);
          if (armorItem) {
            var updates = {
              items: [{
                _id: this.actor.system.armorWaistID,
                "system.equipped": false
              }]
            };
            await this.actor.update(updates);
          }
        }
        if (itemData.system.slot === 'legs') {
          let armorItem = this.actor.items.get(this.actor.system.armorLegsID);
          if (armorItem) {
            var updates = {
              items: [{
                _id: this.actor.system.armorLegsID,
                "system.equipped": false
              }]
            };
            await this.actor.update(updates);
            itemData.system.equipped = true;
          }
        }
      }
    } else if (this.actor.type == 'shop') {
      if (itemData.type == "item") {
        const ItemHandled = await this._sellDropItem(event, item, itemData);
        if (ItemHandled) {
          return;
        }
      }
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
    }

    var bUpdatedItem = true;
    const actorItem = this.actor.items.getName(itemData.name);
    if (actorItem != null) {
      await actorItem.update({"system.inBag": actorItem.system.inBag + 1});
      this.render(false);
    } else {
      itemData.system.inBag = 1;
      itemData.system.inChest = 0;
      bUpdatedItem = false;
    }
    return bUpdatedItem;
  }

  async _onDroppedItem(event, item, itemData) {

    // we're not giving ourselves extra items.
    if (item.actor == this.actor)
      return true;
    
    let isBagDrop = false;
    let isChestDrop = false;
    let target = event.target;
    do {
      if (target.classList.contains("BagDrop")) {
        isBagDrop = true;
        break;
      } else if (target.classList.contains("ChestDrop")) {
        isChestDrop = true;
        break;
      }
      target = target.parentNode;
    } while (target && !isBagDrop && !isChestDrop);

    if (isBagDrop || isChestDrop) {
      const contextData = await this.getData();
      if (isBagDrop && contextData.bag.length > 23) {
        console.log("Bag Full");
        return true;
      } else {
        const actorItem = this.actor.items.getName(itemData.name);
        if (actorItem) {
          if (isBagDrop && actorItem.system.inBag < actorItem.system.stackSize) {
            await actorItem.update({"system.inBag": actorItem.system.inBag + 1});
            return true;
          } else if (isBagDrop) {
            ui.notifications.info("Bag is Full");
            return true;
          } else {
            await actorItem.update({"system.inChest": actorItem.system.inChest + 1});
            return true;
          }
        }
        if (isBagDrop) {
          itemData.system.inBag = 1;
        } else {
          itemData.system.inChest = 1;
        }
      }
    }

    return false;
  }

  async _onPartCreate(event) {
    const Titan = this.actor;

    const parts = Titan.system.parts;
    const partKeys = Object.keys(parts).sort();
    let newPartKey = "Part" + partKeys.length;

    for (let i = 0; i < partKeys.length; ++i) {
      if (partKeys[i] !== ("Part" + i)) {
        newPartKey = "Part" + i;
        break;
      }
    }

    parts[newPartKey] = {
      "name": "Body",
      "resistances": {
        "Slashing": 5,
        "Blunt": 5,
        "Explosive": 5,
        "Piercing": 5,
        "Sonic": 5,
        "Water": 1,
        "Fire": 1,
        "Lightning": 1,
        "Ice": 1,
        "Dragon": 1
      },
      "breakReward": "none",
      "breakPercent": 10,
      "breakDamageType": "Any",
      "staggerPercent": 8,
      "staggerType": "flinch"
    };

    Titan.update({"system.parts": parts});
  }

  _onUpdateRoundChange(event) {
    const Titan = this.actor;
    const statusData = foundry.utils.deepClone(Titan.system.statusData);

    let updates = {};
    for (let [k, status] of Object.entries(statusData)) {
      status.roundsRemaining = Math.max(status.roundsRemaining - 1, 0);
      status.value = Math.max(status.value - status.Degradation, 0);
    }

    updates["system.statusData"] = statusData;

    Titan.update(updates);
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
    console.log(options);
    const attackStringObj = JSON.parse(options.attackString);

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