import { isNull } from '@/app/helpers/isNull';

export function getPackagePrice({
  discount,
  price,
  duration,
}: {
  discount: number;
  price: number;
  duration: PlanDuration;
}) {
  let finalPrice = 0;

  if (price === 0) {
    return { price: finalPrice, ok: true };
  }

  if ([isNull(duration.value), isNull(price)].includes(true)) {
    return { price: finalPrice, ok: false };
  }

  const prePrice = (price ?? 0) * duration.value;
  const durationDiscount = ((duration.discount ?? 0) / 100) * Number(prePrice);
  finalPrice = Number(prePrice) - durationDiscount;

  return { price: finalPrice, ok: true };
}
