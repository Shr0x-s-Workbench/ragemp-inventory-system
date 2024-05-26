const { ItemObject } = require("./ItemObject.class");
const { inventoryAssets } = require("./Items.module");

/**
 * Drops an inventory item from the player's inventory.
 *
 * @param {PlayerMp} player - The player dropping the item.
 * @param {string} itemData - The data of the item to drop.
 */
const dropInventoryItem = async (player, itemData) => {
    try {
        if (!player.inventory) return;

        const { item, source } = JSON.parse(itemData);

        if (!item) return;

        if (player.vehicle) {
            player.outputChatBox("You cannot drop an item while in a vehicle.");
            return;
        }

        const playerItem = player.inventory.getItemByUUID(item.hash);
        if (!playerItem) {
            player.inventory.setInventory(player);
            return;
        }

        if (source.component === "clothes" && item.type === RageShared.Enums.ITEM_TYPES.ITEM_TYPE_ARMOUR && item.isPlaced) {
            player.armour = 0;
        }

        const options = item.options || inventoryAssets.items[item.type].options;

        const itemInQuickUse = player.inventory.isItemInQuickUse(source.component, parseInt(source.slot));

        if (itemInQuickUse !== -1) {
            player.inventory.quickUse[itemInQuickUse] = null;

            if (player.fastSlotActive === itemInQuickUse) {
                player.removeAllWeapons();
                player.setVariable("ammoHash", null);
                player.setVariable("itemAsAmmo", null);
                player.fastSlotActive = null;
            }
        }

        if (player.inventory.isAmmoItem(item)) {
            let ammoHash = player.getVariable("ammoHash");
            if (ammoHash?.items.includes(item.hash)) {
                ammoHash.items.splice(ammoHash.items.indexOf(item.hash), 1);
                player.setWeaponAmmo(player.weapon, player.weaponAmmo - item.count);
                player.setVariable("ammoHash", ammoHash);
                player.setVariable("itemAsAmmo", ammoHash.items.length ? ammoHash.items[0] : null);
            }
        }

        const { x, y, z } = player.position;

        new ItemObject({
            hash: item.hash,
            key: item.key,
            type: "item",
            model: item.modelHash || "prop_food_bag1",
            coords: new mp.Vector3(x, y, z - 1),
            rotation: player.inventory.isWeapon(item) ? new mp.Vector3(-90, 0, 0) : new mp.Vector3(0, 0, 0),
            collision: false,
            itemType: item.type,
            name: item.name,
            image: item.image?.replace(".svg", "") || inventoryAssets.items[item.type].image.replace(".svg", ""),
            range: 10,
            count: item.count,
            assets: { ...item, isPlaced: false, options }
        });

        if (source.component !== "clothes") {
            player.inventory.resetItemData(source.component, parseInt(source.slot));
        } else {
            player.inventory.resetClothingItemData(parseInt(source.slot));
            player.inventory.reloadClothes(player);
        }

        player.inventory.setInventory(player);
    } catch (err) {
        console.log("dropInventoryItem error: ", err);
    }
};

module.exports = { dropInventoryItem }