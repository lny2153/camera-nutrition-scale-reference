const GRAMS_PER_OUNCE = 28.349523125;
const OUNCES_PER_POUND = 16;

function roundToIncrement(value: number, increment: number) {
  return Math.round((value + Number.EPSILON) / increment) * increment;
}

export function formatOunces(grams: number) {
  const ounces = Math.max(0, grams) / GRAMS_PER_OUNCE;
  const increment = ounces < 10 ? 0.05 : 0.1;
  const rounded = roundToIncrement(ounces, increment);

  return rounded.toFixed(increment === 0.05 ? 2 : 1);
}

export function formatPoundsOunces(grams: number) {
  const totalOunces = Math.max(0, grams) / GRAMS_PER_OUNCE;
  let pounds = Math.floor(totalOunces / OUNCES_PER_POUND);
  let ounces = roundToIncrement(totalOunces - pounds * OUNCES_PER_POUND, 0.1);

  if (ounces >= OUNCES_PER_POUND) {
    pounds += 1;
    ounces = 0;
  }

  return `${pounds}:${ounces.toFixed(1)}`;
}
