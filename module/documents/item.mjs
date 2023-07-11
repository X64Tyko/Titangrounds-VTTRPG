import {processTakeDamageButton} from "../monhunsys.mjs";
import {TITANGROUND} from "../helpers/config.mjs";
import {TITANGROUND_WEAPONS} from "../helpers/config-weapon-data.mjs";
import {TITANGROUND_ARMOR} from "../helpers/config-armor-data.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class MonHunSysItem extends Item {
  
  /**
 * The HTML template path used to render a complete Roll object to the chat log
 * @type {string}
 */
static ATTACKROLL_TEMPLATE = "systems/monhunsys/templates/chat/AttackRoll.html";

/**
 * The HTML template used to render an expanded Roll tooltip to the chat log
 * @type {string}
 */
static TOOLTIP_TEMPLATE = "systems/monhunsys/templates/dice/hitTooltip.html";

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

    prepareDerivedData() {
        const itemData = this;
        
        if (itemData.type === "bow") {
            itemData.system.ammoTypes = TITANGROUND_WEAPONS.arrowTypes;
        }
        
        if (itemData.type === "armor") {
            itemData.system.allSlots = TITANGROUND_ARMOR.armorSlots;
            itemData.system.allAbilities = TITANGROUND_ARMOR.armorAbilities;
        }
    }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle pushing item data to chat log
   * @private
   */
  async displayData() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // Push item data to chat window
    ChatMessage.create({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label,
      content: item.system.description ?? ''
    });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll(options ={}) {
      const item = this;
      const attackStringObj = JSON.parse(options.attackString);

      // Initialize chat data.
      const speaker = ChatMessage.getSpeaker({actor: this.actor});
      const rollMode = game.settings.get('core', 'rollMode');
      const label = `[${item.type}] ${item.name}`;

      // If there's no roll data, send a chat message.
      if (!this.system.formula) {
          ChatMessage.create({
              speaker: speaker,
              rollMode: rollMode,
              flavor: label,
              content: item.system.description ?? ''
          });
      }
      // Otherwise, create a roll and send a chat message from it.
      else {
          // Retrieve roll data.
          const rollData = this.getRollData();

          if (this.system.type == "weapon") {

              var formula = rollData.sharpness.formula.replace('X', item.system.die).concat("+", this.actor.system.abilities.str.value + this.actor.system.abilities.str.bonus + this.actor.system.abilities.str.temp, "+", item.system.bonus);
              if (options.hasOwnProperty('attackDamage')) formula = formula.concat("+", options.attackDamage);
              var elementFormula = this.system.element.type != "N/A" ? this.system.element.formula.concat("+", this.actor.system.abilities.spr.value + this.actor.system.abilities.str.bonus + this.actor.system.abilities.str.temp) : "0";
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
                  "elementType": this.system.element.type,
                  "rawDamage": Math.round(attackRoll.total * 100) / 100,
                  "eleDamage": Math.round(elementRoll.total * 100) / 100
              };
              
              const chatData = {
                  attackName: options.hasOwnProperty('attackName') ? options.attackName : "",
                  attackType: options.hasOwnProperty('attackType') ? options.attackType : "",
                  hitFormula: hitRoll.formula,
                  damageFormula: attackRoll.formula,
                  elementFormula: this.system.element.type === "N/A" ? "" : elementRoll.formula,
                  elementType: this.system.element.type,
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

          // Invoke the roll and submit it to chat.
          const roll = new Roll(rollData.item.formula, rollData);
          // If you need to store the value first, uncomment the next line.
          // let result = await roll.roll({async: true});
          roll.toMessage({
              speaker: speaker,
              rollMode: rollMode,
              flavor: label,
          });
          return roll;

      }
  }
}
