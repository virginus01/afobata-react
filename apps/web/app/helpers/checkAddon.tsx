export function checkAddon({ data, addon }: { data: any; addon: string }): {
  value: number;
  available: boolean;
} {
  try {
    let addV = { value: data[addon].value, available: data[addon].available };
    return addV;
  } catch (error) {
    let addV = { value: 0, available: false };
    return addV;
  }
}
