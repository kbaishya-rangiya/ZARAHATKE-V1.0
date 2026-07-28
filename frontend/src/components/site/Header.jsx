import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "@/context/StoreContext";
import { useState } from "react";

const navLinks = [
  { label: "HOME", to: "/" },
  { label: "SHOP", to: "/category/sarees" },
  { label: "NEW ARRIVALS", to: "/category/sarees" },
  { label: "SAREES", to: "/category/sarees" },
  { label: "KURTIS", to: "/category/kurtis" },
  { label: "KURTA SETS", to: "/category/kurta-sets" },
  { label: "LEHENGAS", to: "/category/lehengas" },
  { label: "FESTIVE WEAR", to: "/category/wedding-collection" },
  { label: "WEDDING COLLECTION", to: "/category/wedding-collection" },
  { label: "SALE", to: "/category/lehengas" },
];

export default function Header() {
  const { cartCount, wishlist, setCartOpen, setWishlistOpen } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useNavigate();

  return (
    <header
      className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-cream-200"
      data-testid="site-header"
    >
      {/* Top row */}
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0" data-testid="logo-link">
          <div className="w-11 h-11 rounded-full border border-maroon-900/30 grid place-items-center">
            <span className="font-display italic text-2xl text-maroon-900">Z</span>
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-display text-xl md:text-2xl tracking-[0.25em] text-maroon-900">
              ZARAHATKE
            </div>
            <div className="text-[9px] tracking-[0.35em] text-gold-600 uppercase">
              — Ethnic Fashion —
            </div>
            <div className="hidden md:block text-[10px] italic text-stone-500 font-display">
              Tradition Woven with Elegance.
            </div>
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <label className="relative block">
            <input
              type="text"
              placeholder="Search for Sarees, Kurtis, Lehenga, Dress..."
              className="w-full h-12 pl-5 pr-14 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900 transition-colors placeholder:text-stone-400"
              data-testid="search-input"
            />
            <button
              className="absolute right-1 top-1 h-10 w-10 grid place-items-center bg-maroon-900 text-cream-50 hover:bg-maroon-700 transition-colors"
              aria-label="Search"
              data-testid="search-button"
            >
              <Search size={16} strokeWidth={1.8} />
            </button>
          </label>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 md:gap-7 shrink-0 ml-auto">
          <IconBtn icon={User} label="Account" testId="account-btn" />
          <IconBtn
            icon={Heart}
            label="Wishlist"
            count={wishlist.length}
            onClick={() => setWishlistOpen(true)}
            testId="wishlist-btn"
          />
          <IconBtn
            icon={ShoppingBag}
            label="Cart"
            count={cartCount}
            onClick={() => setCartOpen(true)}
            testId="cart-btn"
          />
          <button
            className="lg:hidden ml-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            data-testid="mobile-menu-btn"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Nav row */}
      <nav
        className="border-t border-cream-200 hidden lg:block"
        data-testid="site-nav"
      >
        <ul className="max-w-[1400px] mx-auto px-6 flex items-center justify-center gap-9 py-3.5">
          {navLinks.map((n, i) => (
            <li key={n.label + i}>
              <Link
                to={n.to}
                className={`text-[12px] tracking-[0.14em] font-medium transition-colors ${
                  i === 0
                    ? "text-maroon-900 border-b-2 border-maroon-900 pb-1"
                    : "text-stone-700 hover:text-maroon-900"
                }`}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-cream-200 bg-cream-50">
          <ul className="px-6 py-4 grid gap-3">
            {navLinks.map((n, i) => (
              <li key={n.label + i}>
                <Link
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-widest text-stone-800 hover:text-maroon-900"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

function IconBtn({ icon: Icon, label, count, onClick, testId }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 group"
      aria-label={label}
      data-testid={testId}
    >
      <div className="relative">
        <Icon
          size={22}
          strokeWidth={1.5}
          className="text-stone-800 group-hover:text-maroon-900 transition-colors"
        />
        {count > 0 && (
          <span
            className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-maroon-900 text-cream-50 text-[10px] font-semibold grid place-items-center"
            data-testid={`${testId}-count`}
          >
            {count}
          </span>
        )}
      </div>
      <span className="text-[10px] tracking-wider text-stone-700">{label}</span>
    </button>
  );
}
