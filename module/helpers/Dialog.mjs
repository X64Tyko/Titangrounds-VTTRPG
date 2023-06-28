/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {String} tableName      The table to roll on with the user's selected discipline
 */
 export async function onPushGatherDialog(tableName) {
     const Response = new Promise((resolve, reject) => {
         const dialog = new Dialog({
             title: tableName + " Gathering Roll",
             content: "choose a discipline to use while searching the area",
             buttons: {
                 Bioecology: {
                     label: "Bioecology",
                     callback: async () => {
                         resolve(
                         {
                             roll: rollEcology('bioecology'),
                             tableFormula: "none"
                         })
                     }
                 },
                 Herbology: {
                     label: "Herbology",
                     callback: async () => {
                         resolve(
                             {
                                 roll: rollEcology('herbology'),
                                 tableFormula: "2d3+6"
                             })
                     }
                 },
                 Heteroptology: {
                     label: "Heteroptology",
                     callback: async () => {
                         resolve(
                             {
                                 roll: rollEcology('heteroptology'),
                                 tableFormula: "2d3"
                             })
                     }
                 },
                 Mineralogy: {
                     label: "Mineralogy",
                     callback: async () => {
                         resolve(
                             {
                                 roll: rollEcology('mineralogy'),
                                 tableFormula: "2d3+12"
                             })
                     }
                 },
                 Mycology: {
                     label: "Mycology",
                     callback: async () => {
                         resolve(
                             {
                                 roll: rollEcology('mycology'),
                                 tableFormula: "2d3+9"
                             })
                     }
                 },
                 Spermology: {
                     label: "Spermology",
                     callback: async () => {
                         resolve(
                             {
                                 roll: rollEcology('spermology'),
                                 tableFormula: "2d3+3"
                             })
                     }
                 }
             },
             close: () => {
                 reject()
             }
         });

         dialog.render(true);
     });
     
     return Response;
}

export async function onGatherRollRequest(tableName) {
    const Response = await onPushGatherDialog(tableName);
    if (Response.tableFormula !== "none") {
        const table = game.tables.getName(tableName);
        await Response.roll.roll({async: true});
        const draws = await table.drawMany(Response.roll.total / 5, {roll: new Roll(Response.tableFormula), recursive: true, displayChat: false});
        await table.toMessage(draws.results, {roll: Response.roll});
    }
    else
    {
        await Response.roll.toMessage();
    }
}

export async function onSocketMessageReceived(packet) {
     console.log(packet);
     switch (packet.type) {
         case "gather":
             await onGatherRollRequest(packet.tableName);
     }
}

function rollEcology(discipline) {
     switch (discipline){
         case 'bioecology':
             return new Roll('2d10 + @Disciplines.Ecology.Bio.value', game.user.character.getRollData());
         case 'herbology':
             return new Roll('2d10 + @Disciplines.Ecology.Hrb.value', game.user.character.getRollData());
         case 'heteroptology':
             return new Roll('2d10 + @Disciplines.Ecology.Het.value', game.user.character.getRollData());
         case 'mineralogy':
             return new Roll('2d10 + @Disciplines.Ecology.Min.value', game.user.character.getRollData());
         case 'mycology':
             return new Roll('2d10 + @Disciplines.Ecology.Myc.value', game.user.character.getRollData());
         case 'spermology':
             return new Roll('2d10 + @Disciplines.Ecology.Spm.value', game.user.character.getRollData());
     }
     
     return 'Invalid';
}