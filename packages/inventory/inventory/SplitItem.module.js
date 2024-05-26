const { v4 } = require("uuid");
const uuid = v4;

const splitInventoryItem = (player, data) => {
    try {
        if (!mp.players.exists(player) || !player.inventory) return;
        let {
            item,
            source,
            target
        } = JSON.parse(data);
        if (item.type === null) return;

        player.inventory.items[source.component][source.slot] = { ...item, type: item.type, count: item.count - target.count };
        player.inventory.items[target.component][target.slot] = { ...item, type: item.type, count: target.count, hash: uuidv4() };

        if (player.inventory.isAmmoItem(item)) {
            player.inventory.reloadWeaponAmmo(player, item.type);
        }
        player.inventory.setInventory(player);
    } catch (err) {
        console.log("splitInventoryItem err: ", err);
    }
};
module.exports = { splitInventoryItem }