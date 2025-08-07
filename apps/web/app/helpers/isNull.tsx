export function isNull(text: any, name?: string): boolean {
  if (
    text === undefined ||
    text === null ||
    text === '' ||
    text === 'not_found' ||
    text === '/' ||
    text === '<></>' ||
    text === 'NaN' ||
    text === '#' ||
    text === 'undefined/undefined' ||
    text === 'undefined/' ||
    text === '/undefined' ||
    text === 'undefined' ||
    text === false ||
    text === 0 ||
    text === '0'
  ) {
    if (name) {
      console.info(`"${text}" ${name} is null`);
    }
    return true;
  }

  if (typeof text === 'object' && text !== null && Object.keys(text).length === 0) {
    if (name) {
      console.info(`${name} is null`);
    }
    return true;
  }

  if (text instanceof Date && isNaN(text.getTime())) {
    if (name) {
      console.info(`${name} is null (invalid date)`);
    }
    return true;
  }

  if (typeof text === 'string' && text.trim().length === 0) {
    if (name) {
      console.info(`${name} is null`);
    }
    return true;
  }

  if (text === '{}' || text === '[]' || text === '[{}]') {
    if (name) {
      console.info(`"${text}" ${name} is null`);
    }
    return true;
  }

  return false;
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
