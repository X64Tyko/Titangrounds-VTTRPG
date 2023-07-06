class WeaponModel extends foundry.abstact.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            type: new fields.StringField(),
            formula: new fields.StringField(),
            sharpness: new fields.NumberField({
                required: true,
                initial: 100,
                integer: true
            }),
            speed: new fields.NumberField({
                required: true,
                initial: 0,
                integer: true
            }),
            scratch: new fields.NumberField({
                required: true,
                initial: 0,
                integer: true
            }),
            crit: new fields.StringField(),
            element: new fields.SchemeField({
                type: new fields.StringField(),
                formula: new fields.StringField()
            })
        };
    }
    
    WeapponRoll(options) {
        
    }
}