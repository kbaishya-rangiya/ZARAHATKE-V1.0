import { Instagram, Facebook, Youtube, Phone, Mail, Clock } from "lucide-react";

const shop = ["All Products", "Sarees", "Kurtis", "Kurta Sets", "Lehengas"];
const help = ["Track Order", "Returns & Exchange", "Shipping Policy", "FAQs", "Size Guide"];
const info = ["About Us", "Contact Us", "Privacy Policy", "Terms & Conditions", "Blog"];

export default function Footer() {
  return (
    <footer className="bg-maroon-900 text-cream-50 mt-4" data-testid="site-footer">
      <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border border-cream-50/40 grid place-items-center">
              <span className="font-display italic text-xl text-cream-50">Z</span>
            </div>
            <div>
              <div className="font-display tracking-[0.28em] text-lg">ZARAHATKE</div>
              <div className="text-[9px] tracking-[0.35em] text-gold-400 uppercase">
                — Ethnic Fashion —
              </div>
            </div>
          </div>
          <p className="text-xs italic text-cream-50/70 font-display mt-3">
            Tradition Woven with Elegance.
          </p>
          <div className="flex gap-4 mt-6">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full border border-cream-50/30 grid place-items-center hover:bg-cream-50 hover:text-maroon-900 transition-colors"
                aria-label="Social link"
                data-testid={`social-${i}`}
              >
                <Icon size={15} strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Shop" links={shop} />
        <FooterCol title="Help" links={help} />
        <FooterCol title="Information" links={info} />

        {/* Support */}
        <div>
          <div className="text-[11px] tracking-[0.28em] uppercase text-gold-400 mb-4">
            Customer Support
          </div>
          <ul className="space-y-3 text-[13px] text-cream-50/85">
            <li className="flex items-center gap-2">
              <Phone size={13} /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail size={13} /> support@zarahatke.com
            </li>
            <li className="flex items-start gap-2">
              <Clock size={13} className="mt-0.5" />
              <div>
                Mon - Sat: 9AM - 8PM
                <br />
                Sun: 10AM - 6PM
              </div>
            </li>
          </ul>

          <div className="text-[11px] tracking-[0.28em] uppercase text-gold-400 mt-6 mb-3">
            Payment Methods
          </div>
          <div className="flex flex-wrap gap-2">
            {["VISA", "MC", "RuPay", "UPI", "Paytm"].map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 bg-cream-50 text-maroon-900 text-[10px] font-semibold tracking-wider"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-cream-50/15">
        <div className="max-w-[1400px] mx-auto px-6 py-5 text-[11px] tracking-widest text-cream-50/70 text-center">
          © 2026 ZARAHATKE. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.28em] uppercase text-gold-400 mb-4">
        {title}
      </div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-[13px] text-cream-50/85 hover:text-gold-400 transition-colors"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
