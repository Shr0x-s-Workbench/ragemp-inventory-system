/**
 * Class responsible for managing the player's inventory.
 */
class _PlayerInventory {
    private readonly url: string = "http://package2/build/index.html";
    inventoryUI: BrowserMp;
    currentPage: string | undefined;

    screenPedHandle: Handle;

    isOpen: boolean = false;
    onTick: NodeJS.Timeout | null = null;

    constructor() {
        this.screenPedHandle = 0;
        this.inventoryUI = mp.browsers.new(this.url);

        // temporary keybinds (subject to change)
        // Bind keys for inventory actions
        mp.keys.bind(27, false, this.close.bind(this)); // ESC to close inventory

        mp.keys.bind(49, false, () => this.toggleFastSlot(1)); // Key '1'
        mp.keys.bind(50, false, () => this.toggleFastSlot(2)); // Key '2'
        mp.keys.bind(51, false, () => this.toggleFastSlot(3)); // Key '3'
        mp.keys.bind(52, false, () => this.toggleFastSlot(4)); // Key '4'
        mp.keys.bind(53, false, () => this.toggleFastSlot(5)); // Key '5'
        mp.keys.bind(54, false, () => this.toggleFastSlot(6)); // Key '6'

        mp.keys.bind(73, false, this.open.bind(this)); // Key 'I' to open inventory

        // Event bindings
        mp.events.add("client::mainMenu:openInventory", this.open.bind(this));
        mp.events.add("server::mainMenu:closeInventory", this.close.bind(this));
        mp.events.add("client:inventory:updatePedComponent", this.setPedComponentVariation.bind(this));
        mp.events.add("client:inventory:updatePedProp", this.setPedProps.bind(this));
        mp.events.add("client::inventory:deletePedScreen", this.deletePedScreen.bind(this));
        mp.events.add("playerQuit", this.playerQuit.bind(this));

        mp.events.add("client::eventManager::emitServer", this.emitServer.bind(this));
        mp.events.add("client::eventManager::emitClient", this.emitClient.bind(this));
        mp.events.add("client::eventManager", this.processEvent.bind(this));
    }

    tryParse(obj: any): any {
        try {
            return JSON.parse(obj);
        } catch (_err) {
            return obj;
        }
    }

    /**
     * Updates nearby players.
     */
    public updateNearbyPlayers() {}

    /**
     * Checks players around the player.
     *
     * @param bool - Whether to check players around or not.
     */
    public checkPlayersAround(bool: boolean) {}

