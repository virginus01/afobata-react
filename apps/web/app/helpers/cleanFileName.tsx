export function cleanFileName(filename: any) {
  let cleanName = filename;
  if (filename) {
    cleanName = cleanName.split('.').slice(0, -1).join('.');
    cleanName = cleanName.replace(/[-_]/g, ' ');
    cleanName = cleanName.replace(/[^A-Za-z0-9]/g, ' ');
    cleanName = cleanName.replace(/\s\s+/g, ' ');
  }
  return cleanName.trim();
}
