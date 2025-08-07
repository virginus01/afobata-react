export const borders = [
  {
    all: ["border-0", "border", "border-2", "border-4", "border-8"],
  },
  {
    top: ["border-t-0", "border-t", "border-t-2", "border-t-4", "border-t-8"],
  },
  {
    right: ["border-r-0", "border-r", "border-r-2", "border-r-4", "border-r-8"],
  },
  {
    bottom: ["border-b-0", "border-b", "border-b-2", "border-b-4", "border-b-8"],
  },
  {
    left: ["border-l-0", "border-l", "border-l-2", "border-l-4", "border-l-8"],
  },
  {
    "top-left": ["border-tl-0", "border-tl", "border-tl-2", "border-tl-4", "border-tl-8"],
  },
  {
    "top-right": ["border-tr-0", "border-tr", "border-tr-2", "border-tr-4", "border-tr-8"],
  },
  {
    "bottom-left": ["border-bl-0", "border-bl", "border-bl-2", "border-bl-4", "border-bl-8"],
  },
  {
    "bottom-right": ["border-br-0", "border-br", "border-br-2", "border-br-4", "border-br-8"],
  },
];

const borderWidths = [0, 1, 2, 4, 8];
const borderDirections = [
  { key: "border", label: "border all sides" },
  { key: "border-t", label: "border top" },
  { key: "border-r", label: "border right" },
  { key: "border-b", label: "border bottom" },
  { key: "border-l", label: "border left" },
];

function generateBorderObjects(prefix = "") {
  const prefixClass = prefix ? `${prefix}:` : "";
  const titlePrefix = prefix ? `for Large Screen` : "";

  const items = [];

  for (const dir of borderDirections) {
    for (const width of borderWidths) {
      // Tailwind uses 'border' for 1px border, so 'border' class equals 'border-1'
      // For width 1, if dir.key === 'border' use 'border' (no suffix)
      const className =
        width === 1 && dir.key === "border"
          ? `${prefixClass}border`
          : `${prefixClass}${dir.key}-${width}`;

      const title =
        width === 1 && dir.key === "border"
          ? `${dir.label} (1px) ${titlePrefix}`.trim()
          : `${dir.label} width ${width}px ${titlePrefix}`.trim();

      items.push({
        value: width,
        class: className,
        title: title,
      });
    }
  }

  return items;
}

export const objectBorders = [
  ...generateBorderObjects(), // base (no prefix)
  ...generateBorderObjects("sm"), // sm: prefix
];
