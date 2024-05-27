class ItemObject {
    static List = {};


    constructor(data) {
        this.image = data.image;
        this.hash = data.hash;
        this.dimension = data.dimension || 0;
        this.type = data.type;
        this.key = data.key;

        this.model = data.model;
        this.coords = data.coords;
        this.rotation = data.rotation;
        this.collision = data.collision;
        this.name = data.name;
        this.range = data.range;
        this.count = data.count;
        this.itemType = data.itemType;
        this.assets = data.assets;
        if (this.coords) {
            this.object = mp.objects.new(mp.joaat(this.model), this.coords, {
                rotation: new mp.Vector3(data.rotation.x, data.rotation.y, data.rotation.z)
            });
        }
        this.update();

        this.timeout = setTimeout(() => {
            if (ItemObject.List[this.hash]) {
                this.remove();
            }
        }, 300000);

        ItemObject.List[this.hash] = this;
    }
    async update() {
        this.object.setVariables({
            is_item: true,
            hash: this.hash,
            image: this.image,
            item_type: this.itemType
        });
        /*
         * Enable object stream-in 
         */
        mp.players.forEachInRange(this.object.position, mp.config["stream-distance"], (player) => {
            player.call("client::inventory:streamInObject");
        });
    }
    remove() {
        if (this.object && mp.objects.exists(this.object)) {
            this.object.destroy();
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        delete ItemObject.List[this.hash];
    }

    static fetchInRange(player, range = 1) {
        return Object.values(ItemObject.List)
            .filter((x) => player.dist(x.coords) <= range)
            .map((x) => x.assets);
    }

    static getItem(hash) {
        return Object.values(ItemObject.List).find((x) => x.assets?.hash === hash)?.assets ?? null;
    }
    static deleteDroppedItemByHash(hash) {
        const item = Object.values(ItemObject.List).find((x) => x.assets?.hash === hash) ?? null;
        if (item) item.remove();
    }
}
module.exports = { ItemObject }