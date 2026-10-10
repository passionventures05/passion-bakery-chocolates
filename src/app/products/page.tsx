import type { Metadata } from "next";
import ProductsView from "@/components/products/ProductsView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chocolate Collection",
  description: `Browse chocolate cupcakes, brownies, donuts, macarons and ghewar from ${site.name}, ${site.city}. Pure vegetarian and freshly made.`,
  alternates: { canonical: "/products/" },
};

export default function ProductsPage() {
  return <ProductsView />;
}
