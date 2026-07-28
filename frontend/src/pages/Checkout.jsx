import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Wallet, ChevronRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import { createCheckout } from "@/lib/api";

const SHIPPING_FLAT = 149;
const FREE_THRESHOLD = 1999;

export default function Checkout() {
  const { cart, cartTotal, updateQty, removeFromCart, clearCart } = useStore();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState("stripe");
  const [address, setAddress] = useState({
    full_name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const shipping = cartTotal === 0 ? 0 : cartTotal >= FREE_THRESHOLD ? 0 : SHIPPING_FLAT;
  const grandTotal = cartTotal + shipping;

  const set = (k, v) => setAddress((a) => ({ ...a, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map(({ product, qty }) => ({
          product_id: product.id,
          quantity: qty,
          size: product.size || null,
        })),
        address,
        payment_method: method,
        origin_url: window.location.origin,
      };
      const res = await createCheckout(payload);
      if (method === "stripe" && res.checkout_url) {
        window.location.href = res.checkout_url;
      } else if (method === "cod" && res.order_id) {
        clearCart();
        toast.success("Order placed! Cash on delivery.");
        nav(`/order/${res.order_id}`);
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || "Could not process checkout";
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <section className="max-w-[1400px] mx-auto px-6 py-24 text-center" data-testid="checkout-empty">
        <div className="font-display text-3xl text-maroon-900">Your bag is empty</div>
        <p className="text-stone-500 mt-3">Add a few pieces to check out.</p>
        <Link
          to="/"
          className="mt-8 inline-block h-11 px-8 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold leading-[44px] hover:bg-maroon-700 transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10" data-testid="checkout-page">
      <nav className="text-[11px] tracking-widest text-stone-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-maroon-900">HOME</Link>
        <ChevronRight size={12} />
        <span className="text-maroon-900">CHECKOUT</span>
      </nav>

      <h1 className="font-display text-3xl md:text-4xl text-maroon-900 mb-10">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
        {/* Left: form */}
        <div className="space-y-10">
          {/* Address */}
          <div>
            <h2 className="font-display text-xl text-maroon-900 mb-5">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" required value={address.full_name} onChange={(v) => set("full_name", v)} testId="full_name" />
              <Field label="Email" type="email" required value={address.email} onChange={(v) => set("email", v)} testId="email" />
              <Field label="Phone" required value={address.phone} onChange={(v) => set("phone", v)} testId="phone" />
              <Field label="Postal Code" required value={address.postal_code} onChange={(v) => set("postal_code", v)} testId="postal_code" />
              <div className="md:col-span-2">
                <Field label="Address Line 1" required value={address.line1} onChange={(v) => set("line1", v)} testId="line1" />
              </div>
              <div className="md:col-span-2">
                <Field label="Address Line 2 (optional)" value={address.line2} onChange={(v) => set("line2", v)} testId="line2" required={false} />
              </div>
              <Field label="City" required value={address.city} onChange={(v) => set("city", v)} testId="city" />
              <Field label="State" required value={address.state} onChange={(v) => set("state", v)} testId="state" />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <h2 className="font-display text-xl text-maroon-900 mb-5">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MethodOption
                selected={method === "stripe"}
                onClick={() => setMethod("stripe")}
                icon={CreditCard}
                title="Card / UPI / Netbanking"
                subtitle="Secure payment via Stripe"
                testId="method-stripe"
              />
              <MethodOption
                selected={method === "cod"}
                onClick={() => setMethod("cod")}
                icon={Wallet}
                title="Cash on Delivery"
                subtitle="Pay when your order arrives"
                testId="method-cod"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-4 flex items-center gap-2">
              <ShieldCheck size={13} className="text-maroon-900" />
              Your payment info is encrypted end-to-end.
            </p>
          </div>
        </div>

        {/* Right: order summary */}
        <aside className="space-y-4">
          <div className="border border-cream-200 bg-white p-6">
            <h3 className="font-display text-lg text-maroon-900 mb-4">Order Summary</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {cart.map(({ product, qty, key }) => (
                <div key={key || product.id + (product.size || "")} className="flex gap-3" data-testid={`summary-${product.id}`}>
                  <img src={product.image} alt={product.name} className="w-16 h-20 object-cover" />
                  <div className="flex-1">
                    <div className="text-[12px] leading-snug text-stone-800 line-clamp-2">{product.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {product.size ? `Size: ${product.size} · ` : ""}Qty {qty}
                    </div>
                    <div className="text-[12px] text-maroon-900 font-semibold mt-1">
                      ₹{(product.price * qty).toLocaleString("en-IN")}
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px] tracking-widest">
                      <button
                        type="button"
                        onClick={() => updateQty(key || product.id, qty - 1)}
                        className="text-stone-500 hover:text-maroon-900"
                      >−</button>
                      <button
                        type="button"
                        onClick={() => updateQty(key || product.id, qty + 1)}
                        className="text-stone-500 hover:text-maroon-900"
                      >+</button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(key || product.id)}
                        className="ml-auto text-stone-500 hover:text-maroon-900 uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 pt-4 border-t border-cream-200 text-sm">
              <Row label="Subtotal" value={`₹${cartTotal.toLocaleString("en-IN")}`} />
              <Row label="Shipping" value={shipping === 0 ? "FREE" : `₹${shipping}`} />
              <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
                <span className="text-[11px] tracking-[0.28em] uppercase text-stone-600">Total</span>
                <span className="font-display text-2xl text-maroon-900" data-testid="checkout-total">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full h-12 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold hover:bg-maroon-700 transition-colors disabled:opacity-70"
              data-testid="place-order-btn"
            >
              {submitting
                ? "PROCESSING..."
                : method === "stripe"
                ? "PAY WITH STRIPE"
                : "PLACE ORDER (COD)"}
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required, testId }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.2em] uppercase text-stone-600 mb-1.5 block">
        {label}
      </span>
      <input
        type={type}
        required={required !== false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900 transition-colors"
        data-testid={`checkout-${testId}`}
      />
    </label>
  );
}

function MethodOption({ selected, onClick, icon: Icon, title, subtitle, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`text-left p-4 border transition-colors ${
        selected ? "border-maroon-900 bg-cream-100" : "border-cream-200 bg-white hover:border-stone-400"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 grid place-items-center border ${selected ? "bg-maroon-900 text-cream-50 border-maroon-900" : "border-cream-200 text-maroon-900"}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-maroon-900">{title}</div>
          <div className="text-[11px] text-stone-500">{subtitle}</div>
        </div>
        <div className={`w-4 h-4 rounded-full border ${selected ? "bg-maroon-900 border-maroon-900" : "border-cream-200"}`} />
      </div>
    </button>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-stone-700">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
