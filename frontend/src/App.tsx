import { FC, Suspense, lazy, useEffect } from "react";
import { observer, useLocalObservable } from "mobx-react-lite";
import InventoryStore, { IBaseItem } from "store/Inventory.store";
import EventManager from "utils/EventManager.util";

const Inventory = lazy(() => import("pages/Inventory/Inventory"));

const App: FC = () => {
    const inventoryStore = useLocalObservable(() => new InventoryStore());

    useEffect(() => {
        EventManager.addHandler("inventory", "setVisible", (enable: boolean) => inventoryStore.setVisible(enable));
        EventManager.addHandler("inventory", "setClothes", (obj: { [key: number]: IBaseItem }) => inventoryStore.fetchClothesData(obj));
        EventManager.addHandler("inventory", "setClothesItem", (id: number, data: IBaseItem) => inventoryStore.setClothesData(id, data));

        EventManager.addHandler("inventory", "setInventory", (obj: { [key: string]: { [key: number]: IBaseItem | null } }) => inventoryStore.fetchInventoryData(obj));
        EventManager.addHandler("inventory", "setQuickUseItems", (obj: { [key: number]: { component: string; id: number } | null }) => inventoryStore.fetchQuickUseItems(obj));
        EventManager.addHandler("inventory", "setInventoryItem", (component: string, slot: number, obj: IBaseItem | null) => inventoryStore.fetchInventoryItem(component, slot, obj));

        EventManager.addHandler("inventory", "setBackpackData", (backpack: string, data: { [key: number]: IBaseItem | null }) => inventoryStore.fetchBackpackData(backpack, data));
        EventManager.addHandler("inventory", "setDroppedItems", (items: any) => inventoryStore.fetchGroundItems(items));

        EventManager.addHandler("inventory", "setPlayersAround", (array: any) => inventoryStore.fetchPlayersAround(array));
        EventManager.addHandler("inventory", "setMaxWeight", (weight: number) => inventoryStore.setInventoryMaxWeight(weight));

        return () => EventManager.removeTargetHandlers("inventory");
    }, [inventoryStore]);

    return (
        <div className="app">
            <Suspense>{inventoryStore.isVisible && <Inventory store={inventoryStore} />}</Suspense>
        </div>
    );
};
export default observer(App);
