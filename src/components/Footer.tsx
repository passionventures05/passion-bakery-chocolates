import Link from "next/link";
import { site, whatsappChatUrl } from "@/lib/site";
import Icon, { type IconName } from "./Icon";

/** `hidePhone` leaves the phone number out (used on the hiring page, which is email-only). */
export default function Footer({ hidePhone = false }: { hidePhone?: boolean }) {
  const year = new Date().getFullYear();

  return (
    <footer className="business-footer">
      <div className="footer-content">
        <div className="footer-section">
          <img src="/Chocolate_Logo-96.webp" width={96} height={96} alt={`${site.name} logo`} className="footer-logo-img" loading="lazy" decoding="async" />
          <p className="footer-brand-name">{site.name} ({site.shortName})</p>
          <p>
            Crafting sweet memories with every bite. We specialise in handmade chocolates and sweet
            treats made with pure vegetarian ingredients in the most hygienic environment.
          </p>
          <div className="social-footer-links">
            {[
              { href: site.social.instagram, icon: "instagram", label: "Instagram" },
              { href: site.social.facebook, icon: "facebook", label: "Facebook" },
              { href: whatsappChatUrl, icon: "whatsapp", label: "WhatsApp" },
              { href: site.social.youtube, icon: "youtube", label: "YouTube" },
              { href: site.social.googleReviews, icon: "google", label: "Google Reviews" },
            ].map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" title={l.label} aria-label={l.label}>
                <Icon name={l.icon as IconName} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/products/">Chocolate Collection</Link></li>
            <li><Link href="/special-order/">Special Orders</Link></li>
            <li><Link href="/hiring/">We&apos;re Hiring</Link></li>
            <li><Link href="/cart/">Shopping Cart</Link></li>
            <li><Link href="/terms/">Delivery &amp; Terms</Link></li>
            <li><Link href="/privacy/">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Our Specialties</h3>
          <ul>
            <li>Handmade Chocolates</li>
            <li>Bulk Chocolate &amp; Cupcake Orders</li>
            <li>Festival Special Treats</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Get In Touch</h3>
          <div className="contact-info-item">
            <Icon name="envelope" />
            <span>{site.email}</span>
          </div>
          {!hidePhone && (
            <div className="contact-info-item">
              <Icon name="phone" />
              <span>{site.phoneDisplay}</span>
            </div>
          )}
          <div className="contact-info-item">
            <Icon name="clock-o" />
            <span>{site.hours}</span>
          </div>
          <div className="contact-info-item">
            <Icon name="map-marker" />
            <span>{site.address}</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom-section">
        {site.fssai && <p>FSSAI Licence No. {site.fssai}</p>}
        <p>
          Allergen information: our chocolates and treats may contain milk, wheat (gluten), nuts and
          other allergens. Please tell us about any allergies when you order.
        </p>
        <p>
          &copy; {year} La Ruby Studio &middot; {site.name} ({site.shortName}) &middot; All Rights Reserved
        </p>
        <p>
          Designed with ❤️ for Sweet Lovers &middot; Made in India 🇮🇳
        </p>
      </div>
    </footer>
  );
}
