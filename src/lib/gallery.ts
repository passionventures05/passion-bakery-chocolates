/**
 * Photos for the home-page gallery. Put image files in /public/gallery/ (or reuse product photos) and list them here:
 *   { src: "/gallery/truffle-box.webp", alt: "Box of handmade chocolate truffles" },
 * While the list is empty the gallery shows an Instagram call-to-action instead.
 */
export interface GalleryImage {
  src: string;
  alt: string;
}

export const gallery: GalleryImage[] = [
  { src: "/chocolate.webp", alt: "Assorted handmade chocolates in a ribboned box" },
  { src: "/uploads/products/chocolate-brownie.webp", alt: "Fudgy chocolate brownies" },
  { src: "/uploads/products/macarons.webp", alt: "Stack of colourful macarons" },
  { src: "/uploads/products/chocolate-cupcakes.webp", alt: "Chocolate cupcake with swirled chocolate frosting" },
  { src: "/uploads/products/donuts.webp", alt: "Glazed and sprinkled donuts" },
  { src: "/uploads/products/premium-ghewar.webp", alt: "Premium ghewar with dry fruits and rose petals" },
  { src: "/uploads/products/chocolate-strawberry-cupcakes.webp", alt: "Chocolate strawberry cupcake" },
  { src: "/uploads/products/oreo-cupcake.webp", alt: "Oreo cupcake with cookie crumb" },
];
