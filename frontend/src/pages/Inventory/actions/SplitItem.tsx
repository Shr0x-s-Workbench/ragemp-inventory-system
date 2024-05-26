import { useCallback } from "react";
import InventoryStore, { IBaseItem } from "store/Inventory.store";
import { CenterComponent, ICurrentItem } from "../Interfaces";
import EventManager from "utils/EventManager.util";
import { values } from "mobx";

export const OnPlayerSplitItem = (
    currentItem: ICurrentItem,
    store: InventoryStore,
    viewingBackpack: string | null,
    setItem: (item: ICurrentItem) => void,
    setMiddleComponent: (comp: CenterComponent) => void
) => {
    return useCallback(
        (splitItem: IBaseItem, value: number) => {
            if (currentItem.id === null || currentItem.component === null) return;

            if (value <= 0) return setMiddleComponent("dropZone");

            //if player is trying to split an item from backpack
            if (currentItem.component === "backpack") {
                if (!viewingBackpack) return setMiddleComponent("dropZone");
                let findFreeSlot = -1;
                const backpackData = store.backpackData[viewingBackpack];

                const linkedBackpackData = Object.values(store.inventory.pockets).find((x) => x && x.hash === viewingBackpack);
                if (!linkedBackpackData) return setMiddleComponent("dropZone");

                const itemData = store.backpackData[viewingBackpack][currentItem.id];
                if (!itemData) return setMiddleComponent("dropZone");
                const backpackQualityList: { [key: number]: number } = { 0: 12, 1: 24 };

                const backpackQuality = backpackQualityList[linkedBackpackData.quality];

                for (let i = 0; i < backpackQuality; i++) {
                    if (backpackData[i] === null) {
                        findFreeSlot = i;
                        break;
                    }
                }

                if (findFreeSlot === -1) {
                    return setMiddleComponent("dropZone");
                }
                if (itemData.count <= 1) return setMiddleComponent("dropZone");

                itemData.count -= value;

                store.changeInventoryData({ component: currentItem.component, id: findFreeSlot }, { ...itemData, count: value }, true, viewingBackpack);
                setItem({ component: "backpack", id: findFreeSlot, options: itemData.options });

                //BACKEND TODO: Making sure the newly created item has a new hash key (better generate there then here)
                EventManager.emitServer("inventory", "onSplitItem", {
                    item: itemData,
                    source: { component: "backpack", slot: `${currentItem.id}` },
                    target: { component: "backpack", count: value, slot: `${findFreeSlot}`, linkedbackpack: viewingBackpack }
                });
            } else {
                let item = { ...splitItem, options: [...splitItem.options] };
                let component;
                let pocketsFreeIndex = values(store.inventory.pockets).findIndex((el) => !el);

                let backpackFreeIndex = -1;
                let backpackQuality: { [key: number]: number } = { 0: 12, 1: 24 };
                //checking if backpack is placed to clothes
                if (store.clothes[7]?.isPlaced) {
                    const itemData = store.clothes[7];
                    const backpackData = store.backpackData[itemData.hash];
                    if (backpackData) {
                        const quality = backpackQuality[itemData.quality];
                        for (let i = 0; i < quality; i++) {
                            if (backpackData[i] === null) {
                                backpackFreeIndex = i;
                                break;
                            }
                        }
                    }
                }

                if (pocketsFreeIndex >= 0) {
                    component = "pockets";
                } else if (store.clothes[7]?.isPlaced && backpackFreeIndex >= 0) {
                    component = "backpack";
                } else {
                    return;
                }

                if (currentItem.component === "quickUse") {
                    const quickUseData = store.quickUse[currentItem.id];
                    if (!quickUseData) return;
                    const [fastSlotComponent, fastSlotLinkedID] = [quickUseData.component, quickUseData.id];
                    if (!fastSlotComponent || fastSlotLinkedID === null) return;

                    const itemData = store.inventory[fastSlotComponent][fastSlotLinkedID];
                    if (!itemData) return;
                    itemData.count -= value;
                } else {
                    const itemData = store.inventory[currentItem.component][currentItem.id];
                    if (!itemData) return;
                    itemData.count -= value;
                }

                store.changeInventoryData(
                    { component, id: component === "pockets" ? pocketsFreeIndex : backpackFreeIndex },
                    { ...item, count: value },
                    true,
                    component === "backpack" ? store.clothes[7]?.hash : null
                );

                setItem({ component, id: component === "pockets" ? pocketsFreeIndex : backpackFreeIndex, options: item.options });

                EventManager.emitServer("inventory", "onSplitItem", {
                    item: item,
                    source: { component: currentItem.component, slot: `${currentItem.id}` },
                    target: {
                        component: component,
                        count: value,
                        slot: `${component === "pockets" ? pocketsFreeIndex : backpackFreeIndex}`,
                        linkedbackpack: component === "backpack" ? store.clothes[7]?.hash : null
                    }
                });
            }
        },
        [currentItem.component, currentItem.id, setItem, setMiddleComponent, store, viewingBackpack]
    );
};
