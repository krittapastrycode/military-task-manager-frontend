export function getProfile(): any {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem('profile');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function getRoles(): string[] {
  const role = getProfile()?.role;
  if (!role) return ['user'];
  if (Array.isArray(role)) return role;
  if (typeof role === 'string') return [role];
  return ['user'];
}

export function hasRole(role: string): boolean {
  return getRoles().includes(role);
}

export function canCreateTask(): boolean {
  const roles = getRoles();
  return roles.includes('admin') || roles.includes('commander');
}

export function canExportPDF(): boolean {
  const roles = getRoles();
  return roles.includes('admin') || roles.includes('commander');
}

/** @deprecated use getRoles() */
export function getRole(): string {
  return getRoles()[0] ?? 'user';
}
