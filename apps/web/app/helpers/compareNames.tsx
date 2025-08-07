export function compareNames(verifiedName: string, accountName: string, match = 2) {
  const words1 = verifiedName.toLowerCase().split(/\s+/);
  const words2 = accountName.toLowerCase().split(/\s+/);

  // Create a set of words from the second string for quick lookup
  const wordSet2 = new Set(words2);

  // Count matching words
  let matchCount = 0;
  for (const word of words1) {
    if (wordSet2.has(word)) {
      matchCount++;
      if (matchCount >= match) return true;
    }
  }
  return false;
}
