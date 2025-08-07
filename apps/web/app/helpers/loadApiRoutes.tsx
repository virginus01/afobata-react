export async function loadApiRoutes() {
  const moduleFn = await import('@/app/routes/api_routes');
  return {
    api_dynamic_get_data: moduleFn.api_dynamic_get_data,
    api_get_csrf: moduleFn.api_get_csrf,
    api_get_exchange_rates: moduleFn.api_get_exchange_rates,
    api_get_parents: moduleFn.api_get_parents,
  };
}
