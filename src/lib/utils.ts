/**
 * Converts a string into a deterministic hex color code.
 * @param str - Input string (e.g., "JD", "user123", "my-project")
 * @returns A hex color string like "#a1b2c3" or "#000000" for empty input.
 */
export const stringToHexColor = (str: string): string => {
    if (str.length === 0) {
        return "#000000";
    }

    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i);
        hash |= 0;
    }

    const colorValue = (hash >>> 0) % 0x1000000;

    const hex = colorValue.toString(16).padStart(6, "0");
    return `#${hex}`;
}