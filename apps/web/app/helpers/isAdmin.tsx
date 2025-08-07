export function isAdmin(user?: UserTypes): boolean {
  try {
    if (user?.isAdmin) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error in isAdmin function:', error);
    return false;
  }
}

export function adminAccess(user?: UserTypes): boolean {
  try {
    if (user?.isAdmin && user.selectedProfile === 'admin') {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error in isAdmin function:', error);
    return false;
  }
}
