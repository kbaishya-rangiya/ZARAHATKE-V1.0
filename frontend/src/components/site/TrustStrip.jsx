import { Lock, Truck, Globe, Headphones, Users } from "lucide-react";

const items = [
  { icon: Lock, text: "100% Secure Checkout" },
  { icon: Truck, text: "COD Available" },
  { icon: Globe, text: "Worldwide Shipping" },
  { icon: Headphones, text: "24/7 Customer Support" },
  { icon: Users, text: "Trusted by 50K+ Customers" },
];

export default function TrustStrip() {
  return (
    <section className="border-t border-b border-cream-200 bg-cream-50" data-testid="trust-strip">
      <div className="max-w-[1400px] mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-5 gap-5">
        {items.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center justify-center gap-3 text-center">
            <Icon size={18} strokeWidth={1.6} className="text-maroon-900" />
            <span className="text-[12px] tracking-wide text-stone-700">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
