export async function getParents({ subBase }: { subBase?: string } = {}): Promise<ParentsInfo> {
  let res = { master: {}, parent: {}, other: [] };
  try {
    const { isNull } = await import('@/app/helpers/isNull');
    const { api_get_parents } = await import('@/app/routes/api_routes');
    if (isNull(subBase)) {
      throw Error('brand id missing at getParents');
    }
    const subf = subBase;
    const url = await api_get_parents({ subBase: subf, brandId: subBase! });
    const { modHeaders } = await import('@/app/helpers/modHeaders');
    const response = await fetch(url, {
      method: 'GET',
      headers: await modHeaders('get'),
      credentials: 'include',
    });
    if (!response.ok) {
      console.error(response.statusText, 'at get parents');
      return res;
    }
    const result = await response.json();
    if (result.status && result.data) {
      res = {
        master: result.data?.master,
        parent: result.data?.parent,
        other: result.data?.others,
      };
    }
    return res;
  } catch (error) {
    const { show_error } = await import('@/app/helpers/show_error');
    show_error('error getting parents', error);
    return res;
  }
}
