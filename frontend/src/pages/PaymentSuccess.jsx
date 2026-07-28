import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { fetchPaymentStatus } from "@/lib/api";
import { useStore } from "@/context/StoreContext";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const nav = useNavigate();
  const { clearCart } = useStore();
  const [state, setState] = useState("polling"); // polling | paid | timeout | error
  const [orderId, setOrderId] = useState(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      return;
    }
    let cancelled = false;
    let timer = null;

    const poll = async () => {
      if (cancelled) return;
      attemptsRef.current += 1;
      if (attemptsRef.current > 20) {
        setState("timeout");
        return;
      }
      try {
        const res = await fetchPaymentStatus(sessionId);
        setOrderId(res.order_id);
        if (res.payment_status === "paid") {
          setState("paid");
          clearCart && clearCart();
          setTimeout(() => nav(`/order/${res.order_id}`), 1200);
          return;
        }
      } catch (e) {
        // continue polling
      }
      timer = setTimeout(poll, 2000);
    };
    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, clearCart, nav]);

  return (
    <section className="max-w-xl mx-auto px-6 py-24 text-center" data-testid="payment-success">
      {state === "polling" && (
        <>
          <Loader2 size={48} className="mx-auto text-maroon-900 animate-spin" />
          <h1 className="font-display text-3xl text-maroon-900 mt-6">Confirming your payment…</h1>
          <p className="text-stone-500 mt-2 text-sm">This usually takes a few seconds.</p>
        </>
      )}
      {state === "paid" && (
        <>
          <CheckCircle2 size={48} className="mx-auto text-green-600" />
          <h1 className="font-display text-3xl text-maroon-900 mt-6">Payment successful</h1>
          <p className="text-stone-500 mt-2 text-sm">Redirecting to your order…</p>
        </>
      )}
      {state === "timeout" && (
        <>
          <Loader2 size={48} className="mx-auto text-maroon-900" />
          <h1 className="font-display text-3xl text-maroon-900 mt-6">Still processing</h1>
          <p className="text-stone-500 mt-2 text-sm">Your payment is taking longer than usual. It&rsquo;s safe to check your order.</p>
          {orderId && (
            <Link to={`/order/${orderId}`} className="inline-block mt-6 h-11 px-8 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold leading-[44px]">
              VIEW ORDER
            </Link>
          )}
        </>
      )}
      {state === "error" && (
        <>
          <XCircle size={48} className="mx-auto text-red-500" />
          <h1 className="font-display text-3xl text-maroon-900 mt-6">Something went wrong</h1>
          <Link to="/" className="inline-block mt-6 h-11 px-8 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold leading-[44px]">
            BACK TO HOME
          </Link>
        </>
      )}
    </section>
  );
}
