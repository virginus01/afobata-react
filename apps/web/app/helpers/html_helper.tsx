export function sanitizeHTML(htmlString: string): string {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;

  // Function to get body content or main content
  function getMainContent(element: HTMLElement): string {
    // Find the body element
    const body = element.querySelector("body");

    // If body exists, get its content, otherwise use the whole content
    const contentElement = body || element;

    // Convert to array to maintain only the direct children we want to keep
    const children = Array.from(contentElement.children);

    // Filter out unwanted elements and their content
    const validChildren = children.filter((child) => {
      const tagName = child.tagName.toLowerCase();
      return !["html", "head", "body", "script", "style", "h1", "link", "meta"].includes(tagName);
    });

    // Return the HTML of valid children
    return validChildren.map((child) => child.outerHTML).join("\n");
  }

  // Get the main content first
  let mainContent = getMainContent(tempDiv);

  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS: [
      "div",
      "span",
      "section",
      "article",
      "aside",
      "main",
      "header",
      "footer",
      "nav",
      "p",
      "pre",
      "blockquote",
      "hr",
      "br",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "dl",
      "dt",
      "dd",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "small",
      "sub",
      "sup",
      "mark",
      "del",
      "ins",
      "code",
      "kbd",
      "samp",
      "var",
      "time",
      "abbr",
      "dfn",
      "q",
      "cite",
      "table",
      "caption",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "td",
      "th",
      "colgroup",
      "col",
      "form",
      "input",
      "textarea",
      "button",
      "select",
      "option",
      "optgroup",
      "fieldset",
      "legend",
      "label",
      "datalist",
      "output",
      "img",
      "figure",
      "figcaption",
      "picture",
      "audio",
      "video",
      "source",
      "track",
      "map",
      "area",
      "a",
      "details",
      "summary",
      "menu",
      "dialog",
      "template",
      "ruby",
      "rt",
      "rp",
      "data",
      "meter",
      "progress",
      "address",
      "bdi",
      "bdo",
    ],
    ALLOWED_ATTR: [
      "id",
      "class",
      "title",
      "lang",
      "dir",
      "role",
      "tabindex",
      "contenteditable",
      "draggable",
      "hidden",
      "accesskey",
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "poster",
      "controls",
      "muted",
      "loop",
      "autoplay",
      "colspan",
      "rowspan",
      "headers",
      "scope",
      "type",
      "name",
      "value",
      "placeholder",
      "required",
      "disabled",
      "readonly",
      "maxlength",
      "min",
      "max",
      "pattern",
      "multiple",
      "checked",
      "for",
      "selected",
      "width",
      "height",
      "loading",
      "decoding",
      "aria-label",
      "aria-describedby",
      "aria-hidden",
      "aria-expanded",
      "aria-controls",
      "aria-live",
    ],
    FORBID_TAGS: ["html", "head", "body", "h1", "script", "style", "link", "meta"],
    FORBID_ATTR: ["on*", "style", "xmlns", "srcset"],
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  };

  // Sanitize the content
  //  return createDOMPurify.sanitize(mainContent, config).trim();
  return mainContent;
}

export function cleanString(html: string): string {
  const config = {
    ALLOWED_TAGS: [], // Don't allow any tags
    ALLOWED_ATTR: [], // Don't allow any attributes
    KEEP_CONTENT: true, // Keep the text content of removed tags
  };

  return html;
  // return createDOMPurify
  //   .sanitize(html, config)
  //   .replace(/[^\w\s.,!?@#$%&*()[\]{}:;"'/-]|_/g, "") // Keep alphanumeric, common punctuation, and basic symbols
  //   .replace(/\s+/g, " ") // Replace multiple spaces with single space
  //   .trim();
}
