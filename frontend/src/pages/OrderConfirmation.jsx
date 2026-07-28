import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Package, Wallet, CreditCard } from "lucide-react";
import { fetchOrder } from "@/lib/api";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchOrder(id).then(setOrder).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <section className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="font-display text-3xl text-maroon-900">Order not found</div>
        <Link to="/" className="mt-6 inline-block text-[11px] tracking-widest text-maroon-900 border-b border-maroon-900 pb-1">BACK TO HOME</Link>
      </section>
    );
  }

  if (!order) return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-stone-500">Loading order…</div>;

  const isCod = order.payment_method === "cod";
  const paid = order.payment_status === "paid";

  return (
    <section className="max-w-3xl mx-auto px-6 py-16" data-testid="order-confirmation">
      <div className="text-center">
        <CheckCircle2 size={56} className="mx-auto text-green-600" />
        <h1 className="font-display text-4xl text-maroon-900 mt-6" data-testid="order-heading">
          {isCod ? "Order placed!" : paid ? "Thank you!" : "Order received"}
        </h1>
        <p className="text-stone-600 mt-2 text-sm">
          {isCod
            ? "We'll deliver your order in 4-7 business days. Please have cash ready."
            : paid
            ? "Your payment is confirmed and we're preparing your order."
            : "We're finalising your payment. You'll receive an email shortly."}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-[11px] tracking-widest text-stone-500">
          ORDER ID · <span className="text-maroon-900 font-semibold" data-testid="order-id">{order.id}</span>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Shipping to" icon={Package}>
          <div className="text-sm text-stone-700 leading-relaxed">
            <div className="font-semibold text-maroon-900">{order.address.full_name}</div>
            <div>{order.address.line1}</div>
            {order.address.line2 && <div>{order.address.line2}</div>}
            <div>{order.address.city}, {order.address.state} {order.address.postal_code}</div>
            <div>{order.address.country}</div>
            <div className="mt-2 text-stone-500">{order.address.phone}</div>
            <div className="text-stone-500">{order.address.email}</div>
          </div>
        </Panel>

        <Panel title="Payment" icon={isCod ? Wallet : CreditCard}>
          <div className="text-sm text-stone-700">
            <div className="font-semibold text-maroon-900">
              {isCod ? "Cash on Delivery" : "Card / Stripe"}
            </div>
            <div className="text-stone-500 mt-1 uppercase text-[11px] tracking-widest">
              {order.payment_status}
            </div>
          </div>
        </Panel>
      </div>

      {/* Items */}
      <div className="mt-6 border border-cream-200 bg-white p-6">
        <h3 className="font-display text-xl text-maroon-900 mb-5">Items</h3>
        <ul className="divide-y divide-cream-200">
          {order.items.map((it, i) => (
            <li key={i} className="py-4 flex gap-4" data-testid={`order-item-${it.product_id}`}>
              <img src={it.image} alt={it.name} className="w-16 h-20 object-cover" />
              <div className="flex-1">
                <div className="text-sm text-stone-800">{it.name}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {it.size ? `Size ${it.size} · ` : ""}Qty {it.quantity}
                </div>
              </div>
              <div className="text-sm text-maroon-900 font-semibold self-start">
                ₹{(it.price * it.quantity).toLocaleString("en-IN")}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-4 border-t border-cream-200 space-y-2 text-sm">
          <Row label="Subtotal" value={`₹${order.subtotal.toLocaleString("en-IN")}`} />
          <Row label="Shipping" value={order.shipping === 0 ? "FREE" : `₹${order.shipping}`} />
          <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.28em] uppercase text-stone-600">Total</span>
            <span className="font-display text-2xl text-maroon-900">
              ₹{order.total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="h-11 px-8 inline-block bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold leading-[44px] hover:bg-maroon-700 transition-colors"
          data-testid="continue-shopping-btn"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </section>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <div className="border border-cream-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-maroon-900" />
        <div className="text-[11px] tracking-[0.28em] uppercase text-gold-600 font-semibold">{title}</div>
      </div>
      {children}
    </div>
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
