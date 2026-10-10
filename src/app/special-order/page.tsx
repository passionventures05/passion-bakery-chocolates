import type { Metadata } from "next";
import SpecialOrderView from "@/components/special-order/SpecialOrderView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Special Order",
  description: `Place a bulk or custom order for chocolates, cupcakes, brownies and donuts from ${site.name}, ${site.city}.`,
  alternates: { canonical: "/special-order/" },
};

export default function SpecialOrderPage() {
  return <SpecialOrderView />;
}
