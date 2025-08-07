import {
  airtime_rech_page,
  betting_account_fund,
  data_sub_page,
  education_serv_page,
  electric_sub_page,
  tv_sub_page,
} from '@/app/routes/utility_pages_routes';

export function createUtilityNavigation({ slug }: { slug: string }): NavItem[] {
  return [
    {
      name: 'Utility Services',
      href: '#',
      position: 13,
      sub: [
        {
          name: 'Data Subscription',
          base: 'utility',
          action: 'data',
          href: `${data_sub_page({ subBase: slug })}`,
          position: 1,
          className: 'bg-white',
          silverImage: '/utility/data.jpg',
        },
        {
          name: 'Airtime Recharge',
          href: `${airtime_rech_page({ subBase: slug })}`,
          base: 'utility',
          action: 'airtime',
          className: 'bg-white',
          position: 1,
          silverImage: '/utility/airtime.jpg',
        },
        {
          name: 'TV Subscription',
          href: `${tv_sub_page({ subBase: slug })}`,
          base: 'utility',
          action: 'tv',
          className: 'bg-white',
          position: 1,
          silverImage: '/utility/cable.jpg',
        },
        {
          name: 'Electricity Subscription',
          href: `${electric_sub_page({ subBase: slug })}`,
          base: 'utility',
          action: 'electric',
          className: 'bg-white',
          position: 1,
          silverImage: '/utility/electric.jpg',
        },
        {
          name: 'Educational Services',
          href: `${education_serv_page({ subBase: slug })}`,
          base: 'utility',
          action: 'education',
          className: 'bg-white',
          position: 1,
          silverImage: '/utility/education.jpg',
        },
        {
          name: 'Fund Betting Account',
          href: `${betting_account_fund({ subBase: slug })}`,
          base: 'utility',
          action: 'betting',
          className: 'bg-white',
          position: 1,
        },
      ],
    },
  ];
}
