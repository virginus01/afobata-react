/**
 * Parse JSON responses in multiple formats with enhanced error handling
 * @param {any} response - The response that might contain JSON
 * @returns {Object|null} - Parsed JSON object or null if parsing fails
 */
export const parseJsonResponse = (response: any, key: string) => {
  if (!response) return null;

  // Debug log to inspect the actual response structure
  console.debug("Response type:", typeof response);
  if (typeof response === "object") {
    console.debug("Response keys:", Object.keys(response));
    if (response.data) {
      console.debug("Data type:", typeof response.data);
      // Log just a snippet of data if it's a string (to avoid flooding console)
      if (typeof response.data === "string") {
        console.debug("Data preview:", response.data.substring(0, 100) + "...");
      }
    }
  }

  // Case 1: If it's already an object with expected data structure
  if (typeof response === "object" && !Array.isArray(response)) {
    // Case 1a: Object with data property containing a JSON string
    if (response.data && typeof response.data === "string") {
      try {
        // Clean the string before parsing
        const cleanedData = cleanJsonString(response.data, key);
        return JSON.parse(cleanedData);
      } catch (e) {
        console.error("Error parsing JSON from data property:", e);
        // Try to extract JSON from the data string
        try {
          const extracted = extractJsonFromString(response.data, key);
          if (extracted) return extracted;
        } catch (extractError) {
          console.error("Failed to extract JSON from data property:", extractError);
        }

        // If that fails, maybe the object itself has what we need
        if (response.chapters || response.topics || response.content) {
          return response;
        }
      }
    }

    // Case 1b: Object with data property already parsed
    if (response.data && typeof response.data === "object") {
      return response.data;
    }

    // Case 1c: Object already has expected properties
    if (response.chapters || response.topics || response.content) {
      return response;
    }

    // Just return the object as is
    return response;
  }

  // Case 2: If it's a string, try to parse it as JSON
  if (typeof response === "string") {
    try {
      // Clean the string before parsing
      const cleanedString = cleanJsonString(response, key);
      return JSON.parse(cleanedString);
    } catch (e) {
      console.error("Error parsing JSON response:", e);

      // Try to extract JSON using our utility function
      try {
        const extracted = extractJsonFromString(response, key);
        if (extracted) return extracted;
      } catch (extractError) {
        console.error("Failed to extract JSON from string:", extractError);
      }
    }
  }

  return null;
};

/**
 * Helper function to clean a JSON string before parsing
 * Handles common issues with AI-generated JSON
 */
