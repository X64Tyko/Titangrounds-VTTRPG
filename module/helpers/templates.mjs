/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/monhunsys/templates/actor/parts/actor-features.html",
    "systems/monhunsys/templates/actor/parts/actor-items.html",
    "systems/monhunsys/templates/actor/parts/actor-npc-items.html",
    "systems/monhunsys/templates/actor/parts/actor-npc-parts.html",
    "systems/monhunsys/templates/actor/parts/actor-npc-combatData.html",
    "systems/monhunsys/templates/actor/parts/actor-spells.html",
    "systems/monhunsys/templates/actor/parts/actor-effects.html",
      
      // Item partials
      "systems/monhunsys/templates/item/parts/item-effects.html",
      
      // Chat partials
    "systems/monhunsys/templates/chat/AttackRoll.html",
    "systems/monhunsys/templates/chat/AttackRollButtons.html",
    "systems/monhunsys/templates/chat/PurchaseRequest.html",
    "systems/monhunsys/templates/chat/PurchaseRequestButtons.html",
    "systems/monhunsys/templates/chat/SaleCard.html",
      
      // Weapon Partials
      "systems/monhunsys/templates/item/parts/bow-sheet.html",
      "systems/monhunsys/templates/item/parts/bow-attack-sheet.html",
      "systems/monhunsys/templates/item/parts/dualblade-attack-sheet.html",
      "systems/monhunsys/templates/item/parts/fan-attack-sheet.html",
      "systems/monhunsys/templates/item/parts/greatsword-attack-sheet.html",
      "systems/monhunsys/templates/item/parts/hammer-attack-sheet.html",
      "systems/monhunsys/templates/item/parts/longsword-attack-sheet.html",
    "systems/monhunsys/templates/item/parts/bow-attack-card.html",
    "systems/monhunsys/templates/item/parts/dualblade-attack-card.html",
    "systems/monhunsys/templates/item/parts/fan-attack-card.html",
    "systems/monhunsys/templates/item/parts/greatsword-attack-card.html",
    "systems/monhunsys/templates/item/parts/hammer-attack-card.html",
    "systems/monhunsys/templates/item/parts/longsword-attack-card.html"
  ]);
};
