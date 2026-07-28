import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <section className="max-w-xl mx-auto px-6 py-24 text-center" data-testid="payment-cancel">
      <XCircle size={48} className="mx-auto text-maroon-900" />
      <h1 className="font-display text-3xl text-maroon-900 mt-6">Payment cancelled</h1>
      <p className="text-stone-500 mt-2 text-sm">
        No charge was made. Your bag is still saved — you can retry any time.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          to="/checkout"
          className="h-11 px-8 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold leading-[44px] hover:bg-maroon-700 transition-colors"
        >
          RETRY CHECKOUT
        </Link>
        <Link
          to="/"
          className="h-11 px-8 border border-maroon-900 text-maroon-900 text-[11px] tracking-[0.28em] font-semibold leading-[42px] hover:bg-maroon-900 hover:text-cream-50 transition-colors"
        >
          KEEP SHOPPING
        </Link>
      </div>
    </section>
  );
}
