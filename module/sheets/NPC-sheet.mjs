import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {TITANGROUND} from "../helpers/config.mjs";
import {TITANGROUND_WEAPONS} from "../helpers/config-weapon-data.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class MonHunSysNPCSheet extends ActorSheet {

  /**
   * The HTML template path used to render a complete Roll object to the chat log
   * @type {string}
   */
  static ATTACKROLL_TEMPLATE = "systems/monhunsys/templates/chat/TitanAttackRoll.html";
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

    // Prepare NPC data and items.
    await this._prepareItems(context);

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
    
    const inTown = game.settings.get('monhunsys', 'bInTown');

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
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
    }

    // Assign and return
    context.attacks = await this.getNPCAttacks();
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.user = game.user;
    context.biographyHTML = await TextEditor.enrichHTML(context.system.biography, {
      secrets: this.actor.isOwner,
      rollData: context.rollData,
      async: true,
      relativeTo: this.actor
    });
    
    context.inTown = inTown;
    context.expandBag = this.expandBag;
  }

  async getNPCAttacks() {
    const json = await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute("systems/monhunsys/data/TitanAttacks.json"));

    if (!json.hasOwnProperty(this.actor.name))
      return [];
    
    var attacks = json[this.actor.name];
    
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

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    // Create the owned item
    return this._onDropItemCreate(itemData);
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
    updates["system.clock"] = Math.max(0,Titan.system.clock - 1);
    if (Titan.system.exhausted)
      updates["system.stamina.value"] = Titan.system.stamina.value + 5;

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
    const attackStringObj = JSON.parse(options.attackString);
    const ammoType = options.hasOwnProperty('ammoType') ? options.ammoType : undefined;

    // update the attack type with the ammo damage type if applicable
    options.attackType = TITANGROUND_WEAPONS.arrowTypes[ammoType]?.damageType || options?.attackType;
    
    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({actor: this.actor});

    // Retrieve roll data.
    const rollData = this.actor.getRollData();
    
    let damageVal = Math.round((options?.attackDamage || 0) * (this.actor.system.enraged ? 1.25 : 1));
    const attackRoll = new Roll(damageVal?.toString(), rollData);

    await attackRoll.roll({async: true});

    const applyDamageData = {
      "user": this.actor,
      "damageType": options?.attackType,
      "rawDamage": Math.round(attackRoll.total * 100) / 100
    };

    const chatData = {
      attackName: options?.attackName,
      attackType: options?.attackType,
      damageFormula: attackRoll.formula,
      user: game.user,
      titan: this.actor,
      damageTooltip: await attackRoll.getTooltip(),
      damageTotal: Math.round(attackRoll.total * 100) / 100,
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
      rolls: [attackRoll],
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    });

    this.processAttack(attackStringObj);
    return attackRoll;
  }
  
  async processAttack(attackData) {
    let updates = {
      "system.clock": attackData?.clock,
      "system.stamina.value": this.actor.system.stamina.value - attackData?.stamina
    };
    
    if (this.actor.system.stamina.value - attackData?.stamina <= 0) {
      updates["system.exhausted"] = true;
      updates["system.enraged"] = false;
    }
    
    this.actor.update(updates);
  }
}