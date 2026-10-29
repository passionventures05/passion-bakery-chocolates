/** Single source of truth for business details. Edit here; everything else reads from this file. */
export const site = {
  name: "Passsion Chocolate World",
  shortName: "PB&C",
  tagline: "Handmade chocolates and sweet treats, crafted with passion in Mumbai",
  description:
    "Order handmade chocolates, cupcakes, brownies, donuts and macarons from Passsion Chocolate World (PB&C), Mumbai. Pure vegetarian, freshly made in a hygienic home kitchen.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://passionbakerynchocos.co.in",

  phone: "8657216555",
  phoneDisplay: "+91 86572 16555",
  whatsappNumber: "918657216555", // country code + number, digits only
  email: "PassionChocolatesWorld@gmail.com",
  hours: "Mon-Fri: 10 AM - 7 PM, Sat: 9 AM - 1 PM",
  address: "Mumbai, Maharashtra, India",
  city: "Mumbai",
  region: "Maharashtra",
  country: "IN",

  /** FSSAI licence number. Leave empty to hide it from the footer. */
  fssai: "",

  /** UPI details shown after an order is sent (advance payment). */
  upiId: "manjupathak135@okicici",
  instagramHandle: "@passionchocolatesworld",

  /** Photo shown in the "About" section (swap for a photo of the chocolatier any time). */
  aboutImage: "/PCW_Logo-480.webp",

  /** Products shown in "Signature Treats" on the home page (must match the product names exactly). */
  featured: [
    "Chocolate Brownie",
    "Chocolate Cupcakes",
    "Chocolate Cream Cheese Cupcake",
    "Chocolate Strawberry Cupcakes",
    "Macarons",
    "Oreo Cupcake",
  ] as readonly string[],

  /**
   * Pincodes you deliver to (e.g. ["400001", "400050"]). While this list is empty the
   * delivery checker simply asks the customer to confirm their area with you on WhatsApp.
   */
  deliveryPincodes: [] as readonly string[],

  /** Minimum notice for delivery / pick-up, in hours. */
  leadTimeHours: 36,
  /** Share of the total to be paid in advance to confirm an order. */
  advancePercent: 50,

  social: {
    facebook: "https://www.facebook.com/share/1CmymuJ4hc/",
    instagram: "https://www.instagram.com/passionchocolatesworld?utm_source=qr&igsh=MXFsNGd1YXRqcDlhZg==",
    youtube: "https://www.youtube.com/@PassionChocolateWorld",
    googleReviews: "https://share.google/pfo83AjPDmMGBeVmf",
  },
} as const;

export const whatsappChatUrl = `https://wa.me/${site.whatsappNumber}`;
