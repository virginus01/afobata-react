export const gridOptions = [
  {
    display: ["grid", "inline-grid"],
  },
  {
    columns: [
      "grid-cols-1",
      "grid-cols-2",
      "grid-cols-3",
      "grid-cols-4",
      "grid-cols-6",
      "grid-cols-12",
    ],
  },
  {
    gap: ["gap-1", "gap-2", "gap-4", "gap-8"],
  },
];

export const objectGridOptions = [
  // Display types
  { class: "grid", title: "grid display", value: 0 },
  { class: "inline-grid", title: "inline grid display", value: 1 },

  // Columns
  { class: "grid-cols-1", title: "1 column grid", value: 10 },
  { class: "grid-cols-2", title: "2 columns grid", value: 11 },
  { class: "grid-cols-3", title: "3 columns grid", value: 12 },
  { class: "grid-cols-4", title: "4 columns grid", value: 13 },
  { class: "grid-cols-6", title: "6 columns grid", value: 14 },
  { class: "grid-cols-12", title: "12 columns grid", value: 15 },

  // Gap sizes
  { class: "gap-1", title: "gap size 1", value: 20 },
  { class: "gap-2", title: "gap size 2", value: 21 },
  { class: "gap-4", title: "gap size 4", value: 22 },
  { class: "gap-8", title: "gap size 8", value: 23 },
];
