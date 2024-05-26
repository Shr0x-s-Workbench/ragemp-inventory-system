/**
 * THIS IS AN EXAMPLE SCRIPT
 * Contain inventory events that are being triggered from CEF
 */

const { inventorydataPresset } = require("./inventory/Assets.module");
const { Inventory } = require("./inventory");
const onPlayerJoin = async (player) => {
    try {
        player.inventory = new Inventory(player, inventorydataPresset.clothes, inventorydataPresset.pockets, inventorydataPresset.quickUse);
        player.cdata = {};
        player.giveWeaponEx = function (weapon, totalAmmo, ammoInClip) {
            this.call("client::weapon:giveWeapon", [weapon, totalAmmo, ammoInClip]);
        };
    } catch (err) {
        console.error(err);
    }
};

mp.events.add("playerJoin", onPlayerJoin);
//-------------------------------------------------------//
mp.events.add("server::inventory:onMoveItem", async (player, data) => {
    if (!mp.players.exists(player) || !player.inventory) return;
    await player.inventory.moveItem(player, data);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:onUseITem", (player, data) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.useItem(player, data);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:quickUse", (player, event) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.manageFastSlots(player, event);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:onSplitItem", (player, data) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.splitStack(player, data);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:onDropItem", (player, itemData) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.dropItem(player, itemData);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:deleteItem", (player, itemData) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.deleteItem(itemData);
});
//-------------------------------------------------------//
mp.events.add("server::player:loadInventory", (player) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.setInventory(player);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:onGiveItemAway", (player) => player.call("client::inventory:deletePedScreen"));
//-------------------------------------------------------//
mp.events.add("server::inventory:confirmItemDrop", (player) => player.call("client::inventory:deletePedScreen"));
//-------------------------------------------------------//
mp.events.add("server::inventory:openItem", (player, data) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.openItem(player, data);
});
