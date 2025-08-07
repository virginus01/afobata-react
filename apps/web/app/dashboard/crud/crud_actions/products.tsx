import { curFormat } from '@/app/helpers/curFormat';

export default function ProductSideDetails({ product }: { product: ProductTypes }) {
  const orderDetails = [
    { label: 'Views:', value: product.views ?? product.cashViews ?? 0 },
    { label: 'Revenue:', value: curFormat(product.revenue ?? 0, product.currencySymbol) },
    { label: 'Sales:', value: product.sales ?? 0 },
  ].filter(Boolean);

  return (
    <div className="flex flex-col space-y-3 text-xs px-2">
      {orderDetails.map((detail, index) => (
        <div key={index} className="border-b border-gray-300 flex flex-row justify-between p-1">
          <div className="font-normal">{detail.label}</div>
          <div>{detail.value}</div>
        </div>
      ))}
    </div>
  );
}
