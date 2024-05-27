
/**
 * Events
 */

mp.events.add("client::inventory:setVisible", async (enable) => {
    enable ? await Inventory.open() : Inventory.close();
});

mp.events.add("client::weapon:giveWeapon", async (weapon, totalAmmo, ammoInClip) => {
    await Inventory.giveWeapon(weapon, totalAmmo, ammoInClip).catch((err) => mp.console.logError("An error occurred giving weapon to player " + mp.players.local.name));
});

mp.events.add("render", () => {
    /**
     * Weapon related actions
     */
    //Disables weapon wheel selection
    mp.game.controls.disableControlAction(2, 37, true);
    mp.game.controls.disableControlAction(32, 157, true); // INPUT_SELECT_WEAPON_UNARMED
    mp.game.controls.disableControlAction(32, 158, true); // INPUT_SELECT_WEAPON_MELEE
    mp.game.controls.disableControlAction(32, 159, true); // INPUT_SELECT_WEAPON_HANDGUN
    mp.game.controls.disableControlAction(32, 160, true); // INPUT_SELECT_WEAPON_SHOTGUN
    mp.game.controls.disableControlAction(32, 161, true); // INPUT_SELECT_WEAPON_SMG
    mp.game.controls.disableControlAction(32, 162, true); // INPUT_SELECT_WEAPON_AUTO_RIFLE
    mp.game.controls.disableControlAction(32, 163, true); // INPUT_SELECT_WEAPON_SNIPER
    mp.game.controls.disableControlAction(32, 164, true); // INPUT_SELECT_WEAPON_HEAVY
    mp.game.controls.disableControlAction(32, 165, true); // INPUT_SELECT_WEAPON_SPECIAL
    //Hides current player's weapon HUD data (like ammo)
    mp.game.hud.hideHudComponentThisFrame(2);
    mp.game.hud.hideHudComponentThisFrame(20);

    //------------------------------------------------------//
});

//------------------------------------------------------//
mp.events.addProc("client::proc:getWeaponTypeGroup", (weaponhash) => {
    let weapongroup = mp.game.weapon.getWeapontypeGroup(weaponhash);
    return weapongroup;
});

//------------------------------------------------------//
mp.events.addProc("client::proc:getAmmoInClip", (weaponhash) => {
    return mp.players.local.getAmmoInClip(weaponhash);
});
//------------------------------------------------------//

mp.events.add("client::inventory:streamInObject", () => {

    mp.objects.forEach((object) => {
        if (object && object.getVariable("is_item")) {
            object.notifyStreaming = true;
            if (object.getVariable("item_type") != "weapon") {
                mp.game.invoke("0x58A850EAEE20FAA3", object.handle); //placeongroundproperly
                mp.game.invoke("0x1A9205C1B9EE827F", object.handle, false, false);
            }
            let objtype = object.getVariable("item_type");

            if (objtype && objtype === "weapon") {
                object.setRotation(90, 0, 0, 2, false);
            }
            object.setNoCollision(mp.players.local.handle, false);
            object.setInvincible(true);
            object.freezePosition(true);
        }
    });
});