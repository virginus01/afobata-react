import { isNull } from '@/app/helpers/isNull';
import { show_error } from '@/app/helpers/show_error';

export function getRuleValueTubor({
  rules = [],
  id,
  value,
  sellerProfit,
}: {
  rules: Rule[];
  id: string;
  value: number;
  sellerProfit: number;
}): RuleValueModel {
  let finalValue = 0;
  let profit = 0;

  try {
    const rule = rules?.find((rule) => rule.name === id);

    if (!isNull(rule) && rule) {
      let ruleVal = Number(((rule?.value || 0) / 100) * value);

      if (rule.direction === 'increase') {
        let sellerProfitValue = Number((sellerProfit / 100) * value);
        finalValue = ruleVal;
        profit = Number(rule?.value || 0) + Number(sellerProfit);
        sellerProfit = finalValue + sellerProfitValue;
      } else if (rule.direction === 'decrease') {
        const p =
          (Number(Math.abs(rule?.value ?? 0)) > sellerProfit ? sellerProfit : rule?.value) ?? 0;
        ruleVal = Number((p / 100) * value);
        profit = sellerProfit - p;
        sellerProfit = (profit / 100) * value;
        finalValue = -(p / 100) * value;
      }
    } else {
      let sellerProfitValue = Number((parseFloat(sellerProfit.toString() || '0') / 100) * value);
      profit = Number(sellerProfit);
      sellerProfit = sellerProfitValue;
    }

    return {
      value: finalValue,
      plus: rule?.serviceCharge ?? 0,
      profit,
      sellerProfit,
    };
  } catch (error) {
    show_error('error on price rule', error);
    return {
      value: finalValue,
      plus: 0,
      profit: 0,
      sellerProfit: 0,
    };
  }
}
