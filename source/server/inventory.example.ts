/**
 * THIS IS AN EXAMPLE SCRIPT
 * Contain inventory events that are being triggered from CEF
 */

import { inventorydataPresset } from "./inventory/Assets.module";
import { Inventory } from "./inventory";
const onPlayerJoin = async (player: PlayerMp) => {
    try {
        //@ts-ignore
        player.inventory = new Inventory(player, inventorydataPresset.clothes, inventorydataPresset.pockets, inventorydataPresset.quickUse);

        //Required stuff
        player.cdata = {};
        player.giveWeaponEx = function (this: PlayerMp, weapon: number, totalAmmo: number, ammoInClip?: number) {
            this.call("client::weapon:giveWeapon", [weapon, totalAmmo, ammoInClip]);
        };
    } catch (err) {
        console.error(err);
    }
};

mp.events.add("playerJoin", onPlayerJoin);
//-------------------------------------------------------//
mp.events.add("server::inventory:onMoveItem", async (player: PlayerMp, data: any) => {
    if (!mp.players.exists(player) || !player.inventory) return;
    await player.inventory.moveItem(player, data);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:onUseITem", (player: PlayerMp, data: any) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.useItem(player, data);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:quickUse", (player: PlayerMp, event: any) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.manageFastSlots(player, event);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:onSplitItem", (player: PlayerMp, data: any) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.splitStack(player, data);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:onDropItem", (player: PlayerMp, itemData: any) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.dropItem(player, itemData);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:deleteItem", (player: PlayerMp, itemData: any) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.deleteItem(itemData);
});
//-------------------------------------------------------//
mp.events.add("server::player:loadInventory", (player: PlayerMp) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.setInventory(player);
});
//-------------------------------------------------------//
mp.events.add("server::inventory:onGiveItemAway", (player) => player.call("client::inventory:deletePedScreen"));
//-------------------------------------------------------//
mp.events.add("server::inventory:confirmItemDrop", (player) => player.call("client::inventory:deletePedScreen"));
//-------------------------------------------------------//
mp.events.add("server::inventory:openItem", (player: PlayerMp, data: any) => {
    if (!mp.players.exists(player)) return;
    if (player.inventory) player.inventory.openItem(player, data);
});
