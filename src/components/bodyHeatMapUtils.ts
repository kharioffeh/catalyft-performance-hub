
/**
 * Utilities for muscle heatmap components.
 */

// Original color scale for ACWR values - keeping for backward compatibility
export const colorScale = (acwr: number) => {
  if (acwr <= 0.8) return "#22c55e";
  if (acwr <= 1.3) return "#fec15f";
  return "#ef4444";
};

// New function to generate HSL color classes based on load (0-100)
// Green (120deg) at 0% load to Red (0deg) at 100% load
export const getLoadColorClass = (load: number): string => {
  // Clamp load between 0 and 100
  const clampedLoad = Math.max(0, Math.min(100, load));
  
  // Calculate hue: 120 (green) to 0 (red)
  const hue = 120 - (clampedLoad * 120) / 100;
  
  // Use high saturation and moderate lightness for better visibility
  const saturation = 70;
  const lightness = 50;
  
  return `fill-[hsl(${Math.round(hue)},${saturation}%,${lightness}%)]`;
};

// Function to get direct HSL color value (for inline styles)
export const getLoadColor = (load: number): string => {
  const clampedLoad = Math.max(0, Math.min(100, load));
  const hue = 120 - (clampedLoad * 120) / 100;
  const saturation = 70;
  const lightness = 50;
  
  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
};

export const prettyName = (muscle: string) =>
  muscle.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Helper to normalize id. SVGs may have id="rectus-femoris"; DB uses "rectus_femoris" */
export function normalizeId(id: string) {
  return id.replace(/-/g, "_").toLowerCase();
}
