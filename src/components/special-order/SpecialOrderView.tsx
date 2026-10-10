"use client";

import { useEffect, useRef, useState } from "react";
import BorderDivider from "@/components/BorderDivider";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/useToast";
import { openWhatsApp } from "@/lib/external";
import { site } from "@/lib/site";
import { DELIVERY_WINDOW, GHEWAR_DATES, SPECIAL_TYPES, findType } from "@/lib/specialOrder";
import { digitsOnly, earliestDelivery, toDateInput, validatePhoneNumber } from "@/lib/validation";
import "@/styles/special-order.css";
import "@/styles/luxe-special-order.css";

const STEPS = ["Your treats", "Delivery", "Your details"];

interface FormState {
  name: string;
  phone: string;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryMode: string;
  productType: string;
  quantity: number;
  details: Record<string, string>;
}

const initial: FormState = {
  name: "",
  phone: "",
  address: "",
  deliveryDate: "",
  deliveryTime: "",
  deliveryMode: "",
  productType: "",
  quantity: 0,
  details: {},
};

const MODE_LABEL: Record<string, string> = { pickup: "Store Pick Up", homedelivery: "Home Delivery" };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** What is wrong on each step, keyed by field id. */
const stepErrors = (step: number, f: FormState): Record<string, string> => {
  const e: Record<string, string> = {};
  const type = findType(f.productType);
  if (step === 0) {
    if (!type) e["product-type"] = "Please choose what you would like to order.";
    else if (!type.available) e["product-type"] = `${type.label} is currently unavailable.`;
  }
  if (step === 1) {
    if (type?.id === "ghewar") {
      if (!f.deliveryDate) e["delivery-date"] = "Please choose an available delivery date.";
    } else if (!f.deliveryDate) e["delivery-date"] = "Please choose a delivery date.";
    else if (f.deliveryDate < toDateInput(earliestDelivery()))
      e["delivery-date"] = `Please choose a date at least ${site.leadTimeHours} hours from now.`;
    if (!f.deliveryTime) e["delivery-time"] = `Please choose a time between ${DELIVERY_WINDOW.text}.`;
    else if (toMinutes(f.deliveryTime) < toMinutes(DELIVERY_WINDOW.from) || toMinutes(f.deliveryTime) > toMinutes(DELIVERY_WINDOW.to))
      e["delivery-time"] = `Delivery time must be between ${DELIVERY_WINDOW.text}.`;
    if (!f.deliveryMode) e["delivery-mode"] = "Please choose pick up or home delivery.";
    if (!f.address.trim()) e["address"] = "Please enter your complete address.";
  }
  if (step === 2) {
    if (!f.name.trim()) e["name"] = "Please enter your name.";
    if (!f.phone.trim()) e["phone"] = "Please enter your phone number.";
    else if (!validatePhoneNumber(f.phone.trim()))
      e["phone"] = "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.";
  }
  return e;
};

