export type widthAll =
  | "w-0"
  | "w-1"
  | "w-2"
  | "w-3"
  | "w-4"
  | "w-5"
  | "w-6"
  | "w-8"
  | "w-10"
  | "w-12"
  | "w-16"
  | "w-20"
  | "w-24"
  | "w-32"
  | "w-40"
  | "w-48"
  | "w-56"
  | "w-64"
  | "w-72"
  | "w-80"
  | "w-96"
  | "w-full"
  | "w-screen"
  | "w-auto"
  | "w-min"
  | "w-max"
  | "w-fit"
  | "w-1/2"
  | "w-1/3"
  | "w-2/3"
  | "w-1/4"
  | "w-3/4"
  | "w-1/5"
  | "w-2/5"
  | "w-3/5"
  | "w-4/5"
  | "w-1/6"
  | "w-5/6";

export type widthSm = `sm:${widthAll}`;

export const widthAllList: widthAll[] = [
  "w-0",
  "w-1",
  "w-2",
  "w-3",
  "w-4",
  "w-5",
  "w-6",
  "w-8",
  "w-10",
  "w-12",
  "w-16",
  "w-20",
  "w-24",
  "w-32",
  "w-40",
  "w-48",
  "w-56",
  "w-64",
  "w-72",
  "w-80",
  "w-96",
  "w-full",
  "w-screen",
  "w-auto",
  "w-min",
  "w-max",
  "w-fit",
  "w-1/2",
  "w-1/3",
  "w-2/3",
  "w-1/4",
  "w-3/4",
  "w-1/5",
  "w-2/5",
  "w-3/5",
  "w-4/5",
  "w-1/6",
  "w-5/6",
];

export const widthSmList: widthSm[] = widthAllList.map((w) => `sm:${w}` as widthSm);

export const width = [
  {
    all: [
      "w-0",
      "w-1",
      "w-2",
      "w-3",
      "w-4",
      "w-5",
      "w-6",
      "w-8",
      "w-10",
      "w-12",
      "w-16",
      "w-20",
      "w-24",
      "w-32",
      "w-40",
      "w-48",
      "w-56",
      "w-64",
      "w-72",
      "w-80",
      "w-96",
      "w-full",
      "w-screen",
      "w-auto",
      "w-min",
      "w-max",
      "w-fit",
      "w-1/2",
      "w-1/3",
      "w-2/3",
      "w-1/4",
      "w-3/4",
      "w-1/5",
      "w-2/5",
      "w-3/5",
      "w-4/5",
      "w-1/6",
      "w-5/6",
    ],
  },
  {
    large_screen: [
      "sm:w-0",
      "sm:w-1",
      "sm:w-2",
      "sm:w-3",
      "sm:w-4",
      "sm:w-5",
      "sm:w-6",
      "sm:w-8",
      "sm:w-10",
      "sm:w-12",
      "sm:w-16",
      "sm:w-20",
      "sm:w-24",
      "sm:w-32",
      "sm:w-40",
      "sm:w-48",
      "sm:w-56",
      "sm:w-64",
      "sm:w-72",
      "sm:w-80",
      "sm:w-96",
      "sm:w-full",
      "sm:w-screen",
      "sm:w-auto",
      "sm:w-min",
      "sm:w-max",
      "sm:w-fit",
      "sm:w-1/2",
      "sm:w-1/3",
      "sm:w-2/3",
      "sm:w-1/4",
      "sm:w-3/4",
      "sm:w-1/5",
      "sm:w-2/5",
      "sm:w-3/5",
      "sm:w-4/5",
      "sm:w-1/6",
      "sm:w-5/6",
    ],
  },
];

