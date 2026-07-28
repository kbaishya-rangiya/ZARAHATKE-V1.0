import { Truck, BadgeCheck, RotateCcw } from "lucide-react";

const items = [
  { icon: Truck, text: "Free Shipping on Orders Above ₹1999" },
  { icon: BadgeCheck, text: "Cash on Delivery Available" },
  { icon: RotateCcw, text: "Easy Returns & 7 Days Refund" },
];

export default function AnnouncementBar() {
  return (
    <div
      className="bg-maroon-900 text-cream-50 text-[11px] tracking-[0.18em] uppercase"
      data-testid="announcement-bar"
    >
      <div className="max-w-[1400px] mx-auto px-6 py-2.5 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-0 text-center">
        {items.map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-center justify-center gap-2">
            <Icon size={13} strokeWidth={1.6} className="text-gold-400" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
