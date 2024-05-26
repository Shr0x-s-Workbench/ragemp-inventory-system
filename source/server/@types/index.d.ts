import { Inventory } from "../inventory";

declare global {
    interface PlayerMp {
        this: PlayerMp;
        inventory: Inventory | null;
        fastSlotActive: number | null;
        cdata: any;
        giveWeaponEx: (this: PlayerMp, weapon: number, totalAmmo: number, ammoInClip?: number | undefined) => void;
    }
}
export {};
