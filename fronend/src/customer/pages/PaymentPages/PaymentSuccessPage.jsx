import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "../../../config/apiConfig";
import { getCart } from "../../../State/Cart/Action";
import { getOrderHistory } from "../../../State/Order/Action";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";
import Button from "../../../components/ui/Button";
import PaymentRecommendations from "./PaymentRecommendations";

const NEXT_STEPS = [
  {
    icon: EnvelopeIcon,
    title: "Confirmation email",
    text: "A receipt and order summary are on the way to your inbox.",
  },
  {
    icon: ClipboardDocumentListIcon,
    title: "Order processing",
    text: "We're preparing your items. Track status anytime in your account.",
  },
  {
    icon: TruckIcon,
    title: "Delivery updates",
    text: "You'll get shipping notifications once your order is on the move.",
  },
];

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const shortRef = sessionId ? sessionId.slice(-12).toUpperCase() : null;
  const [confirming, setConfirming] = useState(Boolean(sessionId && orderId));

  useEffect(() => {
    if (!sessionId || !orderId || !localStorage.getItem("jwt")) return;

    let cancelled = false;
    (async () => {
      try {
        await api.post("/api/payments/confirm-session", { sessionId, orderId });
        if (!cancelled) {
          await dispatch(getCart({ silent: true }));
          await dispatch(getOrderHistory({ silent: true }));
        }
      } catch (e) {
        console.error("Payment confirm:", e);
      } finally {
        if (!cancelled) setConfirming(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, orderId, dispatch]);

  return (
    <div className="page-section bg-surface">
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-emerald-50/80 via-surface to-brand-50/30">
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="app-container relative py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <CheckSolid className="h-9 w-9" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Payment confirmed
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Thank you for your order!
            </h1>
            <p className="mt-3 text-base text-foreground-muted sm:text-lg">
              {confirming
                ? "Confirming your payment…"
                : "Your payment was successful. We're getting everything ready for you."}
            </p>
            {shortRef ? (
              <div className="mt-6 inline-flex flex-col items-center rounded-2xl border border-line bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm">
                <span className="text-xs font-medium text-foreground-muted">Payment reference</span>
                <span className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                  {shortRef}
                </span>
              </div>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="!px-8" onClick={() => navigate("/account/order")}>
                View my orders
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="!px-8"
                onClick={() => navigate("/products")}
              >
                Continue shopping
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="app-container py-12 md:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-foreground">What happens next?</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Here&apos;s what you can expect after your purchase.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {NEXT_STEPS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface-muted/40 py-10">
        <div className="app-container">
          <div className="grid gap-6 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-2 sm:p-8">
            <div className="flex gap-4">
              <ShieldCheckIcon className="h-8 w-8 shrink-0 text-brand-500" />
              <div>
                <h3 className="font-semibold text-foreground">Secure payment</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Your transaction was processed securely through Stripe. We never store your
                  full card details.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <ChatBubbleLeftRightIcon className="h-8 w-8 shrink-0 text-brand-500" />
              <div>
                <h3 className="font-semibold text-foreground">Need help?</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Questions about your order?{" "}
                  <Link to="/contact-us" className="font-semibold text-brand-600 hover:text-brand-700">
                    Contact our support team
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PaymentRecommendations
        title="You might also like"
        description="Popular picks from our catalog while you wait for delivery."
      />

      <section className="app-container py-10 text-center">
        <p className="text-sm text-foreground-muted">
          <CheckCircleIcon className="mr-1 inline h-4 w-4 text-emerald-500" />
          Order placed successfully · Estimated delivery 3–5 business days
        </p>
      </section>
    </div>
  );
};

export default PaymentSuccessPage;
