import { Truck, Wallet, RefreshCcw, ShieldCheck, Award, Headphones } from "lucide-react";

const items = [
  { icon: Truck, title: "Free Shipping", sub: "On Orders Above ₹1999" },
  { icon: Wallet, title: "Cash on Delivery", sub: "Available" },
  { icon: RefreshCcw, title: "Easy Returns", sub: "7 Days Return Policy" },
  { icon: ShieldCheck, title: "Secure Payments", sub: "100% Secure Payments" },
  { icon: Award, title: "Authentic Products", sub: "Quality You Can Trust" },
  { icon: Headphones, title: "Customer Support", sub: "We're Here to Help" },
];

export default function ServiceStrip() {
  return (
    <section
      className="max-w-[1400px] mx-auto px-6"
      data-testid="service-strip"
    >
      <div className="border border-cream-200 bg-white px-6 md:px-8 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-4">
        {items.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="shrink-0 w-11 h-11 grid place-items-center border border-cream-200 rounded-full">
              <Icon size={18} strokeWidth={1.6} className="text-maroon-900" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-maroon-900 leading-tight">
                {title}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
