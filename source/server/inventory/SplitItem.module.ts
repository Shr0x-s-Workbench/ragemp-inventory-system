import { inventoryAssets } from "./Items.module";
import { v4 as uuidv4 } from "uuid";

export const splitInventoryItem = (player: PlayerMp, data: string) => {
    try {
        if (!mp.players.exists(player) || !player.inventory) return;
        let {
            item,
            source,
            target
        }: {
            item: RageShared.Interfaces.Inventory.IInventoryItem;
            source: { component: inventoryAssets.INVENTORY_CATEGORIES; slot: number };
            target: { component: inventoryAssets.INVENTORY_CATEGORIES; slot: number; count: number };
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
