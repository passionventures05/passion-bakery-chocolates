# Passion Chocolate World (PB&C) — Next.js + React + TypeScript + Tailwind

Chocolate-only website and Android app source. Static export, no server, $0 hosting.
Built from the same setup as the cakes site (same stack, sections, CMS, Android app and ordering flow),
with the chocolate site's data and its pistachio-and-chocolate colour palette.

## Commands
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out  (deploy to Cloudflare Pages)
npm run check      # type-check + unit tests
```

## Android APK (Capacitor)
```bash
npx cap add android   # first time only
npm run cap:sync      # builds ./out and syncs it into the Android project
npm run cap:open      # opens Android Studio -> Build > Build APK
```
The app opens WhatsApp directly (falls back to the browser), handles the hardware back button
(back / exit from home) and respects notch/safe areas. These native behaviours need a test on a real phone.
App id: `com.passionbakerynchocos.chocolates` (change it in `capacitor.config.ts` if you need another).

## Content management (Decap CMS)
Products live as one file each in `content/products/`, edited at `/admin/` (GitHub sign-in through a free Cloudflare Worker).
Saving commits to GitHub → GitHub Actions validates + builds → Cloudflare Pages deploys. See **docs/CMS-SETUP.md**
(one-time setup) and **docs/CLIENT-GUIDE.md** (for the owner).
```bash
npm run dev:cms    # site + local CMS at http://localhost:3000/admin/index.html (no accounts needed)
```
`public/products.json` is generated from `content/products` on every build — don't edit it.

## Where to change things
| What | File |
|---|---|
| Phone (**8657216555**), email, address, hours, social links, lead time, advance %, **FSSAI number**, **UPI ID**, **products shown in "Signature Treats"**, **delivery pincodes**, About photo | `src/lib/site.ts` |
| Special-order types, minimum quantities, delivery window, **switching Ghewar on** (and its dates) | `src/lib/specialOrder.ts` |
| Home-page gallery photos | `src/lib/gallery.ts` |
| Home-page sections (hero, bulk orders, how to order, FAQ) | `src/components/home/` |
| Products (name, price, sizes, photo) | the CMS, or `content/products/*.json` |
| Reviews | `src/lib/reviews.ts` |
| Terms / Privacy wording | `src/app/terms/page.tsx`, `src/app/privacy/page.tsx` |
| Colours | CSS variables at the top of `src/styles/luxe.css` |
| Site URL for SEO (or set `NEXT_PUBLIC_SITE_URL`) | `src/lib/site.ts` (currently `https://passionbakerynchocos.co.in`) |

### How prices work
Everything is priced **by number of pieces**. `basePrice` is the price of `baseQuantity`; other sizes scale in proportion
and are rounded to whole rupees:
- Donuts: ₹65 per piece → 3 pieces = ₹195, 12 pieces = ₹780
- Brownie ₹70, Classic Ghewar ₹375, Premium Ghewar ₹550 — each per piece
- Cupcakes: the price is for a pack of 6 (e.g. ₹370) → 12 pieces = ₹740
- Macarons: ₹300 for 4 → 8 pieces = ₹600
Weight sizes such as `250gm,500gm,1kg` also work (for loose chocolates you add later). Don't mix pieces and weights in one product.

## Structure
```
public/            images + products.json (generated)
src/app/           routes: / /products /cart /special-order /terms /privacy (+ robots, sitemap)
src/components/    Navbar, Footer, Icon, ContactForm, FloatingWhatsApp, ScrollReveal, home/, products/, cart/, special-order/
src/lib/           site config, cart (localStorage "chocolateCart_v2"), pricing, validation, WhatsApp helper, special-order config
src/styles/        shared.css (footer/base) + one file per page, plus luxe*.css (typography, nav, animations, new sections)
tests/             unit tests (vitest)
```

## Colour palette
Pistachio `#bad012` (with lighter `#d6e65a` / cream `#eef3c9` / mist `#f7f9e6` and deeper `#7d8c0a` tones), chocolate
browns `#8c4b29`, `#54422b`, espresso `#2c1810`, gold `#ffd700`, and a soft pink `#fea3aa` for hover glints. Nothing outside this family is used
(the only extra colours are the standard red for form errors).

## Notes for the owner
- The 22 products, their prices and photos come from the chocolate site. Spelling fixed (Blueberry, Macarons, Cream Cheese…),
  prices corrected (Brownie ₹70, Ghewar ₹375 / ₹550 per piece) and the three Red Velvet cupcakes given distinct names.
- **Product descriptions, FAQ answers, About text, reviews and the Terms/Privacy pages were written/adapted for chocolates from the
  original site's wording — please read them once and correct anything that doesn't match your recipes and policies.**
- The old phone number printed inside a few product photos was removed; **8657216555** is the only number anywhere.
- Ghewar is shown as "currently unavailable" in Special Order. Add delivery dates to `GHEWAR_DATES` and set `available: true` in
  `src/lib/specialOrder.ts` to switch it on.
- The category list in the CMS already includes Handmade Chocolates, Truffles & Pralines and Chocolate Bars, ready for when you add those products.
- Reviews keep the original names, stars and dates, with the wording changed to chocolates.
