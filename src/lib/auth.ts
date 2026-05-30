export function getProfile(): any {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem('profile');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function getRole(): string {
  return getProfile()?.role ?? 'user';
}

export function canCreateTask(): boolean {
  const r = getRole();
  return r === 'admin' || r === 'commander';
}

export function canExportPDF(): boolean {
  const r = getRole();
  return r === 'admin' || r === 'commander';
}
