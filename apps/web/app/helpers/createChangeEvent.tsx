export function createChangeEvent<T extends HTMLElement>(
  name: string,
  value: any,
): React.ChangeEvent<T> {
  return {
    target: { name, value },
  } as unknown as React.ChangeEvent<T>;
}
