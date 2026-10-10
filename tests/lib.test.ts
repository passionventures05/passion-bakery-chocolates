import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-ignore plain ESM helper without types
import { buildCatalogue } from "../scripts/products-lib.mjs";
import { cartItemCount, cartKey, cartTotal } from "@/lib/cart";
import { formatAmount, formatRupees } from "@/lib/format";
import { buildSizeOptions, calculatePrice, calculateServing, parseQuantity } from "@/lib/products";
import { site } from "@/lib/site";
import { validatePhoneNumber } from "@/lib/validation";
import { advanceAmount, buildDelivery, emptyOrderForm, generateWhatsAppMessage, getCartDetails, getFieldErrors, validateOrder } from "@/components/cart/orderMessage";
import type { CartData, Product } from "@/types";

const treat: Product = { name: "Test", baseQuantity: "6pc", basePrice: 370, category: "Cupcakes", availableQuantities: "6pc,12pc,18pc,24pc", description: "" };

describe("parseQuantity", () => {
  it("understands weights and pieces", () => {
    expect(parseQuantity("500gm")).toEqual({ amount: 500, unit: "g" });
    expect(parseQuantity("500g")).toEqual({ amount: 500, unit: "g" });
    expect(parseQuantity("1.5 kg")).toEqual({ amount: 1500, unit: "g" });
    expect(parseQuantity("3pc")).toEqual({ amount: 3, unit: "pc" });
    expect(parseQuantity("3")).toEqual({ amount: 3, unit: "pc" });
    expect(parseQuantity("500")).toEqual({ amount: 500, unit: "g" });
    expect(parseQuantity("abc")).toBeNull();
    expect(parseQuantity("")).toBeNull();
  });
});

describe("pricing", () => {
  it("scales by quantity and rounds to whole rupees", () => {
    expect(calculatePrice(370, 6, 12)).toBe(740);
    expect(calculatePrice(370, 6, 18)).toBe(1110);
    expect(calculatePrice(65, 1, 3)).toBe(195);
    expect(calculatePrice(349, 500, 750)).toBe(524); // weight-based chocolates: 523.5 -> 524
  });
  it("builds sorted, de-duplicated options", () => {
    const opts = buildSizeOptions({ ...treat, availableQuantities: "12pc, 6pc,12pc,,24pc," });
    expect(opts.map((o) => o.label)).toEqual(["6 pieces", "12 pieces", "24 pieces"]);
    expect(opts.map((o) => o.price)).toEqual([370, 740, 1480]);
  });
  it("prices per piece, by number of pieces", () => {
    const brownie = buildSizeOptions({ ...treat, baseQuantity: "1pc", basePrice: 70, availableQuantities: "1pc,3pc,5pc,7pc" });
    expect(brownie.map((o) => o.label)).toEqual(["1 piece", "3 pieces", "5 pieces", "7 pieces"]);
    expect(brownie.map((o) => o.price)).toEqual([70, 210, 350, 490]);
    const donuts = buildSizeOptions({ ...treat, baseQuantity: "1pc", basePrice: 65, availableQuantities: "3pc,6pc,9pc,12pc" });
    expect(donuts.map((o) => o.price)).toEqual([195, 390, 585, 780]);
    const macarons = buildSizeOptions({ ...treat, baseQuantity: "4pc", basePrice: 300, availableQuantities: "4pc,8pc,12pc,16pc" });
    expect(macarons.map((o) => o.price)).toEqual([300, 600, 900, 1200]);
  });
  it("the three ghewar/brownie prices are the base price per piece (not doubled)", () => {
    const { catalogue } = buildCatalogue("content/products", "public") as { catalogue: Product[] };
    const byName = (n: string) => buildSizeOptions(catalogue.find((p) => p.name === n)!);
    expect(byName("Chocolate Brownie")[0].price).toBe(70);
    expect(byName("Classic Ghewar")[0].price).toBe(375);
    expect(byName("Premium Ghewar")[0].price).toBe(550);
  });
  it("every product in the catalogue yields valid options", () => {
    const { catalogue } = buildCatalogue("content/products", "public") as { catalogue: Product[] };
    for (const p of catalogue) {
      const opts = buildSizeOptions(p);
      expect(opts.length, p.name).toBeGreaterThan(0);
      opts.forEach((o) => expect(o.price, p.name).toBeGreaterThan(0));
    }
  });
});

