export const flexOptions = [
  {
    display: ["flex", "inline-flex"],
  },
  {
    direction: ["flex-row", "flex-row-reverse", "flex-col", "flex-col-reverse"],
  },
  {
    wrap: ["flex-wrap", "flex-nowrap", "flex-wrap-reverse"],
  },
  {
    justifyContent: [
      "justify-start",
      "justify-center",
      "justify-end",
      "justify-between",
      "justify-around",
      "justify-evenly",
    ],
  },
  {
    alignItems: ["items-start", "items-center", "items-end", "items-stretch", "items-baseline"],
  },
  {
    alignContent: [
      "content-start",
      "content-center",
      "content-end",
      "content-between",
      "content-around",
      "content-evenly",
    ],
  },
  {
    alignSelf: ["self-auto", "self-start", "self-center", "self-end", "self-stretch"],
  },
  {
    growShrink: ["flex-1", "flex-auto", "flex-initial", "flex-none"],
  },
  {
    order: ["order-first", "order-last", "order-none", "order-1", "order-2", "order-3"],
  },
];

export const objectFlexOptions = [
  // display
  { class: "flex", title: "display flex", value: 0 },
  { class: "inline-flex", title: "display inline-flex", value: 1 },

  // direction
  { class: "flex-row", title: "flex direction row", value: 10 },
  { class: "flex-row-reverse", title: "flex direction row reverse", value: 11 },
  { class: "flex-col", title: "flex direction column", value: 12 },
  { class: "flex-col-reverse", title: "flex direction column reverse", value: 13 },

  // wrap
  { class: "flex-wrap", title: "flex wrap", value: 20 },
  { class: "flex-nowrap", title: "flex no wrap", value: 21 },
  { class: "flex-wrap-reverse", title: "flex wrap reverse", value: 22 },

  // justifyContent
  { class: "justify-start", title: "justify content start", value: 30 },
  { class: "justify-center", title: "justify content center", value: 31 },
  { class: "justify-end", title: "justify content end", value: 32 },
  { class: "justify-between", title: "justify content between", value: 33 },
  { class: "justify-around", title: "justify content around", value: 34 },
  { class: "justify-evenly", title: "justify content evenly", value: 35 },

  // alignItems
  { class: "items-start", title: "align items start", value: 40 },
  { class: "items-center", title: "align items center", value: 41 },
  { class: "items-end", title: "align items end", value: 42 },
  { class: "items-stretch", title: "align items stretch", value: 43 },
  { class: "items-baseline", title: "align items baseline", value: 44 },

  // alignContent
  { class: "content-start", title: "align content start", value: 50 },
  { class: "content-center", title: "align content center", value: 51 },
  { class: "content-end", title: "align content end", value: 52 },
  { class: "content-between", title: "align content between", value: 53 },
  { class: "content-around", title: "align content around", value: 54 },
  { class: "content-evenly", title: "align content evenly", value: 55 },

  // alignSelf
  { class: "self-auto", title: "align self auto", value: 60 },
  { class: "self-start", title: "align self start", value: 61 },
  { class: "self-center", title: "align self center", value: 62 },
  { class: "self-end", title: "align self end", value: 63 },
  { class: "self-stretch", title: "align self stretch", value: 64 },

  // growShrink
  { class: "flex-1", title: "flex grow/shrink 1", value: 70 },
  { class: "flex-auto", title: "flex grow/shrink auto", value: 71 },
  { class: "flex-initial", title: "flex grow/shrink initial", value: 72 },
  { class: "flex-none", title: "flex grow/shrink none", value: 73 },

  // order
  { class: "order-first", title: "order first", value: 80 },
  { class: "order-last", title: "order last", value: 81 },
  { class: "order-none", title: "order none", value: 82 },
  { class: "order-1", title: "order 1", value: 83 },
  { class: "order-2", title: "order 2", value: 84 },
  { class: "order-3", title: "order 3", value: 85 },
];
