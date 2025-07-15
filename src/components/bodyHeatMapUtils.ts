
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

// Enhanced muscle name mapping for detailed anatomy
const muscleNameMap: Record<string, string> = {
  // Chest
  'pectoralis_major': 'Pectoralis Major',
  'pectoralis_minor': 'Pectoralis Minor',
  
  // Shoulders
  'anterior_deltoid': 'Anterior Deltoid',
  'medial_deltoid': 'Medial Deltoid', 
  'posterior_deltoid': 'Posterior Deltoid',
  'anterior_deltoid_right': 'Anterior Deltoid (R)',
  'medial_deltoid_right': 'Medial Deltoid (R)',
  'posterior_deltoid_right': 'Posterior Deltoid (R)',
  
  // Arms
  'biceps_left': 'Biceps (L)',
  'biceps_right': 'Biceps (R)',
  'triceps_left': 'Triceps (L)',
  'triceps_right': 'Triceps (R)',
  'brachialis_left': 'Brachialis (L)',
  'brachialis_right': 'Brachialis (R)',
  
  // Forearms
  'forearm_flexors_left': 'Forearm Flexors (L)',
  'forearm_flexors_right': 'Forearm Flexors (R)',
  'forearm_extensors_left': 'Forearm Extensors (L)',
  'forearm_extensors_right': 'Forearm Extensors (R)',
  
  // Core
  'rectus_abdominis': 'Rectus Abdominis',
  'external_obliques': 'External Obliques (L)',
  'external_obliques_right': 'External Obliques (R)',
  'serratus_anterior': 'Serratus Anterior (L)',
  'serratus_anterior_right': 'Serratus Anterior (R)',
  
  // Back
  'latissimus_dorsi': 'Latissimus Dorsi (L)',
  'latissimus_dorsi_right': 'Latissimus Dorsi (R)',
  'rhomboids': 'Rhomboids',
  'middle_trapezius': 'Middle Trapezius',
  'lower_trapezius': 'Lower Trapezius',
  'trapezius_upper': 'Upper Trapezius',
  
  // Neck
  'sternocleidomastoid': 'Sternocleidomastoid',
  
  // Legs
  'quadriceps_left': 'Quadriceps (L)',
  'quadriceps_right': 'Quadriceps (R)',
  'hamstrings_left': 'Hamstrings (L)',
  'hamstrings_right': 'Hamstrings (R)',
  'glutes_left': 'Glutes (L)',
  'glutes_right': 'Glutes (R)',
  'hip_flexors_left': 'Hip Flexors (L)',
  'hip_flexors_right': 'Hip Flexors (R)',
  'hip_abductors_left': 'Hip Abductors (L)',
  'hip_abductors_right': 'Hip Abductors (R)',
  'adductors_left': 'Adductors (L)',
  'adductors_right': 'Adductors (R)',
  'it_band_left': 'IT Band (L)',
  'it_band_right': 'IT Band (R)',
  
  // Calves
  'gastrocnemius_left': 'Gastrocnemius (L)',
  'gastrocnemius_right': 'Gastrocnemius (R)',
  'soleus_left': 'Soleus (L)',
  'soleus_right': 'Soleus (R)',
  'tibialis_anterior_left': 'Tibialis Anterior (L)',
  'tibialis_anterior_right': 'Tibialis Anterior (R)',
};

export const prettyName = (muscle: string) => {
  const normalized = normalizeId(muscle);
  return muscleNameMap[normalized] || muscle.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Helper to normalize id. SVGs may have id="rectus-femoris"; DB uses "rectus_femoris" */
export function normalizeId(id: string) {
  return id.replace(/-/g, "_").toLowerCase();
}
