export const bordersRadius = [
  {
    all: [
      "rounded-none",
      "rounded-sm",
      "rounded",
      "rounded-md",
      "rounded-lg",
      "rounded-xl",
      "rounded-2xl",
      "rounded-3xl",
      "rounded-full",
    ],
  },
  {
    top: [
      "rounded-t-none",
      "rounded-t-sm",
      "rounded-t",
      "rounded-t-md",
      "rounded-t-lg",
      "rounded-t-xl",
      "rounded-t-2xl",
      "rounded-t-3xl",
      "rounded-t-full",
    ],
  },
  {
    right: [
      "rounded-r-none",
      "rounded-r-sm",
      "rounded-r",
      "rounded-r-md",
      "rounded-r-lg",
      "rounded-r-xl",
      "rounded-r-2xl",
      "rounded-r-3xl",
      "rounded-r-full",
    ],
  },
  {
    bottom: [
      "rounded-b-none",
      "rounded-b-sm",
      "rounded-b",
      "rounded-b-md",
      "rounded-b-lg",
      "rounded-b-xl",
      "rounded-b-2xl",
      "rounded-b-3xl",
      "rounded-b-full",
    ],
  },
  {
    left: [
      "rounded-l-none",
      "rounded-l-sm",
      "rounded-l",
      "rounded-l-md",
      "rounded-l-lg",
      "rounded-l-xl",
      "rounded-l-2xl",
      "rounded-l-3xl",
      "rounded-l-full",
    ],
  },
  {
    "top-left": [
      "rounded-tl-none",
      "rounded-tl-sm",
      "rounded-tl",
      "rounded-tl-md",
      "rounded-tl-lg",
      "rounded-tl-xl",
      "rounded-tl-2xl",
      "rounded-tl-3xl",
      "rounded-tl-full",
    ],
  },
  {
    "top-right": [
      "rounded-tr-none",
      "rounded-tr-sm",
      "rounded-tr",
      "rounded-tr-md",
      "rounded-tr-lg",
      "rounded-tr-xl",
      "rounded-tr-2xl",
      "rounded-tr-3xl",
      "rounded-tr-full",
    ],
  },
  {
    "bottom-left": [
      "rounded-bl-none",
      "rounded-bl-sm",
      "rounded-bl",
      "rounded-bl-md",
      "rounded-bl-lg",
      "rounded-bl-xl",
      "rounded-bl-2xl",
      "rounded-bl-3xl",
      "rounded-bl-full",
    ],
  },
  {
    "bottom-right": [
      "rounded-br-none",
      "rounded-br-sm",
      "rounded-br",
      "rounded-br-md",
      "rounded-br-lg",
      "rounded-br-xl",
      "rounded-br-2xl",
      "rounded-br-3xl",
      "rounded-br-full",
    ],
  },
];

const borderRadiusSizes = [
  { value: "none", title: "no border radius" },
  { value: "sm", title: "small border radius" },
  { value: "md", title: "medium border radius" },
  { value: "lg", title: "large border radius" },
  { value: "xl", title: "extra large border radius" },
  { value: "2xl", title: "2x extra large border radius" },
  { value: "3xl", title: "3x extra large border radius" },
  { value: "full", title: "full (circular) border radius" },
];

const borderRadiusDirections = [
  { key: "rounded", label: "all corners" },
  { key: "rounded-t", label: "top corners" },
  { key: "rounded-r", label: "right corners" },
  { key: "rounded-b", label: "bottom corners" },
  { key: "rounded-l", label: "left corners" },
  { key: "rounded-tl", label: "top left corner" },
  { key: "rounded-tr", label: "top right corner" },
  { key: "rounded-br", label: "bottom right corner" },
  { key: "rounded-bl", label: "bottom left corner" },
];

function generateBorderRadiusObjects(prefix = "") {
  const prefixClass = prefix ? `${prefix}:` : "";
  const titlePrefix = prefix ? `for Large Screen` : "";

  const items = [];

  for (const dir of borderRadiusDirections) {
    for (const size of borderRadiusSizes) {
      items.push({
        value: size.value,
        class: `${prefixClass}${dir.key}${
          size.value === "none" ? "-none" : size.value === "md" ? "" : `-${size.value}`
        }`,
        title: `${dir.label} ${size.title} ${titlePrefix}`.trim(),
      });
    }
  }

  return items;
}

export const objectBorderRadius = [
  ...generateBorderRadiusObjects(), // base (no prefix)
  ...generateBorderRadiusObjects("sm"), // sm: prefix
];
