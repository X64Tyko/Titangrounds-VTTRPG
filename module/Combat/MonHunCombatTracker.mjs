export class MonHunCombatTracker extends CombatTracker {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/monhunsys/templates/chat/combat-tracker.html"
        });
    }
    
    // overriding so we can add isNPC to the turn data for the tracker.
    async getData(options ={}) {
        let context = await super.getData(options);

        // Get the combat encounters possible for the viewed Scene
        const combat = this.viewed;
        const hasCombat = combat !== null;
        const combats = this.combats;
        const currentIdx = combats.findIndex(c => c === combat);
        const previousId = currentIdx > 0 ? combats[currentIdx-1].id : null;
        const nextId = currentIdx < combats.length - 1 ? combats[currentIdx+1].id : null;
        const settings = game.settings.get("core", Combat.CONFIG_SETTING);

        // Prepare rendering data
        context = foundry.utils.mergeObject(context, {
            combats: combats,
            currentIndex: currentIdx + 1,
            combatCount: combats.length,
            hasCombat: hasCombat,
            combat,
            turns: [],
            previousId,
            nextId,
            started: this.started,
            control: false,
            settings,
            linked: combat?.scene !== null,
            labels: {}
        });
        context.labels.scope = game.i18n.localize(`COMBAT.${context.linked ? "Linked" : "Unlinked"}`);
        if ( !hasCombat ) return context;

        // Format information about each combatant in the encounter
        let hasDecimals = false;
        const turns = [];
        for ( let [i, combatant] of combat.turns.entries() ) {
            if ( !combatant.visible ) continue;

            // Prepare turn data
            const resource = combatant.permission >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER ? combatant.resource : null;
            const turn = {
                id: combatant.id,
                name: combatant.name,
                img: await this._getCombatantThumbnail(combatant),
                active: i === combat.turn,
                owner: combatant.isOwner,
                npc: combatant.isNPC,
                defeated: combatant.isDefeated,
                hidden: combatant.hidden,
                initiative: combatant.initiative,
                hasRolled: combatant.initiative !== null,
                hasResource: resource !== null,
                resource: resource,
                canPing: (combatant.sceneId === canvas.scene?.id) && game.user.hasPermission("PING_CANVAS")
            };
            if ( (turn.initiative !== null) && !Number.isInteger(turn.initiative) ) hasDecimals = true;
            turn.css = [
                turn.active ? "active" : "",
                turn.hidden ? "hidden" : "",
                turn.defeated ? "defeated" : ""
            ].join(" ").trim();

            // Actor and Token status effects
            turn.effects = new Set();
            if ( combatant.token ) {
                combatant.token.effects.forEach(e => turn.effects.add(e));
                if ( combatant.token.overlayEffect ) turn.effects.add(combatant.token.overlayEffect);
            }
            if ( combatant.actor ) {
                for ( const e of combatant.actor.temporaryEffects ) {
                    if ( e.getFlag("core", "statusId") === CONFIG.specialStatusEffects.DEFEATED ) turn.defeated = true;
                    else if ( e.icon ) turn.effects.add(e.icon);
                }
            }
            turns.push(turn);
        }

        // Format initiative numeric precision
        const precision = CONFIG.Combat.initiative.decimals;
        turns.forEach(t => {
            if ( t.initiative !== null ) t.initiative = t.initiative.toFixed(hasDecimals ? precision : 0);
        });

        // Merge update data for rendering
        return foundry.utils.mergeObject(context, {
            round: combat.round,
            turn: combat.turn,
            turns: turns,
            control: combat.combatant?.players?.includes(game.user)
        });
    }
}