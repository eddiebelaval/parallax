/**
 * Maps emotional temperature (0.0-1.0) to the factory color scale.
 *
 * | Range     | Color   | Meaning              |
 * |-----------|---------|----------------------|
 * | 0.0-0.1   | #eeeeee | Neutral / balanced   |
 * | 0.2-0.4   | #4ecdc4 | Cool / calming down  |
 * | 0.5-0.7   | #f59e0b | Warm / moderate      |
 * | 0.8-1.0   | #ef4444 | Hot / high charge    |
 */
export function getTemperatureColor(temperature: number): string {
  if (temperature <= 0.1) return "#eeeeee";
  if (temperature <= 0.4) return "#4ecdc4";
  if (temperature <= 0.7) return "#f59e0b";
  return "#ef4444";
}

export function getTemperatureLabel(temperature: number): string {
  if (temperature <= 0.1) return "neutral";
  if (temperature <= 0.4) return "cool";
  if (temperature <= 0.7) return "warm";
  return "hot";
}
