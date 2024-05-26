/**
 * A function to handle inventory item usage.
 *
 * @param player the player consuming the item
 * @param data item data such as from where item is coming from and which slot
 * @returns void
 */
export const useInventoryItem = async (player: PlayerMp, data: string): Promise<void> => {
    try {
        if (!mp.players.exists(player) || !player.inventory) return;
        const { item, source }: { item: RageShared.Interfaces.Inventory.IInventoryItem; source: { component: string; slot: number } } = JSON.parse(data);

        switch (item.type) {
            default:
                return;
        }
    } catch (err) {
        console.log("useInventoryItem err: ", err);
    }
};
