import { randomNumber } from '@/app/helpers/randomNumber';
import { Card, Metric, Text, AreaChart, BadgeDelta, Flex } from '@tremor/react';
import { useMemo } from 'react';
import { Suspense } from 'react';

export function OverviewStats() {
  const data = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return [
      ...months.map((month) => ({
        Month: `${month} 23`,
        'Total Visitors': randomNumber(6),
      })),
      ...months.map((month) => ({
        Month: `${month} 23`,
        'Total Visitors': randomNumber(6),
      })),
      ...months.map((month) => ({
        Month: `${month} 23`,
        'Total Visitors': randomNumber(6),
      })),
      {
        Month: 'Jul 23',
        'Total Visitors': 170418,
      },
    ];
  }, []);

  return (
    <div className="min-h-[100vh]">
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="brand-bg-card brand-text-card dark:!bg-stone-900 border border-none">
          <Text>Total Visitors</Text>
          <Flex className="space-x-3 truncate" justifyContent="start" alignItems="baseline">
            <Metric className="font-cal">170,418</Metric>
            <BadgeDelta
              deltaType="moderateIncrease"
              className="dark:bg-green-900 dark:bg-opacity-50 dark:text-green-400"
            >
              34.3%
            </BadgeDelta>
          </Flex>
          <AreaChart
            className="mt-6 h-28"
            data={data}
            index="Month"
            valueFormatter={(number: number) =>
              `${Intl.NumberFormat('us').format(number).toString()}`
            }
            categories={['Total Visitors']}
            colors={['blue']}
            showXAxis={true}
            showGridLines={false}
            startEndOnly={true}
            showYAxis={false}
            showLegend={false}
          />
        </Card>
      </div>
    </div>
  );
}
