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
             { "AAMods.baseDamage": 2, "type": "add" },
             { "AAMods.baseCrit": 1, "type": "add" }
         ],
         "2": [
             { "AAMods.baseDamage": 4, "type": "add" },
             { "AAMods.baseCrit": 1, "type": "add" }
         ],
         "3": [
             { "AAMods.baseDamage": 6, "type": "add" },
             { "AAMods.baseCrit": 2, "type": "add" }
         ],
         "4": [
             { "AAMods.baseDamage": 8, "type": "add" },
             { "AAMods.baseCrit": 2, "type": "add" }
         ],
         "5": [
             { "AAMods.baseDamage": 10, "type": "add" },
             { "AAMods.baseCrit": 3, "type": "add" }
         ],
         "6": [
             { "AAMods.baseDamage": 15, "type": "add" },
             { "AAMods.baseCrit": 3, "type": "add" }
         ],
         "7": [
             { "AAMods.baseDamage": 20, "type": "add" },
             { "AAMods.baseCrit": 4, "type": "add" }
         ]
     },
     "Airborne": {
         "description": "Increases base Damage from aerial attacks",
         "condition": { "attackType": "aerial" },
         "1": [
             { "AAMods.baseDamage": 10, "type": "add" }
         ],
         "2": [
             { "AAMods.baseDamage": 20, "type": "add" }
         ],
         "3": [
             { "AAMods.baseDamage": 45, "type": "add" }
         ]
     },
     "Attack Boost": {
         "description": "Increases base Damage",
         "condition": {},
         "1": [
             { "AAMods.baseDamage": 5, "type": "add" }
         ],
         "2": [
             { "AAMods.baseDamage": 10, "type": "add" }
         ],
         "3": [
             { "AAMods.baseDamage": 15, "type": "add" }
         ],
         "4": [
             { "AAMods.baseDamage": 20, "type": "add" }
         ],
         "5": [
             { "AAMods.baseDamage": 25, "type": "add" }
         ],
         "6": [
             { "AAMods.baseDamage": 30, "type": "add" }
         ],
         "7": [
             { "AAMods.baseDamage": 40, "type": "add" }
         ]
     },
     "Bleed Booster": {
         "description": "Increases Bleed Damage",
         "condition": {},
         "1": [
             { "AAMods.bleedDamage": 5, "type": "add" }
         ],
         "2": [
             { "AAMods.bleedDamage": 10, "type": "add" }
         ],
         "3": [
             { "AAMods.bleedDamage": 15, "type": "add" }
         ],
         "4": [
             { "AAMods.bleedDamage": 20, "type": "add" }
         ],
         "5": [
             { "AAMods.bleedDamage": 25, "type": "add" }
         ],
         "6": [
             { "AAMods.bleedDamage": 30, "type": "add" }
         ],
         "7": [
             { "AAMods.bleedDamage": 40, "type": "add" }
         ]
     },
    "Bleed Resistance": {
        "description": "Reduces the duration of Bleed",
        "condition": {},
        "1": [
            { "AAMods.bleedRes": 1, "type": "add" }
        ],
        "2": [
            { "AAMods.bleedRes": 2, "type": "add" }
        ],
        "3": [
            { "AAMods.bleedRes": 3, "type": "add" }
        ],
        "4": [
            { "AAMods.bleedRes": 4, "type": "add" }
        ],
        "5": [
            { "AAMods.bleedRes": 5, "type": "add" }
        ]
    },
    "Bombardier": {
        "description": "Increases damage of explosive items",
        "condition": {},
        "1": [
            { "AAMods.bombardier": 20, "type": "add" }
        ],
        "2": [
            { "AAMods.bombardier": 40, "type": "add" }
        ],
        "3": [
            { "AAMods.bombardier": 100, "type": "add" }
        ]
    },
    "Brainy": {
        "description": "Increases Intelligence",
        "condition": {},
        "1": [
            { "AAMods.int": 2, "type": "add" }
        ],
        "2": [
            { "AAMods.int": 4, "type": "add" }
        ],
        "3": [
            { "AAMods.int": 6, "type": "add" }
        ],
        "4": [
            { "AAMods.int": 8, "type": "add" }
        ],
        "5": [
            { "AAMods.int": 10, "type": "add" }
        ]
    },
    "Bugged Out": {
        "description": "Increases Heteroptology",
        "condition": {},
        "1": [
            { "AAMods.Het": 1, "type": "add" }
        ],
        "2": [
            { "AAMods.Het": 2, "type": "add" }
        ],
        "3": [
            { "AAMods.Het": 3, "type": "add" }
        ],
        "4": [
            { "AAMods.Het": 4, "type": "add" }
        ],
        "5": [
            { "AAMods.Het": 5, "type": "add" }
        ]
    },
    "Coldproof": {
         "description": "Nullifies the effects of cold weather",
        "condition": {}
    },
    "Constitution": {
        "description": "Increases Constitution",
        "condition": {},
        "1": [
            { "AAMods.con": 2, "type": "add" }
        ],
        "2": [
            { "AAMods.con": 4, "type": "add" }
        ],
        "3": [
            { "AAMods.con": 6, "type": "add" }
        ],
        "4": [
            { "AAMods.con": 8, "type": "add" }
        ],
        "5": [
            { "AAMods.con": 10, "type": "add" }
        ]
    },
    "Critical Boost": {
        "description": "Increases Crit",
        "condition": {},
        "1": [
            { "AAMods.baseCrit": 1, "type": "add" }
        ],
        "2": [
            { "AAMods.baseCrit": 2, "type": "add" }
        ],
        "3": [
            { "AAMods.baseCrit": 3, "type": "add" }
        ],
        "4": [
            { "AAMods.baseCrit": 4, "type": "add" }
        ],
        "5": [
            { "AAMods.baseCrit": 5, "type": "add" }
        ]
    },
    "Critical Draw": {
        "description": "Increases Crit for the first attack after unsheathing a weapon",
        "condition": {},
        "1": [
            { "AAMods.baseCrit": 2, "type": "add" }
        ],
        "2": [
            { "AAMods.baseCrit": 4, "type": "add" }
        ],
        "3": [
            { "AAMods.baseCrit": 6, "type": "add" }
        ],
        "4": [
            { "AAMods.baseCrit": 8, "type": "add" }
        ],
        "5": [
            { "AAMods.baseCrit": 10, "type": "add" }
        ]
    },
    "Critical Element": {
         "description": "Increases elemental damage after landing a Crit",
        "condition": {}
    },
    "Critical Status": {
        "description": "Increases status damage after landing a Crit",
        "condition": {}
    },
    "Defender": {
        "description": "Increases physical resistances",
        "condition": {},
        "1": [
            { "AAMods.physRes": 2, "type": "add" }
        ],
        "2": [
            { "AAMods.physRes": 4, "type": "add" }
        ],
        "3": [
            { "AAMods.physRes": 6, "type": "add" }
        ],
        "4": [
            { "AAMods.physRes": 8, "type": "add" }
        ],
        "5": [
            { "AAMods.physRes": 10, "type": "add" }
        ]
    },
    "Detector": {
        "description": "Ability to see what gathering points are most plentiful in a region",
        "condition": {}
    },
    "Dragon Booster": {
        "description": "Increases Dragon Damage",
        "condition": {}
    },
    "Earplugs": {
        "description": "Titan roars no longer cause flinching",
        "condition": {}
    },
    "Evader": {
        "description": "Decreases clock for dodge roll",
        "condition": {}
    },
    "Fire Booster": {
        "description": "Increases Fire damage",
        "condition": {}
    },
    "Focus": {
        "description": "Increases weapon unique resource charge rate",
        "condition": {}
    },
    "Gatherer": {
        "description": "Increases amount and quality of gathered items",
        "condition": {},
        "1": [
            { "AAMods.gatherBoost": 5, "type": "add" }
        ],
        "2": [
            { "AAMods.gatherBoost": 10, "type": "add" }
        ],
        "3": [
            { "AAMods.gatherBoost": 15, "type": "add" }
        ]
    },
    "Health Boost": {
        "description": "Increases base Health",
        "condition": {}
    },
    "Heatproof": {
        "description": "Nullifies the effects of hot weather",
        "condition": {}
    },
    "Herbalist": {
        "description": "Increases Herbology",
        "condition": {}
    },
    "Heroic": {
        "description": "Increases base Damage while health is under 50",
        "condition": {}
    },
    "Ice Booster": {
        "description": "Increases Ice damage",
        "condition": {}
    },
    "Item Prolonger": {
        "description": "Increases the duration of temporary item buffs",
        "condition": {}
    },
    "Lightning Booster": {
        "description": "Increases Lightning damage",
        "condition": {}
    },
    "Maximum Might": {
        "description": "Increases Crit when Stamina is full",
        "condition": {}
    },
    "Mind's Eye": {
        "description": "Weapon can only bounce on a 1 regardless of Titan armor",
        "condition": {}
    },
    "Mountaineer": {
        "description": "Increase movement in the mountains",
        "condition": {}
    },
    "Non-elemental Boost": {
        "description": "Increases base damage when weilding a non-elemental weapon",
        "condition": {}
    },
    "Nutty": {
        "description": "Increases Spermology",
        "condition": {}
    },
    "Paralysis Booster": {
        "description": "Increases Paralysis damage",
        "condition": {}
    },
    "Paralysis Resistance": {
        "description": "Reduces the duration of paralysis",
        "condition": {}
    },
    "Peak Performance": {
        "description": "Increases base damage when Health is full",
        "condition": {}
    },
    "Pet Rocks": {
        "description": "Increases Mineralogy",
        "condition": {},
        "1": [
            { "AAMods.Min": 2, "type": "add" }
        ],
        "2": [
            { "AAMods.Min": 4, "type": "add" }
        ],
        "3": [
            { "AAMods.Min": 6, "type": "add" }
        ],
        "4": [
            { "AAMods.Min": 8, "type": "add" }
        ],
        "5": [
            { "AAMods.Min": 10, "type": "add" }
        ]
    },
    "Poison Booster": {
        "description": "Increases Poison damage",
        "condition": {},
        "1": [
            { "AAMods.psnDamage": 5, "type": "add" }
        ],
        "2": [
            { "AAMods.psnDamage": 10, "type": "add" }
        ],
        "3": [
            { "AAMods.psnDamage": 15, "type": "add" }
        ],
        "4": [
            { "AAMods.psnDamage": 20, "type": "add" }
        ],
        "5": [
            { "AAMods.psnDamage": 25, "type": "add" }
        ],
        "6": [
            { "AAMods.psnDamage": 30, "type": "add" }
        ],
        "7": [
            { "AAMods.psnDamage": 40, "type": "add" }
        ]
    },
    "Poison Resistance": {
        "description": "Reduces the duration of poison",
        "condition": {}
    },
    "Provoker": {
        "description": "Increases the change that a Titan will target you instead of your allies",
        "condition": {}
    },
    "Roomy": {
        "description": "Increases Mycology",
        "condition": {}
    },
    "Sandman": {
        "description": "Increases Movement in the Desert",
        "condition": {}
    },
    "Sleep Booster": {
        "description": "Increases Sleep damage",
        "condition": {}
    },
    "Sleep Resistance": {
        "description": "Reduces the duration of sleep",
        "condition": {}
    },
    "Speed Eating": {
        "description": "Reduces clock time for consuming items",
        "condition": {}
    },
    "Speed Sharpening": {
        "description": "Reduces clock time for sharpening",
        "condition": {}
    },
    "Spiritual": {
        "description": "Increases Spirit",
        "condition": {}
    },
    "Stamina Thief": {
        "description": "Increases attacks ability to exhaust a Titan",
        "condition": {}
    },
    "Stun Booster": {
        "description": "Increases Stun damage",
        "condition": {}
    },
    "Stun Resistance": {
        "description": "Reduces duration of Stun",
        "condition": {}
    },
    "Survival Expert": {
        "description": "Increases Health gained from environmental interactables",
        "condition": {}
    },
    "Swampwalker": {
        "description": "Increases movement in the Swamp",
        "condition": {}
    },
    "Tickler": {
        "description": "Light damage no longer causes flinching",
        "condition": {}
    },
    "Treekour": {
        "description": "Increases movement in the forest",
        "condition": {}
    },
    "Water Booster": {
        "description": "Increases Water damage",
        "condition": {}
    }
 }