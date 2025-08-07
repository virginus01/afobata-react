export const data_sub_page = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/dashboard/utility/data`;
};

export const airtime_rech_page = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/dashboard/utility/airtime`;
};

export const tv_sub_page = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/dashboard/utility/tv`;
};

export const electric_sub_page = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/dashboard/utility/electric`;
};

export const education_serv_page = ({
  subBase,
}: {
  subBase: string;
}): string => {
  return `/${subBase}/dashboard/utility/education`;
};

export const betting_account_fund = ({
  subBase,
}: {
  subBase: string;
}): string => {
  return `/${subBase}/dashboard/utility/betting`;
};

export const service_page = ({
  subBase,
  action,
}: {
  subBase: string;
  action: string;
}): string => {
  return `/${subBase}/dashboard/utility/${action}`;
};
