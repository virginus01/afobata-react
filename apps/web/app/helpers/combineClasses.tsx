export function combineClasses(
  classInput: Record<string, string> | Array<{ class: string }>,
): string {
  if (!classInput) return '';

  // Check if input is an array of objects with a "class" key
  if (
    Array.isArray(classInput) &&
    classInput.every((item) => typeof item === 'object' && item !== null && 'class' in item)
  ) {
    return classInput
      .map((item) => item.class)
      .filter(Boolean)
      .join(' ');
  }

  // Fallback: assume it's an object with string values
  if (typeof classInput === 'object' && classInput !== null) {
    return Object.values(classInput).filter(Boolean).join(' ');
  }

  return '';
}
