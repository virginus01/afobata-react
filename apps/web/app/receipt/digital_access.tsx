import React from 'react';
import Link from 'next/link';
import CustomCard from '@/app/widgets/custom_card';
import { route_public_page } from '@/app/routes/page_routes';
import { Order } from '@/app/models/Order';

export default function DigitalOrderLinks({ orders }: { orders: Order[] }) {
  const resolveLinks = (order: Order): FileType[] => {
    const links: FileType[] = [];

    const fulfilmentType = order?.productData?.fulFilmentType ?? '';

    if (['subCourses', 'chapter', 'topics'].includes(fulfilmentType)) {
      links.push({
        publicUrl: route_public_page({
          paths: ['views', 'product', `${order?.productData?.password ?? ''}`],
        }),
      });
    } else if (fulfilmentType === 'redirect') {
      links.push({ publicUrl: order?.productData?.redirectUrl ?? '' });
    } else if (fulfilmentType === 'downloadable') {
      const files = order?.productData?.product_files ?? [];
      if (Array.isArray(files)) {
        files.forEach((file) => links.push(file));
      }
    }

    return links;
  };

  return (
    <div>
      {orders.map((order, index) => {
        const links = resolveLinks(order);
        return (
          <div key={index} className="p-2">
            <CustomCard title={`Access Links: ${order.title ?? ''}`}>
              <div className="space-y-2 mt-2">
                {links.map((link, i) => (
                  <Link
                    key={i}
                    href={link.publicUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline block"
                  >
                    Click here to view your product
                  </Link>
                ))}
              </div>
            </CustomCard>
          </div>
        );
      })}
    </div>
  );
}
