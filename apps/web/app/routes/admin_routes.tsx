export const package_page = ({
  action,
  subBase,
  id,
}: {
  action: string;
  subBase: string;
  id?: string;
}): string => {
  return `/${subBase}/admin/packages/${action}${id ? `?id=${id}` : ""}`;
};

export const addons_page = ({
  action,
  subBase,
  id,
}: {
  action: string;
  subBase: string;
  id?: string;
}): string => {
  return `/${subBase}/admin/addons/${action}${id ? `?id=${id}` : ""}`;
};
