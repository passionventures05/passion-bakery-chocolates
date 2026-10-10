/**
 * Special (bulk / custom) order settings. Edit here to change minimums, add a product type or switch Ghewar on.
 *
 * To switch Ghewar on: set `available: true` on the "ghewar" entry and list the delivery dates you offer
 * in GHEWAR_DATES (format "YYYY-MM-DD"). Customers can then only pick those dates.
 */
export interface FieldDef {
  id: string;
  label: string;
  kind: "text" | "textarea" | "select";
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
}

export interface SpecialType {
  id: string;
  label: string;
  /** whether customers can currently choose it */
  available: boolean;
  min: number;
  step: number;
  unitLabel: string;
  fields: FieldDef[];
  /** shows a "send reference pictures on WhatsApp" hint */
  referenceHint?: string;
}

/** Delivery dates offered for Ghewar. Empty while Ghewar is unavailable. */
export const GHEWAR_DATES: string[] = [];

/** Special-order deliveries are made in this window (24-hour HH:MM). */
export const DELIVERY_WINDOW = { from: "15:00", to: "19:00", text: "3:00 PM - 7:00 PM" } as const;

export const SPECIAL_TYPES: SpecialType[] = [
  {
    id: "cupcakes",
    label: "Cupcakes",
    available: true,
    min: 12,
    step: 6,
    unitLabel: "pieces",
    referenceHint: "If you have reference images for the design or theme, please send them via WhatsApp after submitting this form.",
    fields: [
      { id: "flavour", label: "Flavour", kind: "text", placeholder: "e.g. Vanilla, Chocolate, Red Velvet, Butterscotch (or type 'None' if no preference)" },
      { id: "theme", label: "Theme", kind: "text", placeholder: "e.g. Birthday, Baby Shower, Festival, Custom (or type 'None' if no preference)" },
      { id: "requests", label: "Any other requests", kind: "textarea", placeholder: "Special topping preferences, decorations, dietary requirements (or type 'None')" },
    ],
  },
  {
    id: "chocolates",
    label: "Handmade Chocolates",
    available: true,
    min: 50,
    step: 1,
    unitLabel: "pieces",
    referenceHint: "If you have reference images for packaging or design, please send them via WhatsApp after submitting this form.",
    fields: [
      { id: "flavour", label: "Flavour", kind: "text", placeholder: "e.g. Dark Chocolate, Milk Chocolate, Hazelnut, Caramel (or type 'None' if no preference)" },
      { id: "filling", label: "Filling", kind: "text", placeholder: "e.g. Truffle, Caramel, Nuts, Fruit, Cream (or type 'None' if no preference)" },
      {
        id: "type",
        label: "Chocolate type",
        kind: "select",
        options: [
          { value: "Dark Chocolate", label: "Dark Chocolate" },
          { value: "Milk Chocolate", label: "Milk Chocolate" },
          { value: "White Chocolate", label: "White Chocolate" },
          { value: "Mixed Variety", label: "Mixed Variety" },
        ],
      },
      { id: "requests", label: "Any other requests", kind: "textarea", placeholder: "Packaging preferences, custom messages (or type 'None' if no special requests)" },
    ],
  },
  {
    id: "brownies",
    label: "Brownies",
    available: true,
    min: 6,
    step: 1,
    unitLabel: "pieces",
    referenceHint: "If you have reference images, please send them via WhatsApp after submitting this form.",
    fields: [
      {
        id: "garnishing",
        label: "Garnishing options",
        kind: "text",
        placeholder: "e.g. Chocolate Drizzle, Dry Fruits, Caramel Sauce, Whipped Cream (or type 'None')",
        hint: "You can mention several garnishing options separated by commas.",
      },
      { id: "requests", label: "Any other requests", kind: "textarea", placeholder: "Fudgy or cakey texture, special ingredients, packaging preferences (or type 'None')" },
    ],
  },
  {
    id: "donuts",
    label: "Donuts",
    available: true,
    min: 12,
    step: 6,
    unitLabel: "pieces",
    referenceHint: "If you have reference images for the design or theme, please send them via WhatsApp after submitting this form.",
    fields: [
      { id: "flavour", label: "Flavour", kind: "text", placeholder: "e.g. Glazed, Chocolate, Strawberry, Cinnamon, Nutella (or type 'None' if no preference)" },
      { id: "theme", label: "Theme", kind: "text", placeholder: "e.g. Rainbow, Unicorn, Sports, Custom Colours (or type 'None' if no preference)" },
      { id: "requests", label: "Any other requests", kind: "textarea", placeholder: "Frosting preferences, sprinkles, filled or ring donuts (or type 'None')" },
    ],
  },
  {
    id: "ghewar",
    label: "Ghewar",
    available: false, // switch to true (and fill GHEWAR_DATES) when Ghewar is on offer
    min: 3,
    step: 3,
    unitLabel: "pieces",
    referenceHint: "If you have reference images, please send them via WhatsApp after submitting this form.",
    fields: [
      {
        id: "kind",
        label: "Type of Ghewar",
        kind: "select",
        options: [
          { value: "Premium Ghewar", label: "Premium Ghewar" },
          { value: "Classic Ghewar", label: "Classic Ghewar" },
        ],
      },
      {
        id: "packaging",
        label: "Packaging type",
        kind: "select",
        options: [
          { value: "Premium Packaging", label: "Premium Packaging" },
          { value: "Classic Packaging", label: "Classic Packaging" },
        ],
      },
      { id: "requests", label: "Any other requests", kind: "textarea", placeholder: "Size preferences, sugar coating level, special decorations (or type 'None')" },
    ],
  },
];

export const findType = (id: string) => SPECIAL_TYPES.find((t) => t.id === id);
