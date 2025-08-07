export async function loadAuthSessionData() {
  const moduleFn = await import('@/app/controller/auth_controller');
  return moduleFn.getAuthSessionData;
}