export default function SpecialOrderView() {
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const lastMessage = useRef("");
  const { toast, element: toastEl } = useToast();

  useEffect(() => setMinDate(toDateInput(earliestDelivery())), []);

  // arriving from "Bulk & Custom Orders" on the home page: /special-order/?type=cupcakes
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("type");
    const t = id ? findType(id) : undefined;
    if (t?.available) setForm((f) => (f.productType ? f : { ...f, productType: t.id, quantity: t.min }));
  }, []);

  const type = findType(form.productType);

  const clearError = (id: string) =>
    setErrors((e) => {
      if (!e[id]) return e;
      const { [id]: _removed, ...rest } = e;
      void _removed;
      return rest;
    });
  const set = <K extends keyof FormState>(key: K, value: FormState[K], errorId?: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errorId) clearError(errorId);
  };
  const setDetail = (id: string, value: string) => setForm((f) => ({ ...f, details: { ...f.details, [id]: value } }));

  const aria = (id: string) => ({
    "aria-invalid": errors[id] ? (true as const) : undefined,
    "aria-describedby": errors[id] ? `err-${id}` : undefined,
  });
  const fieldError = (id: string) =>
    errors[id] ? (
      <p className="lx-field-error" id={`err-${id}`} role="alert">
        <Icon name="exclamation-triangle" /> {errors[id]}
      </p>
    ) : null;

  const onTypeChange = (id: string) => {
    const t = findType(id);
    setForm((f) => ({ ...f, productType: id, quantity: t ? t.min : 0, details: {}, deliveryDate: "" }));
    clearError("product-type");
  };

  const changeQty = (dir: 1 | -1) => {
    if (!type) return;
    setForm((f) => ({ ...f, quantity: Math.max(type.min, f.quantity + dir * type.step) }));
  };

  const goTo = (n: number) => {
    setStep(n);
    setErrors({});
    window.setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      headingRef.current?.focus({ preventScroll: true });
    }, 60);
  };

  const focusFirst = (found: Record<string, string>) => {
    const id = Object.keys(found)[0];
    const el = id ? document.getElementById(id) : null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => el?.focus({ preventScroll: true }), 300);
  };

  const next = () => {
    const found = stepErrors(step, form);
    if (Object.keys(found).length) {
      setErrors(found);
      return focusFirst(found);
    }
    goTo(step + 1);
  };

  const buildMessage = () => {
    const t = findType(form.productType)!;
    const lines = t.fields.map((fd) => `▫️ ${fd.label}: ${form.details[fd.id]?.trim() || "None"}`);
    return (
      `🍫 *${site.name} - Special Order* 🍫\n\n` +
      `👤 Name: ${form.name.trim()}\n` +
      `📞 Phone: ${form.phone.trim()}\n` +
      `📍 Address: ${form.address.trim()}\n\n` +
      `🛍️ Product: ${t.label}\n` +
      `🔢 Quantity: ${form.quantity} ${t.unitLabel}\n` +
      `${lines.join("\n")}\n\n` +
      `📅 Delivery Date: ${form.deliveryDate}\n` +
      `🕐 Delivery Time: ${form.deliveryTime}\n` +
      `🚚 Delivery Mode: ${MODE_LABEL[form.deliveryMode] ?? form.deliveryMode}\n\n` +
      `📸 *Please send any reference images in your next message*`
    );
  };

  const openChat = async () => {
    try {
      await openWhatsApp(lastMessage.current);
    } catch {
      toast(`We couldn't open WhatsApp. Please message us directly on ${site.phoneDisplay}.`);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) return next();

    // re-check every step before sending (the date may have passed while the form was open)
    for (let s = 0; s <= 2; s++) {
      const found = stepErrors(s, form);
      if (Object.keys(found).length) {
        goTo(s);
        window.setTimeout(() => {
          setErrors(found);
          focusFirst(found);
        }, 120);
        return;
      }
    }
    lastMessage.current = buildMessage();
    setSent(true);
    window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    void openChat();
  };

  const startOver = () => {
    setForm(initial);
    setSent(false);
    setErrors({});
    setStep(0);
  };

  return (
    <div className="site page-special-order">
      <Navbar active="special-order" />
      {toastEl}
      <main id="main" tabIndex={-1}>
        <div ref={topRef} className="lx-scroll-anchor" />
        <div className="lx-head on-light" data-reveal="">
          <span className="lx-eyebrow">Made just for you</span>
          <h1 className="lx-title">Place a Special Order</h1>
          <p className="lx-sub">Tell us what you need in three quick steps. We&apos;ll confirm the details and final price on WhatsApp.</p>
        </div>

        {!sent && (
          <ol className="lx-progress" aria-label="Order progress">
            {STEPS.map((label, i) => (
              <li key={label} className={i < step ? "done" : i === step ? "current" : ""} aria-current={i === step ? "step" : undefined}>
                <span className="lx-progress-dot">{i < step ? <Icon name="check" /> : i + 1}</span>
                <span className="lx-progress-label">{label}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="container">
          {sent ? (
            <div className="lx-so-result" aria-live="polite">
              <div className="lx-so-result-icon"><Icon name="whatsapp" /></div>
              <h2 className="lx-step-title" ref={headingRef} tabIndex={-1}>Almost done — send it on WhatsApp</h2>
              <p className="lx-so-lead">
                We&apos;ve opened WhatsApp with your order. <strong>Press Send there</strong> to complete it, and attach any reference pictures.
              </p>
              <div className="lx-so-actions column">
                <button type="button" className="lx-btn lx-btn-primary" onClick={openChat}>
                  <Icon name="whatsapp" /> Open WhatsApp again
                </button>
                <button type="button" className="lx-btn lx-btn-light" onClick={() => setSent(false)}>
                  <Icon name="chevron-left" /> Review or change my order
                </button>
                <button type="button" className="lx-so-link" onClick={startOver}>Start a new order</button>
              </div>
            </div>
          ) : (
            <form id="special-order-form" onSubmit={onSubmit} noValidate>
              <div className="lx-so-step" key={step}>
                <h2 className="lx-step-title" ref={headingRef} tabIndex={-1}>
                  <span>Step {step + 1} of 3</span>
                  {STEPS[step]}
                </h2>

                {step === 0 && (
                  <>
                    <div className="lx-note-box">
                      <Icon name="info-circle" />
                      <p>
                        <strong>Note:</strong> The final pricing for your custom order will be confirmed after our team
                        carefully reviews your specific requirements and preferences. We&apos;ll get back to you shortly
                        with a detailed quote.
                      </p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-type">Type of product</label>
                      <select id="product-type" name="product-type" value={form.productType} {...aria("product-type")}
                        onChange={(e) => onTypeChange(e.target.value)}>
                        <option value="">Select product type…</option>
                        {SPECIAL_TYPES.map((t) => (
                          <option key={t.id} value={t.id} disabled={!t.available}>
                            {t.label}{t.available ? "" : " (currently unavailable)"}
                          </option>
                        ))}
                      </select>
                      {fieldError("product-type")}
                    </div>

                    {type?.available && (
                      <>
                        <div className="form-group">
                          <label htmlFor="quantity">Quantity of {type.label} (minimum {type.min} {type.unitLabel})</label>
                          <div className="weight-input-wrapper">
                            <button type="button" className="weight-btn" id="decrease-quantity" aria-label={`Decrease quantity by ${type.step}`}
                              onClick={() => changeQty(-1)}>
                              −
                            </button>
                            <input type="number" id="quantity" name="quantity" value={form.quantity} min={type.min} step={type.step} readOnly />
                            <button type="button" className="weight-btn" id="increase-quantity" aria-label={`Increase quantity by ${type.step}`}
                              onClick={() => changeQty(1)}>
                              +
                            </button>
                          </div>
                          <div className="weight-display">
                            <Icon name="shopping-basket" />
                            <span>Use +/− to change the quantity (steps of {type.step})</span>
                          </div>
                        </div>

                        {type.fields.map((fd) => (
                          <div className="form-group" key={`${type.id}-${fd.id}`}>
                            <label htmlFor={`d-${fd.id}`}>{fd.label}</label>
                            {fd.kind === "select" ? (
                              <select id={`d-${fd.id}`} name={fd.id} value={form.details[fd.id] ?? ""} onChange={(e) => setDetail(fd.id, e.target.value)}>
                                <option value="">Select {fd.label.toLowerCase()}…</option>
                                {fd.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            ) : fd.kind === "textarea" ? (
                              <textarea id={`d-${fd.id}`} name={fd.id} rows={3} placeholder={fd.placeholder}
                                value={form.details[fd.id] ?? ""} onChange={(e) => setDetail(fd.id, e.target.value)}></textarea>
                            ) : (
                              <input type="text" id={`d-${fd.id}`} name={fd.id} placeholder={fd.placeholder}
                                value={form.details[fd.id] ?? ""} onChange={(e) => setDetail(fd.id, e.target.value)} />
                            )}
                            {fd.hint && <small className="lx-hint">{fd.hint}</small>}
                          </div>
                        ))}

                        {type.referenceHint && (
                          <p className="lx-hint-row"><small className="lx-hint"><Icon name="camera" /> {type.referenceHint}</small></p>
                        )}
                      </>
                    )}
                  </>
                )}

                {step === 1 && (
                  <>
                    {type?.id === "ghewar" ? (
                      <div className="form-group">
                        <label htmlFor="delivery-date">Delivery date for Ghewar</label>
                        <select id="delivery-date" name="delivery-date" value={form.deliveryDate} {...aria("delivery-date")}
                          onChange={(e) => set("deliveryDate", e.target.value, "delivery-date")}>
                          <option value="">Select available delivery date…</option>
                          {GHEWAR_DATES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <small className="lx-hint">Ghewar is only available on specific dates.</small>
                        {fieldError("delivery-date")}
                      </div>
                    ) : (
                      <div className="form-group">
                        <label htmlFor="delivery-date">Date for order delivery (at least {site.leadTimeHours} hours from now)</label>
                        <input type="date" id="delivery-date" name="delivery-date" min={minDate} {...aria("delivery-date")}
                          value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value, "delivery-date")} />
                        {fieldError("delivery-date")}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="delivery-time">Preferred delivery time ({DELIVERY_WINDOW.text} only)</label>
                      <input type="time" id="delivery-time" name="delivery-time" min={DELIVERY_WINDOW.from} max={DELIVERY_WINDOW.to} {...aria("delivery-time")}
                        value={form.deliveryTime} onChange={(e) => set("deliveryTime", e.target.value, "delivery-time")} />
                      {fieldError("delivery-time")}
                    </div>

                    <div className="form-group">
                      <label htmlFor="delivery-mode">Mode of delivery</label>
                      <select id="delivery-mode" name="delivery-mode" value={form.deliveryMode} {...aria("delivery-mode")}
                        onChange={(e) => set("deliveryMode", e.target.value, "delivery-mode")}>
                        <option value="">Select delivery option…</option>
                        <option value="homedelivery">Home Delivery</option>
                        <option value="pickup">Store Pick Up</option>
                      </select>
                      {fieldError("delivery-mode")}
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <textarea id="address" name="address" placeholder="Enter your complete address" {...aria("address")}
                        value={form.address} onChange={(e) => set("address", e.target.value, "address")}></textarea>
                      {fieldError("address")}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input type="text" id="name" name="name" placeholder="Enter your full name" autoComplete="name" {...aria("name")}
                        value={form.name} onChange={(e) => set("name", e.target.value, "name")} />
                      {fieldError("name")}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone number</label>
                      <input type="tel" id="phone" name="phone" placeholder="Enter your 10-digit mobile number" autoComplete="tel-national" inputMode="numeric" maxLength={10} {...aria("phone")}
                        value={form.phone} onChange={(e) => set("phone", digitsOnly(e.target.value), "phone")} />
                      {fieldError("phone")}
                    </div>

                    <div className="lx-review" aria-label="Order summary">
                      <h3>Your order at a glance</h3>
                      <dl>
                        <div><dt>Product</dt><dd>{type?.label}</dd></div>
                        <div><dt>Quantity</dt><dd>{form.quantity} {type?.unitLabel}</dd></div>
                        {type?.fields.map((fd) => form.details[fd.id]?.trim() ? (
                          <div key={fd.id}><dt>{fd.label}</dt><dd>{form.details[fd.id].trim()}</dd></div>
                        ) : null)}
                        <div><dt>Date</dt><dd>{form.deliveryDate}</dd></div>
                        <div><dt>Time</dt><dd>{form.deliveryTime}</dd></div>
                        <div><dt>Mode</dt><dd>{MODE_LABEL[form.deliveryMode] ?? ""}</dd></div>
                        <div><dt>Address</dt><dd>{form.address.trim()}</dd></div>
                      </dl>
                    </div>
                  </>
                )}
              </div>

              <div className={step === 0 ? "lx-so-actions" : "lx-so-actions split"}>
                {step > 0 && (
                  <button type="button" className="lx-btn lx-btn-light" onClick={() => goTo(step - 1)}>
                    <Icon name="chevron-left" /> Back
                  </button>
                )}
                {step < 2 ? (
                  <button type="submit" className="lx-btn lx-btn-primary">
                    Next <Icon name="arrow-right" />
                  </button>
                ) : (
                  <button type="submit" className="lx-btn lx-btn-primary">
                    <Icon name="whatsapp" /> Send Order on WhatsApp
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <BorderDivider />
      </main>
      <Footer />
    </div>
  );
}
