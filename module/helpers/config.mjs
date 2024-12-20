export const TITANGROUND = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
 TITANGROUND.abilities = {
  "str": "TITANGROUND.AbilityStr",
  "con": "TITANGROUND.AbilityCon",
  "spr": "TITANGROUND.AbilitySpr",
  "int": "TITANGROUND.AbilityInt",
};
 
 TITANGROUND.disciplines = {
     "Alg": "TITANGROUND.disciplineAlg",
     "Bat": "TITANGROUND.disciplineBat",
     "Cyn": "TITANGROUND.disciplineCyn",
     "Dra": "TITANGROUND.disciplineDra",
     "Ent": "TITANGROUND.disciplineEnt",
     "Fel": "TITANGROUND.disciplineFel",
     "Hpt": "TITANGROUND.disciplineHpt",
     "Ich": "TITANGROUND.disciplineIch",
     "Orn": "TITANGROUND.disciplinePrn",
     "Pat": "TITANGROUND.disciplinePat",
     "Phy": "TITANGROUND.disciplinePhy",
     "Prm": "TITANGROUND.disciplinePrm",
     "Bio": "TITANGROUND.disciplineBio",
     "Hrb": "TITANGROUND.disciplineHrb",
     "Het": "TITANGROUND.disciplineHet",
     "Min": "TITANGROUND.disciplineMin",
     "Myc": "TITANGROUND.disciplineMyc",
     "Spm": "TITANGROUND.disciplineSpm",
 }
 
 TITANGROUND.resistances = {
     "Sls": "TITANGROUND.ResistanceSls",
     "Blt": "TITANGROUND.ResistanceBlt",
     "Epl": "TITANGROUND.ResistanceEpl",
     "Prc": "TITANGROUND.ResistancePrc",
     "Mag": "TITANGROUND.ResistanceMag",
     "Wtr": "TITANGROUND.ResistanceWtr",
     "Fre": "TITANGROUND.ResistanceFre",
     "Lgt": "TITANGROUND.ResistanceLgt",
     "Ice": "TITANGROUND.ResistanceIce",
     "Drg": "TITANGROUND.ResistanceDrg",
     "Slp": "TITANGROUND.ResistanceSlp",
     "Psn": "TITANGROUND.ResistancePsn",
     "Par": "TITANGROUND.ResistancePar",
     "Stn": "TITANGROUND.ResistanceStn",
     "Bld": "TITANGROUND.ResistanceBld",
 }
 
 TITANGROUND.skills = {
     "acr": "TITANGROUND.SkillAcr",
     "apr": "TITANGROUND.SkillApr",
     "dec": "TITANGROUND.SkillDec",
     "ins": "TITANGROUND.SkillIns",
     "int": "TITANGROUND.SkillInt",
     "per": "TITANGROUND.SkillPer",
 }

TITANGROUND.abilityAbbreviations = {
  "str": "TITANGROUND.AbilityStrAbbr",
  "con": "TITANGROUND.AbilityConAbbr",
  "spr": "TITANGROUND.AbilitySprAbbr",
  "int": "TITANGROUND.AbilityIntAbbr",
};
 
 TITANGROUND.sharpnessLevels = {
     "Red": {
         "min": 0,
         "max": 25,
         "formula": "bounce",
         "color": 'red'
     },
     "Orange": {
         "min": 26,
         "max": 37,
         "formula": "1dX",
         "color": 'orange'
     },
     "Yellow": {
         "min": 38,
         "max": 49,
         "formula": "2dX",
         "color": 'yellow'
     },
     "Green": {
         "min": 50,
         "max": 60,
         "formula": "3dX",
         "color": 'limegreen'
     },
     "Blue": {
         "min": 61,
         "max": 70,
         "formula": "4dX",
         "color": 'dodgerblue'
     },
     "White": {
         "min": 71,
         "max": 80,
         "formula": "5dX",
         "color": 'white'
     },
     "Purple": {
         "min": 81,
         "max": 200,
         "formula": "6dX",
         "color": 'mediumorchid'
     }
 }
 
 TITANGROUND.armorAbilities = {
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