export function pluralize(text: string, length = 0) {
  if (length === 0 || length === 1) {
    return `${text}`;
  } else {
    return `${text}s`;
  }
}