export const objectWidths = [
  // Base widths
  { value: 0, class: "w-0", title: "width 0" },
  { value: 1, class: "w-1", title: "width 1" },
  { value: 2, class: "w-2", title: "width 2" },
  { value: 3, class: "w-3", title: "width 3" },
  { value: 4, class: "w-4", title: "width 4" },
  { value: 5, class: "w-5", title: "width 5" },
  { value: 6, class: "w-6", title: "width 6" },
  { value: 8, class: "w-8", title: "width 8" },
  { value: 10, class: "w-10", title: "width 10" },
  { value: 12, class: "w-12", title: "width 12" },
  { value: 16, class: "w-16", title: "width 16" },
  { value: 20, class: "w-20", title: "width 20" },
  { value: 24, class: "w-24", title: "width 24" },
  { value: 32, class: "w-32", title: "width 32" },
  { value: 40, class: "w-40", title: "width 40" },
  { value: 48, class: "w-48", title: "width 48" },
  { value: 56, class: "w-56", title: "width 56" },
  { value: 64, class: "w-64", title: "width 64" },
  { value: 72, class: "w-72", title: "width 72" },
  { value: 80, class: "w-80", title: "width 80" },
  { value: 96, class: "w-96", title: "width 96" },
  { value: "full", class: "w-full", title: "full width" },
  { value: "screen", class: "w-screen", title: "screen width" },
  { value: "auto", class: "w-auto", title: "auto width" },
  { value: "min", class: "w-min", title: "min width" },
  { value: "max", class: "w-max", title: "max width" },
  { value: "fit", class: "w-fit", title: "fit width" },
  { value: "50%", class: "w-1/2", title: "width 50%" },
  { value: "33.33%", class: "w-1/3", title: "width 33.33%" },
  { value: "66.67%", class: "w-2/3", title: "width 66.67%" },
  { value: "25%", class: "w-1/4", title: "width 25%" },
  { value: "75%", class: "w-3/4", title: "width 75%" },
  { value: "20%", class: "w-1/5", title: "width 20%" },
  { value: "40%", class: "w-2/5", title: "width 40%" },
  { value: "60%", class: "w-3/5", title: "width 60%" },
  { value: "80%", class: "w-4/5", title: "width 80%" },
  { value: "16.67%", class: "w-1/6", title: "width 16.67%" },
  { value: "83.33%", class: "w-5/6", title: "width 83.33%" },
  { value: "min-w-full", class: "min-w-screen", title: "min full width" },
  { value: "max-w-full", class: "max-w-screen", title: "max full width" },

  // Large screen (sm:) widths
  { value: 0, class: "sm:w-0", title: "width 0 for Large Screen" },
  { value: 1, class: "sm:w-1", title: "width 1 for Large Screen" },
  { value: 2, class: "sm:w-2", title: "width 2 for Large Screen" },
  { value: 3, class: "sm:w-3", title: "width 3 for Large Screen" },
  { value: 4, class: "sm:w-4", title: "width 4 for Large Screen" },
  { value: 5, class: "sm:w-5", title: "width 5 for Large Screen" },
  { value: 6, class: "sm:w-6", title: "width 6 for Large Screen" },
  { value: 8, class: "sm:w-8", title: "width 8 for Large Screen" },
  { value: 10, class: "sm:w-10", title: "width 10 for Large Screen" },
  { value: 12, class: "sm:w-12", title: "width 12 for Large Screen" },
  { value: 16, class: "sm:w-16", title: "width 16 for Large Screen" },
  { value: 20, class: "sm:w-20", title: "width 20 for Large Screen" },
  { value: 24, class: "sm:w-24", title: "width 24 for Large Screen" },
  { value: 32, class: "sm:w-32", title: "width 32 for Large Screen" },
  { value: 40, class: "sm:w-40", title: "width 40 for Large Screen" },
  { value: 48, class: "sm:w-48", title: "width 48 for Large Screen" },
  { value: 56, class: "sm:w-56", title: "width 56 for Large Screen" },
  { value: 64, class: "sm:w-64", title: "width 64 for Large Screen" },
  { value: 72, class: "sm:w-72", title: "width 72 for Large Screen" },
  { value: 80, class: "sm:w-80", title: "width 80 for Large Screen" },
  { value: 96, class: "sm:w-96", title: "width 96 for Large Screen" },
  { value: "full", class: "sm:w-full", title: "full width for Large Screen" },
  { value: "screen", class: "sm:w-screen", title: "screen width for Large Screen" },
  { value: "auto", class: "sm:w-auto", title: "auto width for Large Screen" },
  { value: "min", class: "sm:w-min", title: "min width for Large Screen" },
  { value: "max", class: "sm:w-max", title: "max width for Large Screen" },
  { value: "fit", class: "sm:w-fit", title: "fit width for Large Screen" },
  { value: "50%", class: "sm:w-1/2", title: "width 50% for Large Screen" },
  { value: "33.33%", class: "sm:w-1/3", title: "width 33.33% for Large Screen" },
  { value: "66.67%", class: "sm:w-2/3", title: "width 66.67% for Large Screen" },
  { value: "25%", class: "sm:w-1/4", title: "width 25% for Large Screen" },
  { value: "75%", class: "sm:w-3/4", title: "width 75% for Large Screen" },
  { value: "20%", class: "sm:w-1/5", title: "width 20% for Large Screen" },
  { value: "40%", class: "sm:w-2/5", title: "width 40% for Large Screen" },
  { value: "60%", class: "sm:w-3/5", title: "width 60% for Large Screen" },
  { value: "80%", class: "sm:w-4/5", title: "width 80% for Large Screen" },
  { value: "16.67%", class: "sm:w-1/6", title: "width 16.67% for Large Screen" },
  { value: "83.33%", class: "sm:w-5/6", title: "width 83.33% for Large Screen" },
  { value: "sm:min-w-full", class: "min-w-screen", title: "min full width for Large Screen" },
  { value: "sm:max-w-full", class: "max-w-screen", title: "max full width for Large Screen" },
];
