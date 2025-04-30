// Function to generate a color based on family member name
export function generateColorFromName(name: string) {
    // Simple hash function to generate a number from a string
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert the hash to a hue value (0-360)
    const hue = Math.abs(hash) % 360;

    // Use a pastel color with fixed saturation and lightness
    return `hsl(${hue}, 70%, 80%)`;
}
