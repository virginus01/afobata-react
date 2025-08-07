export function get_plan_data(planInfo: PackageTypes) {
  let pAd = {};
  for (let a of (planInfo?.addons || []) as any) {
    Object.assign(pAd, {
      [a.id]: {
        value: parseFloat(a.value),
        available: a.available,
      },
    });
  }
  return pAd;
}