const cleanJsonString = (str: string, key: string): string => {
  if (!str) return str;

  let cleaned = str;

  // Replace any invalid escape sequences
  cleaned = cleaned.replace(/\\(?!["\\/bfnrt])/g, "\\\\");

  // Handle potential trailing commas in objects and arrays
  cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*\]/g, "]");

  // Fix missing quotes around property names
  cleaned = cleaned.replace(/(\{|\,)\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

  // Remove potential control characters and other invalid characters
  cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

  return cleaned;
};

/**
 * Helper function to extract valid JSON from a string that might contain extra text
 * ES5 compatible version (no /s flag)
 */
const extractJsonFromString = (str: string, key: string): object | null => {
  if (!str) return null;

  // Try to find a complete JSON object
  const jsonPattern = /\{(?:[^{}]|(\{(?:[^{}]|(\{(?:[^{}]|\{[^{}]*\})*\}))*\}))*\}/g;
  const matches = str.match(jsonPattern);

  if (matches && matches.length > 0) {
    // Try each match until we find one that parses
    for (const match of matches) {
      try {
        const cleaned = cleanJsonString(match, key);
        const result = JSON.parse(cleaned);

        // If we successfully parsed and it has expected properties, return it
        if (result && typeof result === "object") {
          if (result.chapters || result.topics || result.content) {
            return result;
          }
        }
      } catch (e) {
        // Continue to the next match
      }
    }
  }

  // ES5 compatible approach for multiline regex (replacing /s flag)
  // Using [\s\S] to match any character including newlines

  // If we couldn't find a complete JSON object, try to find JSON with specific properties
  try {
    // Look for key array
    const topicsRegex = new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`);
    const topicsMatch = topicsRegex.exec(str);
    if (topicsMatch) {
      const topicsStr = `"${key}": [${topicsMatch[1]}]`;
      const reconstructed = `{${topicsStr}}`;
      const cleaned = cleanJsonString(reconstructed, key);
      return JSON.parse(cleaned);
    }

    // Look for key property
    const contentRegex = new RegExp(`${key}\\s*:\\s*"([\\s\\S]*?)"`);
    const contentMatch = contentRegex.exec(str);
    if (contentMatch) {
      // Escape the content properly for JSON
      const content = contentMatch[1].replace(/"/g, '\\"');
      const contentStr = `"${key}": "${content}"`;
      const reconstructed = `{${contentStr}}`;
      const cleaned = cleanJsonString(reconstructed, key);
      return JSON.parse(cleaned);
    }
  } catch (e) {
    console.error("Error extracting specific JSON properties:", e);
  }

  return null;
};

/**
 * Formats AI-generated text by converting newlines to HTML paragraphs and applying other formatting
 * @param {string} text - The raw text to format
 * @returns {string} - The formatted HTML content
 */
export function formatAiText(text: string): string {
  // Replace multiple newlines with paragraph breaks
  let textWithParagraphs = text.replace(/\n\n+/g, "</p><p>");

  // Add opening and closing paragraph tags
  textWithParagraphs = "<p>" + textWithParagraphs + "</p>";

  // Replace newlines with line breaks
  const textWithBr = textWithParagraphs.replace(/\n\n/g, "<br/><br/>");

  // Apply word replacements and clean HTML
  return findAndReplaceAiWords(cleanHtmlContent(textWithBr));
}

/**
 * Replaces common AI phrases with preferred alternatives
 * @param {string} string - The text to process
 * @returns {string} - Text with replaced phrases
 */
export function findAndReplaceAiWords(string: string): string {
  // Create a map for replacements that handles both cases and punctuation variations
  const replacements: Record<string, string> = {
    "in conclusion,": "",
    "conclusion,": "",
    "In conclusion,": "",
    "In conclusion, ": "",
    "in addition to,": "",
    "In addition to,": "",
    "<h2>Conclusion</h2>": "",
    "Table of Contents": "",
    "Lastly,": "",
    "finally,": "",
    "Finally,": "",
    "to conclude,": "",
    "To conclude,": "",
    "to summarize,": "",
    "To summarize,": "",
    "in summary,": "",
    "In summary,": "",
    "overall,": "",
    "Overall,": "",
    "to sum up,": "",
    "To sum up,": "",
    "thus,": "",
    "Thus,": "",
    "therefore,": "",
    "Therefore,": "",
    "hence,": "",
    "Hence,": "",
    "as a result,": "",
    "As a result,": "",
    "accordingly,": "",
    "Accordingly,": "",
    "in short,": "",
    "In short,": "",
    "all in all,": "",
    "All in all,": "",
  };

  // Replace the words with proper boundary checks to ensure exact matches
  let result = string;
  Object.entries(replacements).forEach(([search, replace]) => {
    // Escape special regex characters in the search term
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Create a regex that matches the term with proper word boundaries
    // The word boundary ensures we don't match substrings within larger words
    const regex = new RegExp(`\\b${escapedSearch}\\b`, "gi");
    result = result.replace(regex, replace);
  });

  return result;
}
/**
 * Cleans HTML content by removing problematic elements and handling issues with images and links
 * @param {string} htmlContent - The HTML content to clean
 * @returns {string} - The cleaned HTML content
 */
export function cleanHtmlContent(htmlContent: string): string {
  // For server-side rendering, we need to check if document is available
  if (typeof document === "undefined") {
    // Server-side rendering - use a simple regex approach for basic cleaning
    let cleaned = htmlContent;

    // Remove head tags
    cleaned = cleaned.replace(/<head>[\s\S]*?<\/head>/gi, "");

    // Remove h1 tags but keep their content
    cleaned = cleaned.replace(/<h1>([\s\S]*?)<\/h1>/gi, "$1");

    return cleaned;
  }

  // Client-side rendering - use DOM API
  const parser = new DOMParser();
  const dom = parser.parseFromString(htmlContent, "text/html");

  // Process images - remove images with empty or unavailable sources
  const images = dom.getElementsByTagName("img");
  const imagesToRemove: HTMLImageElement[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i] as HTMLImageElement;
    const src = img.getAttribute("src");
    if (!src || !isImageAvailable(src)) {
      imagesToRemove.push(img);
    }
  }

  imagesToRemove.forEach((img) => {
    if (img.parentNode) {
      img.parentNode.removeChild(img);
    }
  });

  // Process links - keep text but remove link wrappers for unavailable URLs
  const links = dom.getElementsByTagName("a");
  const linksToRemove: HTMLAnchorElement[] = [];

  for (let i = 0; i < links.length; i++) {
    const link: any = links[i] as HTMLAnchorElement;
    const href: any = link.getAttribute("href");
    if (!href || !isUrlAvailable(href)) {
      // Keep the text content but remove the link wrapper
      while (link.childNodes.length > 0) {
        link.parentNode?.insertBefore(link.firstChild, link);
      }
      linksToRemove.push(link);
    }
  }

  linksToRemove.forEach((link) => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  });

  // Remove head tags
  const head = dom.getElementsByTagName("head")[0];
  if (head && head.parentNode) {
    head.parentNode.removeChild(head);
  }

  // Remove h1 tags and keep their content
  const h1Tags = dom.getElementsByTagName("h1");
  while (h1Tags.length > 0) {
    const h1: any = h1Tags[0];
    if (h1 && h1.parentNode) {
      while (h1.childNodes.length > 0) {
        h1.parentNode.insertBefore(h1.firstChild, h1);
      }
      h1.parentNode.removeChild(h1);
    }
  }

  // Get the content inside body
  const body = dom.getElementsByTagName("body")[0];
  if (body) {
    return body.innerHTML;
  }

  // If body is not present, return the entire cleaned HTML
  return dom.documentElement.innerHTML;
}

/**
 * Check if an image URL is available
 * Note: This is a simplified version - in a real app, you'd want to implement proper availability checking
 * @param {string} url - The image URL to check
 * @returns {boolean} - Whether the URL is available
 */
function isImageAvailable(url: string): boolean {
  // Simple validation - would need to be expanded in a real application
  return !!url && url.trim() !== "";
}

/**
 * Check if a URL is available
 * Note: This is a simplified version - in a real app, you'd want to implement proper availability checking
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL is available
 */
function isUrlAvailable(url: string): boolean {
  // Simple validation - would need to be expanded in a real application
  return !!url && url.trim() !== "";
}