describe("formatting", () => {
  it("formats rupees and amounts", () => {
    expect(formatRupees(1049)).toBe("₹1,049");
    expect(formatRupees(123456)).toBe("₹1,23,456");
    expect(formatAmount(500, "g")).toBe("500 g");
    expect(formatAmount(1000, "g")).toBe("1 kg");
    expect(formatAmount(1500, "g")).toBe("1.5 kg");
    expect(formatAmount(1, "pc")).toBe("1 piece");
    expect(calculateServing(1000, "g")).toBe("19-21 people");
    expect(calculateServing(6, "pc")).toBe("6 people");
  });
});

describe("cart", () => {
  const cart: CartData = {
    [cartKey("A", 500, "g")]: { name: "A", amount: 500, unit: "g", label: "500 g", unitPrice: 699, quantity: 2 },
    [cartKey("A", 1000, "g")]: { name: "A", amount: 1000, unit: "g", label: "1 kg", unitPrice: 1398, quantity: 1 },
  };
  it("keeps the same product in several sizes", () => {
    expect(Object.keys(cart)).toHaveLength(2);
    expect(cartItemCount(cart)).toBe(3);
    expect(cartTotal(cart)).toBe(2796);
  });
});

describe("order validation", () => {
  const now = new Date("2026-10-01T10:00:00");
  const base = { ...emptyOrderForm, name: "Asha", address: "Andheri", phone: "9876543210", orderingForSomeone: "no" as const, occasion: "Birthday", deliveryMode: "pick-up" as const };
  const delivery = { phone: "9876543210", name: "Asha", address: "Andheri" };

  it("validates Indian mobile numbers", () => {
    expect(validatePhoneNumber("9876543210")).toBe(true);
    expect(validatePhoneNumber("5876543210")).toBe(false);
    expect(validatePhoneNumber("98765")).toBe(false);
  });
  it("enforces the lead time", () => {
    expect(validateOrder({ ...base, deliveryDate: "2026-10-02", deliveryTime: "12:00" }, delivery, now)).toMatch(/at least 36 hours/);
    expect(validateOrder({ ...base, deliveryDate: "2026-10-03", deliveryTime: "12:00" }, delivery, now)).toBeNull();
  });
  it("requires recipient details when ordering for someone else", () => {
    const f = { ...base, orderingForSomeone: "yes" as const, deliveryDate: "2026-10-05", deliveryTime: "12:00" };
    expect(validateOrder(f, { phone: "", name: "", address: "" }, now)).toMatch(/delivery details/);
  });
  it("rejects bad customer phone", () => {
    expect(validateOrder({ ...base, phone: "12345", deliveryDate: "2026-10-05", deliveryTime: "12:00" }, delivery, now)).toMatch(/valid 10-digit/);
  });
});

describe("WhatsApp message", () => {
  it("is on-brand and has the totals", () => {
    const cart: CartData = { x: { name: "Chocolate Brownie", amount: 3, unit: "pc", label: "3 pieces", unitPrice: 210, quantity: 2 } };
    const msg = generateWhatsAppMessage(
      { ...emptyOrderForm, name: "Asha", address: "Andheri", phone: "9876543210", deliveryDate: "2026-10-05", deliveryTime: "12:00", deliveryMode: "home-delivery", occasion: "Birthday" },
      { phone: "9876543210", name: "Asha", address: "Andheri" },
      getCartDetails(cart)
    );
    expect(msg).toContain(site.name.toUpperCase());
    expect(msg).toContain("🍫");
    expect(msg).not.toMatch(/cake/i);
    expect(msg).toContain("Chocolate Brownie (3 pieces) x 2 = ₹420");
    expect(msg).toContain("Total Amount: ₹420");
    expect(msg).toContain("₹210"); // 50% advance
  });
});

