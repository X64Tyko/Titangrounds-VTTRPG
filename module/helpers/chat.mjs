export async function addChatListeners(message, html) {

    await renderDamageButtons(message, html);
    
    if (game.user.isGM) {
        await renderPurchaseButtons(message, html);
    }
}
async function applyDamage(event) {
    const element = event.currentTarget;
    var attackCard = $(event.currentTarget).parents('.attack-roll-card');
    
    console.log(attackCard);
    const dataset = attackCard[0].dataset;
    const damageData = JSON.parse(dataset.damageData);
    const damageMod = element.dataset.damageMod;
    
    const tokens = canvas.tokens.controlled;
    
    if (tokens.length <= 0)
        return;
    
    const firstToken = tokens[0];
    const tokenActor = firstToken.actor;
    
    if (tokenActor.type === "character") {
        const totalDamage = (damageData.rawDamage * damageMod) - tokenActor.system.resistances[damageData.damageType].value;
        const newHealth = Math.max(tokenActor.system.health.value - totalDamage, 0);
        tokenActor.update({"system.health.value": newHealth});
    }
    else if (tokenActor.type === "npc")
    {
        const partKeys = Object.keys(tokenActor.system.parts).sort();
        const Buttons = {};
        let part = "Part0";
        partKeys.forEach( partKey => {
            Buttons[partKey] = {
                label: tokenActor.system.parts[partKey].name,
                callback: async () => part = partKey
            }
        });
        
        const updates = {};

        new Dialog({
            title: "Damage Location",
            content:'<div><label for=\"quantity\">Additional Raw Dmg </label><input id=\"rawAdd\" name=\"rawAdd\" type=\"number\" value="0" min=\"0\" data-dtype="Number"><label for=\"quantity\">Additional Ele Dmg </label><input id=\"eleAdd\" name=\"eleAdd\" type=\"number\" value="0" min=\"0\" data-dtype="Number"></div>',
            buttons: Buttons,
            close: html => {

                var rawAdd = html.find("input#rawAdd").val();
                var eleAdd = html.find("input#eleAdd").val();
                
                
                const chosenPart = foundry.utils.deepClone(tokenActor.system.parts[part]);
                const rawResist = chosenPart.resistances[damageData.damageType];
                const eleResist = (chosenPart.resistances.hasOwnProperty(damageData.elementType) ? chosenPart.resistances[damageData.elementType] : 1);
                const rawDamage = Math.round(((damageData.rawDamage + Number(rawAdd)) * damageMod) * rawResist * 0.1);
                const eleDamage = Math.round(((damageData.eleDamage + Number(eleAdd)) * damageMod) * eleResist);

                const styleColor = (eleResist > 3 || rawResist > 4) ? "color:red;" : "color:black;";

                chosenPart.staggerDamage += rawDamage + eleDamage;
                if (chosenPart.breakDamageType === "Any" || chosenPart.breakDamageType === damageData.damageType)
                    chosenPart.breakDamage += rawDamage;
                if (chosenPart.breakDamageType === damageData.elementType)
                    chosenPart.breakDamage += eleDamage;
                
                if (chosenPart.staggerDamage >= chosenPart.staggerLimit) {
                    chosenPart.staggerDamage = 0;
                    chosenPart.staggerNum++;
                    ui.notifications.info(`Staggered ${chosenPart.name}`);
                }
                
                if (chosenPart.breakDamage >= chosenPart.breakLimit && chosenPart.breakNum === 0) {
                    chosenPart.breakDamage = 0;
                    chosenPart.breakNum = 1;
                    ui.notifications.info(`Broke ${chosenPart.name}`);
                }
                
                if (tokenActor.system.statusData.hasOwnProperty(damageData.elementType.toLowerCase()))
                {
                    const status = foundry.utils.deepClone(tokenActor.system.statusData[damageData.elementType.toLowerCase()]);
                    status.value += eleDamage;
                    const statusID = "system.statusData." + damageData.elementType.toLowerCase();
                    
                    if (status.value >= status.currentLimit)
                    {
                        status.num++;
                        status.value = 0;
                        status.currentLimit = (50 * status.initialRes) + (50 * status.nextRes * Math.min(status.num, status.maxRes));
                        status.roundsRemaining = (status.effectivity + 1) * 2;
                        ui.notifications.info(`Status ${damageData.elementType} Applied`);
                    }
                    updates[statusID] = status;
                }
                
                const accessor = "system.parts." + part;
                const attacker = "system.damageLog." + damageData.user.name;
                updates["system.health.value"] = tokenActor.system.health.value - (rawDamage + eleDamage);
                updates[accessor] = chosenPart;
                
                if (!tokenActor.system.hasOwnProperty("damageLog"))
                    tokenActor.system.damageLog = {};
                
                if (!tokenActor.system.damageLog.hasOwnProperty(damageData.user.name))
                    tokenActor.system.damageLog[damageData.user.name] = {
                        "values": [],
                        "total": 0,
                    };

                const damageLog = foundry.utils.deepClone(tokenActor.system.damageLog[damageData.user.name]);
                damageLog.values.push(rawDamage + eleDamage);
                updates[attacker] = damageLog;
                
                tokenActor.update(updates);
                
                ChatMessage.create({
                    user: game.user._id,
                    speaker: ChatMessage.getSpeaker({token: firstToken}),
                    content: '<h2 style="'+styleColor+'">'+ (rawDamage + eleDamage) + '</h2>'
                });
            }
        }).render(true);
    }
}

async function renderDamageButtons(message, html) {
    let damageButtons = await renderTemplate(`systems/monhunsys/templates/chat/AttackRollButtons.html`, {});
    let elements = [];
    if (game.user.isGM)
        elements = html.find('.attack-roll-card').toArray();
    else
        elements = html.find('.titan-attack').toArray();

    elements.forEach(element => {
        element = $(element);
        element.append($(damageButtons));
    });

    html.find('.apply-damage').click(async ev => {
        applyDamage(ev)
    });
}

async function renderPurchaseButtons(message, html) {
    let purcahseButtons = await renderTemplate(`systems/monhunsys/templates/chat/PurchaseRequestButtons.html`, {});
    const elements = html.find('.purchase-request-card').toArray();

    elements.forEach(element => {
        element = $(element);
        element.append($(purcahseButtons));
    });

    html.find('.accept-purchase').click(async ev => {
        handlePurchase(message, ev)
    });
    html.find('.deny-purchase').click(async ev => {
        handlePurchase(message, ev)
    });
}

async function handlePurchase (message, event) {

    const element = $(event.currentTarget).parents('.purchase-request-card');
    if (element.length > 1) {
        ui.notifications.error(`Purchase has multiple requests associated.`);
        return;
    }
    else if (element.length < 1) {
        ui.notification.error('Purchase data not found on card');
        return;
    }
    const dataset = element[0].dataset;
    const purchaseData = JSON.parse(dataset.purchaseData);
    
    message.delete();
}