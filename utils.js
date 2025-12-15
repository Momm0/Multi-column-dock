/**
 * Utility functions for Multi-Column Dock
 */

/**
 * Parse a hex color string to RGB values
 * @param {string} hex - Hex color string like '#1e1e1e'
 * @returns {{r: number, g: number, b: number}} RGB values
 */
export function parseHexColor(hex) {
    let r = 30, g = 30, b = 30;
    if (hex && hex.match(/^#[0-9a-fA-F]{6}$/)) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
}
