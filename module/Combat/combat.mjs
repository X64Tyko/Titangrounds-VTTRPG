import { TITANGROUND } from "../helpers/config.mjs";
/**
 * Extend the base Combat document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Combat}
 */
export class MonHunCombat extends Combat {
    TurnHistory = [];
    
    _sortCombatants(a, b) {
        const clockA = Number.isNumeric(a.initiative) ? a.initiative : -9999;
        const clockB = Number.isNumeric(b.initiative) ? b.initiative : -9999;
        
        if (a.actor.type == 'character' && b.actor.type == "npc") {
            return -1;
        }
        else if (a.actor.type == 'npc' && b.actor.type == 'character')
            return 1;
        
        //let clockDifference = clockA - clockB;
        //if (clockDifference != 0)
        //    return clockDifference;
        
        return a.tokenId - b.tokenId;
    }
    
    async _pushHistory(data) {
        return this.TurnHistory.push(data);
    }
    
    async _popHistory() {
        return this.TurnHistory.pop();
    }
    
    async setClock(combatant, clock) {
        this._pushHistory({
            id: combatant._id,
            initiative: combatant.initiative,
            clock: clock,
        });
        
        const updates = [];
        updates.push({
            _id: combatant._id,
            initiative: combatant.initiative,
            
        });

        await this.updateEmbeddedDocuments('Combatant', updates);
    }
    
    async startCombat() {
        await this.setupTurns();
        return super.startCombat();
    }
    
    updateCombatantClock(combatant, updates) {
        let newInit = Math.max(combatant.token.actor.system.clock, 0);
        
        updates.push({
            _id: combatant._id,
            initiative: newInit
        });
        
        let update = { [`system.clock`]: newInit };
        combatant.actor.update(update);
    }
    
    async nextRound() {        
        await this._pushHistory(this.combatants.map(c => {
            return {
                id: c._id,
                initiative: c.initiative
            }
        }));
        
        await this._pushHistory("newRound");
        
        let newRoundNum = this.round + 1;
        
        const updates = [];
        let newInit = 0;
        
        //this.combatants.forEach(c => this.updateCombatantClock(c, updates));
        
        let message = "<p><b>Round " + newRoundNum + " Start</b> <br>+1 Stamina";
        
        if (newRoundNum % 10 === 0) {
            message = message.concat("<br> -1 Stamina Mod");
        }
        
        message = message.concat("</p>");
        
        await this.updateEmbeddedDocuments('Combatant', updates);
        ChatMessage.create({ user: game.user, content: message }, { roundmarker: true });
        Dialog.prompt({
            title: "New Round",
            content: message,
            label: "Ok, I did it, go away."
        });
        return super.nextRound();
    }
    
    async previousRound() {
        const round = Math.max(this.round - 1, 0);
        
        if (round > 0) {
            //let turnHistory = this.TurnHistory.slice();
            let data = this.TurnHistory.pop();
            console.log("prev Round");

            let roundState;

            if (Array.isArray(data)) {
                roundState = data;
            } else {
                let index = this.TurnHistory.lastIndexOf("newRound");
                let SpliceData = this.TurnHistory.splice(index);
                roundState = this.TurnHistory.pop();
            }

            console.log("roundState: ");
            const updates = [];
            for (let c of roundState) {
                if (c !== "newRound") {
                updates.push({
                    _id: c.id,
                    initiative: c.initiative
                })};
            }

            await this.updateEmbeddedDocuments('Combatant', updates);
            return this.update({round: round, turn: 0});
        }
    }
    
    async nextTurn() {
        //let combatant = this.combatant;
        //if (combatant.initiative > 0)
        //    return this.nextRound();

        await this._pushHistory({
                id: this.combatant._id,
                initiative: this.combatant.initiative
        });

        const updates = [];

        this.updateCombatantClock(this.combatant, updates);
        await this.updateEmbeddedDocuments('Combatant', updates);
        
        return super.nextTurn();
    }
    
    async previousTurn() {
        let data = await this._popHistory();
        console.log("prev turn: ");
        
        if (data == null || data === "newRound") {
            return this.previousRound();
        }
        
        const updates = [];
        updates.push({
            _id: data.id,
            initiative: data.initiative
        });

        await this.updateEmbeddedDocuments('Combatant', updates);
        return this.update({ turn: 0 });
    }
}