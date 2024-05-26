import { useCallback } from "react";
import { ICurrentItem } from "../Interfaces";
import InventoryStore from "store/Inventory.store";
import EventManager from "utils/EventManager.util";
import { values } from "mobx";

export const OnPlayerTakeItemOff = (setItem: (item: ICurrentItem) => void, currentItem: ICurrentItem, store: InventoryStore) => {
    return useCallback(() => {
        if (currentItem.id === null) return;

        const clothesData = store.clothes[currentItem.id];
        if (!clothesData) return;
        let component;
        let id;
        const item = { ...clothesData };

        const pocketsFreeIndex = values(store.inventory.pockets).findIndex((el) => !el);

        if (item.type === "backpack" && values(store.inventory.backpack).findIndex((el) => el !== null) >= 0) {
            return;
        }

        if (item.weight + store.currentWeight <= store.maxInventoryWeight) {
            if (pocketsFreeIndex >= 0) {
                store.changeInventoryData({ component: "pockets", id: pocketsFreeIndex }, { ...item }, true);
                id = pocketsFreeIndex;
                component = "pockets";
            } else if (store.clothes[7] && store.clothes[7].isPlaced) {
                const backpackFreeIndex = values(store.inventory.backpack).findIndex((el) => !el);
                if (item.type === "backpack") return;
                store.changeInventoryData({ component: "backpack", id: backpackFreeIndex }, { ...item }, true);
                id = backpackFreeIndex;
                component = "backpack";
            } else return;
        } else return;

        setItem({ component, id, options: item.options ?? null });
        store.changeInventoryData(currentItem, null, true);

        EventManager.emitServer("inventory", "onMoveItem", {
            item: item,
            source: { component: currentItem.component, slot: `${currentItem.id}` },
            target: { component: component, slot: `${id}`, item: null }
        });
    }, [currentItem, setItem, store]);
};