describe("site config", () => {
  it("uses the confirmed phone number", () => {
    expect(site.phone).toBe("8657216555");
    expect(site.whatsappNumber).toBe("918657216555");
  });
  it("uses the chocolate site's domain and brand", () => {
    expect(site.url).toBe("https://passionbakerynchocos.co.in");
    expect(site.name).toBe("Passsion Chocolate World");
  });
});

describe("checkout helpers", () => {
  it("advance is the configured percentage of the total", () => {
    expect(advanceAmount(420)).toBe(210);
    expect(advanceAmount(699)).toBe(Math.round((699 * site.advancePercent) / 100));
  });

  it("reports every missing field at once, keyed by field id", () => {
    const errors = getFieldErrors({ ...emptyOrderForm });
    for (const id of ["name", "address", "phone", "delivery-date", "delivery-time", "delivery-mode", "occasion"]) {
      expect(errors[id], id).toBeTruthy();
    }
    expect(errors["delivery-phone"]).toBeUndefined(); // only needed when ordering for someone else
  });

  it("is clean for a complete order and flags a too-soon delivery time", () => {
    const now = new Date("2030-01-10T09:00:00");
    const ok = { ...emptyOrderForm, name: "Asha", address: "Andheri", phone: "9876543210", deliveryDate: "2030-01-15", deliveryTime: "12:00", deliveryMode: "home-delivery" as const, occasion: "Birthday" };
    expect(getFieldErrors(ok, now)).toEqual({});
    expect(getFieldErrors({ ...ok, deliveryDate: "2030-01-10", deliveryTime: "10:00" }, now)["delivery-time"]).toMatch(/hours/);
  });

  it("sends to the recipient, not the buyer", () => {
    const f = { ...emptyOrderForm, name: "Asha", phone: "9876543210", address: "A", orderingForSomeone: "yes" as const, deliveryName: "Riya", deliveryPhone: "9123456780", deliveryAddress: "B" };
    expect(buildDelivery(f)).toEqual({ name: "Riya", phone: "9123456780", address: "B" });
    expect(getFieldErrors({ ...f, deliveryPhone: "" })["delivery-phone"]).toBeTruthy();
  });

  it("keeps UPI and featured-product settings in one place", () => {
    expect(site.upiId).toContain("@");
    expect(site.featured.length).toBeGreaterThanOrEqual(3);
  });
});

describe("no leftovers from the cakes site", () => {
  const read = (f: string) => fs.readFileSync(f, "utf8");
  const walk = (d: string): string[] =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const files = [...walk("src"), ...walk("content"), "public/admin/config.yml", "README.md", "capacitor.config.ts"].filter((f) => /\.(tsx?|css|json|ya?ml|md)$/.test(f));

  it("has no other phone numbers or old domains anywhere in the source", () => {
    for (const f of files) {
      const text = read(f);
      expect(text, f).not.toMatch(/7365887555|9869153017|7400296336|manjupathak135@gmail/);
      expect(text, f).not.toMatch(/passionbakerynchocos\.com\b/);
    }
  });
  it("mentions no cakes, weddings, gifts or Pinterest on the site", () => {
    for (const f of files.filter((f) => f.startsWith("src") && !f.endsWith(".css") && !f.includes("/styles/"))) {
      const text = read(f).replace(/cupcakes?/gi, "");
      expect(text, f).not.toMatch(/\bcakes?\b|cheesecake|wedding|\bgifts?\b|pinterest/i);
    }
  });
});
