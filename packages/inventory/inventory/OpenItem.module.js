const openInventoryItem = (player, data) => {
    try {
        let { item } = JSON.parse(data);
        if (!item) return;
        switch (item.type) {

            default:
                return;
        }
    } catch (err) {
        console.log("openInventoryItem err: ", err);
    }
};
module.exports = { openInventoryItem }