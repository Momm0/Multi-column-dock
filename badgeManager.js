/**
 * Badge Manager for Multi-Column Dock
 * Handles Unity Launcher API badge notifications
 */

import Gio from 'gi://Gio';

// Unity Launcher API DBus interface for notification badges
const LauncherEntryIface = `
<node>
  <interface name="com.canonical.Unity.LauncherEntry">
    <signal name="Update">
      <arg type="s" name="app_uri"/>
      <arg type="a{sv}" name="properties"/>
    </signal>
  </interface>
</node>`;

/**
 * BadgeManager - Listens to Unity Launcher Entry signals for notification badges
 */
export class BadgeManager {
    constructor() {
        this._badges = new Map(); // appId -> { count: number, urgent: boolean }
        this._listeners = new Set();
        this._dbusConnection = null;
        this._signalId = 0;
        
        this._initDBus();
    }

    _initDBus() {
        try {
            this._dbusConnection = Gio.bus_get_sync(Gio.BusType.SESSION, null);
            
            // Listen for Unity LauncherEntry Update signals
            this._signalId = this._dbusConnection.signal_subscribe(
                null, // sender
                'com.canonical.Unity.LauncherEntry',
                'Update',
                null, // object path
                null, // arg0
                Gio.DBusSignalFlags.NONE,
                this._onUpdate.bind(this)
            );
        } catch (e) {
            log(`[Multi-Column Dock] Failed to init DBus for badges: ${e.message}`);
        }
    }

    _onUpdate(connection, sender, objectPath, interfaceName, signalName, parameters) {
        try {
            let [appUri, props] = parameters.deep_unpack();
            
            // appUri is like "application://org.telegram.desktop.desktop"
            // Convert to app ID: "org.telegram.desktop.desktop"
            let appId = appUri.replace('application://', '');
            
            let count = 0;
            let countVisible = false;
            let urgent = false;
            
            if (props['count']) {
                count = props['count'].deep_unpack();
            }
            if (props['count-visible']) {
                countVisible = props['count-visible'].deep_unpack();
            }
            if (props['urgent']) {
                urgent = props['urgent'].deep_unpack();
            }
            
            if (countVisible && count > 0) {
                this._badges.set(appId, { count, urgent });
            } else {
                this._badges.delete(appId);
            }
            
            // Notify listeners
            this._notifyListeners(appId);
        } catch (e) {
            log(`[Multi-Column Dock] Error parsing badge update: ${e.message}`);
        }
    }

    /**
     * Get badge info for an app
     * @param {string} appId - The application ID
     * @returns {{count: number, urgent: boolean}|null} Badge info or null
     */
    getBadge(appId) {
        return this._badges.get(appId) || null;
    }

    /**
     * Add a listener for badge updates
     * @param {Function} callback - Callback function(appId)
     */
    addListener(callback) {
        this._listeners.add(callback);
    }

    /**
     * Remove a badge update listener
     * @param {Function} callback - The callback to remove
     */
    removeListener(callback) {
        this._listeners.delete(callback);
    }

    _notifyListeners(appId) {
        for (let callback of this._listeners) {
            try {
                callback(appId);
            } catch (e) {
                log(`[Multi-Column Dock] Badge listener error: ${e.message}`);
            }
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this._dbusConnection && this._signalId) {
            this._dbusConnection.signal_unsubscribe(this._signalId);
            this._signalId = 0;
        }
        this._badges.clear();
        this._listeners.clear();
    }
}
