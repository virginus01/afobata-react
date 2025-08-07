export const defaultRules = [
  {
    name: 'data',
    title: 'Data Subscriptions',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 10,
    direction: 'increase',
    serviceCharge: 0,
    type: 'utility',
  },
  {
    name: 'airtime',
    title: 'Airtime Top Ups',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 1.5,
    serviceCharge: 0,
    direction: 'decrease',
    type: 'utility',
  },
  {
    name: 'tv',
    title: 'Tv Subscriptions',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0.1,
    serviceCharge: 0,
    direction: 'decrease',
    type: 'utility',
  },
  {
    name: 'electric',
    title: 'Meter Top Up',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0.1,
    serviceCharge: 0,
    direction: 'decrease',
    type: 'utility',
  },
  {
    name: 'package',
    title: 'Package Prices',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 5,
    serviceCharge: 0,
    direction: 'decrease',
    type: 'package',
  },
  {
    name: 'digital',
    title: 'Digital Product Price Rule',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'decrease',
    type: 'product',
  },
  {
    name: 'physical',
    title: 'Physical Product Price Rule',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'increase',
    type: 'product',
  },
  {
    name: 'course',
    title: 'Course Price Rule',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'increase',
    type: 'product',
  },
];

export const initialRules: Rule[] = [
  {
    name: 'data',
    title: 'Data Subscriptions',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    direction: 'increase',
    serviceCharge: 0,
    type: 'utility',
  },
  {
    name: 'airtime',
    title: 'Airtime Top Ups',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'increase',
    type: 'utility',
  },
  {
    name: 'tv',
    title: 'Tv Subscriptions',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'increase',
    type: 'utility',
  },
  {
    name: 'electric',
    title: 'Meter Top Up',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'increase',
    type: 'utility',
  },

  {
    name: 'package',
    title: 'Package Prices',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'increase',
    type: 'package',
  },

  {
    name: 'digital',
    title: 'Digital Product Price Rule',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'increase',
    type: 'product',
  },
  {
    name: 'physical',
    title: 'Physical Product Price Rule',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'increase',
    type: 'product',
  },

  {
    name: 'course',
    title: 'Course Price Rule',
    adjustmentType: 'percentage',
    chargeAdjustmentType: 'fixed',
    chargeDirection: 'increase',
    value: 0,
    serviceCharge: 0,
    direction: 'increase',
    type: 'product',
  },
];

export function iniRules(rules: any[]) {
  const mergedRules = initialRules.map((rule) => {
    const brandRule = rules?.find((br) => br.name === rule.name);
    return brandRule || rule;
  });

  return mergedRules.reduce((acc, r) => {
    return {
      ...acc,
      [`rule.${r.name}.value`]: r.value || 0,
      [`rule.${r.name}.direction`]: r.direction || 'increase',
      [`rule.${r.name}.adjustmentType`]: r.adjustmentType || 'percentage',
      [`rule.${r.name}.chargeDirection`]: r.chargeDirection || 'increase',
      [`rule.${r.name}.serviceCharge`]: r.serviceCharge || 0,
    };
  }, {});
}

export function mergeRules(rules: any[]): Rule[] {
  const mergedRules: Rule[] = initialRules.map((rule) => {
    const brandRule = rules?.find((br) => br.name === rule.name);
    return brandRule || rule || [];
  });

  return mergedRules;
}

export const mergeRulesTubor = (rules: Rule[] = []) => {
  const userRulesMap = new Map(rules.map((rule) => [rule.name, rule]));

  // Merge rules: priority to userRules, fallback to initialRules
  return initialRules.map((rule) => userRulesMap.get(rule.name) || rule);
};
