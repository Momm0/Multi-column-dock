import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TwoColumnDockPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'Dock Appearance',
            description: 'Configure the look and feel of the dock.'
        });
        page.add(group);

        // Columns
        const columnsRow = new Adw.ActionRow({ title: 'Number of Columns' });
        const columnsSpin = Gtk.SpinButton.new_with_range(1, 5, 1);
        settings.bind('columns', columnsSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        columnsRow.add_suffix(columnsSpin);
        group.add(columnsRow);

        // Icon Size
        const sizeRow = new Adw.ActionRow({ title: 'Icon Size (px)' });
        const sizeSpin = Gtk.SpinButton.new_with_range(16, 128, 4);
        settings.bind('icon-size', sizeSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        sizeRow.add_suffix(sizeSpin);
        group.add(sizeRow);

        // Appearance Group
        const appearanceGroup = new Adw.PreferencesGroup({
            title: 'Visual Style',
            description: 'Customize colors and shapes.'
        });
        page.add(appearanceGroup);

        // Background Color (clickable color picker)
        const colorRow = new Adw.ActionRow({ title: 'Background Color' });
        let colorButton;
        try {
            const dialog = new Gtk.ColorDialog();
            colorButton = new Gtk.ColorDialogButton({ dialog });
        } catch (e) {
            colorButton = new Gtk.ColorButton();
        }

        // Initialize color
        const initialHex = settings.get_string('background-color');
        const rgba = new Gdk.RGBA();
        rgba.parse(initialHex);
        if (colorButton.set_rgba) {
            colorButton.set_rgba(rgba);
        } else {
            colorButton.rgba = rgba;
        }

        // Sync changes back to settings
        colorButton.connect('notify::rgba', () => {
            const c = colorButton.rgba;
            const hex = '#' +
                Math.round(c.red * 255).toString(16).padStart(2, '0') +
                Math.round(c.green * 255).toString(16).padStart(2, '0') +
                Math.round(c.blue * 255).toString(16).padStart(2, '0');
            settings.set_string('background-color', hex);
        });

        colorRow.add_suffix(colorButton);
        appearanceGroup.add(colorRow);

        // Opacity
        const opacityRow = new Adw.ActionRow({ title: 'Opacity (0.0 - 1.0)' });
        const opacitySpin = Gtk.SpinButton.new_with_range(0.0, 1.0, 0.05);
        settings.bind('background-opacity', opacitySpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        opacityRow.add_suffix(opacitySpin);
        appearanceGroup.add(opacityRow);

        // Corner Radius
        const radiusRow = new Adw.ActionRow({ title: 'Corner Radius' });
        const radiusSpin = Gtk.SpinButton.new_with_range(0, 50, 1);
        settings.bind('corner-radius', radiusSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        radiusRow.add_suffix(radiusSpin);
        appearanceGroup.add(radiusRow);

        // Multi-monitor
        const monitorGroup = new Adw.PreferencesGroup({
            title: 'Multi-Monitor',
        });
        page.add(monitorGroup);

        const monitorRow = new Adw.SwitchRow({ title: 'Show on all monitors' });
        settings.bind('show-on-all-monitors', monitorRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        monitorGroup.add(monitorRow);

        window.add(page);
    }
}
