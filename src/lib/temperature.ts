/**
 * Maps emotional temperature (0.0-1.0) to the Ember color scale.
 *
 * | Range     | Color   | Meaning              |
 * |-----------|---------|----------------------|
 * | 0.0-0.1   | #ebe1d4 | Neutral / balanced   |
 * | 0.2-0.4   | #6aab8e | Cool / calming down  |
 * | 0.5-0.7   | #d4a040 | Warm / moderate      |
 * | 0.8-1.0   | #c45c3c | Hot / high charge    |
 */
export function getTemperatureColor(temperature: number): string {
  if (temperature <= 0.1) return "var(--temp-neutral)";
  if (temperature <= 0.4) return "var(--temp-cool)";
  if (temperature <= 0.7) return "var(--temp-warm)";
  return "var(--temp-hot)";
}

export function getTemperatureLabel(temperature: number): string {
  if (temperature <= 0.1) return "neutral";
  if (temperature <= 0.4) return "cool";
  if (temperature <= 0.7) return "warm";
  return "hot";
}

/** Returns the CSS class for backlit glow based on temperature */
export function getBacklitClass(temperature: number, strong = false): string {
  const label = getTemperatureLabel(temperature);
  if (label === "neutral") return "";
  return strong ? `backlit backlit-${label}-strong` : `backlit backlit-${label}`;
}

/** Returns the CSS class for ambient glow background */
export function getAmbientClass(temperature: number): string {
  const label = getTemperatureLabel(temperature);
  if (label === "neutral") return "";
  return `ambient-glow ambient-${label}`;
}