    /**
     * Creates a ped screen.
     */
    public async createPedScreen() {
        try {
            mp.game.ui.setPauseMenuActive(false);
            mp.game.ui.setFrontendActive(false);
            mp.game.ui.activateFrontendMenu(mp.game.gameplay.getHashKey("FE_MENU_VERSION_EMPTY_NO_BACKGROUND"), false, -1);

            let playerPed = mp.peds.new(
                mp.players.local.model,
                new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z - 10),
                0,
                mp.players.local.dimension
            );

            setInterval(() => {
                mp.game.invoke("0x2162C446DFDF38FD", true);
            }, 0);

            while (playerPed.handle === 0) {
                await mp.game.waitAsync(15);
            }

            playerPed.setInvincible(true);
            playerPed.setCollision(false, false);
            mp.players.local.cloneToTarget(playerPed.handle);
            mp.game.entity.setVisible(playerPed.handle, false, false);
            this.screenPedHandle = playerPed.handle;

            mp.game.ped.setCapsule(this.screenPedHandle, 0.001);
            mp.game.wait(100);
            mp.game.hud.givePedToPauseMenu(this.screenPedHandle, 1);
            mp.game.hud.setPauseMenuPedLighting(true);
            mp.game.hud.setPauseMenuPedSleepState(true);

            mp.game.hud.replaceColourWithRgba(117, 0, 0, 0, 0);
            mp.game.invoke("0x98215325A695E78A", false);

            mp.console.logWarning(`${mp.peds.at(playerPed.handle).isDead}`);
        } catch (e: unknown) {
            if (e instanceof TypeError) mp.console.logWarning(`${JSON.stringify(e.message)}`);
        }
    }

    /**
     * Deletes the ped screen.
     */
    public deletePedScreen() {
        mp.game.invoke("0xF314CF4F0211894E", 117, 0, 0, 0, 186); // REPLACE_HUD_COLOUR_WITH_RGBA
        mp.game.hud.clearPedInPauseMenu();
        mp.game.ui.setPauseMenuActive(false);
        mp.game.ui.setFrontendActive(false);
        mp.game.invoke("0x98215325A695E78A", true);

        let findPed = mp.peds.atHandle(this.screenPedHandle);
        if (findPed && mp.peds.exists(findPed)) {
            findPed.destroy();
        }

        this.screenPedHandle = 0;
    }

    /**
     * Sets ped properties.
     *
     * @param propid - The property ID.
     * @param drawableid - The drawable ID.
     * @param textureid - The texture ID.
     */
    public setPedProps(propid: number, drawableid: number, textureid: number) {
        try {
            if (this.screenPedHandle === null) return;
            mp.game.invoke("0x93376B65A266EB5F", this.screenPedHandle, propid, drawableid, textureid, true);
        } catch (e: unknown) {
            if (e instanceof TypeError) mp.console.logWarning(`setPedProps || ${JSON.stringify(e.message)}`);
        }
    }

    /**
     * Sets ped component variation.
     *
     * @param componentId - The component ID.
     * @param drawableId - The drawable ID.
     * @param textureId - The texture ID.
     * @param paletteId - The palette ID.
     */
    public setPedComponentVariation(componentId: number, drawableId: number, textureId: number, paletteId: number) {
        try {
            if (this.screenPedHandle === null) return;
            mp.game.invoke("0x262B14F48D29DE80", this.screenPedHandle, componentId, drawableId, textureId, paletteId);
        } catch (e: unknown) {
            if (e instanceof TypeError) mp.console.logWarning(`setPedComponentVariation || ${JSON.stringify(e.message)}`);
        }
    }

    /**
     * Toggles the fast slot.
     *
     * @param slotNumber - The slot number to toggle.
     */
    toggleFastSlot(slotNumber: number) {
        if (mp.game.ui.isPauseMenuActive()) return;
        if (mp.game.ped.getVehicleIsEntering(mp.players.local.handle)) return;
        mp.events.callRemote("server::inventory:quickUse", `k_fastslot${slotNumber}`);
    }

    /**
     * Opens the inventory.
     */
    public async open() {
        try {
            this.isOpen = !this.isOpen;
            await this.createPedScreen();

            this.inventoryUI.active = true;
            this.processEvent("cef::inventory:setVisible", true);
            mp.events.callRemote("server::player:loadInventory");
            this.checkPlayersAround(true);
        } catch (e: unknown) {
            if (e instanceof TypeError) mp.console.logWarning(`OpenInventory:: >> ${e.message}`);
        }
    }

    /**
     * Closes the inventory.
     */
    public close() {
        if (!this.isOpen) return;
        this.isOpen = !this.isOpen;

        this.processEvent("cef::inventory:setVisible", false);
        this.deletePedScreen();
        mp.game.graphics.transitionFromBlurred(1);
        mp.events.callRemote("server:inventory:close");
        this.checkPlayersAround(false);
        return;
    }

    /**
     * Gives a weapon to the player.
     *
     * @param weapon - The weapon ID.
     * @param totalAmmo - The total amount of ammo.
     * @param ammoInClip - The amount of ammo in the clip (optional).
     */
    public async giveWeapon(weapon: number, totalAmmo: number, ammoInClip?: number) {
        if (ammoInClip) {
            mp.players.local.giveWeapon(weapon, totalAmmo, true);
            mp.game.invoke("0xBF0FD6E56C964FCB", mp.players.local.handle, weapon, totalAmmo, false, true);
            mp.game.weapon.setPedAmmo(mp.players.local.handle, mp.players.local.weapon, totalAmmo, false);
            mp.game.weapon.setPedAmmo(mp.players.local.handle, mp.players.local.weapon, totalAmmo, false);
            mp.players.local.setAmmoInClip(mp.players.local.weapon, ammoInClip);
        } else {
            mp.players.local.giveWeapon(weapon, totalAmmo, true);
        }
    }

    /**
     * Reloads the player's weapons.
     */
    public reloadWeapons() {}

    /**
     * Handles player quit event.
     *
     * @param player - The player who quit.
     */
    public playerQuit(player: PlayerMp) {
        if (player === mp.players.local) this.deletePedScreen();
    }

    /**
     * Emits an event to the server with the given data.
     * @param {any} receivedData - The data to send to the server.
     */
    emitServer(receivedData: any): void {
        let data = this.tryParse(receivedData);
        let { event, args } = data;
        Array.isArray(args) ? (args.length === 1 ? mp.events.callRemote(event, JSON.stringify(args[0])) : mp.events.callRemote(event, JSON.stringify(args))) : mp.events.callRemote(event, args);
    }

    /**
     * Emits an event to the client with the given data.
     * @param {any} receivedData - The data to send to the client.
     */
    emitClient(receivedData: any): void {
        let data = this.tryParse(receivedData);
        let { event, args } = data;
        if (Array.isArray(args)) {
            mp.events.call(event, ...args);
        } else {
            mp.events.call(event, args);
        }
    }

    /**
     * Processes an event by name and forwards arguments to the browser UI.
     * @param {string} eventName - The name of the event to process.
     * @param {...any} args - The arguments to pass to the event handler.
     */
    processEvent(eventName: string, ...args: any): void {
        if (!eventName || !this.inventoryUI) return;
        if (this.inventoryUI && eventName.indexOf("cef::") != -1) {
            let event = eventName.split("cef::")[1];
            const argsString = args.map((arg: any) => JSON.stringify(arg)).join(", ");
            const script = `
                window.callHandler("${event}", ${argsString})
            `;
            this.inventoryUI.execute(script);
        } else return mp.console.logWarning("Error calling event: " + eventName + " it does not exists.");
    }
}
export const Inventory = new _PlayerInventory();

