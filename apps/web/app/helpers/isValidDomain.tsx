export function isValidDomain(domain: string) {
  if (typeof domain !== 'string') return false;

  // Regular Expression for strict domain validation
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,}$/;

  // Check for invalid conditions
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }

  // Validate against the regex
  return domainRegex.test(domain);
}
