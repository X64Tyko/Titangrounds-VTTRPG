export const TITANGROUND_ARMOR = {}

TITANGROUND_ARMOR.armorSlots = [
    "head",
    "chest",
    "arms",
    "waist",
    "legs"
]

TITANGROUND_ARMOR.armorAbilities = {
     "Achievement Unlocked": {
         "armorAbilityCap": 7
     },
     "Agitator": {
         "description": "Increases base Damage and Crit when a Large Titan becomes enraged",
         "condition": { "setting": "nearEnragedTitan" },
         "1": [
             { "system.baseDamage.AAMod": 2, "type": "add" },
             { "system.baseCrit.AAMod": 1, "type": "add" }
         ],
         "2": [
             { "system.baseDamage.AAMod": 4, "type": "add" },
             { "system.baseCrit.AAMod": 1, "type": "add" }
         ],
         "3": [
             { "system.baseDamage.AAMod": 6, "type": "add" },
             { "system.baseCrit.AAMod": 2, "type": "add" }
         ],
         "4": [
             { "system.baseDamage.AAMod": 8, "type": "add" },
             { "system.baseCrit.AAMod": 2, "type": "add" }
         ],
         "5": [
             { "system.baseDamage.AAMod": 10, "type": "add" },
             { "system.baseCrit.AAMod": 3, "type": "add" }
         ],
         "6": [
             { "system.baseDamage.AAMod": 15, "type": "add" },
             { "system.baseCrit.AAMod": 3, "type": "add" }
         ],
         "7": [
             { "system.baseDamage.AAMod": 20, "type": "add" },
             { "system.baseCrit.AAMod": 4, "type": "add" }
         ]
     },
     "Airborne": {
         "description": "Increases base Damage from aerial attacks",
         "condition": { "attackType": "aerial" },
         "1": [
             { "system.baseDamage.AAMod": 10, "type": "add" }
         ],
         "2": [
             { "system.baseDamage.AAMod": 20, "type": "add" }
         ],
         "3": [
             { "system.baseDamage.AAMod": 45, "type": "add" }
         ]
     },
     "Attack Boost": {
         "description": "Increases base Damage",
         "condition": {},
         "1": [
             { "system.baseDamage.AAMod": 5, "type": "add" }
         ],
         "2": [
             { "system.baseDamage.AAMod": 10, "type": "add" }
         ],
         "3": [
             { "system.baseDamage.AAMod": 15, "type": "add" }
         ],
         "4": [
             { "system.baseDamage.AAMod": 20, "type": "add" }
         ],
         "5": [
             { "system.baseDamage.AAMod": 25, "type": "add" }
         ],
         "6": [
             { "system.baseDamage.AAMod": 30, "type": "add" }
         ],
         "7": [
             { "system.baseDamage.AAMod": 40, "type": "add" }
         ]
     },
     "Bleed Booster": {
         "description": "Increases Bleed Damage",
         "condition": {},
         "1": [
             { "system.bleedDamage.AAMod": 5, "type": "add" }
         ],
         "2": [
             { "system.bleedDamage.AAMod": 10, "type": "add" }
         ],
         "3": [
             { "system.bleedDamage.AAMod": 15, "type": "add" }
         ],
         "4": [
             { "system.bleedDamage.AAMod": 20, "type": "add" }
         ],
         "5": [
             { "system.bleedDamage.AAMod": 25, "type": "add" }
         ],
         "6": [
             { "system.bleedDamage.AAMod": 30, "type": "add" }
         ],
         "7": [
             { "system.bleedDamage.AAMod": 40, "type": "add" }
         ]
     }
 }