mp.events.add("client::inventory:setVisible", async (enable) => {
    enable ? await Inventory.open() : Inventory.close();
});

mp.events.add("client::weapon:giveWeapon", async (weapon: number, totalAmmo: number, ammoInClip?: number) => {
    await Inventory.giveWeapon(weapon, totalAmmo, ammoInClip).catch((err) => mp.console.logError("An error occurred giving weapon to player " + mp.players.local.name));
});

mp.events.add("render", () => {
    /**
     * Weapon related actions
     */
    //Disables weapon wheel selection
    mp.game.controls.disableControlAction(2, 37, true);
    mp.game.controls.disableControlAction(32, 157, true); // INPUT_SELECT_WEAPON_UNARMED
    mp.game.controls.disableControlAction(32, 158, true); // INPUT_SELECT_WEAPON_MELEE
    mp.game.controls.disableControlAction(32, 159, true); // INPUT_SELECT_WEAPON_HANDGUN
    mp.game.controls.disableControlAction(32, 160, true); // INPUT_SELECT_WEAPON_SHOTGUN
    mp.game.controls.disableControlAction(32, 161, true); // INPUT_SELECT_WEAPON_SMG
    mp.game.controls.disableControlAction(32, 162, true); // INPUT_SELECT_WEAPON_AUTO_RIFLE
    mp.game.controls.disableControlAction(32, 163, true); // INPUT_SELECT_WEAPON_SNIPER
    mp.game.controls.disableControlAction(32, 164, true); // INPUT_SELECT_WEAPON_HEAVY
    mp.game.controls.disableControlAction(32, 165, true); // INPUT_SELECT_WEAPON_SPECIAL
    //Hides current player's weapon HUD data (like ammo)
    mp.game.hud.hideHudComponentThisFrame(2);
    mp.game.hud.hideHudComponentThisFrame(20);

    //------------------------------------------------------//
});

//------------------------------------------------------//
mp.events.addProc("client::proc:getWeaponTypeGroup", (weaponhash: Hash) => {
    let weapongroup = mp.game.weapon.getWeapontypeGroup(weaponhash);
    return weapongroup;
});

//------------------------------------------------------//
mp.events.addProc("client::proc:getAmmoInClip", (weaponhash: Hash) => {
    return mp.players.local.getAmmoInClip(weaponhash);
});
//------------------------------------------------------//
