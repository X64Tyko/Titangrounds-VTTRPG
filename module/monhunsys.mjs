// Import document classes.
import { MonHunSysActor } from "./documents/actor.mjs";
import { MonHunSysItem } from "./documents/item.mjs";
import { MonHunCombat } from "./Combat/combat.mjs";
import { AdvRollTable } from "./documents/AdvRollTable.mjs"
import { MonHunCombatTracker } from "./Combat/MonHunCombatTracker.mjs";
import * as Chat from "./helpers/chat.mjs";
import * as dragDrop from "./helpers/dragDrop.mjs";
import { onGatherRollRequest } from "./helpers/Dialog.mjs";
// Import sheet classes.
import { MonHunSysActorSheet } from "./sheets/actor-sheet.mjs";
import { MonHunSysItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { TITANGROUND } from "./helpers/config.mjs";
import {onSocketMessageReceived} from "./helpers/Dialog.mjs"
import {addChatListeners} from "./helpers/chat.mjs";
import {handleDragDrop} from "./helpers/dragDrop.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.monhunsys = {
    MonHunSysActor,
    MonHunSysItem,
    MonHunCombat,
    AdvRollTable,
    onSocketMessageReceived,
    addChatListeners,
    handleDragDrop,
    onGatherRollRequest
  };

  // Add custom constants for configuration.
  CONFIG.TITANGROUND = TITANGROUND;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: null,
    decimals: 2
  };
  CONFIG.Combat.documentClass = MonHunCombat;

  // Define custom Document classes
  CONFIG.Actor.documentClass = MonHunSysActor;
  CONFIG.RollTable.documentClass = AdvRollTable;
  CONFIG.Item.documentClass = MonHunSysItem;
  CONFIG.ui.combat = MonHunCombatTracker;
  

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("monhunsys", MonHunSysActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("monhunsys", MonHunSysItemSheet, { makeDefault: true });
  
  game.socket.on('system.monhunsys', onSocketMessageReceived);
  
  // Settings!
  game.settings.register('monhunsys', 'bInTown', {
    name: 'In Town',
    hint: 'True if the party is in town, allowing them to move items to the chest and see sell prices',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
    onChange: value => {
      console.log(value)
    },
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('isCharacter', function(Data) {
  return Data.type == 'character';
});

Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
})

Handlebars.registerHelper("displayBag", function(context, options) {
  var ret = "";

  for(var i=0, j=context.length; i<j; i++) {
    ret = ret + options.fn(context[i]);
  }

  //for(var i=0, j=2-context.length; i<j; i++) {
  //  ret = ret + options.fn({});
  //}

  return ret;
});

Handlebars.registerHelper('isNPC', function(Data) {
  return Data.type == 'npc';
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('weaponPartial', function(context, options) {
  console.log(context);
  switch (context.data.root.item.type) {
    case "bow": return 'systems/monhunsys/templates/item/parts/bow-sheet.html'
  }
  
  return 'none';
});

Handlebars.registerHelper('actorWeaponPartial', function(context, options) {
  switch (context.data.root.activeWeapon.type) {
    case "bow": return 'systems/monhunsys/templates/item/parts/bow-attack-sheet.html';
    case "dualblade": return 'systems/monhunsys/templates/item/parts/dualblade-attack-sheet.html';
    case "fan": return 'systems/monhunsys/templates/item/parts/fan-attack-sheet.html';
    case "greatsword": return 'systems/monhunsys/templates/item/parts/greatsword-attack-sheet.html';
    case "hammer": return 'systems/monhunsys/templates/item/parts/hammer-attack-sheet.html';
    case "longsword": return 'systems/monhunsys/templates/item/parts/longsword-attack-sheet.html';
  }

  return 'none';
});

Handlebars.registerHelper('breaklines', function(text) {
  text = Handlebars.Utils.escapeExpression(text);
  text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
  return new Handlebars.SafeString(text);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Damage buttons                              */
/* -------------------------------------------- */
Hooks.on("renderChatMessage", (message, html, data) => Chat.addChatListeners(message, html));

/* -------------------------------------------- */
/*  Drag drop between actor sheet handling                              */
/* -------------------------------------------- */
Hooks.on("dropActorSheetData", (dragTarget, sheet, dragSource, user) => dragDrop.handleDragDrop(dragTarget, sheet, dragSource, game.user));

export async function processTakeDamageButton(data) {
  console.log(data);
}
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.monhunsys.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "monhunsys.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}