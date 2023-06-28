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
         "max": 50,
         "formula": "bounce",
         "color": 'red'
     },
     "Orange": {
         "min": 51,
         "max": 75,
         "formula": "1dX",
         "color": 'orange'
     },
     "Yellow": {
         "min": 76,
         "max": 95,
         "formula": "1dX+1",
         "color": 'yellow'
     },
     "Green": {
         "min": 96,
         "max": 110,
         "formula": "2dX",
         "color": 'limegreen'
     },
     "Blue": {
         "min": 111,
         "max": 125,
         "formula": "2dX+2",
         "color": 'dodgerblue'
     },
     "White": {
         "min": 126,
         "max": 135,
         "formula": "3dX",
         "color": 'white'
     },
     "Purple": {
         "min": 136,
         "max": 200,
         "formula": "4dX+4",
         "color": 'mediumorchid'
     }
 }
 
 TITANGROUND