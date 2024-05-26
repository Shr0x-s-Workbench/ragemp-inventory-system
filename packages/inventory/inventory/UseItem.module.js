/**
 * A function to handle inventory item usage.
 *
 * @param player the player consuming the item
 * @param data item data such as from where item is coming from and which slot
 * @returns void
 */
const useInventoryItem = async (player, data) => {
    try {
        if (!mp.players.exists(player) || !player.inventory) return;
        const { item, source } = JSON.parse(data);

        switch (item.type) {
            default:
                return;
        }
    } catch (err) {
        console.log("useInventoryItem err: ", err);
    }
};
module.exports = { useInventoryItem }