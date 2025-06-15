
/**
 * Utilities for muscle heatmap components.
 */

// Zones: Low (green), Normal (yellow), High (red)
export const colorScale = (acwr: number) => {
  if (acwr <= 0.8) return "#22c55e";
  if (acwr <= 1.3) return "#fec15f";
  return "#ef4444";
};

export const prettyName = (muscle: string) =>
  muscle.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Helper to normalize id. SVGs may have id="rectus-femoris"; DB uses "rectus_femoris" */
export function normalizeId(id: string) {
  return id.replace(/-/g, "_").toLowerCase();
}
