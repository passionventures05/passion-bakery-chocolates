import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";

const bulk: { name: string; type: string; blurb: string; icon: IconName }[] = [
  { name: "Handmade Chocolates", type: "chocolates", blurb: "Custom flavours and fillings, from 50 pieces.", icon: "candy" },
  { name: "Cupcakes", type: "cupcakes", blurb: "Your flavour and theme, from 12 pieces.", icon: "cookie" },
  { name: "Brownies", type: "brownies", blurb: "Fudgy squares with your choice of garnish, from 6 pieces.", icon: "brownie" },
  { name: "Donuts", type: "donuts", blurb: "Glazed, filled or themed, from 12 pieces.", icon: "star" },
];

export default function BulkOrders() {
  return (
    <div className="lx-occasion-grid">
      {bulk.map((o, i) => (
        <Link
          key={o.type}
          href={`/special-order/?type=${encodeURIComponent(o.type)}`}
          className="lx-occasion"
          data-reveal=""
          style={{ "--i": i } as React.CSSProperties}
        >
          <span className="lx-occasion-icon"><Icon name={o.icon} /></span>
          <span className="lx-occasion-name">{o.name}</span>
          <span className="lx-occasion-blurb">{o.blurb}</span>
          <span className="lx-occasion-go">Order yours <Icon name="arrow-right" /></span>
        </Link>
      ))}
    </div>
  );
}
