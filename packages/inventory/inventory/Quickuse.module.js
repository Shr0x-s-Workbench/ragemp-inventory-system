const { weaponHash } = require("./Weapons.assets");
const { inventoryAssets } = require("./Items.module");

async function giveWeaponByType(player, item, weaponGroup, itemType) {
    if (!mp.players.exists(player) || !player.inventory) return;

    if (item.type === null) return;
    const fullAmmo = await player.inventory.getAllCountByItemType(player.inventory.items, itemType);

    if (fullAmmo && fullAmmo.items.length) {
        const ammoCount = fullAmmo.count;
        player.giveWeaponEx(mp.joaat(item.type), ammoCount, item.ammoInClip);
        player.setVariable("ammoHash", fullAmmo);
        player.setVariable("itemAsAmmo", fullAmmo.items[0]);
    } else {
        player.giveWeaponEx(mp.joaat(item.type), 0);
        player.setVariable("ammoHash", null);
        player.setVariable("itemAsAmmo", null);
    }
}

const manageInventoryFastSlot = async (player, event) => {
    try {
        if (!mp.players.exists(player) || !player.inventory) return;
        if (event.indexOf("k_fastslot") === -1) return;
        const key = parseInt(event[event.length - 1]);
        const fastslot = player.inventory.quickUse[key - 1];
        if (!fastslot) return null;

        const item = player.inventory.items[fastslot.component][fastslot.id];
        if (!item) return;

        if (player.inventory.isWeapon(item) && item.type) {
            if (player.cdata.quckUseDelay === true) return;

            if (player.weapon !== mp.joaat(item.type)) {
                player.removeAllWeapons();
                const weaponGroup = await player.callProc("client::proc:getWeaponTypeGroup", [mp.joaat(item.type)]);
                player.fastSlotActive = key - 1;

                if (weaponGroup) {
                    switch (weaponGroup) {
                        case RageShared.Enums.WEAPON_GROUP.UNKNOWN: {
                            player.giveWeaponEx(mp.joaat(item.type), 0);
                            return;
                        }
                        case RageShared.Enums.WEAPON_GROUP.HANDGUNS: {
                            await giveWeaponByType(player, item, weaponGroup, inventoryAssets.AMMO_TYPES.TYPE_PISTOL);
                            break;
                        }
                        case RageShared.Enums.WEAPON_GROUP.SUBMACHINE: {
                            await giveWeaponByType(player, item, weaponGroup, inventoryAssets.AMMO_TYPES.TYPE_SMG);
                            break;
                        }
                        case RageShared.Enums.WEAPON_GROUP.SHOTGUN: {
                            await giveWeaponByType(player, item, weaponGroup, inventoryAssets.AMMO_TYPES.TYPE_GUAGE);
                            break;
                        }
                        case RageShared.Enums.WEAPON_GROUP.ASSAULTRIFLE: {
                            await giveWeaponByType(player, item, weaponGroup, inventoryAssets.AMMO_TYPES.TYPE_RIFLE);
                            break;
                        }
                        case RageShared.Enums.WEAPON_GROUP.LIGHTMACHINE: {
                            await giveWeaponByType(player, item, weaponGroup, inventoryAssets.AMMO_TYPES.TYPE_LMG);
                            break;
                        }
                        case RageShared.Enums.WEAPON_GROUP.SNIPER: {
                            await giveWeaponByType(player, item, weaponGroup, inventoryAssets.AMMO_TYPES.TYPE_SNIPER);
                            break;
                        }
                        default:
                            return;
                    }
                }

                player.setVariable("ammoType", inventoryAssets.items[item.type].ammoType || "pistol");
                player.cdata.quckUseDelay = true;

                player.cdata.qucikSlotTimeout = setTimeout(() => {
                    if (!mp.players.exists(player)) return;
                    player.cdata.quckUseDelay = false;
                    clearTimeout(player.cdata.qucikSlotTimeout);
                }, 3000);
            } else {
                const currentAmmoInClip = await player.callProc("client::proc:getAmmoInClip", [player.weapon]);
                if (currentAmmoInClip >= 0) {
                    item.ammoInClip = currentAmmoInClip;
                    console.log(`Ammo in clip for ${player.name} is ${currentAmmoInClip} || ${item.ammoInClip}`);
                }
                // player.removeAllWeaponComponents(item.type);
                player.removeAllWeapons();
                player.setVariable("ammoHash", null);
                player.fastSlotActive = null;
                player.giveWeapon(weaponHash["unarmed"], 0);
            }
            return;
        }

        player.inventory.useItem(player, JSON.stringify({ item: item, source: { component: fastslot.component, slot: fastslot.id } }));
    } catch (err) {
        console.log("manageInventoryFastSlot err: ", err);
    }
};
module.exports = { manageInventoryFastSlot }