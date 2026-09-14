export const formatPrice = (price: string) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
    Number(price),
  );
export function ageOutsideRange(
  age: number,
  minimum: number | null,
  maximum: number | null,
) {
  return (
    (minimum !== null && age < minimum) || (maximum !== null && age > maximum)
  );
}
