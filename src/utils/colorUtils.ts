// Function to generate a color based on family member name
export function generateColorFromName(name: string) {
    if (!name) return `hsl(0, 70%, 80%)`; // Default color for empty names

    // Normalize the name: trim whitespace and convert to lowercase
    const normalizedName = name.trim().toLowerCase();
    if (normalizedName.length === 0) return `hsl(0, 70%, 80%)`;

    // Use a more sophisticated hash function for better distribution
    let hash = 0;
    for (let i = 0; i < normalizedName.length; i++) {
        // Use prime numbers to improve distribution
        hash = normalizedName.charCodeAt(i) + ((hash << 5) - hash) * 31;
    }

    // Create a more unique fingerprint by using the first and last characters
    if (normalizedName.length > 1) {
        const firstChar = normalizedName.charCodeAt(0);
        const lastChar = normalizedName.charCodeAt(normalizedName.length - 1);
        hash = hash ^ (firstChar * lastChar);
    }

    // Use vowel count to further differentiate similar names
    // Include Swedish vowels å, ä, ö
    const vowelCount = (normalizedName.match(/[aeiouyåäö]/gi) || []).length;

    // Count special Swedish characters for additional differentiation
    const specialCharsCount = (normalizedName.match(/[åäö]/gi) || []).length;

    // Use the hash to determine base hue (0-360)
    // Multiply by prime numbers and add vowel count to improve distribution
    let hue = ((Math.abs(hash) * 17) + (vowelCount * 13) + (specialCharsCount * 29)) % 360;

    // Vary saturation based on name length (65-85%)
    const saturation = 65 + (normalizedName.length % 5) * 5;

    // Vary lightness based on first character (65-85%)
    const firstCharCode = normalizedName.charCodeAt(0);
    const lightness = 65 + (firstCharCode % 5) * 5;

    // For names starting with the same letter, adjust the hue significantly
    // This helps with names like "Stefan" and "Sven" that might otherwise get similar colors
    const initialLetter = normalizedName.charAt(0);
    const hueAdjustment = initialLetter.charCodeAt(0) % 30; // 0-29 degree adjustment

    // Calculate final hue with adjustment
    const finalHue = (hue + hueAdjustment) % 360;

    // For common Swedish names that might still clash, apply specific adjustments
    // This ensures that problematic pairs like "Stefan" and "Ingemar" get distinct colors
    const commonSwedishNames: Record<string, number> = {
        'stefan': 200,  // Force towards blue-cyan (was green)
        'ingemar': 240, // Force towards blue
        'sven': 330,    // Force towards pink (was yellow)
        'lars': 300,    // Force towards purple
        'anders': 30,   // Force towards orange
        'johan': 210,   // Force towards blue-purple (was cyan)
        'erik': 0,      // Force towards red
        'karl': 270,    // Force towards magenta
        'patrik': 160   // Force towards teal (distinct from blue)
    };

    // If the name is in our common names list, bias the hue strongly towards the specified value
    if (commonSwedishNames[normalizedName]) {
        // Mix the calculated hue with the predefined hue (70% predefined, 30% calculated)
        hue = (commonSwedishNames[normalizedName] * 0.7) + (finalHue * 0.3);
    } else {
        hue = finalHue;
    }

    // Avoid green-ish colors (60-140 degrees) which are used for the user's own bookings
    // This function shifts any hue in the green range to a different range
    const avoidGreenHue = (h: number): number => {
        // If the hue is in the green range (60-140), shift it
        if (h >= 60 && h <= 140) {
            // Shift to the blue range (180-260)
            return 180 + (h - 60) * (80 / 80);
        }
        return h;
    };

    // Apply the green avoidance function to the final hue
    hue = avoidGreenHue(hue);

    // Ensure better color separation by quantizing the hue to specific ranges
    // This helps prevent similar names from getting too-similar colors
    if (!commonSwedishNames[normalizedName]) {
        // Divide the color wheel into 12 distinct segments (30 degrees each)
        // and snap the hue to the center of the nearest segment
        const segment = Math.floor(hue / 30);
        hue = segment * 30 + 15;
    }

    // Return the HSL color
    return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}

// For testing purposes - uncomment to see color values for specific names
/*
console.log("Stefan color:", generateColorFromName("Stefan"));
console.log("Ingemar color:", generateColorFromName("Ingemar"));
console.log("Patrik color:", generateColorFromName("Patrik"));
console.log("Sven color:", generateColorFromName("Sven"));
console.log("Sara color:", generateColorFromName("Sara"));
console.log("Lars color:", generateColorFromName("Lars"));
console.log("Anders color:", generateColorFromName("Anders"));
// Test some additional names to verify green avoidance
console.log("Green test (hue 120):", generateColorFromName("GreenTest"));
console.log("Yellow-green test (hue 90):", generateColorFromName("YellowGreenTest"));
console.log("Yellow test (hue 60):", generateColorFromName("YellowTest"));
// Test similar names to verify color separation
console.log("Anna color:", generateColorFromName("Anna"));
console.log("Anne color:", generateColorFromName("Anne"));
*/
